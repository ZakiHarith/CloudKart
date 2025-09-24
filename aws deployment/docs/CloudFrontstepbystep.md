# CloudFront CDN Setup - Step by Step Tutorial

This tutorial will guide you through setting up Amazon CloudFront as a Content Delivery Network (CDN) for your CloudKart application deployed on S3.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- CloudKart application deployed on S3 (see S3stepbystep.md)
- S3 bucket configured for static website hosting
- AWS CLI installed and configured

## 🎯 Overview

We'll create a CloudFront distribution to serve your S3-hosted website globally with improved performance, caching, and HTTPS support.

## Step 1: Prepare S3 Bucket

Before setting up CloudFront, ensure your S3 bucket is properly configured.

### 1.1 Verify S3 Website Endpoint

```bash
# Get your S3 website endpoint
aws s3api get-bucket-website --bucket cloudkart-website-1234567890

# Example output:
# {
#     "IndexDocument": {
#         "Suffix": "index.html"
#     },
#     "ErrorDocument": {
#         "Key": "error.html"
#     }
# }
```

### 1.2 Test S3 Website Access

```bash
# Test S3 website endpoint
curl -I http://cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com

# Should return HTTP 200 OK
```

## Step 2: Create CloudFront Distribution

### 2.1 Using AWS Console

1. **Navigate to CloudFront**
   - Login to AWS Console
   - Search for "CloudFront"
   - Click on CloudFront service

2. **Create Distribution**
   - Click "Create Distribution"
   - Select "Web" delivery method
   - Click "Get Started"

3. **Origin Settings**
   - **Origin Domain Name**: `cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com`
   - **Origin ID**: `S3-cloudkart-website`
   - **Origin Protocol Policy**: `HTTP Only`
   - **Origin Path**: (leave blank)

4. **Default Cache Behavior Settings**
   - **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
   - **Allowed HTTP Methods**: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - **Cached HTTP Methods**: `GET, HEAD, OPTIONS`
   - **Cache Based on Selected Request Headers**: `None`
   - **Query String Forwarding and Caching**: `None`
   - **Cookie Forwarding**: `None`
   - **TTL Settings**:
     - Minimum TTL: `0`
     - Maximum TTL: `31536000` (1 year)
     - Default TTL: `86400` (1 day)
   - **Compress Objects Automatically**: `Yes`

5. **Distribution Settings**
   - **Price Class**: `Use Only U.S., Canada and Europe`
   - **AWS WAF Web ACL**: `None`
   - **Alternate Domain Names (CNAMEs)**: (leave blank for now)
   - **SSL Certificate**: `Default CloudFront Certificate`
   - **Supported HTTP Versions**: `HTTP/2, HTTP/1.1, HTTP/1.0`
   - **Default Root Object**: `index.html`
   - **Logging**: `Off` (can enable later)
   - **IPv6**: `Enabled`
   - **Comment**: `CloudKart CDN Distribution`
   - **Distribution State**: `Enabled`

6. **Create Distribution**
   - Click "Create Distribution"
   - Wait for deployment (15-20 minutes)
   - Note the CloudFront domain name (e.g., `d1234567890.cloudfront.net`)

### 2.2 Using AWS CLI

```bash
# Create distribution configuration file
cat > cloudfront-config.json << 'EOF'
{
  "CallerReference": "cloudkart-$(date +%s)",
  "Comment": "CloudKart CDN Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-cloudkart-website",
        "DomainName": "cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-cloudkart-website",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "Compress": true,
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      "CachedMethods": {
        "Quantity": 3,
        "Items": ["GET", "HEAD", "OPTIONS"]
      }
    }
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

# Create the distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## Step 3: Configure Cache Behaviors for Different File Types

### 3.1 Using AWS Console

1. **Edit Distribution**
   - Select your distribution
   - Click "Distribution Settings"
   - Go to "Behaviors" tab

2. **Create Behavior for CSS Files**
   - Click "Create Behavior"
   - **Path Pattern**: `*.css`
   - **Origin**: Select your S3 origin
   - **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
   - **Allowed HTTP Methods**: `GET, HEAD, OPTIONS`
   - **TTL Settings**:
     - Minimum TTL: `0`
     - Maximum TTL: `31536000`
     - Default TTL: `31536000` (1 year for CSS)
   - **Compress Objects**: `Yes`
   - Click "Create"

3. **Create Behavior for JavaScript Files**
   - Click "Create Behavior"
   - **Path Pattern**: `*.js`
   - **Origin**: Select your S3 origin
   - **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
   - **Allowed HTTP Methods**: `GET, HEAD, OPTIONS`
   - **TTL Settings**:
     - Minimum TTL: `0`
     - Maximum TTL: `31536000`
     - Default TTL: `31536000` (1 year for JS)
   - **Compress Objects**: `Yes`
   - Click "Create"

4. **Create Behavior for Images**
   - Click "Create Behavior"
   - **Path Pattern**: `images/*`
   - **Origin**: Select your S3 origin
   - **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
   - **Allowed HTTP Methods**: `GET, HEAD, OPTIONS`
   - **TTL Settings**:
     - Minimum TTL: `0`
     - Maximum TTL: `31536000`
     - Default TTL: `2592000` (30 days for images)
   - **Compress Objects**: `Yes`
   - Click "Create"

### 3.2 Using AWS CLI

```bash
# Get distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text)

# Get current distribution config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > distribution-config.json

# Extract ETag
ETAG=$(jq -r '.ETag' distribution-config.json)

# Update the configuration to add cache behaviors
# (This is complex via CLI, recommend using console for behaviors)
```

## Step 4: Configure Custom Error Pages

### 4.1 Using AWS Console

1. **Go to Error Pages Tab**
   - Select your distribution
   - Click "Distribution Settings"
   - Go to "Error Pages" tab

2. **Create Custom Error Page for 404**
   - Click "Create Custom Error Response"
   - **HTTP Error Code**: `404`
   - **Error Caching Minimum TTL**: `300` (5 minutes)
   - **Customize Error Response**: `Yes`
   - **Response Page Path**: `/error.html`
   - **HTTP Response Code**: `404`
   - Click "Create"

3. **Create Custom Error Page for 403**
   - Click "Create Custom Error Response"
   - **HTTP Error Code**: `403`
   - **Error Caching Minimum TTL**: `300`
   - **Customize Error Response**: `Yes`
   - **Response Page Path**: `/error.html`
   - **HTTP Response Code**: `404`
   - Click "Create"

### 4.2 Using AWS CLI

```bash
# Create custom error page configuration
cat > error-pages-config.json << 'EOF'
{
  "Quantity": 2,
  "Items": [
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/error.html",
      "ResponseCode": "404",
      "ErrorCachingMinTTL": 300
    },
    {
      "ErrorCode": 403,
      "ResponsePagePath": "/error.html",
      "ResponseCode": "404",
      "ErrorCachingMinTTL": 300
    }
  ]
}
EOF

# Update distribution with error pages
# (Complex to implement via CLI - recommend console)
```

## Step 5: Test CloudFront Distribution

### 5.1 Wait for Deployment

```bash
# Check distribution status
aws cloudfront get-distribution --id $DISTRIBUTION_ID

# Wait for deployment to complete
aws cloudfront wait distribution-deployed --id $DISTRIBUTION_ID

echo "Distribution is now deployed!"
```

### 5.2 Test Website Access

```bash
# Get CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query "Distribution.DomainName" --output text)

echo "CloudFront URL: https://$CLOUDFRONT_DOMAIN"

# Test access
curl -I https://$CLOUDFRONT_DOMAIN
curl -I https://$CLOUDFRONT_DOMAIN/styles.css
curl -I https://$CLOUDFRONT_DOMAIN/script.js
```

### 5.3 Verify HTTPS Redirect

```bash
# Test HTTP to HTTPS redirect
curl -I http://$CLOUDFRONT_DOMAIN

# Should return 301 redirect to HTTPS
```

## Step 6: Configure Security Headers

### 6.1 Create Lambda@Edge Function (Advanced)

Create a Lambda function to add security headers:

```javascript
exports.handler = (event, context, callback) => {
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    headers['strict-transport-security'] = [{
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubdomains; preload'
    }];

    headers['content-security-policy'] = [{
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com fonts.googleapis.com; font-src fonts.gstatic.com; img-src 'self' data:; connect-src 'self'"
    }];

    headers['x-content-type-options'] = [{
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    }];

    headers['x-frame-options'] = [{
        key: 'X-Frame-Options',
        value: 'DENY'
    }];

    headers['x-xss-protection'] = [{
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    }];

    headers['referrer-policy'] = [{
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
    }];

    callback(null, response);
};
```

## Step 7: Set Up Monitoring and Logging

### 7.1 Enable CloudFront Logging

```bash
# Create logging bucket
aws s3 mb s3://cloudkart-cloudfront-logs-$(date +%s)

# Enable logging (via console is easier)
# Go to Distribution Settings > General > Logging
# Bucket: cloudkart-cloudfront-logs-xxx
# Log Prefix: cloudfront-logs/
```

### 7.2 Set Up CloudWatch Alarms

```bash
# Create alarm for 4xx errors
aws cloudwatch put-metric-alarm \
    --alarm-name "CloudFront-4xx-Errors" \
    --alarm-description "High 4xx error rate" \
    --metric-name "4xxErrorRate" \
    --namespace "AWS/CloudFront" \
    --statistic "Average" \
    --period 300 \
    --threshold 5 \
    --comparison-operator "GreaterThanThreshold" \
    --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
    --evaluation-periods 2

# Create alarm for 5xx errors
aws cloudwatch put-metric-alarm \
    --alarm-name "CloudFront-5xx-Errors" \
    --alarm-description "High 5xx error rate" \
    --metric-name "5xxErrorRate" \
    --namespace "AWS/CloudFront" \
    --statistic "Average" \
    --period 300 \
    --threshold 1 \
    --comparison-operator "GreaterThanThreshold" \
    --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
    --evaluation-periods 2
```

## Step 8: Optimize Performance

### 8.1 Configure Origin Request Policy

```bash
# Create origin request policy for better caching
cat > origin-request-policy.json << 'EOF'
{
  "Name": "CloudKart-Origin-Request-Policy",
  "Comment": "Origin request policy for CloudKart",
  "HeadersConfig": {
    "HeaderBehavior": "whitelist",
    "Headers": {
      "Quantity": 3,
      "Items": ["Accept", "Accept-Language", "User-Agent"]
    }
  },
  "CookiesConfig": {
    "CookieBehavior": "none"
  },
  "QueryStringsConfig": {
    "QueryStringBehavior": "none"
  }
}
EOF

# Create the policy
aws cloudfront create-origin-request-policy --origin-request-policy-config file://origin-request-policy.json
```

### 8.2 Configure Cache Policy

```bash
# Create cache policy for static assets
cat > cache-policy.json << 'EOF'
{
  "Name": "CloudKart-Cache-Policy",
  "Comment": "Cache policy for CloudKart static assets",
  "DefaultTTL": 86400,
  "MaxTTL": 31536000,
  "MinTTL": 1,
  "ParametersInCacheKeyAndForwardedToOrigin": {
    "EnableAcceptEncodingGzip": true,
    "EnableAcceptEncodingBrotli": true,
    "QueryStringsConfig": {
      "QueryStringBehavior": "none"
    },
    "HeadersConfig": {
      "HeaderBehavior": "none"
    },
    "CookiesConfig": {
      "CookieBehavior": "none"
    }
  }
}
EOF

# Create the policy
aws cloudfront create-cache-policy --cache-policy-config file://cache-policy.json
```

## Step 9: Invalidate Cache

### 9.1 Create Invalidation

When you update your website files, you need to invalidate the CloudFront cache:

```bash
# Create invalidation for all files
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"

# Create invalidation for specific files
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/index.html" "/styles.css" "/script.js"
```

### 9.2 Check Invalidation Status

```bash
# List invalidations
aws cloudfront list-invalidations --distribution-id $DISTRIBUTION_ID

# Get specific invalidation status
INVALIDATION_ID="I2J3K4L5M6N7O8P9Q0"
aws cloudfront get-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --id $INVALIDATION_ID
```

## Step 10: Set Up Custom Domain (Optional)

### 10.1 Request SSL Certificate

```bash
# Request certificate (must be in us-east-1 for CloudFront)
aws acm request-certificate \
    --domain-name cloudkart.yourdomain.com \
    --validation-method DNS \
    --region us-east-1

# Get certificate ARN
CERT_ARN=$(aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[0].CertificateArn" --output text)
```

### 10.2 Add Custom Domain to Distribution

```bash
# Update distribution with custom domain
# (This requires updating the distribution configuration)
# Recommend using AWS Console for this step
```

## Step 11: Performance Testing

### 11.1 Test Global Performance

```bash
# Test from different locations using online tools:
# - WebPageTest.org
# - GTmetrix
# - Pingdom
# - Google PageSpeed Insights

# Command line test
curl -w "@curl-format.txt" -o /dev/null -s https://$CLOUDFRONT_DOMAIN

# Create curl-format.txt
cat > curl-format.txt << 'EOF'
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
EOF
```

### 11.2 Monitor Cache Hit Ratio

```bash
# Check CloudWatch metrics for cache hit ratio
aws cloudwatch get-metric-statistics \
    --namespace AWS/CloudFront \
    --metric-name CacheHitRate \
    --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
    --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 3600 \
    --statistics Average
```

## 🎉 Success!

Your CloudKart application is now powered by CloudFront CDN!

### ✅ What You've Accomplished:

- ✅ Created CloudFront distribution with optimized caching
- ✅ Configured HTTPS redirect and security
- ✅ Set up cache behaviors for different file types
- ✅ Implemented custom error pages
- ✅ Enabled compression and performance optimization
- ✅ Set up monitoring and logging
- ✅ Configured cache invalidation

### 🌐 Your CDN-Powered Website:
`https://d1234567890.cloudfront.net`

### 📊 Performance Benefits:

- **Global CDN**: Content served from edge locations worldwide
- **HTTPS Security**: All traffic encrypted
- **Improved Loading**: Faster page loads through caching
- **Compression**: Automatic gzip compression
- **DDoS Protection**: Built-in AWS Shield Standard

### 💰 Estimated Monthly Cost:
- **Data Transfer**: $0.085 per GB (first 10TB)
- **Requests**: $0.0075 per 10,000 requests
- **Total**: $5-15/month for typical traffic

### 🔧 Useful Commands:

```bash
# Get distribution info
aws cloudfront get-distribution --id $DISTRIBUTION_ID

# List all distributions
aws cloudfront list-distributions

# Create invalidation
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

# Monitor cache metrics
aws cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name CacheHitRate --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 3600 --statistics Average

# Update S3 files and invalidate cache
aws s3 sync your-files/ s3://cloudkart-website-1234567890/
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

### 🚀 Next Steps:

1. **Test globally** - Check performance from different regions
2. **Set up monitoring** - Configure CloudWatch alarms
3. **Custom domain** - Add your own domain name
4. **WAF protection** - Add AWS WAF for additional security
5. **Lambda@Edge** - Add serverless functions at the edge

Your CloudKart e-commerce platform now has global reach with enterprise-grade CDN! 🌍🛒

# S3 Static Website Hosting - Step by Step Tutorial

This tutorial will guide you through deploying CloudKart as a static website on Amazon S3.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- CloudKart application files ready

## 🎯 Overview

We'll create an S3 bucket, configure it for static website hosting, upload your files, and set up proper permissions.

## Step 1: Create S3 Bucket

### 1.1 Using AWS Console

1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com)
   - Sign in with your credentials

2. **Navigate to S3**
   - Search for "S3" in the services search bar
   - Click on "S3" service

3. **Create Bucket**
   - Click "Create bucket"
   - Enter bucket name: `cloudkart-website-[your-unique-id]`
   - Choose region: `US East (N. Virginia) us-east-1`
   - Click "Next"

4. **Configure Options**
   - Uncheck "Block all public access"
   - Check "I acknowledge that the current settings might result in this bucket and the objects within it becoming public"
   - Click "Next"

5. **Review and Create**
   - Review your settings
   - Click "Create bucket"

### 1.2 Using AWS CLI

```bash
# Create bucket
aws s3 mb s3://cloudkart-website-$(date +%s) --region us-east-1

# Example output: make_bucket: cloudkart-website-1703123456
```

## Step 2: Configure Bucket for Static Website Hosting

### 2.1 Using AWS Console

1. **Select Your Bucket**
   - Click on your bucket name

2. **Enable Static Website Hosting**
   - Go to "Properties" tab
   - Scroll down to "Static website hosting"
   - Click "Edit"

3. **Configure Settings**
   - Select "Enable"
   - Index document: `index.html`
   - Error document: `error.html`
   - Click "Save changes"

4. **Note the Website URL**
   - Copy the "Bucket website endpoint" URL
   - Example: `http://cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com`

### 2.2 Using AWS CLI

```bash
# Configure static website hosting
aws s3 website s3://cloudkart-website-1234567890 \
    --index-document index.html \
    --error-document error.html

# Get website endpoint
aws s3api get-bucket-website --bucket cloudkart-website-1234567890
```

## Step 3: Set Bucket Policy for Public Access

### 3.1 Using AWS Console

1. **Go to Permissions Tab**
   - Click "Permissions" tab in your bucket

2. **Edit Bucket Policy**
   - Scroll down to "Bucket policy"
   - Click "Edit"

3. **Add Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::cloudkart-website-1234567890/*"
       }
     ]
   }
   ```
   - Replace `cloudkart-website-1234567890` with your actual bucket name
   - Click "Save changes"

### 3.2 Using AWS CLI

```bash
# Create bucket policy file
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
EOF

# Apply bucket policy
aws s3api put-bucket-policy --bucket YOUR_BUCKET_NAME --policy file://bucket-policy.json
```

## Step 4: Prepare Application Files

### 4.1 Create Error Page

Create `error.html` in your application directory:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found - CloudKart</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { color: white; font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; }
        a { 
            color: white; 
            text-decoration: none; 
            background: rgba(255, 255, 255, 0.2);
            padding: 12px 24px;
            border-radius: 25px;
            transition: all 0.3s;
        }
        a:hover { 
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">← Back to Home</a>
    </div>
</body>
</html>
```

### 4.2 Optimize Files for S3

```bash
# Create optimized directory
mkdir s3-deployment
cp -r "simple html"/* s3-deployment/

# Add error page
cp error.html s3-deployment/
```

## Step 5: Upload Files to S3

### 5.1 Using AWS Console

1. **Go to Objects Tab**
   - Click "Objects" tab in your bucket

2. **Upload Files**
   - Click "Upload"
   - Click "Add files" or "Add folder"
   - Select your application files
   - Click "Upload"

3. **Set Metadata (Optional)**
   - For CSS files: `Content-Type: text/css`
   - For JS files: `Content-Type: application/javascript`
   - For HTML files: `Content-Type: text/html`

### 5.2 Using AWS CLI

```bash
# Upload all files
aws s3 sync s3-deployment/ s3://cloudkart-website-1234567890/

# Set proper content types
aws s3 cp s3-deployment/styles.css s3://cloudkart-website-1234567890/styles.css \
    --content-type "text/css" \
    --cache-control "max-age=31536000"

aws s3 cp s3-deployment/script.js s3://cloudkart-website-1234567890/script.js \
    --content-type "application/javascript" \
    --cache-control "max-age=31536000"

aws s3 cp s3-deployment/database/database.js s3://cloudkart-website-1234567890/database/database.js \
    --content-type "application/javascript" \
    --cache-control "max-age=31536000"

# Upload HTML files with shorter cache
aws s3 cp s3-deployment/index.html s3://cloudkart-website-1234567890/index.html \
    --content-type "text/html" \
    --cache-control "max-age=3600"

aws s3 cp s3-deployment/error.html s3://cloudkart-website-1234567890/error.html \
    --content-type "text/html" \
    --cache-control "max-age=3600"
```

## Step 6: Test Your Website

### 6.1 Access Your Website

1. **Get Website URL**
   - Go to bucket Properties
   - Copy "Bucket website endpoint"
   - Example: `http://cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com`

2. **Test in Browser**
   - Open the URL in your browser
   - Test all functionality:
     - Navigation
     - Product browsing
     - Cart functionality
     - User authentication
     - Search functionality

### 6.2 Verify File Access

```bash
# Test file access
curl -I http://cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com/
curl -I http://cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com/styles.css
curl -I http://cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com/script.js
```

## Step 7: Configure CORS (If Needed)

If you plan to make API calls from your website, configure CORS:

### 7.1 Using AWS Console

1. **Go to Permissions Tab**
2. **Scroll to Cross-origin resource sharing (CORS)**
3. **Click Edit**
4. **Add CORS Configuration**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### 7.2 Using AWS CLI

```bash
# Create CORS configuration
cat > cors-config.json << 'EOF'
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
EOF

# Apply CORS configuration
aws s3api put-bucket-cors --bucket cloudkart-website-1234567890 --cors-configuration file://cors-config.json
```

## Step 8: Set Up Monitoring

### 8.1 Enable Server Access Logging

```bash
# Create logging bucket
aws s3 mb s3://cloudkart-logs-$(date +%s)

# Enable logging
aws s3api put-bucket-logging --bucket cloudkart-website-1234567890 \
    --bucket-logging-status '{
        "LoggingEnabled": {
            "TargetBucket": "cloudkart-logs-1234567890",
            "TargetPrefix": "access-logs/"
        }
    }'
```

### 8.2 Set Up CloudWatch Metrics

```bash
# Enable CloudWatch metrics
aws s3api put-bucket-metrics-configuration --bucket cloudkart-website-1234567890 \
    --id EntireBucket \
    --metrics-configuration '{
        "Id": "EntireBucket",
        "Status": "Enabled"
    }'
```

## Step 9: Cost Optimization

### 9.1 Set Up Lifecycle Rules

```bash
# Create lifecycle configuration
cat > lifecycle-config.json << 'EOF'
{
  "Rules": [
    {
      "ID": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    },
    {
      "ID": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        }
      ]
    }
  ]
}
EOF

# Apply lifecycle configuration
aws s3api put-bucket-lifecycle-configuration --bucket cloudkart-website-1234567890 \
    --lifecycle-configuration file://lifecycle-config.json
```

### 9.2 Enable Versioning (Optional)

```bash
# Enable versioning
aws s3api put-bucket-versioning --bucket cloudkart-website-1234567890 \
    --versioning-configuration Status=Enabled
```

## Step 10: Security Best Practices

### 10.1 Block Public Access Settings

Ensure only necessary public access is allowed:

```bash
# Check public access settings
aws s3api get-public-access-block --bucket cloudkart-website-1234567890

# Configure public access block
aws s3api put-public-access-block --bucket cloudkart-website-1234567890 \
    --public-access-block-configuration '{
        "BlockPublicAcls": true,
        "IgnorePublicAcls": true,
        "BlockPublicPolicy": false,
        "RestrictPublicBuckets": false
    }'
```

### 10.2 Set Up Bucket Encryption

```bash
# Enable default encryption
aws s3api put-bucket-encryption --bucket cloudkart-website-1234567890 \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
```

## 🎉 Success!

Your CloudKart application is now successfully deployed on S3! 

### ✅ What You've Accomplished:

- ✅ Created S3 bucket for static website hosting
- ✅ Configured bucket for public read access
- ✅ Uploaded optimized application files
- ✅ Set up proper content types and caching
- ✅ Created custom error page
- ✅ Configured monitoring and logging
- ✅ Implemented security best practices

### 🌐 Your Website URL:
`http://cloudkart-website-1234567890.s3-website-us-east-1.amazonaws.com`

### 📊 Next Steps:

1. **Test thoroughly** - Verify all functionality works
2. **Set up CloudFront** - For better performance and HTTPS
3. **Configure custom domain** - Use Route 53 for your own domain
4. **Monitor usage** - Check CloudWatch metrics regularly
5. **Set up alerts** - For unusual traffic or errors

### 💰 Estimated Monthly Cost:
- **Storage**: ~$0.023 per GB
- **Requests**: ~$0.0004 per 1,000 requests
- **Total**: $1-5/month for typical usage

### 🔧 Useful Commands:

```bash
# Update files
aws s3 sync s3-deployment/ s3://cloudkart-website-1234567890/

# Check bucket contents
aws s3 ls s3://cloudkart-website-1234567890/ --recursive

# Get bucket info
aws s3api get-bucket-website --bucket cloudkart-website-1234567890

# Delete bucket (when needed)
aws s3 rb s3://cloudkart-website-1234567890 --force
```

Your CloudKart e-commerce platform is now live on AWS S3! 🛒☁️

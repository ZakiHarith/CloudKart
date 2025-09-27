# CloudFront CDN Setup Guide for CloudKart

CloudFront is AWS's Content Delivery Network (CDN) that makes your CloudKart web application faster and more reliable by caching content at locations around the world.

## 🎯 Why Use CloudFront for CloudKart?

- **Faster Loading**: Product images and static content served from locations closer to users
- **Better Performance**: Reduced latency for global customers
- **HTTPS Support**: Free SSL certificates for secure connections
- **Custom Domains**: Use your own domain name
- **Global Reach**: Serves content from 200+ locations worldwide
- **Cost Reduction**: Reduces EC2 load and bandwidth costs

## 📋 Prerequisites

- EC2 instance running with CloudKart application (see `ec2-setup.md`)
- DynamoDB database configured (see `dynamodb-setup.md`)
- S3 bucket for static files (see `s3-setup.md`)
- Your CloudKart application accessible via HTTP
- Optional: Custom domain name

## 🚀 Step-by-Step CloudFront Setup

### Step 1: Access CloudFront Console

1. **AWS Console**: Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. **Search CloudFront**: Type "CloudFront" in search bar
3. **Select Service**: Click on "CloudFront"
4. **Create Distribution**: Click "Create distribution"

### Step 2: Configure Origin

1. **Origin Domain**: 
   - Enter your EC2 instance's public IP or Elastic IP
   - Example: `ec2-54-123-45-67.compute-1.amazonaws.com`
   - Or use your custom domain if configured

2. **Origin Path**: Leave blank

3. **Origin Protocol Policy**: 
   - Select "HTTP Only" (CloudFront will handle HTTPS)
   - Or "Match Viewer" if you have SSL on EC2

4. **HTTP Port**: 80
5. **HTTPS Port**: 443 (if using SSL on EC2)

### Step 3: Configure Default Cache Behavior

1. **Viewer Protocol Policy**: 
   - Select "Redirect HTTP to HTTPS"
   - This ensures secure connections

2. **Allowed HTTP Methods**: 
   - Select "GET, HEAD"
   - Sufficient for static websites

3. **Cache Policy**: 
   - Select "Managed-CachingOptimized"
   - Optimized for static content

4. **Origin Request Policy**: 
   - Select "Managed-CORS-S3Origin"
   - Handles CORS for S3

### Step 4: Configure Distribution Settings

1. **Price Class**: 
   - Select "Use only US, Canada and Europe"
   - Reduces costs while maintaining good performance

2. **Alternate Domain Names (CNAMEs)**: 
   - Leave blank (unless you have a custom domain)
   - We'll add this later if needed

3. **Default Root Object**: 
   - Enter `index.html`
   - This is your main page

4. **Custom SSL Certificate**: 
   - Leave as default
   - CloudFront provides free SSL

### Step 5: Create Distribution

1. **Review Settings**: Check all configurations
2. **Create Distribution**: Click "Create distribution"
3. **Wait for Deployment**: This takes 10-15 minutes
4. **Note Distribution URL**: Copy the domain name (e.g., `d1234567890.cloudfront.net`)

### Step 6: Update S3 Bucket Policy

1. **Go to S3 Console**: Navigate to your bucket
2. **Permissions Tab**: Click "Permissions"
3. **Bucket Policy**: Click "Edit"
4. **Replace Policy**: Use this updated policy (replace placeholders):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::YOUR-ACCOUNT-ID:distribution/YOUR-DISTRIBUTION-ID"
                }
            }
        }
    ]
}
```

5. **Save Changes**: Click "Save changes"

### Step 7: Test Your CDN

1. **Use CloudFront URL**: Open your CloudFront domain
2. **Verify HTTPS**: Check that URL starts with `https://`
3. **Test Performance**: Compare loading speed with S3 URL
4. **Check Global Access**: Test from different locations if possible

## 🔧 Advanced Configuration

### Custom Domain Setup

If you have your own domain name:

1. **Add CNAME**: In CloudFront distribution settings
2. **SSL Certificate**: Request SSL certificate in AWS Certificate Manager
3. **DNS Configuration**: Update your domain's DNS records
4. **Wait for Propagation**: DNS changes can take 24-48 hours

### Cache Optimization

1. **Cache Headers**: CloudFront automatically sets appropriate headers
2. **TTL Settings**: Default TTL is 24 hours (good for static content)
3. **Invalidation**: Clear cache when updating files

### Error Pages

1. **Custom Error Pages**: Configure custom 404 and 500 pages
2. **Error Caching**: Set appropriate error caching times
3. **Fallback**: Ensure graceful fallbacks for missing content

## 📊 Performance Benefits

### Before CloudFront (S3 Only)
- **Loading Time**: 2-5 seconds (depending on location)
- **HTTPS**: Not available
- **Global Performance**: Varies by location

### After CloudFront (S3 + CDN)
- **Loading Time**: 0.5-2 seconds
- **HTTPS**: Free SSL certificate
- **Global Performance**: Consistent worldwide

## 💰 Cost Considerations

### CloudFront Pricing (Free Tier)
- **Data Transfer**: 1TB free per month
- **Requests**: 10,000,000 free per month
- **HTTPS Requests**: Included in free tier

### Cost Optimization Tips
1. **Price Class**: Use appropriate price class for your audience
2. **Compression**: Enable compression to reduce data transfer
3. **Monitoring**: Monitor usage to avoid unexpected charges

## 🔒 Security Enhancements

### HTTPS Enforcement
- **Automatic Redirect**: HTTP requests redirect to HTTPS
- **SSL Certificate**: Free SSL certificate from AWS
- **Security Headers**: CloudFront adds security headers

### Access Control
- **Geographic Restrictions**: Block access from specific countries
- **Referrer Restrictions**: Limit access to specific domains
- **Signed URLs**: Generate time-limited access URLs

## 📈 Monitoring & Analytics

### CloudWatch Metrics
1. **Request Count**: Monitor traffic volume
2. **Data Transfer**: Track bandwidth usage
3. **Error Rates**: Monitor 4xx and 5xx errors
4. **Cache Hit Ratio**: Measure cache effectiveness

### Real-Time Monitoring
1. **CloudWatch Dashboards**: Create custom monitoring dashboards
2. **Alarms**: Set up alerts for unusual activity
3. **Logs**: Enable access logs for detailed analysis

## 🚨 Troubleshooting

### Common Issues

**Issue**: Website not loading through CloudFront
**Solution**: 
- Check S3 bucket policy allows CloudFront access
- Verify distribution is fully deployed
- Ensure origin is correctly configured

**Issue**: HTTPS not working
**Solution**:
- Check SSL certificate is properly configured
- Verify viewer protocol policy is set correctly
- Wait for SSL certificate propagation

**Issue**: Slow performance
**Solution**:
- Check cache hit ratio
- Verify appropriate price class is selected
- Consider enabling compression

## 🎓 Learning Outcomes

After completing CloudFront setup, you'll understand:
- CDN concepts and benefits
- SSL certificate management
- Global content delivery
- Performance optimization
- Advanced AWS services integration

## 📚 Next Steps

1. **Custom Domain**: Add your own domain name
2. **Monitoring**: Set up CloudWatch dashboards
3. **Security**: Implement additional security measures
4. **Analytics**: Add website analytics
5. **Backup**: Set up automated backups

---

**Note**: CloudFront is optional but highly recommended for production websites. The free tier is generous and provides significant performance benefits.

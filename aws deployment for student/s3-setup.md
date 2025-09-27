# S3 Bucket Configuration Guide

This guide provides detailed instructions for configuring your S3 bucket for static website hosting.

## 🎯 What is S3 Static Website Hosting?

Amazon S3 can host static websites directly, serving HTML, CSS, JavaScript, and image files. It's perfect for:
- Portfolio websites
- Documentation sites
- Single-page applications
- Static blogs
- Project showcases

## 📋 S3 Bucket Setup Checklist

### ✅ Step 1: Create Bucket

1. **Navigate to S3**: In AWS Console, search "S3"
2. **Create Bucket**: Click "Create bucket"
3. **Name Your Bucket**: 
   - Must be globally unique
   - Use lowercase letters, numbers, hyphens
   - Example: `my-cloudkart-website-2024`
4. **Choose Region**: Select closest to your users
5. **Public Access**: Uncheck "Block all public access"
6. **Create**: Click "Create bucket"

### ✅ Step 2: Enable Static Website Hosting

1. **Select Your Bucket**: Click on bucket name
2. **Properties Tab**: Click "Properties"
3. **Static Website Hosting**: Scroll to this section
4. **Edit Settings**: Click "Edit"
5. **Configuration**:
   - **Enable**: Select "Enable"
   - **Hosting type**: "Host a static website"
   - **Index document**: `index.html`
   - **Error document**: `index.html`
6. **Save**: Click "Save changes"

### ✅ Step 3: Set Public Access Policy

1. **Permissions Tab**: Click "Permissions"
2. **Bucket Policy**: Scroll to "Bucket policy"
3. **Edit Policy**: Click "Edit"
4. **Add Policy**: Paste this JSON (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

5. **Save Changes**: Click "Save changes"

### ✅ Step 4: Upload Website Files

1. **Objects Tab**: Click "Objects"
2. **Upload**: Click "Upload"
3. **Add Files**: Select all files from your `simple html` folder
4. **Upload**: Click "Upload"

**Required Files**:
- `index.html` (main page)
- `script.js` (JavaScript functionality)
- `styles.css` (styling)
- `database/database.js` (database logic)
- `images/products/` (all product images)

### ✅ Step 5: Test Your Website

1. **Get Website URL**: 
   - Go to "Properties" tab
   - Scroll to "Static website hosting"
   - Copy the "Bucket website endpoint"
2. **Open URL**: Paste in browser
3. **Verify**: Your CloudKart website should load

## 🔧 Advanced Configuration

### Custom Error Pages

For better user experience, you can create custom error pages:

1. **Create `404.html`**: Custom not found page
2. **Create `500.html`**: Custom server error page
3. **Update Configuration**: 
   - Error document: `404.html`
   - Or keep as `index.html` for SPA routing

### Folder Structure

Your S3 bucket should look like this:
```
your-bucket-name/
├── index.html
├── script.js
├── styles.css
├── database/
│   └── database.js
└── images/
    └── products/
        ├── air.jpeg
        ├── balls.jpeg
        ├── cloths.jpeg
        └── ... (all other images)
```

### File Permissions

- **Public Read**: All files should be publicly readable
- **No Authentication**: Static websites don't require user authentication
- **CORS**: Not needed for basic static hosting

## 🚨 Common Issues & Solutions

### Issue: "Access Denied" Error
**Solution**: 
- Check bucket policy is correctly set
- Verify static website hosting is enabled
- Ensure you're using website endpoint URL, not bucket URL

### Issue: "NoSuchBucket" Error
**Solution**:
- Verify bucket name is correct
- Check you're in the right AWS region
- Ensure bucket exists and is accessible

### Issue: Files Not Loading
**Solution**:
- Check all files are uploaded
- Verify file names match exactly (case-sensitive)
- Ensure `index.html` is in root directory

### Issue: Images Not Displaying
**Solution**:
- Verify all image files are uploaded
- Check image file paths in HTML
- Ensure images are in correct folder structure

## 📊 Performance Optimization

### Enable Compression
1. **CloudFront**: Use CloudFront CDN (see `cloudfront-setup.md`)
2. **File Optimization**: Compress images before upload
3. **Minification**: Minify CSS and JavaScript files

### Caching Headers
- S3 automatically sets appropriate cache headers
- CloudFront provides additional caching options
- Static assets are cached for better performance

## 🔒 Security Considerations

### What's Safe for Static Hosting
- ✅ HTML, CSS, JavaScript files
- ✅ Images (JPG, PNG, GIF, SVG)
- ✅ Fonts and icons
- ✅ Static data files (JSON, CSV)

### What's NOT Safe
- ❌ Server-side code (PHP, Python, etc.)
- ❌ Database connections
- ❌ User authentication (use AWS Cognito)
- ❌ Dynamic content generation

### Security Best Practices
1. **HTTPS**: Use CloudFront for SSL certificates
2. **Access Logs**: Enable S3 access logging
3. **Monitoring**: Set up CloudWatch alarms
4. **Backup**: Regular backups of your files

## 💰 Cost Optimization

### Free Tier Limits
- **Storage**: 5GB free per month
- **Requests**: 20,000 GET requests free per month
- **Data Transfer**: 1GB free per month

### Cost-Saving Tips
1. **Compress Files**: Reduce file sizes before upload
2. **Optimize Images**: Use appropriate image formats and sizes
3. **Monitor Usage**: Check AWS billing dashboard regularly
4. **Use CloudFront**: Can reduce S3 request costs

## 📈 Monitoring & Analytics

### AWS CloudWatch
1. **Enable Metrics**: Monitor S3 usage
2. **Set Alarms**: Get notified of unusual activity
3. **View Logs**: Track access patterns

### Website Analytics
1. **Google Analytics**: Add tracking code to HTML
2. **AWS CloudFront**: Built-in analytics (if using CDN)
3. **S3 Access Logs**: Detailed access information

## 🎓 Learning Outcomes

After completing this setup, you'll understand:
- S3 bucket configuration
- Static website hosting concepts
- AWS security policies
- File upload and management
- Website deployment process

---

**Next Steps**: Once your S3 setup is complete, consider adding CloudFront CDN for better performance (see `cloudfront-setup.md`).

# Complete AWS Deployment Guide for CloudKart

This guide will walk you through deploying your CloudKart web application to AWS using a **complete, production-ready infrastructure** without using AWS CLI.

## 🎯 Overview

We'll deploy CloudKart using a comprehensive AWS infrastructure that includes:
- **VPC** - Secure network environment
- **EC2** - Web server hosting your application
- **DynamoDB** - NoSQL database for data storage
- **CloudFront** - Global CDN for performance
- **S3** - Static file storage and backups

This setup is:
- ✅ **FREE** tier eligible for students
- ✅ **Scalable** as your application grows
- ✅ **Secure** with proper network isolation
- ✅ **Professional** production-ready architecture

## 📋 Prerequisites

1. **AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com) (free tier)
2. **Your Application Files**: The `simple html` folder from your project
3. **Web Browser**: Any modern browser (Chrome, Firefox, Safari, Edge)
4. **Basic Knowledge**: Understanding of web applications and databases

## 🚀 Step-by-Step Deployment

### Phase 1: Infrastructure Setup

#### Step 1: Create AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card for verification, but won't be charged)
4. Verify your email and phone number
5. Choose the "Free Tier" plan

#### Step 2: Set Up VPC (Virtual Private Cloud)
1. Follow the detailed guide in `vpc-setup.md`
2. Create secure network environment
3. Configure subnets and security groups
4. Set up internet gateway

#### Step 3: Launch EC2 Instance
1. Follow the detailed guide in `ec2-setup.md`
2. Launch t2.micro instance (free tier)
3. Install web server and runtime
4. Configure security groups

### Phase 2: Database Setup

#### Step 4: Configure DynamoDB
1. Follow the detailed guide in `dynamodb-setup.md`
2. Create tables for products, users, and orders
3. Set up global secondary indexes
4. Add sample data

### Phase 3: Application Deployment

#### Step 5: Deploy Your Application
1. Upload your CloudKart files to EC2
2. Install dependencies and configure database connections
3. Start your web application
4. Test all functionality

### Phase 4: Performance Optimization

#### Step 6: Set Up CloudFront CDN
1. Follow the detailed guide in `cloudfront-setup.md`
2. Create distribution pointing to your EC2 instance
3. Configure caching policies
4. Enable HTTPS

#### Step 7: Configure S3 for Static Files
1. Follow the detailed guide in `s3-setup.md`
2. Upload product images and static assets
3. Configure CloudFront to serve from S3
4. Optimize file storage

## 🎉 Congratulations!

Your CloudKart web application is now live on AWS with a complete, production-ready infrastructure! You now have:

- ✅ **Secure Network**: VPC with proper security groups
- ✅ **Web Server**: EC2 instance running your application
- ✅ **Database**: DynamoDB storing your data
- ✅ **Global CDN**: CloudFront for fast worldwide access
- ✅ **Static Storage**: S3 for images and assets
- ✅ **HTTPS**: Secure connections via CloudFront

## 🔧 Optional: Add CloudFront CDN

For better performance and a custom domain, see `cloudfront-setup.md`.

## 🆘 Troubleshooting

### Application Not Loading
- Check EC2 instance is running
- Verify security group rules allow HTTP/HTTPS
- Check application logs on EC2
- Ensure database connection is working

### Database Connection Errors
- Verify DynamoDB tables exist
- Check AWS credentials on EC2
- Ensure IAM role has DynamoDB permissions
- Test database queries manually

### Performance Issues
- Check CloudFront cache hit ratio
- Monitor EC2 CPU and memory usage
- Optimize database queries
- Enable CloudFront compression

## 💰 Cost Monitoring

- **EC2**: Monitor instance hours and data transfer
- **DynamoDB**: Track read/write capacity usage
- **CloudFront**: Monitor data transfer and requests
- **S3**: Track storage and request usage

Set up billing alerts to avoid unexpected charges.

## 📚 Next Steps

1. **Custom Domain**: Add your own domain name
2. **SSL Certificate**: Enable HTTPS (included with CloudFront)
3. **Monitoring**: Set up CloudWatch dashboards
4. **Backup**: Configure automated backups
5. **Scaling**: Add auto-scaling for high traffic

## 🎓 Learning Outcomes

After completing this deployment, you'll understand:
- **AWS Core Services**: VPC, EC2, DynamoDB, CloudFront, S3
- **Cloud Architecture**: Multi-tier application design
- **Security**: Network isolation and access control
- **Performance**: CDN and caching strategies
- **Cost Management**: Resource optimization and monitoring
- **DevOps**: Infrastructure management and deployment

## 📞 Need Help?

Each guide includes troubleshooting sections and common issues. The setup is designed to be educational while providing real-world experience with AWS services.

---

**Ready to deploy?** Start with `architecture-overview.md` to understand the complete system, then follow the step-by-step guides!

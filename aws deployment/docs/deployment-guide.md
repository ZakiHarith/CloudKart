# CloudKart AWS Deployment Guide

This comprehensive guide will help you deploy your CloudKart web application to AWS using VPC, EC2, S3, and CloudFront.

## 🏗️ Architecture Overview

```
Internet → CloudFront → S3 (Static Files)
                    → EC2 (Backend API - Optional)
```

### Services Used:
- **S3**: Static website hosting for HTML, CSS, JS, and images
- **CloudFront**: Global CDN for fast content delivery and caching
- **EC2**: Backend server (optional for future API development)
- **VPC**: Network isolation and security
- **Route 53**: DNS management (optional)

## 📋 Prerequisites

Before starting the deployment, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Terraform** installed (version >= 1.0)
4. **Docker** installed (for containerized deployment)
5. **Git** installed

### AWS CLI Setup:
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your default output format (json)
```

## 🚀 Quick Start Deployment

### Step 1: Clone and Navigate
```bash
cd "aws deployment"
```

### Step 2: Deploy Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Step 3: Deploy Application
```bash
cd ..
./scripts/deploy.sh
```

## 📁 Project Structure

```
aws deployment/
├── README.md                 # This file
├── terraform/               # Infrastructure as Code
│   ├── main.tf             # Main Terraform configuration
│   ├── variables.tf        # Variable definitions
│   ├── outputs.tf          # Output values
│   ├── user_data.sh        # EC2 initialization script
│   └── modules/
│       └── vpc/            # VPC module
├── docker/                  # Docker configuration
│   ├── Dockerfile          # Container definition
│   └── docker-compose.yml  # Multi-container setup
├── scripts/                 # Deployment scripts
│   └── deploy.sh           # Main deployment script
├── config/                  # Configuration files
│   ├── nginx.conf          # Nginx configuration
│   └── aws-config.js       # AWS-specific settings
├── aws-optimized/           # AWS-optimized application files
│   └── index.html          # Optimized HTML file
└── docs/                    # Additional documentation
    └── deployment-guide.md  # Detailed deployment guide
```

## 🔧 Configuration Options

### Terraform Variables

You can customize the deployment by modifying `terraform/variables.tf`:

```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "cloudkart"
}

variable "create_ec2_instance" {
  description = "Whether to create EC2 instance"
  type        = bool
  default     = false
}
```

### Environment-Specific Deployments

For different environments, create separate Terraform workspaces:

```bash
# Create development environment
terraform workspace new dev
terraform apply -var="environment=development"

# Create production environment
terraform workspace new prod
terraform apply -var="environment=production"
```

## 💰 Cost Estimation

### Monthly Costs (Approximate):

| Service | Usage | Cost |
|---------|-------|------|
| **S3** | 1GB storage, 10K requests | $1-5 |
| **CloudFront** | 100GB transfer, 1M requests | $5-15 |
| **EC2** | t3.micro (if enabled) | $8-10 |
| **VPC** | NAT Gateway (if enabled) | $45 |
| **Route 53** | Hosted zone (if enabled) | $0.50 |

**Total Estimated Cost: $15-75/month** (depending on traffic and EC2 usage)

### Cost Optimization Tips:

1. **Use CloudFront caching** to reduce S3 requests
2. **Enable S3 lifecycle policies** for old files
3. **Use EC2 Spot Instances** for non-critical workloads
4. **Monitor usage** with AWS Cost Explorer

## 🔒 Security Considerations

### Implemented Security Features:

1. **S3 Bucket Policies**: Public read access only for static files
2. **CloudFront Security**: HTTPS enforcement and security headers
3. **VPC Security Groups**: Restricted access to EC2 instances
4. **IAM Roles**: Minimal permissions principle
5. **Security Headers**: XSS protection, content type options

### Additional Security Recommendations:

1. **Enable AWS WAF** for DDoS protection
2. **Use AWS Certificate Manager** for SSL certificates
3. **Implement VPC Flow Logs** for network monitoring
4. **Enable CloudTrail** for API logging
5. **Use AWS Secrets Manager** for sensitive data

## 📊 Monitoring and Logging

### CloudWatch Integration:

The deployment includes CloudWatch monitoring for:
- EC2 instance metrics (CPU, memory, disk)
- Application logs
- CloudFront access logs
- S3 access logs

### Log Groups Created:
- `/aws/ec2/cloudkart/system` - System logs
- `/aws/ec2/cloudkart/application` - Application logs

### Monitoring Setup:
```bash
# View logs
aws logs describe-log-groups --log-group-name-prefix "/aws/ec2/cloudkart"

# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "CloudKart-High-CPU" \
  --alarm-description "High CPU usage" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy infrastructure
      run: |
        cd terraform
        terraform init
        terraform apply -auto-approve
    
    - name: Deploy application
      run: |
        cd scripts
        chmod +x deploy.sh
        ./deploy.sh
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. S3 Bucket Already Exists
```bash
# Error: Bucket already exists
# Solution: Use a unique bucket name
terraform apply -var="project_name=cloudkart-unique-$(date +%s)"
```

#### 2. CloudFront Distribution Not Ready
```bash
# Wait for distribution to be ready
aws cloudfront wait distribution-deployed --id YOUR_DISTRIBUTION_ID
```

#### 3. EC2 Instance Not Accessible
```bash
# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Check VPC configuration
aws ec2 describe-vpcs --vpc-ids vpc-xxxxxxxxx
```

#### 4. Terraform State Issues
```bash
# Refresh state
terraform refresh

# Import existing resources
terraform import aws_s3_bucket.website existing-bucket-name
```

### Debug Commands:

```bash
# Check AWS credentials
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# Check CloudFront distributions
aws cloudfront list-distributions

# View EC2 instances
aws ec2 describe-instances
```

## 📈 Performance Optimization

### CloudFront Optimizations:

1. **Cache Behaviors**: Different TTL for different file types
2. **Compression**: Enable gzip compression
3. **HTTP/2**: Enable HTTP/2 support
4. **Edge Locations**: Choose appropriate price class

### S3 Optimizations:

1. **Storage Classes**: Use appropriate storage classes
2. **Lifecycle Policies**: Automatically transition old files
3. **Transfer Acceleration**: Enable for faster uploads

### Application Optimizations:

1. **Image Optimization**: Compress images before upload
2. **Code Minification**: Minify CSS and JavaScript
3. **CDN Usage**: Serve static assets from CloudFront

## 🔄 Backup and Recovery

### Backup Strategy:

1. **S3 Versioning**: Enable versioning for file recovery
2. **Terraform State**: Store state in S3 with versioning
3. **Database Backups**: Regular snapshots (if using RDS)
4. **Configuration Backups**: Version control all configs

### Recovery Procedures:

```bash
# Restore from S3 version
aws s3api list-object-versions --bucket your-bucket --prefix your-file

# Restore Terraform state
aws s3 cp s3://your-terraform-state/terraform.tfstate.backup .

# Recover EC2 instance
aws ec2 create-image --instance-id i-xxxxxxxxx --name "recovery-image"
```

## 🌐 Custom Domain Setup

### Route 53 Configuration:

1. **Create Hosted Zone**:
```bash
aws route53 create-hosted-zone --name example.com --caller-reference $(date +%s)
```

2. **Update Name Servers**:
```bash
# Get name servers
aws route53 get-hosted-zone --id YOUR_ZONE_ID

# Update your domain registrar with these name servers
```

3. **Create DNS Records**:
```bash
# Create A record pointing to CloudFront
aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch file://dns-record.json
```

### SSL Certificate:

1. **Request Certificate**:
```bash
aws acm request-certificate --domain-name example.com --validation-method DNS
```

2. **Validate Certificate**:
```bash
# Add DNS validation records to Route 53
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN
```

## 📞 Support and Resources

### AWS Documentation:
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [VPC User Guide](https://docs.aws.amazon.com/vpc/)

### Additional Resources:
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Pricing Calculator](https://calculator.aws/)

### Getting Help:
- Check the troubleshooting section above
- Review AWS CloudWatch logs
- Use AWS Support (if you have a support plan)
- Check the GitHub issues for this project

---

## 🎉 Congratulations!

You've successfully deployed CloudKart to AWS! Your application is now running on a scalable, secure, and cost-effective cloud infrastructure.

**Next Steps:**
1. Test your website functionality
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Implement CI/CD pipeline
5. Add additional features as needed

Happy cloud shopping! 🛒☁️

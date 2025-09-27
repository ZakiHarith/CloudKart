# AWS Architecture Overview for CloudKart

This guide explains the complete AWS infrastructure architecture for hosting your CloudKart web application.

## 🏗️ Architecture Diagram

```
Internet
    ↓
CloudFront CDN (Global Distribution)
    ↓
Application Load Balancer (Optional)
    ↓
EC2 Instance (Web Server)
    ↓
VPC (Virtual Private Cloud)
    ├── Public Subnet (EC2)
    ├── Private Subnet (Database - Optional)
    └── Internet Gateway
    ↓
DynamoDB (Database)
    ↓
S3 (Static Files & Backups)
```

## 🎯 Component Overview

### 1. **VPC (Virtual Private Cloud)**
- **Purpose**: Secure, isolated network environment
- **Benefits**: 
  - Complete control over network configuration
  - Security groups for access control
  - Subnet management for resource organization
- **Cost**: FREE (no additional charges)

### 2. **EC2 (Elastic Compute Cloud)**
- **Purpose**: Virtual server hosting your web application
- **Instance Type**: t2.micro (free tier eligible)
- **Operating System**: Amazon Linux 2 or Ubuntu
- **Web Server**: Apache/Nginx with Node.js or Python
- **Cost**: FREE (750 hours/month for 12 months)

### 3. **DynamoDB (NoSQL Database)**
- **Purpose**: Store application data (users, products, orders)
- **Benefits**:
  - Serverless database
  - Automatic scaling
  - Built-in security
- **Cost**: FREE (25GB storage, 25 read/write capacity units)

### 4. **CloudFront (Content Delivery Network)**
- **Purpose**: Global content distribution and caching
- **Benefits**:
  - Faster loading times worldwide
  - Reduced server load
  - SSL certificate included
- **Cost**: FREE (1TB data transfer, 10M requests)

### 5. **S3 (Simple Storage Service)**
- **Purpose**: Static file storage and backups
- **Use Cases**:
  - Product images
  - User uploads
  - Application backups
  - Static assets
- **Cost**: FREE (5GB storage, 20K requests)

## 🔄 Data Flow

### User Request Flow
1. **User** visits your website URL
2. **CloudFront** checks cache for content
3. If not cached, **CloudFront** requests from **EC2**
4. **EC2** processes request and queries **DynamoDB**
5. **EC2** serves response back through **CloudFront**
6. **CloudFront** caches response and delivers to user

### Static Content Flow
1. **User** requests images or static files
2. **CloudFront** serves from cache if available
3. If not cached, **CloudFront** fetches from **S3**
4. **CloudFront** caches and serves to user

## 🛡️ Security Architecture

### Network Security
- **VPC**: Isolated network environment
- **Security Groups**: Firewall rules for EC2 instances
- **NACLs**: Network-level access control
- **Private Subnets**: Database isolation (optional)

### Application Security
- **HTTPS**: SSL certificates via CloudFront
- **IAM Roles**: Secure access to AWS services
- **Encryption**: Data encryption at rest and in transit
- **Access Logging**: Monitor all access patterns

## 📊 Scalability Design

### Horizontal Scaling
- **EC2 Auto Scaling**: Add instances during high traffic
- **DynamoDB**: Automatic scaling based on demand
- **CloudFront**: Global edge locations

### Vertical Scaling
- **EC2 Instance Types**: Upgrade to larger instances
- **DynamoDB Capacity**: Increase read/write capacity
- **S3 Storage**: Unlimited storage capacity

## 💰 Cost Optimization Strategy

### Free Tier Maximization
1. **EC2**: Use t2.micro instances (free tier)
2. **DynamoDB**: Stay within free tier limits
3. **CloudFront**: Monitor usage to stay free
4. **S3**: Optimize storage and requests

### Cost Monitoring
- **AWS Cost Explorer**: Track spending
- **Billing Alerts**: Set up cost notifications
- **Resource Tagging**: Track costs by project
- **Regular Reviews**: Monthly cost analysis

## 🔧 Deployment Phases

### Phase 1: Basic Setup
1. Create VPC and subnets
2. Launch EC2 instance
3. Install web server and application
4. Configure basic security groups

### Phase 2: Database Integration
1. Create DynamoDB tables
2. Configure application database connections
3. Implement data models
4. Test database operations

### Phase 3: CDN and Optimization
1. Set up CloudFront distribution
2. Configure caching policies
3. Enable compression
4. Monitor performance

### Phase 4: Production Readiness
1. Set up monitoring and logging
2. Configure backups
3. Implement security best practices
4. Performance optimization

## 🎓 Learning Outcomes

After implementing this architecture, students will understand:

### AWS Core Services
- **VPC**: Network architecture and security
- **EC2**: Virtual server management
- **DynamoDB**: NoSQL database concepts
- **CloudFront**: CDN and caching strategies
- **S3**: Object storage and static hosting

### Cloud Architecture Concepts
- **Scalability**: Horizontal vs vertical scaling
- **Security**: Defense in depth strategy
- **Performance**: Caching and optimization
- **Cost Management**: Resource optimization
- **Monitoring**: Observability and alerting

### DevOps Practices
- **Infrastructure as Code**: CloudFormation/Terraform
- **CI/CD**: Continuous integration/deployment
- **Monitoring**: Application and infrastructure monitoring
- **Backup**: Data protection strategies

## 🚀 Next Steps

1. **Start with VPC**: Set up your network foundation
2. **Launch EC2**: Create your web server
3. **Configure Database**: Set up DynamoDB
4. **Add CDN**: Implement CloudFront
5. **Optimize**: Monitor and improve performance

## 📚 Additional Resources

- **AWS Well-Architected Framework**: Best practices guide
- **AWS Free Tier**: Service limits and usage
- **AWS Documentation**: Comprehensive service guides
- **AWS Training**: Free and paid learning resources

---

**Ready to start?** Begin with the `vpc-setup.md` guide to create your network foundation!

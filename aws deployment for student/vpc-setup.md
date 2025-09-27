# VPC Setup Guide for CloudKart

This guide walks you through creating a Virtual Private Cloud (VPC) for your CloudKart web application.

## 🎯 What is VPC?

A Virtual Private Cloud (VPC) is your own isolated network in AWS where you can launch AWS resources in a virtual network that you define. Think of it as your own private data center in the cloud.

## 🏗️ VPC Architecture for CloudKart

```
VPC (10.0.0.0/16)
├── Public Subnet (10.0.1.0/24)
│   ├── EC2 Instance (Web Server)
│   └── Internet Gateway
├── Private Subnet (10.0.2.0/24) - Optional
│   └── Database (if using RDS)
└── Availability Zone: us-east-1a
```

## 📋 Prerequisites

- AWS Account with free tier access
- Basic understanding of networking concepts
- Access to AWS Management Console

## 🚀 Step-by-Step VPC Setup

### Step 1: Access VPC Console

1. **AWS Console**: Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. **Search VPC**: Type "VPC" in the search bar
3. **Select Service**: Click on "VPC"
4. **Create VPC**: Click "Create VPC"

### Step 2: Configure VPC Settings

1. **VPC Settings**:
   - **Name tag**: `CloudKart-VPC`
   - **IPv4 CIDR block**: `10.0.0.0/16`
   - **IPv6 CIDR block**: No IPv6 CIDR block
   - **Tenancy**: Default

2. **Click "Create VPC"**

### Step 3: Create Internet Gateway

1. **VPC Dashboard**: Go to "Internet Gateways" in left sidebar
2. **Create Internet Gateway**: Click "Create internet gateway"
3. **Configure**:
   - **Name tag**: `CloudKart-IGW`
4. **Create**: Click "Create internet gateway"
5. **Attach**: Click "Actions" → "Attach to VPC"
6. **Select VPC**: Choose your `CloudKart-VPC`
7. **Attach**: Click "Attach internet gateway"

### Step 4: Create Public Subnet

1. **Subnets**: Go to "Subnets" in left sidebar
2. **Create Subnet**: Click "Create subnet"
3. **Configure**:
   - **VPC ID**: Select `CloudKart-VPC`
   - **Subnet name**: `CloudKart-Public-Subnet`
   - **Availability Zone**: Choose `us-east-1a` (or your preferred AZ)
   - **IPv4 CIDR block**: `10.0.1.0/24`
4. **Create**: Click "Create subnet"

### Step 5: Configure Route Table

1. **Route Tables**: Go to "Route Tables" in left sidebar
2. **Find Your Route Table**: Look for route table associated with your VPC
3. **Edit Routes**: Click "Actions" → "Edit routes"
4. **Add Route**: Click "Add route"
5. **Configure Route**:
   - **Destination**: `0.0.0.0/0`
   - **Target**: Select "Internet Gateway" → Choose your IGW
6. **Save Changes**: Click "Save changes"

### Step 6: Associate Subnet with Route Table

1. **Subnet Associations**: In your route table, go to "Subnet associations" tab
2. **Edit Subnet Associations**: Click "Edit subnet associations"
3. **Select Subnet**: Check `CloudKart-Public-Subnet`
4. **Save**: Click "Save associations"

### Step 7: Enable Auto-Assign Public IP

1. **Subnets**: Go back to "Subnets"
2. **Select Subnet**: Click on `CloudKart-Public-Subnet`
3. **Actions**: Click "Actions" → "Modify auto-assign IP settings"
4. **Enable**: Check "Enable auto-assign public IPv4 address"
5. **Save**: Click "Save"

## 🔧 Security Group Configuration

### Create Security Group for Web Server

1. **Security Groups**: Go to "Security Groups" in left sidebar
2. **Create Security Group**: Click "Create security group"
3. **Configure**:
   - **Security group name**: `CloudKart-Web-SG`
   - **Description**: `Security group for CloudKart web server`
   - **VPC**: Select `CloudKart-VPC`

### Add Inbound Rules

1. **Inbound Rules**: Click "Add rule"
2. **HTTP Access**:
   - **Type**: HTTP
   - **Source**: Anywhere-IPv4 (0.0.0.0/0)
   - **Description**: `Allow HTTP traffic`

3. **HTTPS Access**:
   - **Type**: HTTPS
   - **Source**: Anywhere-IPv4 (0.0.0.0/0)
   - **Description**: `Allow HTTPS traffic`

4. **SSH Access** (for EC2 management):
   - **Type**: SSH
   - **Source**: My IP (your current IP)
   - **Description**: `Allow SSH from my IP`

5. **Custom Port** (for Node.js/Python app):
   - **Type**: Custom TCP
   - **Port**: 3000 (or your app port)
   - **Source**: Anywhere-IPv4 (0.0.0.0/0)
   - **Description**: `Allow custom app port`

6. **Create**: Click "Create security group"

## 🎯 VPC Configuration Summary

After setup, you should have:

### ✅ VPC Components
- **VPC**: `CloudKart-VPC` (10.0.0.0/16)
- **Internet Gateway**: `CloudKart-IGW`
- **Public Subnet**: `CloudKart-Public-Subnet` (10.0.1.0/24)
- **Route Table**: Configured with internet access
- **Security Group**: `CloudKart-Web-SG` with necessary rules

### ✅ Network Flow
1. **Internet** → **Internet Gateway** → **Public Subnet** → **EC2 Instance**
2. **EC2 Instance** → **Public Subnet** → **Internet Gateway** → **Internet**

## 🔍 Verification Steps

### Check VPC Configuration
1. **VPC Dashboard**: Verify all components are created
2. **Route Table**: Confirm internet route (0.0.0.0/0 → IGW)
3. **Subnet**: Verify auto-assign public IP is enabled
4. **Security Group**: Confirm all required rules are present

### Test Connectivity (After EC2 Setup)
1. **Launch EC2**: Create instance in your subnet
2. **Public IP**: Verify instance gets public IP
3. **Internet Access**: Test internet connectivity from instance
4. **Security Rules**: Verify web traffic can reach instance

## 🚨 Common Issues & Solutions

### Issue: EC2 Instance Has No Public IP
**Solution**:
- Check subnet auto-assign public IP setting
- Verify route table has internet gateway route
- Ensure internet gateway is attached to VPC

### Issue: Cannot SSH to EC2 Instance
**Solution**:
- Check security group SSH rule
- Verify source IP in security group
- Ensure instance is in public subnet

### Issue: Web Traffic Not Reaching Instance
**Solution**:
- Check security group HTTP/HTTPS rules
- Verify application is listening on correct port
- Confirm route table configuration

## 💰 Cost Considerations

### VPC Costs
- **VPC**: FREE (no additional charges)
- **Internet Gateway**: FREE (no additional charges)
- **NAT Gateway**: $0.045/hour (only if using private subnets)
- **VPC Endpoints**: $0.01/hour (optional)

### Cost Optimization Tips
1. **Use Public Subnets**: Avoid NAT Gateway costs
2. **Single AZ**: Use one availability zone for simplicity
3. **Minimal Subnets**: Only create necessary subnets
4. **Monitor Usage**: Track data transfer costs

## 🎓 Learning Outcomes

After completing VPC setup, you'll understand:

### Networking Concepts
- **CIDR Blocks**: IP address range notation
- **Subnets**: Network segmentation
- **Route Tables**: Traffic routing rules
- **Internet Gateway**: Internet connectivity

### AWS VPC Features
- **Security Groups**: Instance-level firewall
- **NACLs**: Subnet-level firewall
- **VPC Peering**: Connect multiple VPCs
- **Transit Gateway**: Centralized network management

### Security Best Practices
- **Least Privilege**: Minimal required access
- **Defense in Depth**: Multiple security layers
- **Network Isolation**: Separate public/private resources
- **Access Logging**: Monitor network traffic

## 📚 Next Steps

1. **EC2 Setup**: Launch instance in your VPC (see `ec2-setup.md`)
2. **Database Setup**: Configure DynamoDB (see `dynamodb-setup.md`)
3. **CDN Setup**: Add CloudFront distribution (see `cloudfront-setup.md`)
4. **Monitoring**: Set up CloudWatch monitoring

## 🔧 Advanced Configuration (Optional)

### Private Subnet Setup
If you want to add a private subnet for additional security:

1. **Create Private Subnet**: `10.0.2.0/24`
2. **NAT Gateway**: For outbound internet access
3. **Database Subnet Group**: For RDS instances
4. **Additional Security Groups**: For private resources

### Multi-AZ Setup
For high availability:

1. **Multiple Subnets**: Create subnets in different AZs
2. **Load Balancer**: Distribute traffic across AZs
3. **Database Replication**: Multi-AZ database setup

---

**Ready for the next step?** Proceed to `ec2-setup.md` to launch your web server instance!

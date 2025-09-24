# VPC Network Setup - Step by Step Tutorial

This tutorial will guide you through creating a complete Virtual Private Cloud (VPC) infrastructure for your CloudKart application, including subnets, security groups, and network connectivity.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Basic understanding of networking concepts
- Understanding of CIDR notation

## 🎯 Overview

We'll create a production-ready VPC with public and private subnets, internet gateway, NAT gateway, and security groups for a secure and scalable CloudKart deployment.

## Step 1: Design Your VPC Architecture

### 1.1 Network Planning

```
CloudKart VPC Architecture:
├── VPC (10.0.0.0/16)
├── Public Subnets (Web Tier)
│   ├── Public Subnet 1 (10.0.1.0/24) - AZ-a
│   └── Public Subnet 2 (10.0.2.0/24) - AZ-b
├── Private Subnets (Application Tier)
│   ├── Private Subnet 1 (10.0.10.0/24) - AZ-a
│   └── Private Subnet 2 (10.0.20.0/24) - AZ-b
└── Database Subnets (Data Tier)
    ├── DB Subnet 1 (10.0.100.0/24) - AZ-a
    └── DB Subnet 2 (10.0.200.0/24) - AZ-b
```

### 1.2 Security Groups Planning

- **Web Security Group**: Allow HTTP/HTTPS from internet
- **Application Security Group**: Allow traffic from web tier
- **Database Security Group**: Allow traffic from application tier

## Step 2: Create VPC

### 2.1 Using AWS Console

1. **Navigate to VPC**
   - Login to AWS Console
   - Search for "VPC"
   - Click on VPC service

2. **Create VPC**
   - Click "Create VPC"
   - Select "VPC and more" for wizard
   - **Name tag**: `CloudKart-VPC`
   - **IPv4 CIDR block**: `10.0.0.0/16`
   - **IPv6 CIDR block**: No IPv6 CIDR block
   - **Tenancy**: Default

3. **Configure Subnets**
   - **Number of Availability Zones**: `2`
   - **Number of public subnets**: `2`
   - **Number of private subnets**: `2`
   - **NAT gateways**: `1 per AZ`
   - **VPC endpoints**: None

4. **Create VPC**
   - Review configuration
   - Click "Create VPC"
   - Wait for creation to complete

### 2.2 Using AWS CLI

```bash
# Set variables
export AWS_REGION="us-east-1"
export VPC_NAME="CloudKart-VPC"
export VPC_CIDR="10.0.0.0/16"

# Create VPC
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block $VPC_CIDR \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$VPC_NAME}]" \
    --query 'Vpc.VpcId' \
    --output text)

echo "VPC ID: $VPC_ID"

# Enable DNS resolution and DNS hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames

# Get availability zones
AZ1=$(aws ec2 describe-availability-zones --query 'AvailabilityZones[0].ZoneName' --output text)
AZ2=$(aws ec2 describe-availability-zones --query 'AvailabilityZones[1].ZoneName' --output text)

echo "Availability Zones: $AZ1, $AZ2"
```

## Step 3: Create Internet Gateway

### 3.1 Using AWS Console

1. **Create Internet Gateway**
   - In VPC Dashboard, click "Internet Gateways"
   - Click "Create Internet Gateway"
   - **Name tag**: `CloudKart-IGW`
   - Click "Create Internet Gateway"

2. **Attach to VPC**
   - Select the created IGW
   - Click "Actions" → "Attach to VPC"
   - Select your CloudKart VPC
   - Click "Attach Internet Gateway"

### 3.2 Using AWS CLI

```bash
# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=CloudKart-IGW}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)

echo "Internet Gateway ID: $IGW_ID"

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

echo "Internet Gateway attached to VPC"
```

## Step 4: Create Subnets

### 4.1 Create Public Subnets

#### Using AWS Console

1. **Create Public Subnet 1**
   - Go to "Subnets"
   - Click "Create Subnet"
   - **VPC ID**: Select CloudKart-VPC
   - **Subnet name**: `CloudKart-Public-Subnet-1`
   - **Availability Zone**: First AZ
   - **IPv4 CIDR block**: `10.0.1.0/24`
   - Click "Create Subnet"

2. **Create Public Subnet 2**
   - Repeat with:
   - **Subnet name**: `CloudKart-Public-Subnet-2`
   - **Availability Zone**: Second AZ
   - **IPv4 CIDR block**: `10.0.2.0/24`

3. **Enable Auto-assign Public IPs**
   - Select each public subnet
   - Click "Actions" → "Modify auto-assign IP settings"
   - Check "Enable auto-assign public IPv4 address"
   - Click "Save"

#### Using AWS CLI

```bash
# Create Public Subnet 1
PUBLIC_SUBNET_1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone $AZ1 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=CloudKart-Public-Subnet-1},{Key=Type,Value=Public}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# Create Public Subnet 2
PUBLIC_SUBNET_2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone $AZ2 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=CloudKart-Public-Subnet-2},{Key=Type,Value=Public}]" \
    --query 'Subnet.SubnetId' \
    --output text)

echo "Public Subnet 1 ID: $PUBLIC_SUBNET_1_ID"
echo "Public Subnet 2 ID: $PUBLIC_SUBNET_2_ID"

# Enable auto-assign public IPs for public subnets
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_1_ID --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_2_ID --map-public-ip-on-launch
```

### 4.2 Create Private Subnets

#### Using AWS CLI

```bash
# Create Private Subnet 1
PRIVATE_SUBNET_1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.10.0/24 \
    --availability-zone $AZ1 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=CloudKart-Private-Subnet-1},{Key=Type,Value=Private}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# Create Private Subnet 2
PRIVATE_SUBNET_2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.20.0/24 \
    --availability-zone $AZ2 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=CloudKart-Private-Subnet-2},{Key=Type,Value=Private}]" \
    --query 'Subnet.SubnetId' \
    --output text)

echo "Private Subnet 1 ID: $PRIVATE_SUBNET_1_ID"
echo "Private Subnet 2 ID: $PRIVATE_SUBNET_2_ID"
```

### 4.3 Create Database Subnets

```bash
# Create Database Subnet 1
DB_SUBNET_1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.100.0/24 \
    --availability-zone $AZ1 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=CloudKart-DB-Subnet-1},{Key=Type,Value=Database}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# Create Database Subnet 2
DB_SUBNET_2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.200.0/24 \
    --availability-zone $AZ2 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=CloudKart-DB-Subnet-2},{Key=Type,Value=Database}]" \
    --query 'Subnet.SubnetId' \
    --output text)

echo "Database Subnet 1 ID: $DB_SUBNET_1_ID"
echo "Database Subnet 2 ID: $DB_SUBNET_2_ID"
```

## Step 5: Create NAT Gateways

### 5.1 Allocate Elastic IPs

```bash
# Allocate Elastic IP for NAT Gateway 1
EIP_1_ALLOC_ID=$(aws ec2 allocate-address \
    --domain vpc \
    --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=CloudKart-NAT-EIP-1}]" \
    --query 'AllocationId' \
    --output text)

# Allocate Elastic IP for NAT Gateway 2
EIP_2_ALLOC_ID=$(aws ec2 allocate-address \
    --domain vpc \
    --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=CloudKart-NAT-EIP-2}]" \
    --query 'AllocationId' \
    --output text)

echo "Elastic IP 1 Allocation ID: $EIP_1_ALLOC_ID"
echo "Elastic IP 2 Allocation ID: $EIP_2_ALLOC_ID"
```

### 5.2 Create NAT Gateways

```bash
# Create NAT Gateway 1 in Public Subnet 1
NAT_GW_1_ID=$(aws ec2 create-nat-gateway \
    --subnet-id $PUBLIC_SUBNET_1_ID \
    --allocation-id $EIP_1_ALLOC_ID \
    --tag-specifications "ResourceType=nat-gateway,Tags=[{Key=Name,Value=CloudKart-NAT-Gateway-1}]" \
    --query 'NatGateway.NatGatewayId' \
    --output text)

# Create NAT Gateway 2 in Public Subnet 2
NAT_GW_2_ID=$(aws ec2 create-nat-gateway \
    --subnet-id $PUBLIC_SUBNET_2_ID \
    --allocation-id $EIP_2_ALLOC_ID \
    --tag-specifications "ResourceType=nat-gateway,Tags=[{Key=Name,Value=CloudKart-NAT-Gateway-2}]" \
    --query 'NatGateway.NatGatewayId' \
    --output text)

echo "NAT Gateway 1 ID: $NAT_GW_1_ID"
echo "NAT Gateway 2 ID: $NAT_GW_2_ID"

# Wait for NAT Gateways to be available
echo "Waiting for NAT Gateways to be available..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW_1_ID $NAT_GW_2_ID
echo "NAT Gateways are now available!"
```

## Step 6: Create Route Tables

### 6.1 Create Public Route Table

```bash
# Create Public Route Table
PUBLIC_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=CloudKart-Public-RT}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

echo "Public Route Table ID: $PUBLIC_RT_ID"

# Add route to Internet Gateway
aws ec2 create-route \
    --route-table-id $PUBLIC_RT_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID

# Associate public subnets with public route table
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_1_ID --route-table-id $PUBLIC_RT_ID
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_2_ID --route-table-id $PUBLIC_RT_ID

echo "Public route table configured"
```

### 6.2 Create Private Route Tables

```bash
# Create Private Route Table 1
PRIVATE_RT_1_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=CloudKart-Private-RT-1}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

# Create Private Route Table 2
PRIVATE_RT_2_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=CloudKart-Private-RT-2}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

echo "Private Route Table 1 ID: $PRIVATE_RT_1_ID"
echo "Private Route Table 2 ID: $PRIVATE_RT_2_ID"

# Add routes to NAT Gateways
aws ec2 create-route \
    --route-table-id $PRIVATE_RT_1_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --nat-gateway-id $NAT_GW_1_ID

aws ec2 create-route \
    --route-table-id $PRIVATE_RT_2_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --nat-gateway-id $NAT_GW_2_ID

# Associate private subnets with private route tables
aws ec2 associate-route-table --subnet-id $PRIVATE_SUBNET_1_ID --route-table-id $PRIVATE_RT_1_ID
aws ec2 associate-route-table --subnet-id $PRIVATE_SUBNET_2_ID --route-table-id $PRIVATE_RT_2_ID

echo "Private route tables configured"
```

### 6.3 Create Database Route Table

```bash
# Create Database Route Table
DB_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=CloudKart-DB-RT}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

echo "Database Route Table ID: $DB_RT_ID"

# Associate database subnets with database route table
aws ec2 associate-route-table --subnet-id $DB_SUBNET_1_ID --route-table-id $DB_RT_ID
aws ec2 associate-route-table --subnet-id $DB_SUBNET_2_ID --route-table-id $DB_RT_ID

echo "Database route table configured"
```

## Step 7: Create Security Groups

### 7.1 Web Tier Security Group

```bash
# Create Web Security Group
WEB_SG_ID=$(aws ec2 create-security-group \
    --group-name CloudKart-Web-SG \
    --description "Security group for CloudKart web servers" \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=CloudKart-Web-SG}]" \
    --query 'GroupId' \
    --output text)

echo "Web Security Group ID: $WEB_SG_ID"

# Add inbound rules for web security group
aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

echo "Web security group rules configured"
```

### 7.2 Application Tier Security Group

```bash
# Create Application Security Group
APP_SG_ID=$(aws ec2 create-security-group \
    --group-name CloudKart-App-SG \
    --description "Security group for CloudKart application servers" \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=CloudKart-App-SG}]" \
    --query 'GroupId' \
    --output text)

echo "Application Security Group ID: $APP_SG_ID"

# Add inbound rules for application security group
aws ec2 authorize-security-group-ingress \
    --group-id $APP_SG_ID \
    --protocol tcp \
    --port 3000 \
    --source-group $WEB_SG_ID

aws ec2 authorize-security-group-ingress \
    --group-id $APP_SG_ID \
    --protocol tcp \
    --port 22 \
    --source-group $WEB_SG_ID

echo "Application security group rules configured"
```

### 7.3 Database Tier Security Group

```bash
# Create Database Security Group
DB_SG_ID=$(aws ec2 create-security-group \
    --group-name CloudKart-DB-SG \
    --description "Security group for CloudKart database servers" \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=CloudKart-DB-SG}]" \
    --query 'GroupId' \
    --output text)

echo "Database Security Group ID: $DB_SG_ID"

# Add inbound rules for database security group
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 3306 \
    --source-group $APP_SG_ID

aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 5432 \
    --source-group $APP_SG_ID

aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 27017 \
    --source-group $APP_SG_ID

echo "Database security group rules configured"
```

### 7.4 Load Balancer Security Group

```bash
# Create Load Balancer Security Group
ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name CloudKart-ALB-SG \
    --description "Security group for CloudKart Application Load Balancer" \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=CloudKart-ALB-SG}]" \
    --query 'GroupId' \
    --output text)

echo "Load Balancer Security Group ID: $ALB_SG_ID"

# Add inbound rules for load balancer security group
aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

echo "Load balancer security group rules configured"
```

## Step 8: Create Network ACLs (Optional)

### 8.1 Create Custom Network ACL

```bash
# Create Network ACL
NACL_ID=$(aws ec2 create-network-acl \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=network-acl,Tags=[{Key=Name,Value=CloudKart-NACL}]" \
    --query 'NetworkAcl.NetworkAclId' \
    --output text)

echo "Network ACL ID: $NACL_ID"

# Add inbound rules
aws ec2 create-network-acl-entry \
    --network-acl-id $NACL_ID \
    --rule-number 100 \
    --protocol tcp \
    --rule-action allow \
    --port-range From=80,To=80 \
    --cidr-block 0.0.0.0/0

aws ec2 create-network-acl-entry \
    --network-acl-id $NACL_ID \
    --rule-number 110 \
    --protocol tcp \
    --rule-action allow \
    --port-range From=443,To=443 \
    --cidr-block 0.0.0.0/0

aws ec2 create-network-acl-entry \
    --network-acl-id $NACL_ID \
    --rule-number 120 \
    --protocol tcp \
    --rule-action allow \
    --port-range From=22,To=22 \
    --cidr-block 0.0.0.0/0

# Add outbound rules
aws ec2 create-network-acl-entry \
    --network-acl-id $NACL_ID \
    --rule-number 100 \
    --protocol tcp \
    --rule-action allow \
    --port-range From=0,To=65535 \
    --cidr-block 0.0.0.0/0 \
    --egress

echo "Network ACL rules configured"
```

## Step 9: Create VPC Endpoints (Optional)

### 9.1 S3 VPC Endpoint

```bash
# Create S3 VPC Endpoint
S3_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --service-name com.amazonaws.$AWS_REGION.s3 \
    --vpc-endpoint-type Gateway \
    --route-table-ids $PRIVATE_RT_1_ID $PRIVATE_RT_2_ID \
    --tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=CloudKart-S3-Endpoint}]" \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text)

echo "S3 VPC Endpoint ID: $S3_ENDPOINT_ID"
```

### 9.2 DynamoDB VPC Endpoint

```bash
# Create DynamoDB VPC Endpoint
DYNAMODB_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --service-name com.amazonaws.$AWS_REGION.dynamodb \
    --vpc-endpoint-type Gateway \
    --route-table-ids $PRIVATE_RT_1_ID $PRIVATE_RT_2_ID \
    --tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=CloudKart-DynamoDB-Endpoint}]" \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text)

echo "DynamoDB VPC Endpoint ID: $DYNAMODB_ENDPOINT_ID"
```

## Step 10: Enable VPC Flow Logs

### 10.1 Create CloudWatch Log Group

```bash
# Create CloudWatch log group for VPC Flow Logs
aws logs create-log-group --log-group-name /aws/vpc/cloudkart-flowlogs

# Create IAM role for VPC Flow Logs
cat > flow-logs-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "vpc-flow-logs.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the role
FLOW_LOGS_ROLE_ARN=$(aws iam create-role \
    --role-name CloudKart-VPC-FlowLogs-Role \
    --assume-role-policy-document file://flow-logs-trust-policy.json \
    --query 'Role.Arn' \
    --output text)

# Create policy for the role
cat > flow-logs-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attach policy to role
aws iam put-role-policy \
    --role-name CloudKart-VPC-FlowLogs-Role \
    --policy-name CloudKart-VPC-FlowLogs-Policy \
    --policy-document file://flow-logs-policy.json

echo "VPC Flow Logs IAM role created: $FLOW_LOGS_ROLE_ARN"
```

### 10.2 Enable VPC Flow Logs

```bash
# Enable VPC Flow Logs
FLOW_LOG_ID=$(aws ec2 create-flow-logs \
    --resource-type VPC \
    --resource-ids $VPC_ID \
    --traffic-type ALL \
    --log-destination-type cloud-watch-logs \
    --log-group-name /aws/vpc/cloudkart-flowlogs \
    --deliver-logs-permission-arn $FLOW_LOGS_ROLE_ARN \
    --tag-specifications "ResourceType=vpc-flow-log,Tags=[{Key=Name,Value=CloudKart-VPC-FlowLogs}]" \
    --query 'FlowLogIds[0]' \
    --output text)

echo "VPC Flow Logs ID: $FLOW_LOG_ID"
```

## Step 11: Test Network Connectivity

### 11.1 Launch Test Instances

```bash
# Get Amazon Linux 2 AMI ID
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
              "Name=state,Values=available" \
    --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
    --output text)

# Launch instance in public subnet
PUBLIC_INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type t3.micro \
    --key-name cloudkart-keypair \
    --security-group-ids $WEB_SG_ID \
    --subnet-id $PUBLIC_SUBNET_1_ID \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=CloudKart-Public-Test}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

# Launch instance in private subnet
PRIVATE_INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type t3.micro \
    --key-name cloudkart-keypair \
    --security-group-ids $APP_SG_ID \
    --subnet-id $PRIVATE_SUBNET_1_ID \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=CloudKart-Private-Test}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Public Test Instance ID: $PUBLIC_INSTANCE_ID"
echo "Private Test Instance ID: $PRIVATE_INSTANCE_ID"

# Wait for instances to be running
aws ec2 wait instance-running --instance-ids $PUBLIC_INSTANCE_ID $PRIVATE_INSTANCE_ID
echo "Test instances are running!"
```

### 11.2 Test Connectivity

```bash
# Get public IP of public instance
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $PUBLIC_INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# Get private IP of private instance
PRIVATE_IP=$(aws ec2 describe-instances \
    --instance-ids $PRIVATE_INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PrivateIpAddress' \
    --output text)

echo "Public Instance IP: $PUBLIC_IP"
echo "Private Instance IP: $PRIVATE_IP"

# Test SSH to public instance (after adding your key)
echo "Test SSH to public instance:"
echo "ssh -i cloudkart-keypair.pem ec2-user@$PUBLIC_IP"

# Test connectivity from public to private (via SSH tunnel)
echo "From public instance, test connectivity to private:"
echo "ping $PRIVATE_IP"
echo "ssh -i cloudkart-keypair.pem ec2-user@$PRIVATE_IP"
```

## Step 12: Create DB Subnet Group

### 12.1 Create RDS Subnet Group

```bash
# Create RDS DB Subnet Group
aws rds create-db-subnet-group \
    --db-subnet-group-name cloudkart-db-subnet-group \
    --db-subnet-group-description "CloudKart Database Subnet Group" \
    --subnet-ids $DB_SUBNET_1_ID $DB_SUBNET_2_ID \
    --tags Key=Name,Value=CloudKart-DB-Subnet-Group

echo "RDS DB Subnet Group created"
```

## Step 13: Document Your Infrastructure

### 13.1 Export Configuration

```bash
# Create infrastructure summary
cat > vpc-infrastructure.txt << EOF
CloudKart VPC Infrastructure Summary
==================================

VPC Details:
- VPC ID: $VPC_ID
- CIDR Block: $VPC_CIDR
- Region: $AWS_REGION

Internet Gateway:
- IGW ID: $IGW_ID

Subnets:
- Public Subnet 1: $PUBLIC_SUBNET_1_ID (10.0.1.0/24) - $AZ1
- Public Subnet 2: $PUBLIC_SUBNET_2_ID (10.0.2.0/24) - $AZ2
- Private Subnet 1: $PRIVATE_SUBNET_1_ID (10.0.10.0/24) - $AZ1
- Private Subnet 2: $PRIVATE_SUBNET_2_ID (10.0.20.0/24) - $AZ2
- Database Subnet 1: $DB_SUBNET_1_ID (10.0.100.0/24) - $AZ1
- Database Subnet 2: $DB_SUBNET_2_ID (10.0.200.0/24) - $AZ2

NAT Gateways:
- NAT Gateway 1: $NAT_GW_1_ID (Public Subnet 1)
- NAT Gateway 2: $NAT_GW_2_ID (Public Subnet 2)

Route Tables:
- Public Route Table: $PUBLIC_RT_ID
- Private Route Table 1: $PRIVATE_RT_1_ID
- Private Route Table 2: $PRIVATE_RT_2_ID
- Database Route Table: $DB_RT_ID

Security Groups:
- Web Security Group: $WEB_SG_ID
- Application Security Group: $APP_SG_ID
- Database Security Group: $DB_SG_ID
- Load Balancer Security Group: $ALB_SG_ID

VPC Endpoints:
- S3 Endpoint: $S3_ENDPOINT_ID
- DynamoDB Endpoint: $DYNAMODB_ENDPOINT_ID

Test Instances:
- Public Test Instance: $PUBLIC_INSTANCE_ID ($PUBLIC_IP)
- Private Test Instance: $PRIVATE_INSTANCE_ID ($PRIVATE_IP)

Generated on: $(date)
EOF

echo "Infrastructure summary saved to vpc-infrastructure.txt"
```

### 13.2 Create Terraform Variables

```bash
# Create Terraform variables file for future use
cat > terraform.tfvars << EOF
# CloudKart VPC Configuration
vpc_id = "$VPC_ID"
public_subnet_ids = ["$PUBLIC_SUBNET_1_ID", "$PUBLIC_SUBNET_2_ID"]
private_subnet_ids = ["$PRIVATE_SUBNET_1_ID", "$PRIVATE_SUBNET_2_ID"]
database_subnet_ids = ["$DB_SUBNET_1_ID", "$DB_SUBNET_2_ID"]

# Security Group IDs
web_security_group_id = "$WEB_SG_ID"
app_security_group_id = "$APP_SG_ID"
database_security_group_id = "$DB_SG_ID"
alb_security_group_id = "$ALB_SG_ID"

# Network Configuration
availability_zones = ["$AZ1", "$AZ2"]
vpc_cidr = "$VPC_CIDR"
EOF

echo "Terraform variables saved to terraform.tfvars"
```

## Step 14: Clean Up Test Resources

### 14.1 Terminate Test Instances

```bash
# Terminate test instances
aws ec2 terminate-instances --instance-ids $PUBLIC_INSTANCE_ID $PRIVATE_INSTANCE_ID

# Wait for termination
aws ec2 wait instance-terminated --instance-ids $PUBLIC_INSTANCE_ID $PRIVATE_INSTANCE_ID

echo "Test instances terminated"
```

## Step 15: Set Up Monitoring

### 15.1 Create CloudWatch Dashboard

```bash
# Create CloudWatch dashboard for VPC monitoring
cat > cloudwatch-dashboard.json << EOF
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/VPC", "PacketsDroppedBySecurityGroup", "VpcId", "$VPC_ID"],
          [".", "PacketsDroppedByNetworkAcl", ".", "."]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$AWS_REGION",
        "title": "VPC Packet Drops"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "SOURCE '/aws/vpc/cloudkart-flowlogs'\n| fields @timestamp, srcaddr, dstaddr, srcport, dstport, action\n| filter action = \"REJECT\"\n| stats count() by srcaddr\n| sort count desc\n| limit 20",
        "region": "$AWS_REGION",
        "title": "Top Rejected Source IPs"
      }
    }
  ]
}
EOF

# Create the dashboard
aws cloudwatch put-dashboard \
    --dashboard-name "CloudKart-VPC-Monitoring" \
    --dashboard-body file://cloudwatch-dashboard.json

echo "CloudWatch dashboard created"
```

## 🎉 Success!

Your CloudKart VPC infrastructure is now complete!

### ✅ What You've Accomplished:

- ✅ Created a production-ready VPC with proper CIDR planning
- ✅ Set up public and private subnets across multiple AZs
- ✅ Configured Internet Gateway for public internet access
- ✅ Deployed NAT Gateways for private subnet internet access
- ✅ Created comprehensive security groups for each tier
- ✅ Set up route tables for proper traffic routing
- ✅ Implemented VPC endpoints for cost optimization
- ✅ Enabled VPC Flow Logs for security monitoring
- ✅ Created database subnet groups for RDS
- ✅ Set up monitoring and logging

### 🏗️ Your VPC Architecture:

```
Internet → IGW → Public Subnets (ALB, NAT) → Private Subnets (App Servers) → Database Subnets (RDS)
```

### 📊 Infrastructure Components:

- **VPC**: 1 VPC with /16 CIDR
- **Subnets**: 6 subnets across 2 AZs
- **Gateways**: 1 IGW, 2 NAT Gateways
- **Security Groups**: 4 security groups
- **Route Tables**: 4 route tables
- **VPC Endpoints**: S3 and DynamoDB

### 💰 Estimated Monthly Cost:

- **VPC**: Free
- **NAT Gateways**: $45/month each ($90 total)
- **Elastic IPs**: $3.65/month each
- **VPC Endpoints**: $7.2/month each
- **Total**: ~$110-120/month

### 🔧 Useful Commands:

```bash
# Check VPC resources
aws ec2 describe-vpcs --vpc-ids $VPC_ID
aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID"
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID"

# Monitor VPC Flow Logs
aws logs describe-log-streams --log-group-name /aws/vpc/cloudkart-flowlogs
aws logs get-log-events --log-group-name /aws/vpc/cloudkart-flowlogs --log-stream-name YOUR_STREAM_NAME

# Test connectivity
aws ec2 describe-instances --filters "Name=vpc-id,Values=$VPC_ID"
```

### 🚀 Next Steps:

1. **Deploy Application Load Balancer** in public subnets
2. **Launch EC2 instances** in private subnets
3. **Set up RDS database** in database subnets
4. **Configure Auto Scaling Groups** for high availability
5. **Implement WAF** for additional security
6. **Set up VPN or Direct Connect** for hybrid connectivity

Your CloudKart VPC is now ready for enterprise-grade deployment! 🌐🛒

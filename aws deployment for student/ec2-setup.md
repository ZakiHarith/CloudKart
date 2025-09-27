# EC2 Setup Guide for CloudKart

This guide walks you through launching and configuring an EC2 instance to host your CloudKart web application.

## 🎯 What is EC2?

Amazon Elastic Compute Cloud (EC2) provides scalable virtual servers in the cloud. For CloudKart, we'll use EC2 to host your web application, database connections, and handle user requests.

## 🏗️ EC2 Architecture for CloudKart

```
EC2 Instance (t2.micro)
├── Operating System: Amazon Linux 2
├── Web Server: Apache/Nginx + Node.js/Python
├── Application: CloudKart web app
├── Database Client: DynamoDB SDK
└── Security: Security Group Rules
```

## 📋 Prerequisites

- VPC setup completed (see `vpc-setup.md`)
- Security group configured
- AWS Account with free tier access
- Your CloudKart application files ready

## 🚀 Step-by-Step EC2 Setup

### Step 1: Access EC2 Console

1. **AWS Console**: Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. **Search EC2**: Type "EC2" in the search bar
3. **Select Service**: Click on "EC2"
4. **Launch Instance**: Click "Launch instance"

### Step 2: Choose AMI (Amazon Machine Image)

1. **AMI Selection**:
   - **Amazon Linux 2 AMI**: Free tier eligible
   - **Version**: Latest Amazon Linux 2 (HVM)
   - **Architecture**: 64-bit (x86)

2. **Click "Select"**

### Step 3: Choose Instance Type

1. **Instance Type**: `t2.micro`
   - **vCPUs**: 1
   - **Memory**: 1 GiB
   - **Network Performance**: Low to Moderate
   - **EBS Storage**: 8 GiB gp2
   - **Free Tier Eligible**: ✅

2. **Click "Next: Configure Instance Details"**

### Step 4: Configure Instance Details

1. **Number of Instances**: 1
2. **VPC**: Select your `CloudKart-VPC`
3. **Subnet**: Select `CloudKart-Public-Subnet`
4. **Auto-assign Public IP**: Enable
5. **IAM Role**: Create new role (optional, for DynamoDB access)
6. **Shutdown Behavior**: Stop
7. **Enable Termination Protection**: No (for free tier)

### Step 5: Add Storage

1. **Root Volume**:
   - **Size**: 8 GiB (free tier limit)
   - **Volume Type**: gp2
   - **Encrypted**: No (for free tier)

2. **Click "Next: Add Tags"**

### Step 6: Add Tags

1. **Add Tag**:
   - **Key**: Name
   - **Value**: CloudKart-WebServer

2. **Click "Next: Configure Security Group"**

### Step 7: Configure Security Group

1. **Security Group**: Select existing `CloudKart-Web-SG`
2. **Review Rules**: Ensure HTTP, HTTPS, SSH, and custom port are open

3. **Click "Review and Launch"**

### Step 8: Review and Launch

1. **Review Configuration**: Check all settings
2. **Launch**: Click "Launch"
3. **Key Pair**: 
   - **Create new key pair**: `CloudKart-KeyPair`
   - **Download**: Save the .pem file securely
   - **Note**: You'll need this to SSH into your instance

4. **Launch Instances**: Click "Launch Instances"

## 🔧 Instance Configuration

### Step 1: Connect to Your Instance

#### Option A: EC2 Instance Connect (Recommended)
1. **EC2 Console**: Go to "Instances"
2. **Select Instance**: Click on your instance
3. **Connect**: Click "Connect"
4. **EC2 Instance Connect**: Click "Connect"
5. **Browser Terminal**: Opens in new tab

#### Option B: SSH (Advanced)
1. **Get Public IP**: Copy from instance details
2. **SSH Command**:
   ```bash
   ssh -i CloudKart-KeyPair.pem ec2-user@YOUR-PUBLIC-IP
   ```

### Step 2: Update System Packages

```bash
# Update package manager
sudo yum update -y

# Install essential packages
sudo yum install -y git wget curl
```

### Step 3: Install Web Server and Runtime

#### For Node.js Application:
```bash
# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16

# Install PM2 for process management
npm install -g pm2

# Install web server (Nginx)
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### For Python Application:
```bash
# Install Python 3
sudo yum install -y python3 python3-pip

# Install web server (Apache)
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd

# Install WSGI server
pip3 install gunicorn
```

### Step 4: Configure Firewall

```bash
# Configure firewall for web traffic
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### Step 5: Upload Your Application

#### Method 1: Direct Upload (Simple)
1. **Create App Directory**:
   ```bash
   mkdir -p /home/ec2-user/cloudkart
   cd /home/ec2-user/cloudkart
   ```

2. **Upload Files**: Use SCP or SFTP to upload your files
   ```bash
   # From your local machine
   scp -i CloudKart-KeyPair.pem -r simple\ html/* ec2-user@YOUR-PUBLIC-IP:/home/ec2-user/cloudkart/
   ```

#### Method 2: Git Clone (Recommended)
```bash
# If your code is in a Git repository
git clone https://github.com/yourusername/cloudkart.git
cd cloudkart
```

### Step 6: Install Application Dependencies

#### For Node.js:
```bash
# Install dependencies
npm install

# Install AWS SDK
npm install aws-sdk

# Create package.json if needed
npm init -y
```

#### For Python:
```bash
# Install dependencies
pip3 install boto3 flask django

# Create requirements.txt
pip3 freeze > requirements.txt
```

### Step 7: Configure AWS Credentials

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter your Access Key ID, Secret Access Key, Region, and Output format
```

### Step 8: Start Your Application

#### For Node.js:
```bash
# Start with PM2
pm2 start app.js --name cloudkart
pm2 startup
pm2 save

# Or start directly
node app.js
```

#### For Python:
```bash
# Start with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app

# Or start Flask directly
python3 app.py
```

## 🌐 Web Server Configuration

### Nginx Configuration (for Node.js)

1. **Create Nginx Config**:
   ```bash
   sudo nano /etc/nginx/conf.d/cloudkart.conf
   ```

2. **Add Configuration**:
   ```nginx
   server {
       listen 80;
       server_name YOUR-PUBLIC-IP;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Restart Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

### Apache Configuration (for Python)

1. **Enable Modules**:
   ```bash
   sudo a2enmod proxy
   sudo a2enmod proxy_http
   ```

2. **Create Virtual Host**:
   ```bash
   sudo nano /etc/httpd/conf.d/cloudkart.conf
   ```

3. **Add Configuration**:
   ```apache
   <VirtualHost *:80>
       ServerName YOUR-PUBLIC-IP
       
       ProxyPreserveHost On
       ProxyPass / http://localhost:8000/
       ProxyPassReverse / http://localhost:8000/
   </VirtualHost>
   ```

4. **Restart Apache**:
   ```bash
   sudo systemctl restart httpd
   ```

## 🔍 Testing Your Setup

### Step 1: Test Web Server
1. **Open Browser**: Go to `http://YOUR-PUBLIC-IP`
2. **Check Response**: Should see your CloudKart application
3. **Test Functionality**: Verify all features work

### Step 2: Test Database Connection
1. **Check Logs**: Monitor application logs for errors
2. **Test Database Operations**: Try creating/reading data
3. **Verify DynamoDB**: Check AWS console for table activity

### Step 3: Monitor Performance
1. **Check CPU Usage**: `top` or `htop`
2. **Check Memory**: `free -h`
3. **Check Disk Space**: `df -h`

## 🚨 Troubleshooting

### Common Issues

**Issue**: Cannot connect to instance
**Solution**:
- Check security group rules
- Verify instance is running
- Check public IP assignment

**Issue**: Application not loading
**Solution**:
- Check application logs
- Verify web server configuration
- Check firewall settings
- Ensure application is running

**Issue**: Database connection errors
**Solution**:
- Verify AWS credentials
- Check DynamoDB table exists
- Verify IAM permissions
- Check network connectivity

### Useful Commands

```bash
# Check instance status
sudo systemctl status nginx
sudo systemctl status httpd

# View application logs
pm2 logs cloudkart
journalctl -u your-service

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
ps aux | grep python
```

## 💰 Cost Optimization

### Free Tier Limits
- **Instance Hours**: 750 hours/month (t2.micro)
- **EBS Storage**: 30 GB
- **Data Transfer**: 1 GB/month

### Cost-Saving Tips
1. **Stop Instance**: When not in use
2. **Use Spot Instances**: For non-critical workloads
3. **Optimize Storage**: Use appropriate EBS volume types
4. **Monitor Usage**: Set up billing alerts

## 🎓 Learning Outcomes

After completing EC2 setup, you'll understand:

### EC2 Concepts
- **Instance Types**: Different compute options
- **AMI**: Pre-configured server images
- **Security Groups**: Instance-level firewall
- **EBS**: Elastic block storage

### Linux Administration
- **Package Management**: Installing software
- **Service Management**: Starting/stopping services
- **User Management**: File permissions and access
- **Process Management**: Running applications

### Web Server Configuration
- **Nginx/Apache**: Web server setup
- **Proxy Configuration**: Load balancing
- **SSL/TLS**: Secure connections
- **Performance Tuning**: Optimization techniques

## 📚 Next Steps

1. **Database Setup**: Configure DynamoDB (see `dynamodb-setup.md`)
2. **CDN Setup**: Add CloudFront (see `cloudfront-setup.md`)
3. **Monitoring**: Set up CloudWatch
4. **Backup**: Configure automated backups

## 🔧 Advanced Configuration

### Auto Scaling (Optional)
1. **Launch Template**: Create reusable instance configuration
2. **Auto Scaling Group**: Automatically scale instances
3. **Load Balancer**: Distribute traffic across instances

### High Availability
1. **Multiple AZs**: Deploy across availability zones
2. **Health Checks**: Monitor instance health
3. **Failover**: Automatic instance replacement

---

**Ready for the next step?** Proceed to `dynamodb-setup.md` to configure your database!

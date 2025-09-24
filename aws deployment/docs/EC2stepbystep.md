# EC2 Backend Server Setup - Step by Step Tutorial

This tutorial will guide you through setting up an EC2 instance to serve as a backend server for your CloudKart application, including Docker setup and API configuration.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Key pair for EC2 access
- VPC and Security Groups configured (see VPCstepbystep.md)
- Basic knowledge of Linux commands

## 🎯 Overview

We'll launch an EC2 instance, configure it with Docker, set up a backend API server, and integrate it with your CloudKart frontend.

## Step 1: Create EC2 Key Pair

### 1.1 Using AWS Console

1. **Navigate to EC2**
   - Login to AWS Console
   - Search for "EC2"
   - Click on EC2 service

2. **Create Key Pair**
   - In the left sidebar, click "Key Pairs"
   - Click "Create Key Pair"
   - **Name**: `cloudkart-keypair`
   - **Key pair type**: `RSA`
   - **Private key file format**: `.pem` (for Linux/Mac) or `.ppk` (for PuTTY)
   - Click "Create Key Pair"
   - Download and save the key file securely

### 1.2 Using AWS CLI

```bash
# Create key pair
aws ec2 create-key-pair --key-name cloudkart-keypair --query 'KeyMaterial' --output text > cloudkart-keypair.pem

# Set proper permissions (Linux/Mac)
chmod 400 cloudkart-keypair.pem

# Verify key pair
aws ec2 describe-key-pairs --key-names cloudkart-keypair
```

## Step 2: Launch EC2 Instance

### 2.1 Using AWS Console

1. **Launch Instance**
   - Click "Launch Instance"
   - **Name**: `CloudKart-Backend-Server`

2. **Choose AMI**
   - Select "Amazon Linux 2 AMI (HVM), SSD Volume Type"
   - Architecture: `64-bit (x86)`

3. **Choose Instance Type**
   - Select `t3.micro` (free tier eligible) or `t3.small` for better performance
   - Click "Next: Configure Instance Details"

4. **Configure Instance Details**
   - **Number of instances**: `1`
   - **Network**: Select your VPC (if created)
   - **Subnet**: Select private subnet (if using VPC)
   - **Auto-assign Public IP**: `Enable` (if in public subnet)
   - **IAM role**: Create or select a role with necessary permissions
   - **User data**: (see script below)

5. **Add Storage**
   - Root volume: `20 GB` GP3
   - **Delete on Termination**: `Yes`

6. **Add Tags**
   - Key: `Name`, Value: `CloudKart-Backend`
   - Key: `Project`, Value: `CloudKart`
   - Key: `Environment`, Value: `Production`

7. **Configure Security Group**
   - **Security group name**: `cloudkart-backend-sg`
   - Rules:
     - SSH (22) from your IP
     - HTTP (80) from anywhere
     - HTTPS (443) from anywhere
     - Custom TCP (3000) from anywhere

8. **Review and Launch**
   - Select existing key pair: `cloudkart-keypair`
   - Click "Launch Instance"

### 2.2 Using AWS CLI

```bash
# Get the latest Amazon Linux 2 AMI ID
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
              "Name=state,Values=available" \
    --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
    --output text)

# Get default VPC and subnet
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNET_ID=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[0].SubnetId" --output text)

# Create security group
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name cloudkart-backend-sg \
    --description "Security group for CloudKart backend server" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Add security group rules
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0

# Create user data script
cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y
yum install -y docker git nodejs npm

# Start Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /opt/cloudkart
chown ec2-user:ec2-user /opt/cloudkart
EOF

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type t3.micro \
    --key-name cloudkart-keypair \
    --security-group-ids $SECURITY_GROUP_ID \
    --subnet-id $SUBNET_ID \
    --user-data file://user-data.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=CloudKart-Backend},{Key=Project,Value=CloudKart}]' \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Instance ID: $INSTANCE_ID"

# Wait for instance to be running
aws ec2 wait instance-running --instance-ids $INSTANCE_ID
echo "Instance is now running!"

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "Public IP: $PUBLIC_IP"
```

## Step 3: Connect to Your EC2 Instance

### 3.1 SSH Connection (Linux/Mac)

```bash
# Connect to your instance
ssh -i cloudkart-keypair.pem ec2-user@YOUR_INSTANCE_PUBLIC_IP

# Example:
ssh -i cloudkart-keypair.pem ec2-user@54.123.45.67
```

### 3.2 SSH Connection (Windows)

**Using PuTTY:**
1. Open PuTTY
2. Host Name: `ec2-user@YOUR_INSTANCE_PUBLIC_IP`
3. Port: `22`
4. Connection type: `SSH`
5. Auth > Private key file: Browse to your `.ppk` file
6. Click "Open"

**Using Windows Subsystem for Linux (WSL):**
```bash
ssh -i cloudkart-keypair.pem ec2-user@YOUR_INSTANCE_PUBLIC_IP
```

## Step 4: Set Up Backend Environment

### 4.1 Install Additional Dependencies

```bash
# Connect to your instance and run:

# Update system
sudo yum update -y

# Install development tools
sudo yum groupinstall -y "Development Tools"

# Install Node.js (latest LTS)
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# Verify installations
node --version
npm --version
docker --version
```

### 4.2 Create Backend Application Structure

```bash
# Create application directory
cd /opt/cloudkart
sudo chown ec2-user:ec2-user /opt/cloudkart

# Initialize Node.js project
npm init -y

# Install required packages
npm install express cors helmet morgan compression dotenv bcryptjs jsonwebtoken express-rate-limit
npm install --save-dev nodemon

# Create directory structure
mkdir -p {src,config,logs,uploads}
mkdir -p src/{routes,middleware,controllers,models,utils}
```

## Step 5: Create Backend API Server

### 5.1 Create Main Server File

```bash
cat > src/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    credentials: true
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CloudKart API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
EOF
```

### 5.2 Create Authentication Routes

```bash
cat > src/routes/auth.js << 'EOF'
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
});

// In-memory user store (replace with database in production)
const users = [];

// Register endpoint
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = {
            id: Date.now().toString(),
            email,
            firstName,
            lastName,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Token verification endpoint
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = users.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
EOF
```

### 5.3 Create Products Routes

```bash
cat > src/routes/products.js << 'EOF'
const express = require('express');
const router = express.Router();

// Sample products data (replace with database in production)
const products = [
    {
        id: '1',
        title: 'Sony WH-1000XM5',
        description: 'Premium quality wireless headphones with noise cancellation',
        price: 199.99,
        originalPrice: 249.99,
        category: 'electronics',
        image: 'images/products/mx5.jpg',
        badge: 'Sale',
        inStock: true,
        stock: 50,
        rating: 4.5,
        reviews: 128
    },
    {
        id: '2',
        title: 'Smart Fitness Watch',
        description: 'Track your fitness goals with this advanced smartwatch',
        price: 299.99,
        originalPrice: 349.99,
        category: 'electronics',
        image: 'images/products/smartwatch.jpeg',
        badge: 'New',
        inStock: true,
        stock: 25,
        rating: 4.8,
        reviews: 89
    }
    // Add more products as needed
];

// Get all products
router.get('/', (req, res) => {
    const { category, search, limit, offset } = req.query;
    
    let filteredProducts = [...products];
    
    // Filter by category
    if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Search functionality
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.title.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Pagination
    const startIndex = parseInt(offset) || 0;
    const limitNum = parseInt(limit) || filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limitNum);
    
    res.json({
        products: paginatedProducts,
        total: filteredProducts.length,
        offset: startIndex,
        limit: limitNum
    });
});

// Get single product
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
});

// Get categories
router.get('/categories/list', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    res.json({ categories });
});

module.exports = router;
EOF
```

### 5.4 Create Environment Configuration

```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=*
EOF
```

### 5.5 Update Package.json Scripts

```bash
cat > package.json << 'EOF'
{
  "name": "cloudkart-backend",
  "version": "1.0.0",
  "description": "CloudKart Backend API Server",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["ecommerce", "api", "nodejs", "express"],
  "author": "CloudKart Team",
  "license": "MIT"
}
EOF
```

## Step 6: Create Placeholder Routes

### 6.1 Orders Routes

```bash
cat > src/routes/orders.js << 'EOF'
const express = require('express');
const router = express.Router();

// In-memory orders store (replace with database)
const orders = [];

// Get user orders
router.get('/', (req, res) => {
    // This would typically require authentication middleware
    res.json({ orders: [] });
});

// Create new order
router.post('/', (req, res) => {
    const order = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    orders.push(order);
    res.status(201).json(order);
});

module.exports = router;
EOF
```

### 6.2 Users Routes

```bash
cat > src/routes/users.js << 'EOF'
const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
    // This would typically require authentication middleware
    res.json({ message: 'User profile endpoint' });
});

// Update user profile
router.put('/profile', (req, res) => {
    // This would typically require authentication middleware
    res.json({ message: 'Profile updated successfully' });
});

module.exports = router;
EOF
```

## Step 7: Start the Server

### 7.1 Test the Application

```bash
# Install dependencies
npm install

# Start the server
npm start

# In another terminal (or use screen/tmux)
# Test the API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/products
```

### 7.2 Create Systemd Service

```bash
# Create systemd service file
sudo tee /etc/systemd/system/cloudkart-api.service > /dev/null << 'EOF'
[Unit]
Description=CloudKart API Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/cloudkart
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start service
sudo systemctl daemon-reload
sudo systemctl enable cloudkart-api
sudo systemctl start cloudkart-api

# Check service status
sudo systemctl status cloudkart-api
```

## Step 8: Set Up Nginx Reverse Proxy

### 8.1 Install and Configure Nginx

```bash
# Install Nginx
sudo yum install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/conf.d/cloudkart.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

    # Proxy to Node.js app
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

    # Rate limit auth endpoints
    location /api/auth {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check (no rate limiting)
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
EOF

# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

## Step 9: Set Up SSL/TLS (Optional)

### 9.1 Install Certbot

```bash
# Install EPEL repository
sudo yum install -y epel-release

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 10: Configure Monitoring

### 10.1 Install CloudWatch Agent

```bash
# Download and install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Create CloudWatch configuration
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json > /dev/null << 'EOF'
{
    "metrics": {
        "namespace": "CloudKart/EC2",
        "metrics_collected": {
            "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 60
            }
        }
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/nginx/access.log",
                        "log_group_name": "/aws/ec2/cloudkart/nginx",
                        "log_stream_name": "{instance_id}/access.log"
                    },
                    {
                        "file_path": "/opt/cloudkart/logs/app.log",
                        "log_group_name": "/aws/ec2/cloudkart/app",
                        "log_stream_name": "{instance_id}/app.log"
                    }
                ]
            }
        }
    }
}
EOF

# Start CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s
```

### 10.2 Set Up Log Rotation

```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/cloudkart > /dev/null << 'EOF'
/opt/cloudkart/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
    postrotate
        systemctl restart cloudkart-api
    endscript
}
EOF
```

## Step 11: Test Your Backend

### 11.1 API Testing

```bash
# Get your EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Public IP: $PUBLIC_IP"

# Test health endpoint
curl http://$PUBLIC_IP/health

# Test products endpoint
curl http://$PUBLIC_IP/api/products

# Test authentication
curl -X POST http://$PUBLIC_IP/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

### 11.2 Load Testing (Optional)

```bash
# Install Apache Bench
sudo yum install -y httpd-tools

# Simple load test
ab -n 1000 -c 10 http://$PUBLIC_IP/health

# Test API endpoint
ab -n 100 -c 5 http://$PUBLIC_IP/api/products
```

## Step 12: Update Frontend Configuration

### 12.1 Update CloudKart Frontend

Update your frontend application to use the new backend:

```javascript
// In your frontend JavaScript
const API_BASE_URL = 'http://YOUR_EC2_PUBLIC_IP';

// Example API calls
async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
    return response.json();
}

async function getProducts() {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    return response.json();
}
```

## Step 13: Backup and Security

### 13.1 Create AMI Backup

```bash
# Create AMI of your configured instance
aws ec2 create-image \
    --instance-id $INSTANCE_ID \
    --name "CloudKart-Backend-$(date +%Y%m%d)" \
    --description "CloudKart backend server backup"
```

### 13.2 Security Hardening

```bash
# Update system packages
sudo yum update -y

# Configure automatic security updates
sudo yum install -y yum-cron
sudo systemctl enable yum-cron
sudo systemctl start yum-cron

# Configure firewall (if needed)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Set up fail2ban for SSH protection
sudo yum install -y epel-release
sudo yum install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🎉 Success!

Your CloudKart backend server is now running on EC2!

### ✅ What You've Accomplished:

- ✅ Launched and configured EC2 instance
- ✅ Set up Node.js backend API server
- ✅ Implemented authentication endpoints
- ✅ Created product management APIs
- ✅ Configured Nginx reverse proxy
- ✅ Set up monitoring and logging
- ✅ Implemented security best practices

### 🌐 Your Backend API:
`http://YOUR_EC2_PUBLIC_IP`

### 📊 API Endpoints:

- **Health Check**: `GET /health`
- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Products**: `GET /api/products`, `GET /api/products/:id`
- **Orders**: `GET /api/orders`, `POST /api/orders`
- **Users**: `GET /api/users/profile`, `PUT /api/users/profile`

### 💰 Estimated Monthly Cost:
- **t3.micro**: $8-10/month
- **t3.small**: $15-20/month
- **Storage (20GB)**: $2/month
- **Data transfer**: Variable based on usage

### 🔧 Useful Commands:

```bash
# Check service status
sudo systemctl status cloudkart-api
sudo systemctl status nginx

# View logs
sudo journalctl -u cloudkart-api -f
sudo tail -f /var/log/nginx/access.log

# Restart services
sudo systemctl restart cloudkart-api
sudo systemctl restart nginx

# Update application
cd /opt/cloudkart
git pull origin main  # if using git
npm install
sudo systemctl restart cloudkart-api

# Monitor resources
htop
df -h
free -h
```

### 🚀 Next Steps:

1. **Database Integration** - Set up RDS or MongoDB
2. **Load Balancing** - Add Application Load Balancer
3. **Auto Scaling** - Configure Auto Scaling Groups
4. **Monitoring** - Set up CloudWatch alarms
5. **CI/CD Pipeline** - Automate deployments
6. **API Documentation** - Add Swagger/OpenAPI

Your CloudKart backend is now enterprise-ready! 🚀🛒

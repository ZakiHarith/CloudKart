#!/bin/bash
# CloudKart EC2 User Data Script

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Create application directory
mkdir -p /opt/${project_name}
cd /opt/${project_name}

# Clone repository (replace with your actual repository)
# git clone https://github.com/yourusername/cloudkart.git .

# Create a simple health check endpoint
cat > /opt/${project_name}/health.js << 'EOF'
const express = require('express');
const app = express();
const port = 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Health check server running on port ${port}`);
});
EOF

# Install Express for health check
npm init -y
npm install express

# Create systemd service for health check
cat > /etc/systemd/system/cloudkart-health.service << 'EOF'
[Unit]
Description=CloudKart Health Check Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/cloudkart
ExecStart=/usr/bin/node health.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start health check service
systemctl daemon-reload
systemctl enable cloudkart-health
systemctl start cloudkart-health

# Install CloudWatch agent
yum install -y amazon-cloudwatch-agent

# Create CloudWatch agent configuration
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
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
      "diskio": {
        "measurement": ["io_time"],
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
            "file_path": "/var/log/messages",
            "log_group_name": "/aws/ec2/cloudkart/system",
            "log_stream_name": "{instance_id}/messages"
          },
          {
            "file_path": "/opt/cloudkart/app.log",
            "log_group_name": "/aws/ec2/cloudkart/application",
            "log_stream_name": "{instance_id}/app"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s

# Create log directory
mkdir -p /opt/cloudkart/logs
chown ec2-user:ec2-user /opt/cloudkart/logs

# Set proper permissions
chown -R ec2-user:ec2-user /opt/cloudkart

echo "CloudKart EC2 setup completed successfully!" > /var/log/cloudkart-setup.log

# DynamoDB Setup Guide for CloudKart

This guide walks you through setting up Amazon DynamoDB as the database for your CloudKart web application.

## 🎯 What is DynamoDB?

Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. Perfect for CloudKart's product catalog, user data, and order management.

## 🏗️ DynamoDB Architecture for CloudKart

```
DynamoDB Tables
├── Products Table
│   ├── Primary Key: product_id (String)
│   ├── Attributes: title, price, category, description, image_url
│   └── GSI: category-index
├── Users Table
│   ├── Primary Key: user_id (String)
│   ├── Attributes: email, name, address, created_at
│   └── GSI: email-index
└── Orders Table
    ├── Primary Key: order_id (String)
    ├── Attributes: user_id, items, total, status, created_at
    └── GSI: user_id-index
```

## 📋 Prerequisites

- AWS Account with free tier access
- EC2 instance running (see `ec2-setup.md`)
- Basic understanding of NoSQL concepts
- Your CloudKart application ready for database integration

## 🚀 Step-by-Step DynamoDB Setup

### Step 1: Access DynamoDB Console

1. **AWS Console**: Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. **Search DynamoDB**: Type "DynamoDB" in the search bar
3. **Select Service**: Click on "DynamoDB"
4. **Create Table**: Click "Create table"

### Step 2: Create Products Table

1. **Table Details**:
   - **Table name**: `CloudKart-Products`
   - **Partition key**: `product_id` (String)
   - **Sort key**: Leave empty

2. **Settings**:
   - **Table class**: Standard
   - **Use default settings**: Check this box

3. **Create**: Click "Create table"

### Step 3: Create Users Table

1. **Table Details**:
   - **Table name**: `CloudKart-Users`
   - **Partition key**: `user_id` (String)
   - **Sort key**: Leave empty

2. **Settings**:
   - **Table class**: Standard
   - **Use default settings**: Check this box

3. **Create**: Click "Create table"

### Step 4: Create Orders Table

1. **Table Details**:
   - **Table name**: `CloudKart-Orders`
   - **Partition key**: `order_id` (String)
   - **Sort key**: Leave empty

2. **Settings**:
   - **Table class**: Standard
   - **Use default settings**: Check this box

3. **Create**: Click "Create table"

### Step 5: Create Global Secondary Indexes (GSI)

#### Products Table - Category Index
1. **Select Products Table**: Click on `CloudKart-Products`
2. **Indexes Tab**: Click "Indexes" tab
3. **Create Index**: Click "Create index"
4. **Configure**:
   - **Index name**: `category-index`
   - **Partition key**: `category` (String)
   - **Sort key**: `product_id` (String)
5. **Create**: Click "Create index"

#### Users Table - Email Index
1. **Select Users Table**: Click on `CloudKart-Users`
2. **Indexes Tab**: Click "Indexes" tab
3. **Create Index**: Click "Create index"
4. **Configure**:
   - **Index name**: `email-index`
   - **Partition key**: `email` (String)
   - **Sort key**: Leave empty
5. **Create**: Click "Create index"

#### Orders Table - User Index
1. **Select Orders Table**: Click on `CloudKart-Orders`
2. **Indexes Tab**: Click "Indexes" tab
3. **Create Index**: Click "Create index"
4. **Configure**:
   - **Index name**: `user_id-index`
   - **Partition key**: `user_id` (String)
   - **Sort key**: `created_at` (String)
5. **Create**: Click "Create index"

## 📊 Add Sample Data

### Step 1: Add Products

1. **Select Products Table**: Click on `CloudKart-Products`
2. **Items Tab**: Click "Items" tab
3. **Create Item**: Click "Create item"

#### Sample Product Items:
```json
{
  "product_id": "P001",
  "title": "Wireless Headphones",
  "price": 99.99,
  "category": "electronics",
  "description": "High-quality wireless headphones with noise cancellation",
  "image_url": "https://your-s3-bucket.s3.amazonaws.com/images/headphones.jpg",
  "stock": 50,
  "rating": 4.5,
  "reviews": 120
}
```

```json
{
  "product_id": "P002",
  "title": "Cotton T-Shirt",
  "price": 19.99,
  "category": "fashion",
  "description": "Comfortable cotton t-shirt in various colors",
  "image_url": "https://your-s3-bucket.s3.amazonaws.com/images/tshirt.jpg",
  "stock": 100,
  "rating": 4.2,
  "reviews": 85
}
```

### Step 2: Add Sample Users

```json
{
  "user_id": "U001",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "address": "123 Main St, City, State 12345",
  "phone": "+1-555-0123",
  "created_at": "2024-01-15T10:30:00Z",
  "preferences": {
    "newsletter": true,
    "notifications": true
  }
}
```

### Step 3: Add Sample Orders

```json
{
  "order_id": "O001",
  "user_id": "U001",
  "items": [
    {
      "product_id": "P001",
      "quantity": 1,
      "price": 99.99
    }
  ],
  "total": 99.99,
  "status": "completed",
  "created_at": "2024-01-15T14:30:00Z",
  "shipping_address": "123 Main St, City, State 12345",
  "payment_method": "credit_card"
}
```

## 🔧 Application Integration

### Step 1: Install AWS SDK

#### For Node.js:
```bash
npm install aws-sdk
```

#### For Python:
```bash
pip3 install boto3
```

### Step 2: Configure AWS Credentials

#### Option A: IAM Role (Recommended)
1. **EC2 Console**: Go to your instance
2. **Actions**: Click "Security" → "Modify IAM Role"
3. **Create Role**: Create new role with DynamoDB permissions
4. **Attach Role**: Attach to your EC2 instance

#### Option B: AWS Credentials File
```bash
# On your EC2 instance
aws configure
# Enter Access Key ID, Secret Access Key, Region, Output format
```

### Step 3: Database Connection Code

#### Node.js Example:
```javascript
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get all products
async function getProducts() {
    const params = {
        TableName: 'CloudKart-Products'
    };
    
    try {
        const result = await dynamodb.scan(params).promise();
        return result.Items;
    } catch (error) {
        console.error('Error getting products:', error);
        throw error;
    }
}

// Get product by ID
async function getProductById(productId) {
    const params = {
        TableName: 'CloudKart-Products',
        Key: {
            product_id: productId
        }
    };
    
    try {
        const result = await dynamodb.get(params).promise();
        return result.Item;
    } catch (error) {
        console.error('Error getting product:', error);
        throw error;
    }
}

// Create user
async function createUser(userData) {
    const params = {
        TableName: 'CloudKart-Users',
        Item: {
            user_id: userData.user_id,
            email: userData.email,
            name: userData.name,
            address: userData.address,
            phone: userData.phone,
            created_at: new Date().toISOString()
        }
    };
    
    try {
        await dynamodb.put(params).promise();
        return userData;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Create order
async function createOrder(orderData) {
    const params = {
        TableName: 'CloudKart-Orders',
        Item: {
            order_id: orderData.order_id,
            user_id: orderData.user_id,
            items: orderData.items,
            total: orderData.total,
            status: 'pending',
            created_at: new Date().toISOString(),
            shipping_address: orderData.shipping_address,
            payment_method: orderData.payment_method
        }
    };
    
    try {
        await dynamodb.put(params).promise();
        return orderData;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

module.exports = {
    getProducts,
    getProductById,
    createUser,
    createOrder
};
```

#### Python Example:
```python
import boto3
from botocore.exceptions import ClientError
import json
from datetime import datetime

# Configure AWS
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

def get_products():
    """Get all products from DynamoDB"""
    try:
        table = dynamodb.Table('CloudKart-Products')
        response = table.scan()
        return response['Items']
    except ClientError as e:
        print(f"Error getting products: {e}")
        raise e

def get_product_by_id(product_id):
    """Get product by ID"""
    try:
        table = dynamodb.Table('CloudKart-Products')
        response = table.get_item(Key={'product_id': product_id})
        return response.get('Item')
    except ClientError as e:
        print(f"Error getting product: {e}")
        raise e

def create_user(user_data):
    """Create new user"""
    try:
        table = dynamodb.Table('CloudKart-Users')
        user_data['created_at'] = datetime.utcnow().isoformat()
        table.put_item(Item=user_data)
        return user_data
    except ClientError as e:
        print(f"Error creating user: {e}")
        raise e

def create_order(order_data):
    """Create new order"""
    try:
        table = dynamodb.Table('CloudKart-Orders')
        order_data['status'] = 'pending'
        order_data['created_at'] = datetime.utcnow().isoformat()
        table.put_item(Item=order_data)
        return order_data
    except ClientError as e:
        print(f"Error creating order: {e}")
        raise e
```

## 🔍 Testing Database Operations

### Step 1: Test Connection
```bash
# On your EC2 instance
aws dynamodb list-tables --region us-east-1
```

### Step 2: Test CRUD Operations
1. **Create**: Add new products, users, orders
2. **Read**: Query products by category, users by email
3. **Update**: Modify product prices, user addresses
4. **Delete**: Remove test data

### Step 3: Test Application Integration
1. **Start Application**: Run your CloudKart app
2. **Test Features**: Browse products, create account, place order
3. **Check Logs**: Monitor for database errors
4. **Verify Data**: Check DynamoDB console for new items

## 🚨 Troubleshooting

### Common Issues

**Issue**: Access Denied errors
**Solution**:
- Check IAM role permissions
- Verify AWS credentials
- Ensure correct region

**Issue**: Table not found
**Solution**:
- Verify table names match exactly
- Check region configuration
- Ensure tables are created

**Issue**: Slow queries
**Solution**:
- Use appropriate indexes
- Optimize query patterns
- Consider read capacity units

### Useful Commands

```bash
# List all tables
aws dynamodb list-tables

# Describe table
aws dynamodb describe-table --table-name CloudKart-Products

# Scan table
aws dynamodb scan --table-name CloudKart-Products

# Query with index
aws dynamodb query --table-name CloudKart-Products --index-name category-index --key-condition-expression "category = :cat" --expression-attribute-values '{":cat":{"S":"electronics"}}'
```

## 💰 Cost Optimization

### Free Tier Limits
- **Storage**: 25 GB
- **Read Capacity**: 25 read capacity units
- **Write Capacity**: 25 write capacity units
- **Data Transfer**: 1 GB/month

### Cost-Saving Tips
1. **On-Demand Pricing**: Use for variable workloads
2. **Provisioned Capacity**: Use for predictable workloads
3. **Reserved Capacity**: Use for steady workloads
4. **Monitor Usage**: Set up billing alerts

## 🎓 Learning Outcomes

After completing DynamoDB setup, you'll understand:

### NoSQL Concepts
- **Document Database**: JSON-like data storage
- **Primary Keys**: Partition and sort keys
- **Indexes**: Global and local secondary indexes
- **Query Patterns**: Efficient data access

### DynamoDB Features
- **Auto Scaling**: Automatic capacity management
- **Global Tables**: Multi-region replication
- **Streams**: Real-time data changes
- **Transactions**: ACID compliance

### Database Design
- **Data Modeling**: Efficient table design
- **Access Patterns**: Query optimization
- **Performance**: Capacity planning
- **Security**: Access control and encryption

## 📚 Next Steps

1. **CDN Setup**: Add CloudFront (see `cloudfront-setup.md`)
2. **Monitoring**: Set up CloudWatch
3. **Backup**: Configure point-in-time recovery
4. **Security**: Implement encryption and access controls

## 🔧 Advanced Configuration

### Point-in-Time Recovery
1. **Enable PITR**: In table settings
2. **Recovery Window**: 35 days
3. **Backup Strategy**: Automated backups

### Global Tables
1. **Multi-Region**: Deploy in multiple regions
2. **Replication**: Automatic data synchronization
3. **Conflict Resolution**: Last-write-wins

### DynamoDB Streams
1. **Enable Streams**: Capture data changes
2. **Lambda Integration**: Process changes in real-time
3. **Analytics**: Data processing and analysis

---

**Ready for the next step?** Proceed to `cloudfront-setup.md` to add CDN capabilities!

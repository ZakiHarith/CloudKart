#!/bin/bash
# CloudKart AWS Deployment Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="cloudkart"
AWS_REGION="us-east-1"
SOURCE_DIR="../simple html"
DEST_DIR="./aws-optimized"

echo -e "${BLUE}🚀 Starting CloudKart AWS Deployment${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI.${NC}"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform not found. Please install Terraform.${NC}"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Deploy infrastructure
deploy_infrastructure() {
    echo -e "${YELLOW}🏗️  Deploying AWS infrastructure...${NC}"
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan -var="aws_region=$AWS_REGION" -var="project_name=$PROJECT_NAME"
    
    # Apply configuration
    read -p "Do you want to proceed with infrastructure deployment? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply -var="aws_region=$AWS_REGION" -var="project_name=$PROJECT_NAME" -auto-approve
        
        # Get outputs
        S3_BUCKET=$(terraform output -raw s3_bucket_name)
        CLOUDFRONT_URL=$(terraform output -raw cloudfront_url)
        
        echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
        echo -e "${BLUE}S3 Bucket: $S3_BUCKET${NC}"
        echo -e "${BLUE}CloudFront URL: $CLOUDFRONT_URL${NC}"
        
        # Export variables for next steps
        export S3_BUCKET
        export CLOUDFRONT_URL
    else
        echo -e "${YELLOW}⏭️  Skipping infrastructure deployment${NC}"
        exit 0
    fi
    
    cd ..
}

# Prepare application files
prepare_application() {
    echo -e "${YELLOW}📦 Preparing application files...${NC}"
    
    # Create destination directory
    mkdir -p "$DEST_DIR"
    
    # Copy application files
    cp -r "$SOURCE_DIR"/* "$DEST_DIR/"
    
    # Update AWS configuration in the HTML file
    if [ ! -z "$CLOUDFRONT_URL" ]; then
        sed -i "s|CLOUDFRONT_URL: window.location.origin|CLOUDFRONT_URL: '$CLOUDFRONT_URL'|g" "$DEST_DIR/index.html"
        sed -i "s|S3_BUCKET: 'cloudkart-website'|S3_BUCKET: '$S3_BUCKET'|g" "$DEST_DIR/index.html"
    fi
    
    # Create error page
    cat > "$DEST_DIR/error.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found - CloudKart</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #667eea; }
        a { color: #667eea; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
</body>
</html>
EOF
    
    echo -e "${GREEN}✅ Application files prepared${NC}"
}

# Deploy to S3
deploy_to_s3() {
    echo -e "${YELLOW}☁️  Deploying to S3...${NC}"
    
    if [ -z "$S3_BUCKET" ]; then
        echo -e "${RED}❌ S3 bucket name not found. Please deploy infrastructure first.${NC}"
        exit 1
    fi
    
    # Sync files to S3
    aws s3 sync "$DEST_DIR/" "s3://$S3_BUCKET/" \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "*.html" \
        --exclude "*.json"
    
    # Upload HTML files with shorter cache
    aws s3 sync "$DEST_DIR/" "s3://$S3_BUCKET/" \
        --cache-control "max-age=3600" \
        --include "*.html" \
        --include "*.json"
    
    # Set proper content types
    aws s3 cp "$DEST_DIR/styles.css" "s3://$S3_BUCKET/styles.css" \
        --content-type "text/css" \
        --cache-control "max-age=31536000"
    
    aws s3 cp "$DEST_DIR/script.js" "s3://$S3_BUCKET/script.js" \
        --content-type "application/javascript" \
        --cache-control "max-age=31536000"
    
    aws s3 cp "$DEST_DIR/database/database.js" "s3://$S3_BUCKET/database/database.js" \
        --content-type "application/javascript" \
        --cache-control "max-age=31536000"
    
    echo -e "${GREEN}✅ Application deployed to S3${NC}"
}

# Invalidate CloudFront cache
invalidate_cloudfront() {
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    
    if [ -z "$CLOUDFRONT_URL" ]; then
        echo -e "${YELLOW}⚠️  CloudFront URL not found. Skipping cache invalidation.${NC}"
        return
    fi
    
    DISTRIBUTION_ID=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Origins.Items[0].DomainName=='$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com'].Id" \
        --output text)
    
    if [ ! -z "$DISTRIBUTION_ID" ]; then
        aws cloudfront create-invalidation \
            --distribution-id "$DISTRIBUTION_ID" \
            --paths "/*"
        
        echo -e "${GREEN}✅ CloudFront cache invalidation initiated${NC}"
    else
        echo -e "${YELLOW}⚠️  CloudFront distribution not found${NC}"
    fi
}

# Display deployment summary
show_summary() {
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 Deployment Summary:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ ! -z "$S3_BUCKET" ]; then
        echo -e "${BLUE}📦 S3 Bucket: $S3_BUCKET${NC}"
    fi
    
    if [ ! -z "$CLOUDFRONT_URL" ]; then
        echo -e "${BLUE}🌐 Website URL: $CLOUDFRONT_URL${NC}"
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}💡 Next Steps:${NC}"
    echo -e "${YELLOW}   • Test your website at the URL above${NC}"
    echo -e "${YELLOW}   • Monitor CloudWatch logs for any issues${NC}"
    echo -e "${YELLOW}   • Set up custom domain (optional)${NC}"
    echo -e "${YELLOW}   • Configure monitoring and alerts${NC}"
}

# Main execution
main() {
    check_prerequisites
    
    # Check if infrastructure already exists
    cd terraform
    if terraform output s3_bucket_name &> /dev/null; then
        S3_BUCKET=$(terraform output -raw s3_bucket_name)
        CLOUDFRONT_URL=$(terraform output -raw cloudfront_url)
        export S3_BUCKET
        export CLOUDFRONT_URL
        echo -e "${GREEN}✅ Using existing infrastructure${NC}"
    else
        deploy_infrastructure
    fi
    cd ..
    
    prepare_application
    deploy_to_s3
    invalidate_cloudfront
    show_summary
}

# Run main function
main "$@"

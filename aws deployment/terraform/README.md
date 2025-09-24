# CloudKart AWS Infrastructure

This Terraform configuration creates the AWS infrastructure for CloudKart deployment.

## Resources Created

- VPC with public and private subnets
- Internet Gateway and NAT Gateway
- Security Groups
- S3 bucket for static website hosting
- CloudFront distribution
- EC2 instance (optional backend)
- Route 53 hosted zone (optional)

## Usage

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply

# Destroy resources (when needed)
terraform destroy
```

## Variables

See `variables.tf` for all configurable parameters.

## Outputs

See `outputs.tf` for important values like CloudFront URL, S3 bucket name, etc.

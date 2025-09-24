# CloudKart AWS Infrastructure Outputs

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket
}

output "s3_bucket_website_endpoint" {
  description = "Website endpoint of the S3 bucket"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_url" {
  description = "URL of the CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "ec2_instance_id" {
  description = "ID of the EC2 instance"
  value       = var.create_ec2_instance ? aws_instance.app_server[0].id : null
}

output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = var.create_ec2_instance ? aws_instance.app_server[0].public_ip : null
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = var.create_ec2_instance ? aws_lb.app[0].dns_name : null
}

output "route53_zone_id" {
  description = "Zone ID of the Route 53 hosted zone"
  value       = var.create_route53_zone ? aws_route53_zone.main[0].zone_id : null
}

output "website_url" {
  description = "Main website URL"
  value       = var.create_route53_zone ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

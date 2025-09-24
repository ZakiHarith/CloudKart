@echo off
REM CloudKart AWS Deployment Script for Windows
REM This script prepares and deploys CloudKart to AWS

echo 🚀 Starting CloudKart AWS Deployment...

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ AWS CLI not found. Please install AWS CLI.
    pause
    exit /b 1
)

REM Check if Terraform is installed
terraform --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Terraform not found. Please install Terraform.
    pause
    exit /b 1
)

REM Check AWS credentials
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ AWS credentials not configured. Please run 'aws configure'.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Deploy infrastructure
echo 🏗️ Deploying AWS infrastructure...
cd terraform
terraform init
terraform plan
echo.
set /p deploy="Do you want to proceed with infrastructure deployment? (y/N): "
if /i "%deploy%"=="y" (
    terraform apply -auto-approve
    echo ✅ Infrastructure deployed successfully
) else (
    echo ⏭️ Skipping infrastructure deployment
    exit /b 0
)

REM Get outputs
for /f "tokens=*" %%i in ('terraform output -raw s3_bucket_name') do set S3_BUCKET=%%i
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_url') do set CLOUDFRONT_URL=%%i

cd ..

REM Prepare application files
echo 📦 Preparing application files...
if not exist "aws-optimized" mkdir aws-optimized
xcopy "simple html\*" "aws-optimized\" /E /I /Y

REM Update configuration
powershell -Command "(Get-Content 'aws-optimized\index.html') -replace 'CLOUDFRONT_URL: window.location.origin', 'CLOUDFRONT_URL: ''%CLOUDFRONT_URL%''' | Set-Content 'aws-optimized\index.html'"
powershell -Command "(Get-Content 'aws-optimized\index.html') -replace 'S3_BUCKET: ''cloudkart-website''', 'S3_BUCKET: ''%S3_BUCKET%''' | Set-Content 'aws-optimized\index.html'"

REM Create error page
echo ^<!DOCTYPE html^> > aws-optimized\error.html
echo ^<html lang="en"^> >> aws-optimized\error.html
echo ^<head^> >> aws-optimized\error.html
echo     ^<meta charset="UTF-8"^> >> aws-optimized\error.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> aws-optimized\error.html
echo     ^<title^>Page Not Found - CloudKart^</title^> >> aws-optimized\error.html
echo ^</head^> >> aws-optimized\error.html
echo ^<body^> >> aws-optimized\error.html
echo     ^<h1^>404 - Page Not Found^</h1^> >> aws-optimized\error.html
echo     ^<p^>The page you're looking for doesn't exist.^</p^> >> aws-optimized\error.html
echo     ^<a href="/"^>← Back to Home^</a^> >> aws-optimized\error.html
echo ^</body^> >> aws-optimized\error.html
echo ^</html^> >> aws-optimized\error.html

echo ✅ Application files prepared

REM Deploy to S3
echo ☁️ Deploying to S3...
aws s3 sync aws-optimized\ s3://%S3_BUCKET%/ --delete --cache-control "max-age=31536000" --exclude "*.html" --exclude "*.json"
aws s3 sync aws-optimized\ s3://%S3_BUCKET%/ --cache-control "max-age=3600" --include "*.html" --include "*.json"

REM Set proper content types
aws s3 cp aws-optimized\styles.css s3://%S3_BUCKET%/styles.css --content-type "text/css" --cache-control "max-age=31536000"
aws s3 cp aws-optimized\script.js s3://%S3_BUCKET%/script.js --content-type "application/javascript" --cache-control "max-age=31536000"
aws s3 cp aws-optimized\database\database.js s3://%S3_BUCKET%/database/database.js --content-type "application/javascript" --cache-control "max-age=31536000"

echo ✅ Application deployed to S3

REM Invalidate CloudFront cache
echo 🔄 Invalidating CloudFront cache...
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_distribution_id') do set DISTRIBUTION_ID=%%i
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"

echo ✅ CloudFront cache invalidation initiated

REM Display summary
echo.
echo 🎉 Deployment completed successfully!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 Deployment Summary:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 S3 Bucket: %S3_BUCKET%
echo 🌐 Website URL: %CLOUDFRONT_URL%
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 Next Steps:
echo    • Test your website at the URL above
echo    • Monitor CloudWatch logs for any issues
echo    • Set up custom domain (optional)
echo    • Configure monitoring and alerts

pause

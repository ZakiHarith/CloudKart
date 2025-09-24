// CloudKart AWS Configuration
// Configuration file for AWS deployment

const AWS_CONFIG = {
    // AWS Service Endpoints
    S3_BUCKET: 'cloudkart-website', // Will be replaced during deployment
    CLOUDFRONT_URL: '', // Will be populated from Terraform output
    
    // Environment Detection
    isProduction: () => {
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1' &&
               !window.location.hostname.includes('localhost');
    },
    
    // API Configuration
    API_BASE_URL: () => {
        if (AWS_CONFIG.isProduction()) {
            return AWS_CONFIG.CLOUDFRONT_URL || window.location.origin;
        }
        return 'http://localhost:3000';
    },
    
    // Image URLs
    getImageUrl: (imagePath) => {
        if (AWS_CONFIG.isProduction()) {
            return `${AWS_CONFIG.CLOUDFRONT_URL || window.location.origin}/${imagePath}`;
        }
        return imagePath;
    },
    
    // Static Asset URLs
    getAssetUrl: (assetPath) => {
        if (AWS_CONFIG.isProduction()) {
            return `${AWS_CONFIG.CLOUDFRONT_URL || window.location.origin}/${assetPath}`;
        }
        return assetPath;
    }
};

// Make AWS_CONFIG globally available
window.AWS_CONFIG = AWS_CONFIG;

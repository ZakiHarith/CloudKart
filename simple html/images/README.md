# Product Images Directory

This directory contains custom product images for CloudKart.

## Directory Structure

```
images/
├── products/          # Product images go here
│   ├── headphones.jpg
│   ├── smartwatch.jpg
│   ├── tshirt.jpg
│   └── ...
└── README.md         # This file
```

## How to Add Custom Images

1. **Place your images** in the `products/` folder
2. **Name your images** descriptively (e.g., `headphones.jpg`, `smartwatch.jpg`)
3. **Update the product data** in `script.js` to include the image path

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 400x400px or larger
- **Aspect Ratio**: Square (1:1) works best
- **File Size**: Keep under 500KB for fast loading

## Example Usage

In your product data, add an `image` property:

```javascript
{
    id: 1,
    title: "Wireless Bluetooth Headphones",
    description: "Premium quality wireless headphones",
    price: 199.99,
    category: "electronics",
    icon: "fas fa-headphones",
    image: "images/products/headphones.jpg", // Add this line
    badge: "Sale",
    inStock: true
}
```

## Fallback Behavior

- If an image fails to load, the system will automatically fall back to the FontAwesome icon
- If no image is specified, the FontAwesome icon will be used by default

## Supported Image Formats

- JPG/JPEG
- PNG
- WebP
- GIF (static images only)

## Tips

- Use descriptive filenames
- Optimize images for web (compress but maintain quality)
- Consider using WebP format for better compression
- Test images on different screen sizes

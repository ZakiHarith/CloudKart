// CloudKart Database System
// A simple JSON-based database for storing products, users, orders, and more

class CloudKartDB {
    constructor() {
        this.dbName = 'cloudkart_db';
        this.version = '1.0';
        this.tables = {
            products: 'products',
            users: 'users',
            orders: 'orders',
            categories: 'categories',
            reviews: 'reviews',
            wishlist: 'wishlist',
            cart: 'cart'
        };
        this.init();
    }

    // Initialize database
    init() {
        this.ensureTablesExist();
        this.loadSampleData();
    }

    // Ensure all tables exist in localStorage
    ensureTablesExist() {
        Object.values(this.tables).forEach(tableName => {
            if (!localStorage.getItem(`${this.dbName}_${tableName}`)) {
                localStorage.setItem(`${this.dbName}_${tableName}`, JSON.stringify([]));
            }
        });
    }

    // Generic CRUD operations
    create(table, data) {
        try {
            const tableData = this.read(table);
            const newId = this.generateId();
            const newRecord = { id: newId, ...data, createdAt: new Date().toISOString() };
            tableData.push(newRecord);
            this.write(table, tableData);
            return newRecord;
        } catch (error) {
            console.error(`Error creating record in ${table}:`, error);
            return null;
        }
    }

    read(table, id = null) {
        try {
            const tableData = JSON.parse(localStorage.getItem(`${this.dbName}_${table}`) || '[]');
            if (id) {
                return tableData.find(record => record.id === id);
            }
            return tableData;
        } catch (error) {
            console.error(`Error reading from ${table}:`, error);
            return id ? null : [];
        }
    }

    update(table, id, data) {
        try {
            const tableData = this.read(table);
            const index = tableData.findIndex(record => record.id === id);
            if (index !== -1) {
                tableData[index] = { ...tableData[index], ...data, updatedAt: new Date().toISOString() };
                this.write(table, tableData);
                return tableData[index];
            }
            return null;
        } catch (error) {
            console.error(`Error updating record in ${table}:`, error);
            return null;
        }
    }

    delete(table, id) {
        try {
            const tableData = this.read(table);
            const filteredData = tableData.filter(record => record.id !== id);
            this.write(table, filteredData);
            return true;
        } catch (error) {
            console.error(`Error deleting record from ${table}:`, error);
            return false;
        }
    }

    // Write data to localStorage
    write(table, data) {
        localStorage.setItem(`${this.dbName}_${table}`, JSON.stringify(data));
    }

    // Generate unique ID
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Search functionality
    search(table, query, fields = []) {
        try {
            const tableData = this.read(table);
            if (!query) return tableData;

            return tableData.filter(record => {
                if (fields.length === 0) {
                    // Search all string fields
                    return Object.values(record).some(value => 
                        typeof value === 'string' && 
                        value.toLowerCase().includes(query.toLowerCase())
                    );
                } else {
                    // Search specific fields
                    return fields.some(field => {
                        const value = record[field];
                        return typeof value === 'string' && 
                               value.toLowerCase().includes(query.toLowerCase());
                    });
                }
            });
        } catch (error) {
            console.error(`Error searching in ${table}:`, error);
            return [];
        }
    }

    // Filter functionality
    filter(table, filters) {
        try {
            const tableData = this.read(table);
            return tableData.filter(record => {
                return Object.entries(filters).every(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.includes(record[key]);
                    }
                    return record[key] === value;
                });
            });
        } catch (error) {
            console.error(`Error filtering in ${table}:`, error);
            return [];
        }
    }

    // Sort functionality
    sort(table, field, order = 'asc') {
        try {
            const tableData = this.read(table);
            return tableData.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                
                if (order === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        } catch (error) {
            console.error(`Error sorting in ${table}:`, error);
            return [];
        }
    }

    // Pagination
    paginate(table, page = 1, limit = 10) {
        try {
            const tableData = this.read(table);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            return {
                data: tableData.slice(startIndex, endIndex),
                total: tableData.length,
                page,
                limit,
                totalPages: Math.ceil(tableData.length / limit)
            };
        } catch (error) {
            console.error(`Error paginating in ${table}:`, error);
            return { data: [], total: 0, page: 1, limit, totalPages: 0 };
        }
    }

    // Load sample data if tables are empty
    loadSampleData() {
        this.loadSampleProducts();
        this.loadSampleCategories();
    }

    // Load sample products
    loadSampleProducts() {
        const existingProducts = this.read(this.tables.products);
        if (existingProducts.length === 0) {
            const sampleProducts = [
                {
                    title: "Sony WH-1000XM5",
                    description: "Premium quality wireless headphones with noise cancellation",
                    price: 199.99,
                    originalPrice: 249.99,
                    category: "electronics",
                    icon: "fas fa-headphones",
                    image: "images/products/mx5.jpg",
                    badge: "Sale",
                    inStock: true,
                    stock: 50,
                    rating: 4.5,
                    reviews: 128
                },
                {
                    title: "Smart Fitness Watch",
                    description: "Track your fitness goals with this advanced smartwatch",
                    price: 299.99,
                    originalPrice: 349.99,
                    category: "electronics",
                    icon: "fas fa-clock",
                    image: "images/products/smartwatch.jpeg",
                    badge: "New",
                    inStock: true,
                    stock: 25,
                    rating: 4.8,
                    reviews: 89
                },
                {
                    title: "Cotton T-Shirt",
                    description: "Comfortable and stylish cotton t-shirt for everyday wear",
                    price: 29.99,
                    originalPrice: 39.99,
                    category: "fashion",
                    icon: "fas fa-tshirt",
                    image: "images/products/cloths.jpeg",
                    badge: "Sale",
                    inStock: true,
                    stock: 100,
                    rating: 4.2,
                    reviews: 45
                },
                {
                    title: "Denim Jeans",
                    description: "Classic blue denim jeans with perfect fit",
                    price: 79.99,
                    originalPrice: 99.99,
                    category: "fashion",
                    icon: "fas fa-user-tie",
                    image: "images/products/jeans.jpeg",
                    badge: "Popular",
                    inStock: true,
                    stock: 75,
                    rating: 4.3,
                    reviews: 67
                },
                {
                    title: "Coffee Maker",
                    description: "Automatic coffee maker for your perfect morning brew",
                    price: 149.99,
                    originalPrice: 179.99,
                    category: "home",
                    icon: "fas fa-coffee",
                    image: "images/products/coffeemaker.jpeg",
                    badge: "Sale",
                    inStock: true,
                    stock: 30,
                    rating: 4.6,
                    reviews: 92
                },
                {
                    title: "Garden Tools Set",
                    description: "Complete set of gardening tools for your backyard",
                    price: 89.99,
                    originalPrice: 119.99,
                    category: "home",
                    icon: "fas fa-seedling",
                    image: "images/products/gardentoolset.jpeg",
                    badge: "Bundle",
                    inStock: true,
                    stock: 20,
                    rating: 4.4,
                    reviews: 34
                },
                {
                    title: "Yoga Mat",
                    description: "Non-slip yoga mat for your fitness routine",
                    price: 49.99,
                    originalPrice: 69.99,
                    category: "sports",
                    icon: "fas fa-dumbbell",
                    image: "images/products/yogamat.jpeg",
                    badge: "Sale",
                    inStock: true,
                    stock: 60,
                    rating: 4.1,
                    reviews: 56
                },
                {
                    title: "Running Shoes",
                    description: "Comfortable running shoes with advanced cushioning",
                    price: 129.99,
                    originalPrice: 159.99,
                    category: "sports",
                    icon: "fas fa-running",
                    image: "images/products/sportshoes.jpeg",
                    badge: "New",
                    inStock: true,
                    stock: 40,
                    rating: 4.7,
                    reviews: 78
                },
                {
                    title: "Laptop Stand",
                    description: "Adjustable laptop stand for better ergonomics",
                    price: 39.99,
                    originalPrice: 49.99,
                    category: "electronics",
                    icon: "fas fa-laptop",
                    image: "images/products/stand.jpeg",
                    badge: "Sale",
                    inStock: true,
                    stock: 35,
                    rating: 4.0,
                    reviews: 23
                },
                {
                    title: "Winter Jacket",
                    description: "Warm and stylish winter jacket for cold weather",
                    price: 159.99,
                    originalPrice: 199.99,
                    category: "fashion",
                    icon: "fas fa-user",
                    image: "images/products/jacket.jpeg",
                    badge: "Winter",
                    inStock: true,
                    stock: 15,
                    rating: 4.5,
                    reviews: 41
                },
                {
                    title: "Air Purifier",
                    description: "HEPA air purifier for clean indoor air",
                    price: 199.99,
                    originalPrice: 249.99,
                    category: "home",
                    icon: "fas fa-wind",
                    image: "images/products/air.jpeg",
                    badge: "Health",
                    inStock: true,
                    stock: 12,
                    rating: 4.8,
                    reviews: 67
                },
                {
                    title: "Basketball",
                    description: "Official size basketball for indoor and outdoor play",
                    price: 24.99,
                    originalPrice: 34.99,
                    category: "sports",
                    icon: "fas fa-basketball-ball",
                    image: "images/products/balls.jpeg",
                    badge: "Sale",
                    inStock: true,
                    stock: 80,
                    rating: 4.2,
                    reviews: 29
                },
                {
                    title: "Jet2Holidays airplane merch",
                    description: "Nothing beats a Jet2 holiday",
                    price: 5.99,
                    originalPrice: 12.99,
                    category: "electronics",
                    icon: "fas fa-airplane",
                    image: "images/products/jet2holiday.jpg",
                    badge: "Easter Egg", 
                    inStock: true,
                    stock: 999,
                    rating: 9.11,
                    reviews: 100
                },
                {
                    title: "Google Play GiftCard",
                    description: "DO NOT REDEEM THE CARD",
                    price: 99.99,
                    originalPrice: 129.99,
                    category: "electronics",
                    icon: "fas fa-credit-card",
                    image: "images/products/google_giftcard.jpg",
                    badge: "Easter Egg",
                    inStock: true,
                    stock: 999,
                    rating: 10.0,
                    reviews: 1
                },
                {
                    title: "Sport Shoe",
                    description: "Recommended by Fared",
                    price: 99.99,
                    originalPrice: 129.99,
                    category: "sports",
                    icon: "fas fa-shoe-prints",
                    image: "images/products/toe.jpeg",
                    badge: "Easter Egg",
                    inStock: true,
                    stock: 999,
                    rating: 10.0,
                    reviews: 1
                }
            ];

            sampleProducts.forEach(product => {
                this.create(this.tables.products, product);
            });
        }
    }

    // Load sample categories
    loadSampleCategories() {
        const existingCategories = this.read(this.tables.categories);
        if (existingCategories.length === 0) {
            const sampleCategories = [
                {
                    name: "Electronics",
                    slug: "electronics",
                    icon: "fas fa-laptop",
                    description: "Latest gadgets and electronic devices",
                    productCount: 0
                },
                {
                    name: "Fashion",
                    slug: "fashion",
                    icon: "fas fa-tshirt",
                    description: "Trendy clothing and accessories",
                    productCount: 0
                },
                {
                    name: "Home & Garden",
                    slug: "home",
                    icon: "fas fa-home",
                    description: "Everything for your home and garden",
                    productCount: 0
                },
                {
                    name: "Sports",
                    slug: "sports",
                    icon: "fas fa-dumbbell",
                    description: "Sports equipment and fitness gear",
                    productCount: 0
                }
            ];

            sampleCategories.forEach(category => {
                this.create(this.tables.categories, category);
            });
        }
    }

    // Database statistics
    getStats() {
        const stats = {};
        Object.values(this.tables).forEach(table => {
            const data = this.read(table);
            stats[table] = {
                count: data.length,
                lastUpdated: data.length > 0 ? 
                    Math.max(...data.map(item => new Date(item.updatedAt || item.createdAt).getTime())) : 
                    null
            };
        });
        return stats;
    }

    // Clear all data
    clearAll() {
        Object.values(this.tables).forEach(table => {
            localStorage.removeItem(`${this.dbName}_${table}`);
        });
        this.init();
    }

    // Export data
    exportData() {
        const data = {};
        Object.values(this.tables).forEach(table => {
            data[table] = this.read(table);
        });
        return data;
    }

    // Import data
    importData(data) {
        Object.entries(data).forEach(([table, records]) => {
            if (this.tables[table] || Object.values(this.tables).includes(table)) {
                this.write(table, records);
            }
        });
    }
}

// Create global database instance
window.db = new CloudKartDB();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudKartDB;
}

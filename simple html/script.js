// Products will be loaded from database
let products = [];

// Shopping Cart
let cart = [];
let wishlist = [];

// User Authentication
let currentUser = null;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const wishlistCount = document.getElementById('wishlistCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');

// Authentication DOM Elements
const userBtn = document.getElementById('userBtn');
const authModal = document.getElementById('authModal');
const authOverlay = document.getElementById('authOverlay');
const closeAuth = document.getElementById('closeAuth');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const userProfileTabs = document.getElementById('userProfileTabs');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const closeTabs = document.getElementById('closeTabs');
const reloadBtn = document.getElementById('reloadBtn');
const reloadDatabaseBtn = document.getElementById('reloadDatabaseBtn');
const wishlistTabs = document.getElementById('wishlistTabs');
const wishlistOverlay = document.getElementById('wishlistOverlay');
const closeWishlist = document.getElementById('closeWishlist');
const wishlistItemsContainer = document.getElementById('wishlistItemsContainer');
const wishlistTabCount = document.getElementById('wishlistTabCount');
const addAllToCartBtn = document.getElementById('addAllToCartBtn');
const clearWishlistBtn = document.getElementById('clearWishlistBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromDatabase();
    updateCartUI();
    setupEventListeners();
    checkAuthStatus();
    
    // Show reload button in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        reloadBtn.style.display = 'flex';
    }
});

// Event Listeners
function setupEventListeners() {
    // Cart functionality
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    // Wishlist functionality
    wishlistBtn.addEventListener('click', toggleWishlist);
    closeWishlist.addEventListener('click', closeWishlistTabs);
    wishlistOverlay.addEventListener('click', closeWishlistTabs);
    addAllToCartBtn.addEventListener('click', addAllWishlistToCart);
    clearWishlistBtn.addEventListener('click', clearWishlist);

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterProducts(filter);
            updateActiveFilter(this);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        if (searchTerm.trim() === '') {
            renderProducts(products);
        } else {
            const filteredProducts = db.search('products', searchTerm, ['title', 'description']);
            renderProducts(filteredProducts);
        }
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
            updateActiveFilterByCategory(category);
        });
    });

    // Authentication event listeners
    userBtn.addEventListener('click', handleUserButtonClick);
    closeAuth.addEventListener('click', closeAuthModal);
    authOverlay.addEventListener('click', closeAuthModal);
    showRegister.addEventListener('click', showRegistrationForm);
    showLogin.addEventListener('click', showLoginForm);
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegistration);
    logoutBtn.addEventListener('click', handleLogout);
    closeTabs.addEventListener('click', closeUserTabs);
    reloadBtn.addEventListener('click', reloadDatabase);
    reloadDatabaseBtn.addEventListener('click', handleReloadDatabase);

    // Tab switching functionality
    setupTabSwitching();

    // Close tabs when clicking outside
    document.addEventListener('click', function(e) {
        if (!userBtn.contains(e.target) && !userProfileTabs.contains(e.target)) {
            userProfileTabs.classList.remove('active');
        }
    });
}

// Render Products
function renderProducts(productsToRender) {
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }

    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners as backup
    addButtonEventListeners();
}

// Add event listeners to buttons as backup
function addButtonEventListeners() {
    console.log('Adding event listeners to buttons...');
    
    // Add to cart buttons
    const cartButtons = document.querySelectorAll('.btn-primary[data-product-id]');
    console.log('Found cart buttons:', cartButtons.length);
    
    cartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.dataset.productId;
            console.log('Event listener: Adding to cart product ID:', productId);
            addToCart(productId);
        });
    });
    
    // Add to wishlist buttons
    const wishlistButtons = document.querySelectorAll('.btn-secondary[data-product-id]');
    console.log('Found wishlist buttons:', wishlistButtons.length);
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.dataset.productId;
            console.log('Event listener: Adding to wishlist product ID:', productId);
            addToWishlist(productId);
        });
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Create image element - use custom image if available, otherwise use icon
    const imageElement = product.image ? 
        `<img src="${product.image}" alt="${product.title}" class="product-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <i class="${product.icon}" style="display: none;"></i>` :
        `<i class="${product.icon}"></i>`;
    
    card.innerHTML = `
        <div class="product-image">
            ${imageElement}
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description}</p>
            
            <!-- Product Rating -->
            <div class="product-rating">
                <div class="stars">
                    ${generateStars(product.rating || 0)}
                </div>
                <span class="rating-text">${product.rating || 0}</span>
                <span class="review-count">(${product.reviews || 0} reviews)</span>
            </div>
            
            <div class="product-price">
                <span class="price">$${product.price}</span>
                ${product.originalPrice > product.price ? 
                    `<span class="original-price">$${product.originalPrice}</span>` : ''}
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="btn btn-secondary" data-product-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Add to Cart
function addToCart(productId) {
    console.log('addToCart called with productId:', productId, 'Type:', typeof productId);
    console.log('Available products:', products.map(p => ({ id: p.id, title: p.title })));
    
    const product = products.find(p => p.id == productId); // Use == for type coercion
    if (!product) {
        console.log('Product not found for ID:', productId);
        showNotification('Product not found!');
        return;
    }

    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Updated existing cart item quantity to:', existingItem.quantity);
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        console.log('Added new item to cart:', product.title);
    }
    
    updateCartUI();
    showNotification(`${product.title} added to cart!`);
}

// Make functions globally accessible
window.addToCart = addToCart;
window.addToCartFromWishlistTab = addToCartFromWishlistTab;
window.removeFromWishlistTab = removeFromWishlistTab;
window.addAllWishlistToCart = addAllWishlistToCart;
window.toggleCart = toggleCart;
window.updateCartUI = updateCartUI;
window.cleanupDatabase = cleanupDatabase;
window.reloadDatabase = reloadDatabase;
window.deleteOrder = deleteOrder;
window.cancelOrder = cancelOrder;

// Test function to verify buttons work
window.testButton = function() {
    console.log('Button test function called!');
    showNotification('Button test successful!');
};

// Add to Wishlist
function addToWishlist(productId) {
    console.log('addToWishlist called with productId:', productId, 'Type:', typeof productId);
    console.log('Available products:', products.map(p => ({ id: p.id, title: p.title })));
    
    const product = products.find(p => p.id == productId); // Use == for type coercion
    if (!product) {
        console.log('Product not found for wishlist:', productId);
        showNotification('Product not found!');
        return;
    }

    if (!wishlist.find(item => item.id == productId)) {
        wishlist.push(product);
        updateWishlistUI();
        console.log('Added to wishlist:', product.title);
        showNotification(`${product.title} added to wishlist!`);
        
        // Also add to user's wishlist in database if user is logged in
        if (currentUser) {
            if (!currentUser.wishlist) {
                currentUser.wishlist = [];
            }
            if (!currentUser.wishlist.includes(productId)) {
                currentUser.wishlist.push(productId);
                db.update('users', currentUser.id, currentUser);
                localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
            }
        }
    } else {
        console.log('Already in wishlist:', product.title);
        showNotification(`${product.title} is already in your wishlist!`);
    }
}

// Make functions globally accessible
window.addToWishlist = addToWishlist;

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId); // Use == for type coercion
    updateCartUI();
}

// Update Cart Quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id == productId); // Use == for type coercion
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

// Make cart functions globally accessible
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;

// Update Cart UI
function updateCartUI() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #718096;">Your cart is empty</div>';
        cartTotal.textContent = '0.00';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <i class="${item.icon}"></i>
            </div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Update Wishlist UI
function updateWishlistUI() {
    wishlistCount.textContent = wishlist.length;
}

// Toggle Cart Sidebar
function toggleCart() {
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : 'auto';
}

// Toggle Wishlist Tab Menu
function toggleWishlist() {
    if (currentUser) {
        // User is logged in, show wishlist tab menu
        wishlistTabs.classList.toggle('active');
        wishlistOverlay.classList.toggle('active');
        if (wishlistTabs.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            loadWishlistTabItems();
        } else {
            document.body.style.overflow = 'auto';
        }
    } else {
        // User is not logged in, show auth modal
        openAuthModal();
    }
}

// Close wishlist tabs
function closeWishlistTabs() {
    wishlistTabs.classList.remove('active');
    wishlistOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Load wishlist items in the tab menu
function loadWishlistTabItems() {
    if (!currentUser) return;
    
    wishlistTabCount.textContent = `${wishlist.length} items`;
    
    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 1rem;"></i>
                <h3>Your wishlist is empty</h3>
                <p>Start adding items to your wishlist to see them here!</p>
                <button class="shop-btn" onclick="closeWishlistTabs(); filterProducts('all')">
                    <i class="fas fa-shopping-bag"></i>
                    Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    wishlistItemsContainer.innerHTML = wishlist.map(product => {
        return `
            <div class="wishlist-item">
                <div class="wishlist-item-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` :
                        `<i class="fas fa-image"></i>`
                    }
                </div>
                <div class="wishlist-item-info">
                    <div class="wishlist-item-title">${product.title}</div>
                    <div class="wishlist-item-price">$${product.price}</div>
                    <div class="wishlist-item-actions">
                        <button class="add-to-cart-btn" onclick="addToCartFromWishlistTab('${product.id}')">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="remove-from-wishlist-btn" onclick="removeFromWishlistTab('${product.id}')">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add all wishlist items to cart
function addAllWishlistToCart() {
    if (!currentUser) return;
    
    let addedCount = 0;
    
    wishlist.forEach(product => {
        addToCart(product.id);
        addedCount++;
    });
    
    if (addedCount > 0) {
        // Clear the wishlist after adding all items to cart
        wishlist = [];
        
        // Clear user's wishlist in database
        if (currentUser.wishlist) {
            currentUser.wishlist = [];
            db.update('users', currentUser.id, currentUser);
            localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
        }
        
        // Update wishlist UI
        updateWishlistUI();
        loadWishlistTabItems();
        
        showNotification(`Added ${addedCount} items to cart and cleared wishlist!`, 'success');
        closeWishlistTabs();
    }
}

// Clear wishlist
function clearWishlist() {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to clear your wishlist?')) {
        // Clear global wishlist
        wishlist = [];
        
        // Clear user's wishlist in database
        currentUser.wishlist = [];
        db.update('users', currentUser.id, currentUser);
        localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
        
        updateWishlistUI();
        loadWishlistTabItems();
        showNotification('Wishlist cleared!', 'success');
    }
}

// Add to cart from wishlist tab
function addToCartFromWishlistTab(productId) {
    console.log('addToCartFromWishlistTab called with productId:', productId, 'Type:', typeof productId);
    console.log('Available products:', products.map(p => ({ id: p.id, title: p.title })));
    console.log('Current cart:', cart);
    
    // Find the product in the main products array (same as homepage)
    const product = products.find(p => p.id == productId); // Use == for type coercion
    if (!product) {
        console.log('Product not found for ID:', productId);
        showNotification('Product not found!');
        return;
    }

    // Check if item already exists in cart (same as homepage)
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Updated existing cart item quantity to:', existingItem.quantity);
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        console.log('Added new item to cart:', product.title);
    }
    
    // Update cart UI (same as homepage)
    updateCartUI();
    showNotification(`${product.title} added to cart!`);
    
    console.log('After adding to cart, cart is now:', cart);
}

// Remove from wishlist tab
function removeFromWishlistTab(productId) {
    console.log('removeFromWishlistTab called with productId:', productId);
    
    // Find the product to get its title for notification
    const product = wishlist.find(item => item.id == productId);
    const productTitle = product ? product.title : 'Item';
    
    if (!currentUser) {
        console.log('No current user found');
        return;
    }
    
    // Show confirmation dialog (same as clearWishlist)
    if (confirm(`Are you sure you want to remove "${productTitle}" from your wishlist?`)) {
        // Remove from global wishlist array
        const beforeCount = wishlist.length;
        wishlist = wishlist.filter(item => item.id != productId);
        console.log('Wishlist before:', beforeCount, 'after:', wishlist.length);
        
        // Remove from user's wishlist in database
        if (currentUser.wishlist) {
            currentUser.wishlist = currentUser.wishlist.filter(id => id != productId);
            db.update('users', currentUser.id, currentUser);
            localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
        }
        
        updateWishlistUI();
        loadWishlistTabItems();
        showNotification(`${productTitle} removed from wishlist!`, 'success');
    }
}

// Load orders
function loadOrders() {
    const ordersContainer = document.querySelector('.orders-list');
    
    if (!currentUser || !currentUser.orders || currentUser.orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h4>No orders yet</h4>
                <p>Start shopping to see your orders here</p>
                <button class="shop-btn" onclick="closeUserTabs(); filterProducts('all')">
                    <i class="fas fa-shopping-bag"></i>
                    Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = currentUser.orders.map(order => {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const orderTime = new Date(order.orderDate).toLocaleTimeString();
        
        return `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.id}</h4>
                        <p class="order-date">${orderDate} at ${orderTime}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge status-${order.status}">${order.status}</span>
                    </div>
                </div>
                
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <div class="item-info">
                                <h5>${item.title}</h5>
                                <p>Quantity: ${item.quantity}</p>
                            </div>
                            <div class="item-price">
                                $${(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-footer">
                    <div class="order-total">
                        <strong>Total: $${order.total.toFixed(2)}</strong>
                    </div>
                    <div class="order-actions">
                        ${order.status === 'completed' ? `
                            <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">
                                <i class="fas fa-times"></i>
                                Cancel Order
                            </button>
                        ` : ''}
                        ${order.status === 'cancelled' ? `
                            <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">
                                <i class="fas fa-trash"></i>
                                Delete Order
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View order details
function viewOrderDetails(orderId) {
    const order = currentUser.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const orderDate = new Date(order.orderDate).toLocaleDateString();
    const orderTime = new Date(order.orderDate).toLocaleTimeString();
    
    const details = `
Order #${order.id}
Date: ${orderDate} at ${orderTime}
Status: ${order.status}
Payment Method: ${order.paymentMethod}
Shipping Address: ${order.shippingAddress}

Items:
${order.items.map(item => `- ${item.title} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: $${order.total.toFixed(2)}
    `;
    
    alert(details);
}

// Cancel order
function cancelOrder(orderId) {
    const order = currentUser.orders.find(o => o.id == orderId); // Use == for type coercion
    if (!order) return;
    
    if (confirm(`Are you sure you want to cancel Order #${orderId}?\n\nThis action cannot be undone.`)) {
        // Update order status to cancelled
        order.status = 'cancelled';
        order.cancelledDate = new Date().toISOString();
        
        // Update user in database
        db.update('users', currentUser.id, currentUser);
        localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
        
        // Reload orders display
        loadOrders();
        
        showNotification(`Order #${orderId} has been cancelled.`, 'success');
    }
}

// Delete order
function deleteOrder(orderId) {
    const order = currentUser.orders.find(o => o.id == orderId); // Use == for type coercion
    if (!order) return;
    
    if (confirm(`Are you sure you want to permanently delete Order #${orderId}?\n\nThis action cannot be undone.`)) {
        // Remove order from user's orders array
        currentUser.orders = currentUser.orders.filter(o => o.id != orderId); // Use != for type coercion
        
        // Update user in database
        db.update('users', currentUser.id, currentUser);
        localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
        
        // Reload orders display
        loadOrders();
        
        showNotification(`Order #${orderId} has been deleted.`, 'success');
    }
}

// Load products from database
function loadProductsFromDatabase() {
    products = db.read('products');
    console.log('Loaded products:', products.length, products);
    renderProducts(products);
}

// Force reload database (useful for development)
function reloadDatabase() {
    // Clear existing data
    db.clearAll();
    // Reload products
    loadProductsFromDatabase();
    showNotification('Database reloaded successfully!');
}

// Handle database reload from user profile
function handleReloadDatabase() {
    if (confirm('Are you sure you want to reload the database? This will refresh all product data and images.')) {
        // Clear existing data
        db.clearAll();
        // Reload products
        loadProductsFromDatabase();
        showNotification('Database have successfully reload');
        
        // Close the user profile tabs
        closeUserTabs();
    }
}

// Clean up database - clear all data and reset
function cleanupDatabase() {
    if (confirm('Are you sure you want to clean up the database? This will:\n\n• Clear all user data (users, orders, wishlists)\n• Clear all cart data\n• Reset products to default\n• Clear all localStorage data\n\nThis action cannot be undone!')) {
        try {
            // Clear all database tables
            db.clearAll();
            
            // Clear additional localStorage data
            localStorage.removeItem('cloudkart_current_user');
            localStorage.removeItem('cloudkart_cart');
            localStorage.removeItem('cloudkart_wishlist');
            
            // Reset global variables
            cart = [];
            wishlist = [];
            currentUser = null;
            
            // Reload products
            loadProductsFromDatabase();
            
            // Update UI
            updateCartUI();
            updateWishlistUI();
            updateUserUI();
            
            showNotification('Database cleaned up successfully! All data has been reset.', 'success');
            
            console.log('Database cleanup completed');
        } catch (error) {
            console.error('Error during database cleanup:', error);
            showNotification('Error during database cleanup. Please try again.', 'error');
        }
    }
}

// Filter Products
function filterProducts(filter) {
    let filteredProducts;
    
    if (filter === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = db.filter('products', { category: filter });
    }
    
    renderProducts(filteredProducts);
}

// Update Active Filter Button
function updateActiveFilter(activeButton) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

// Update Active Filter by Category
function updateActiveFilterByCategory(category) {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Checkout Functionality
document.querySelector('.checkout-btn').addEventListener('click', function() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    if (!currentUser) {
        showNotification('Please login to proceed with checkout!');
        openAuthModal();
        return;
    }
    
    proceedToCheckout();
});

// Proceed to checkout and create order
function proceedToCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (confirm(`Proceed to checkout?\n\nItems: ${itemCount}\nTotal: $${total.toFixed(2)}`)) {
        // Create order
        const order = {
            id: Date.now(),
            userId: currentUser.id,
            items: [...cart], // Copy cart items
            total: total,
            itemCount: itemCount,
            status: 'completed',
            orderDate: new Date().toISOString(),
            shippingAddress: currentUser.address || 'No address provided',
            paymentMethod: 'Credit Card' // Default payment method
        };
        
        // Add order to user's orders
        if (!currentUser.orders) {
            currentUser.orders = [];
        }
        currentUser.orders.unshift(order); // Add to beginning of array
        
        // Update user in database
        db.update('users', currentUser.id, currentUser);
        localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
        
        // Clear cart
        cart = [];
        updateCartUI();
        toggleCart();
        
        showNotification(`Order #${order.id} placed successfully!`, 'success');
        
        // Refresh user profile data if profile tabs are open
        if (userProfileTabs.classList.contains('active')) {
            loadUserProfileData();
        }
    }
}

// Newsletter Subscription
document.querySelector('.newsletter button').addEventListener('click', function() {
    const emailInput = document.querySelector('.newsletter input');
    const email = emailInput.value.trim();
    
    if (email && isValidEmail(email)) {
        showNotification('Thank you for subscribing to our newsletter!');
        emailInput.value = '';
    } else {
        showNotification('Please enter a valid email address.');
    }
});

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Smooth Scrolling for CTA Button
document.querySelector('.cta-btn').addEventListener('click', function() {
    document.querySelector('.products').scrollIntoView({
        behavior: 'smooth'
    });
});

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate product cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe product cards
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }, 100);
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cartSidebar.classList.contains('open')) {
        toggleCart();
    }
});

// Initialize wishlist count
updateWishlistUI();

// Authentication Functions
function checkAuthStatus() {
    const savedUser = localStorage.getItem('cloudkart_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
        
        // Load user's wishlist from database
        if (currentUser.wishlist && currentUser.wishlist.length > 0) {
            wishlist = [];
            currentUser.wishlist.forEach(productId => {
                const product = products.find(p => p.id == productId);
                if (product) {
                    wishlist.push(product);
                }
            });
            updateWishlistUI();
        }
    }
}

function handleUserButtonClick(e) {
    e.stopPropagation();
    if (currentUser) {
        // User is logged in, show tab menu
        userProfileTabs.classList.toggle('active');
        if (userProfileTabs.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            loadUserProfileData();
        } else {
            document.body.style.overflow = 'auto';
        }
    } else {
        // User is not logged in, show auth modal
        openAuthModal();
    }
}

function openAuthModal() {
    authModal.classList.add('active');
    authOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    showLoginForm();
}

function closeAuthModal() {
    authModal.classList.remove('active');
    authOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    userProfileTabs.classList.remove('active');
}

function closeUserTabs() {
    userProfileTabs.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

function showRegistrationForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Find user in database
    const users = db.read('users');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('cloudkart_current_user', JSON.stringify(user));
        updateUserUI();
        closeAuthModal();
        showNotification(`Welcome back, ${user.firstName}!`);
        
        // Clear form
        loginFormElement.reset();
    } else {
        showNotification('Invalid email or password. Please try again.');
    }
}

function handleRegistration(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long!');
        return;
    }
    
    // Check if user already exists
    const users = db.read('users');
    if (users.find(u => u.email === email)) {
        showNotification('An account with this email already exists!');
        return;
    }
    
    // Create new user in database
    const newUser = db.create('users', {
        firstName,
        lastName,
        email,
        password
    });
    
    currentUser = newUser;
    localStorage.setItem('cloudkart_current_user', JSON.stringify(newUser));
    
    updateUserUI();
    closeAuthModal();
    showNotification(`Welcome to CloudKart, ${firstName}!`);
    
    // Clear form
    registerFormElement.reset();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('cloudkart_current_user');
    updateUserUI();
    userProfileTabs.classList.remove('active');
    document.body.style.overflow = 'auto';
    showNotification('You have been signed out successfully.');
}

function updateUserUI() {
    if (currentUser) {
        // Update user button to show profile
        userBtn.innerHTML = `
            <i class="fas fa-user-circle"></i>
        `;
        
        // Update tab header content
        userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        userEmail.textContent = currentUser.email;
    } else {
        // Reset user button to default
        userBtn.innerHTML = `
            <i class="fas fa-user"></i>
        `;
    }
}

// Social Login Functions (Placeholder)
function handleGoogleLogin() {
    showNotification('Google login integration coming soon!');
}

function handleFacebookLogin() {
    showNotification('Facebook login integration coming soon!');
}

// Tab Switching Functions
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

function loadUserProfileData() {
    if (currentUser) {
        // Load profile data into form fields
        document.getElementById('profileFirstName').value = currentUser.firstName || '';
        document.getElementById('profileLastName').value = currentUser.lastName || '';
        document.getElementById('profileEmail').value = currentUser.email || '';
        document.getElementById('profilePhone').value = currentUser.phone || '';
        document.getElementById('profileDob').value = currentUser.dob || '';
        
        // Load wishlist items
        loadWishlistItems();
        
        // Load orders
        loadOrders();
    }
}

function loadWishlistItems() {
    const wishlistContainer = document.getElementById('wishlistItems');
    
    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h4>Your wishlist is empty</h4>
                <p>Add items to your wishlist to see them here</p>
                <button class="shop-btn" onclick="closeUserTabs()">Start Shopping</button>
            </div>
        `;
        return;
    }
    
    wishlistContainer.innerHTML = '';
    wishlist.forEach(item => {
        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.innerHTML = `
            <div class="wishlist-item-image">
                <i class="${item.icon}"></i>
            </div>
            <div class="wishlist-item-info">
                <div class="wishlist-item-title">${item.title}</div>
                <div class="wishlist-item-price">$${item.price}</div>
                <div class="wishlist-item-actions">
                    <button class="add-to-cart-btn" onclick="addToCartFromWishlistTab('${item.id}')">
                        Add to Cart
                    </button>
                    <button class="remove-from-wishlist-btn" onclick="removeFromWishlistTab('${item.id}')">
                        Remove
                    </button>
                </div>
            </div>
        `;
        wishlistContainer.appendChild(wishlistItem);
    });
}


function removeFromWishlist(productId) {
    // Find the product to get its title for notification
    const product = wishlist.find(item => item.id == productId);
    const productTitle = product ? product.title : 'Item';
    
    wishlist = wishlist.filter(item => item.id !== productId);
    updateWishlistUI();
    loadWishlistItems();
    showNotification(`${productTitle} removed from wishlist`);
    
    // Also remove from user's wishlist in database if user is logged in
    if (currentUser && currentUser.wishlist) {
        currentUser.wishlist = currentUser.wishlist.filter(id => id != productId);
        db.update('users', currentUser.id, currentUser);
        localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
    }
}

// Profile form save functionality
document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            if (currentUser) {
                // Update user data
                currentUser.firstName = document.getElementById('profileFirstName').value;
                currentUser.lastName = document.getElementById('profileLastName').value;
                currentUser.email = document.getElementById('profileEmail').value;
                currentUser.phone = document.getElementById('profilePhone').value;
                currentUser.dob = document.getElementById('profileDob').value;
                
                // Save to localStorage
                localStorage.setItem('cloudkart_current_user', JSON.stringify(currentUser));
                
                // Update user in database
                db.update('users', currentUser.id, {
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    email: currentUser.email,
                    phone: currentUser.phone,
                    dob: currentUser.dob
                });
                
                // Update UI
                updateUserUI();
                showNotification('Profile updated successfully!');
            }
        });
    }
});

// Add social login event listeners
document.addEventListener('DOMContentLoaded', function() {
    const googleBtns = document.querySelectorAll('.google-btn');
    const facebookBtns = document.querySelectorAll('.facebook-btn');
    
    googleBtns.forEach(btn => {
        btn.addEventListener('click', handleGoogleLogin);
    });
    
    facebookBtns.forEach(btn => {
        btn.addEventListener('click', handleFacebookLogin);
    });
});


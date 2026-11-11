/**
 * Blossom Delight - Shared Utility & Data Management Module (util.js)
 * Manages localStorage for products and shopping cart state
 */

const STORAGE_KEYS = {
    PRODUCTS: 'blossom_delight_products',
    CART: 'blossom_delight_cart'
};

// Initial Seed Products (at least 8 distinct floral products)
const DEFAULT_PRODUCTS = [
    {
        id: 'prod-1',
        name: 'Crimson Velvet Roses',
        price: 49.99,
        category: 'Roses',
        image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=600&q=80',
        description: 'A dozen handpicked, long-stemmed Ecuadorian red roses tied with silk ribbon.',
        featured: true
    },
    {
        id: 'prod-2',
        name: 'Pastel Sunrise Tulips',
        price: 36.50,
        category: 'Tulips',
        image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80',
        description: 'Fresh Dutch spring tulips in soft blushing pinks, sunny yellows, and whites.',
        featured: true
    },
    {
        id: 'prod-3',
        name: 'Royal Purple Orchid',
        price: 58.00,
        category: 'Orchids',
        image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80',
        description: 'Double-stem Phalaenopsis exotic potted orchid with delicate ceramic planter.',
        featured: true
    },
    {
        id: 'prod-4',
        name: 'Enchanted Garden Bouquet',
        price: 64.99,
        category: 'Bouquets',
        image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80',
        description: 'Artisan mix of ranunculus, spray roses, eucalyptus, and delicate baby breath.',
        featured: true
    },
    {
        id: 'prod-5',
        name: 'Golden Sunflower Glow',
        price: 32.00,
        category: 'Bouquets',
        image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
        description: 'Vibrant sunshine sunflowers paired with chamomile daisies for cheerful warmth.',
        featured: false
    },
    {
        id: 'prod-6',
        name: 'Blushing Peony Symphony',
        price: 54.00,
        category: 'Roses',
        image: 'https://images.unsplash.com/photo-1588628566587-dbd176de94b4?auto=format&fit=crop&w=600&q=80',
        description: 'Fragrant blush garden peonies arranged alongside soft foliage and cream spray roses.',
        featured: false
    },
    {
        id: 'prod-7',
        name: 'Pure Serenity White Lilies',
        price: 44.50,
        category: 'Bouquets',
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
        description: 'Stunning fragrant white Oriental lilies signifying peace, grace, and new beginnings.',
        featured: false
    },
    {
        id: 'prod-8',
        name: 'Sweet Violet Orchid Bloom',
        price: 69.99,
        category: 'Orchids',
        image: 'https://images.unsplash.com/photo-1566999572459-399a9a382103?auto=format&fit=crop&w=600&q=80',
        description: 'Rare exotic orchid presented in an artisan terracotta moss vessel.',
        featured: false
    }
];

/**
 * Initialize mock data if not already present in localStorage
 */
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
}

// ----------------------------------------------------
// PRODUCT CRUD FUNCTIONS
// ----------------------------------------------------

/**
 * Get all products from localStorage
 * @returns {Array} List of product objects
 */
function getProducts() {
    initStorage();
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading products from localStorage:', e);
        return [];
    }
}

/**
 * Get single product by ID
 * @param {string|number} id
 * @returns {Object|null}
 */
function getProductById(id) {
    const products = getProducts();
    return products.find(p => String(p.id) === String(id)) || null;
}

/**
 * Save complete product list to localStorage
 * @param {Array} products
 */
function saveProducts(products) {
    try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
        console.error('Error saving products:', e);
    }
}

/**
 * Add a new product
 * @param {Object} productData
 * @returns {Object} Created product
 */
function addProduct(productData) {
    const products = getProducts();
    const newProduct = {
        id: 'prod-' + Date.now(),
        name: productData.name.trim(),
        price: parseFloat(productData.price) || 0.0,
        category: productData.category.trim(),
        image: productData.image && productData.image.trim() !== ''
            ? productData.image.trim()
            : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        description: (productData.description || '').trim(),
        featured: Boolean(productData.featured)
    };
    products.unshift(newProduct);
    saveProducts(products);
    return newProduct;
}

/**
 * Update an existing product
 * @param {string|number} id
 * @param {Object} updatedFields
 * @returns {boolean} Success status
 */
function updateProduct(id, updatedFields) {
    const products = getProducts();
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index === -1) return false;

    products[index] = {
        ...products[index],
        name: updatedFields.name ? updatedFields.name.trim() : products[index].name,
        price: updatedFields.price !== undefined ? parseFloat(updatedFields.price) : products[index].price,
        category: updatedFields.category ? updatedFields.category.trim() : products[index].category,
        image: updatedFields.image && updatedFields.image.trim() !== '' ? updatedFields.image.trim() : products[index].image,
        description: updatedFields.description !== undefined ? updatedFields.description.trim() : products[index].description,
        featured: updatedFields.featured !== undefined ? Boolean(updatedFields.featured) : products[index].featured
    };
    saveProducts(products);

    // Also update any matching product in the cart
    const cart = getCart();
    const cartUpdated = cart.map(item => {
        if (String(item.id) === String(id)) {
            return {
                ...item,
                name: products[index].name,
                price: products[index].price,
                image: products[index].image,
                category: products[index].category
            };
        }
        return item;
    });
    saveCart(cartUpdated);

    return true;
}

/**
 * Delete a product by ID
 * @param {string|number} id
 * @returns {boolean} Success status
 */
function deleteProduct(id) {
    const products = getProducts();
    const filtered = products.filter(p => String(p.id) !== String(id));
    if (filtered.length === products.length) return false;
    saveProducts(filtered);

    // Also remove from cart if present
    removeFromCart(id);
    return true;
}

/**
 * Reset products back to default mock data
 */
function resetDefaultProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
}

// ----------------------------------------------------
// CART MANAGEMENT FUNCTIONS
// ----------------------------------------------------

/**
 * Get current cart items
 * @returns {Array} Array of cart items {id, name, price, image, category, quantity}
 */
function getCart() {
    initStorage();
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CART);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading cart from localStorage:', e);
        return [];
    }
}

/**
 * Save cart items to localStorage and update badge
 * @param {Array} cart
 */
function saveCart(cart) {
    try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        updateNavbarCartBadge();
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

/**
 * Add a product to the cart
 * @param {string|number} productId
 * @param {number} quantity
 */
function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) return false;

    const cart = getCart();
    const existing = cart.find(item => String(item.id) === String(productId));

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    saveCart(cart);
    showToast('Item Added', `"${product.name}" has been added to your bouquet cart!`, 'success');
    return true;
}

/**
 * Update the quantity of a cart item
 * @param {string|number} productId
 * @param {number} quantity
 */
function updateCartItemQuantity(productId, quantity) {
    let cart = getCart();
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(i => String(i.id) === String(productId));
    if (item) {
        item.quantity = qty;
        saveCart(cart);
    }
}

/**
 * Remove an item from the cart
 * @param {string|number} productId
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => String(item.id) !== String(productId));
    saveCart(cart);
}

/**
 * Clear the entire cart
 */
function clearCart() {
    saveCart([]);
}

/**
 * Get total number of items in cart
 * @returns {number}
 */
function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

/**
 * Calculate totals: subtotal, taxes (8%), shipping, and total
 * @returns {Object}
 */
function getCartTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.08;
    const taxes = subtotal > 0 ? subtotal * taxRate : 0;
    const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + taxes + shipping;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxes: parseFloat(taxes.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

/**
 * Update the cart badge count across any active page
 */
function updateNavbarCartBadge() {
    const badges = document.querySelectorAll('.cart-badge-count');
    const count = getCartCount();
    badges.forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
            badge.classList.remove('d-none');
        } else {
            // Keep visible or zero
            badge.textContent = '0';
        }
    });
}

/**
 * Show a toast notification
 * @param {string} title
 * @param {string} message
 * @param {string} type 'success' | 'info' | 'danger'
 */
function showToast(title, message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'text-bg-success' : type === 'danger' ? 'text-bg-danger' : 'text-bg-primary';

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong>: ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    if (window.bootstrap && window.bootstrap.Toast) {
        const toast = new bootstrap.Toast(toastElement, { delay: 3500 });
        toast.show();
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    updateNavbarCartBadge();
});

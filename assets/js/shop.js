/**
 * Blossom Delight - Storefront & Cart JavaScript Module (shop.js)
 * Manages rendering of products, filtering, search, sorting, and cart view interactions
 */

let currentCategory = 'all';
let currentSearchTerm = '';
let currentSort = 'default';

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the Homepage with featured products grid
    const featuredGrid = document.getElementById('featured-products-grid');
    if (featuredGrid) {
        renderFeaturedProducts();
    }

    // Check if we are on the Products catalog page
    const catalogGrid = document.getElementById('products-catalog-grid');
    if (catalogGrid) {
        initCatalogPage();
    }

    // Check if we are on the Cart page
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        renderCartPage();
    }
});

// ----------------------------------------------------
// HOMEPAGE: FEATURED PRODUCTS
// ----------------------------------------------------

function renderFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products-grid');
    if (!featuredGrid) return;

    const allProducts = getProducts();
    // Select featured or first 4 products
    let featured = allProducts.filter(p => p.featured);
    if (featured.length === 0) {
        featured = allProducts.slice(0, 4);
    } else {
        featured = featured.slice(0, 4);
    }

    featuredGrid.innerHTML = '';
    featured.forEach(product => {
        const cardCol = createProductCardElement(product);
        featuredGrid.appendChild(cardCol);
    });
}

// ----------------------------------------------------
// CATALOG PAGE: FILTERING, SEARCH, SORTING
// ----------------------------------------------------

function initCatalogPage() {
    renderCatalog();

    // Search input listener
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase().trim();
            renderCatalog();
        });
    }

    // Sort select listener
    const sortSelect = document.getElementById('product-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderCatalog();
        });
    }

    // Category button filters
    const filterButtons = document.querySelectorAll('.category-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active', 'btn-boutique-primary');
                b.classList.add('btn-boutique-outline');
            });
            btn.classList.add('active', 'btn-boutique-primary');
            btn.classList.remove('btn-boutique-outline');

            currentCategory = btn.getAttribute('data-category');
            renderCatalog();
        });
    });
}

function renderCatalog() {
    const catalogGrid = document.getElementById('products-catalog-grid');
    const emptyState = document.getElementById('catalog-empty-state');
    const resultsCountEl = document.getElementById('results-count');
    if (!catalogGrid) return;

    let products = getProducts();

    // 1. Filter by category
    if (currentCategory && currentCategory !== 'all') {
        products = products.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // 2. Filter by search term
    if (currentSearchTerm) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(currentSearchTerm) ||
            (p.description && p.description.toLowerCase().includes(currentSearchTerm)) ||
            p.category.toLowerCase().includes(currentSearchTerm)
        );
    }

    // 3. Sort
    if (currentSort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
        products.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Update count indicator
    if (resultsCountEl) {
        resultsCountEl.textContent = `Showing ${products.length} floral ${products.length === 1 ? 'item' : 'items'}`;
    }

    catalogGrid.innerHTML = '';

    if (products.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
    } else {
        if (emptyState) emptyState.classList.add('d-none');
        products.forEach(product => {
            const cardCol = createProductCardElement(product);
            catalogGrid.appendChild(cardCol);
        });
    }
}

/**
 * Creates responsive Bootstrap column & card element for a product
 */
function createProductCardElement(product) {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3 d-flex';

    col.innerHTML = `
        <div class="flower-card w-100">
            <div class="card-img-wrap">
                <span class="category-tag">${product.category}</span>
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';">
            </div>
            <div class="card-body">
                <h5 class="fw-bold mb-1">${product.name}</h5>
                <p class="text-muted small line-clamp-2 mb-3">${product.description || 'Handcrafted fresh floral selection by our artisan florists.'}</p>
                <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-sm btn-boutique-primary add-to-cart-btn" data-id="${product.id}" title="Add to cart">
                        <i class="fa-solid fa-cart-plus me-1"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;

    const btn = col.querySelector('.add-to-cart-btn');
    btn.addEventListener('click', () => {
        addToCart(product.id);
    });

    return col;
}

// ----------------------------------------------------
// CART PAGE: LISTING, QUANTITY CONTROLS, SUMMARY & CHECKOUT
// ----------------------------------------------------

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const emptyNotice = document.getElementById('cart-empty-notice');
    const contentWrapper = document.getElementById('cart-content-wrapper');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        if (emptyNotice) emptyNotice.classList.remove('d-none');
        if (contentWrapper) contentWrapper.classList.add('d-none');
        updateNavbarCartBadge();
        return;
    }

    if (emptyNotice) emptyNotice.classList.add('d-none');
    if (contentWrapper) contentWrapper.classList.remove('d-none');

    container.innerHTML = '';

    cart.forEach(item => {
        const tr = document.createElement('tr');
        const itemSubtotal = (item.price * item.quantity).toFixed(2);

        tr.innerHTML = `
            <td class="align-middle">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img me-3 d-none d-sm-block" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';">
                    <div>
                        <h6 class="mb-0 fw-bold">${item.name}</h6>
                        <span class="badge bg-secondary-subtle text-secondary small">${item.category}</span>
                    </div>
                </div>
            </td>
            <td class="align-middle text-muted fw-semibold">$${item.price.toFixed(2)}</td>
            <td class="align-middle">
                <div class="qty-control">
                    <button type="button" class="qty-btn btn-dec" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                    <input type="text" readonly class="qty-input" value="${item.quantity}">
                    <button type="button" class="qty-btn btn-inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
            </td>
            <td class="align-middle fw-bold text-dark">$${itemSubtotal}</td>
            <td class="align-middle text-end">
                <button class="btn btn-outline-danger btn-sm rounded-circle btn-remove" data-id="${item.id}" title="Remove item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        // Event listeners
        const decBtn = tr.querySelector('.btn-dec');
        decBtn.addEventListener('click', () => {
            updateCartItemQuantity(item.id, item.quantity - 1);
            renderCartPage();
        });

        const incBtn = tr.querySelector('.btn-inc');
        incBtn.addEventListener('click', () => {
            updateCartItemQuantity(item.id, item.quantity + 1);
            renderCartPage();
        });

        const removeBtn = tr.querySelector('.btn-remove');
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id);
            showToast('Item Removed', `"${item.name}" has been removed from your cart.`, 'info');
            renderCartPage();
        });

        container.appendChild(tr);
    });

    // Update Totals Summary
    const totals = getCartTotals();
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${totals.taxes.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;

    updateNavbarCartBadge();
}

/**
 * Handle Mock Checkout process
 */
function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Empty Cart', 'Your cart is empty. Add flowers before checking out!', 'info');
        return;
    }

    const totals = getCartTotals();
    const checkoutModalEl = document.getElementById('checkoutModal');
    if (checkoutModalEl && window.bootstrap && window.bootstrap.Modal) {
        const modal = new bootstrap.Modal(checkoutModalEl);

        // Populate modal total
        const modalTotalEl = document.getElementById('modal-checkout-total');
        if (modalTotalEl) modalTotalEl.textContent = `$${totals.total.toFixed(2)}`;

        modal.show();
    }
}

/**
 * Finalize mock order submission
 */
function completeOrder(event) {
    if (event) event.preventDefault();

    const checkoutModalEl = document.getElementById('checkoutModal');
    if (checkoutModalEl) {
        const modal = bootstrap.Modal.getInstance(checkoutModalEl);
        if (modal) modal.hide();
    }

    // Clear cart in localStorage
    clearCart();

    // Re-render cart UI
    renderCartPage();

    // Show celebratory order success modal
    const successModalEl = document.getElementById('orderSuccessModal');
    if (successModalEl && window.bootstrap && window.bootstrap.Modal) {
        const successModal = new bootstrap.Modal(successModalEl);
        successModal.show();
    } else {
        showToast('Order Placed!', 'Thank you for your order! Your flowers will be delivered soon.', 'success');
    }
}

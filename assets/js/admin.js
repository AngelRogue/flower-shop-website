/**
 * Blossom Delight - Admin Dashboard JavaScript Module (admin.js)
 * Manages product catalog management: listing, add, edit, and delete
 */

document.addEventListener('DOMContentLoaded', () => {
    initAdminDashboard();
});

function initAdminDashboard() {
    renderAdminProductsTable();
    updateAdminStats();

    // Add Product Form Listener
    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProductSubmit);
    }

    // Edit Product Form Listener
    const editForm = document.getElementById('edit-product-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditProductSubmit);
    }

    // Reset Defaults Button
    const resetBtn = document.getElementById('btn-reset-defaults');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to restore the default sample floral inventory? This will overwrite existing products.')) {
                resetDefaultProducts();
                renderAdminProductsTable();
                updateAdminStats();
                showToast('Inventory Reset', 'Sample products have been restored successfully.', 'info');
            }
        });
    }

    // Admin search filter listener
    const searchInput = document.getElementById('admin-table-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterAdminTable(query);
        });
    }
}

/**
 * Update Admin Overview Metrics
 */
function updateAdminStats() {
    const products = getProducts();
    const cart = getCart();

    const totalProductsEl = document.getElementById('stat-total-products');
    const totalCategoriesEl = document.getElementById('stat-total-categories');
    const avgPriceEl = document.getElementById('stat-avg-price');
    const activeCartItemsEl = document.getElementById('stat-cart-items');

    if (totalProductsEl) totalProductsEl.textContent = products.length;

    if (totalCategoriesEl) {
        const uniqueCategories = new Set(products.map(p => p.category));
        totalCategoriesEl.textContent = uniqueCategories.size;
    }

    if (avgPriceEl) {
        if (products.length === 0) {
            avgPriceEl.textContent = '$0.00';
        } else {
            const avg = products.reduce((acc, p) => acc + p.price, 0) / products.length;
            avgPriceEl.textContent = `$${avg.toFixed(2)}`;
        }
    }

    if (activeCartItemsEl) {
        const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        activeCartItemsEl.textContent = cartCount;
    }
}

/**
 * Render products in admin table
 */
function renderAdminProductsTable(items) {
    const tbody = document.getElementById('admin-products-table-body');
    const emptyRow = document.getElementById('admin-empty-table');
    if (!tbody) return;

    const products = items || getProducts();

    tbody.innerHTML = '';

    if (products.length === 0) {
        if (emptyRow) emptyRow.classList.remove('d-none');
        return;
    }

    if (emptyRow) emptyRow.classList.add('d-none');

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="align-middle">
                <img src="${product.image}" alt="${product.name}" class="admin-thumbnail" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';">
            </td>
            <td class="align-middle fw-semibold text-dark">
                ${product.name}
                ${product.featured ? '<span class="badge bg-warning-subtle text-warning-emphasis ms-1">Featured</span>' : ''}
            </td>
            <td class="align-middle">
                <span class="badge bg-success-subtle text-success px-2 py-1">${product.category}</span>
            </td>
            <td class="align-middle fw-bold text-dark">$${product.price.toFixed(2)}</td>
            <td class="align-middle text-muted small text-truncate" style="max-width: 220px;" title="${product.description || ''}">
                ${product.description || 'No description provided.'}
            </td>
            <td class="align-middle text-end">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-secondary btn-sm btn-edit" data-id="${product.id}" title="Edit product">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${product.id}" title="Delete product">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;

        // Action bindings
        const editBtn = tr.querySelector('.btn-edit');
        editBtn.addEventListener('click', () => openEditModal(product.id));

        const deleteBtn = tr.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => handleProductDelete(product.id, product.name));

        tbody.appendChild(tr);
    });
}

/**
 * Filter admin table rows by search query
 */
function filterAdminTable(query) {
    const products = getProducts();
    if (!query) {
        renderAdminProductsTable(products);
        return;
    }
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
    renderAdminProductsTable(filtered);
}

/**
 * Handle new product submission
 */
function handleAddProductSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('add-product-name').value.trim();
    const price = parseFloat(document.getElementById('add-product-price').value);
    const category = document.getElementById('add-product-category').value.trim();
    const image = document.getElementById('add-product-image').value.trim();
    const description = document.getElementById('add-product-description').value.trim();
    const featured = document.getElementById('add-product-featured') ? document.getElementById('add-product-featured').checked : false;

    if (!name || isNaN(price) || price < 0 || !category) {
        showToast('Validation Error', 'Please fill in product name, valid price, and category.', 'danger');
        return;
    }

    const newProd = addProduct({
        name,
        price,
        category,
        image,
        description,
        featured
    });

    e.target.reset();
    renderAdminProductsTable();
    updateAdminStats();
    showToast('Product Created', `"${newProd.name}" was added to store inventory!`, 'success');
}

/**
 * Open edit modal prefilled with current product values
 */
function openEditModal(productId) {
    const product = getProductById(productId);
    if (!product) return;

    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-image').value = product.image || '';
    document.getElementById('edit-product-description').value = product.description || '';

    const featuredCheckbox = document.getElementById('edit-product-featured');
    if (featuredCheckbox) {
        featuredCheckbox.checked = Boolean(product.featured);
    }

    const editModalEl = document.getElementById('editProductModal');
    if (editModalEl && window.bootstrap && window.bootstrap.Modal) {
        const modal = new bootstrap.Modal(editModalEl);
        modal.show();
    }
}

/**
 * Handle edit product submission
 */
function handleEditProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value.trim();
    const price = parseFloat(document.getElementById('edit-product-price').value);
    const category = document.getElementById('edit-product-category').value.trim();
    const image = document.getElementById('edit-product-image').value.trim();
    const description = document.getElementById('edit-product-description').value.trim();
    const featured = document.getElementById('edit-product-featured') ? document.getElementById('edit-product-featured').checked : false;

    if (!name || isNaN(price) || price < 0 || !category) {
        showToast('Validation Error', 'Please fill in required product fields.', 'danger');
        return;
    }

    const success = updateProduct(id, {
        name,
        price,
        category,
        image,
        description,
        featured
    });

    if (success) {
        const editModalEl = document.getElementById('editProductModal');
        if (editModalEl) {
            const modal = bootstrap.Modal.getInstance(editModalEl);
            if (modal) modal.hide();
        }

        renderAdminProductsTable();
        updateAdminStats();
        showToast('Product Updated', `"${name}" details updated successfully!`, 'success');
    } else {
        showToast('Error', 'Failed to update product.', 'danger');
    }
}

/**
 * Handle product deletion
 */
function handleProductDelete(productId, productName) {
    if (confirm(`Are you sure you want to delete "${productName}" from the store catalog?`)) {
        deleteProduct(productId);
        renderAdminProductsTable();
        updateAdminStats();
        showToast('Product Deleted', `"${productName}" has been removed.`, 'info');
    }
}

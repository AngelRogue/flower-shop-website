// Store Flower Products Data
let products = [
    {
        id: 1,
        name: "Red Rose Bouquet",
        category: "Anniversary",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
        description: "Classic red roses perfect for expressing love."
    },
    {
        id: 2,
        name: "Sunflower Delight",
        category: "Birthday",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=500&q=80",
        description: "Bright sunflowers to bring joy to any birthday."
    },
    {
        id: 3,
        name: "White Elegant Lilies",
        category: "Wedding",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=500&q=80",
        description: "Elegant white lilies suitable for weddings."
    },
    {
        id: 4,
        name: "Luxury Gift Basket",
        category: "Gift",
        price: 55.00,
        image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=500&q=80",
        description: "A combination of mixed fresh flowers and greenery."
    }
];

// Shopping Cart State (No Login Required)
let cart = [];

// Admin Authentication State
let isAdminLoggedIn = false;
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// Bootstrap Modal Instance Helper
let loginModalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    loginModalInstance = new bootstrap.Modal(document.getElementById('adminLoginModal'));
    renderProducts(products);
});

// Render Product Gallery Cards with Bootstrap Markup
function renderProducts(itemsToRender) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = "";

    itemsToRender.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 product-card">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body d-flex flex-column text-center">
                    <span class="badge bg-danger-subtle text-danger mb-2 align-self-center">${product.category}</span>
                    <h5 class="card-title fw-bold">${product.name}</h5>
                    <p class="card-text text-secondary small flex-grow-1">${product.description}</p>
                    <div class="fw-bold text-danger fs-5 mb-3">$${product.price.toFixed(2)}</div>
                    <button class="btn btn-danger w-100 mt-auto" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus me-1"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

// Category Filtering Function
function filterCategory(category, btnElement) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active', 'btn-danger');
        btn.classList.add('btn-outline-danger');
    });

    btnElement.classList.remove('btn-outline-danger');
    btnElement.classList.add('active', 'btn-danger');

    if (category === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Customer Shopping Cart Logic (No login needed)
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartList = document.getElementById('cart-items-list');
    cartList.innerHTML = "";
    let total = 0;

    if(cart.length === 0) {
        cartList.innerHTML = '<li class="list-group-item text-center text-muted">Your cart is currently empty.</li>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-muted">${item.category}</small>
                </div>
                <span class="fw-bold text-danger">$${item.price.toFixed(2)}</span>
            `;
            cartList.appendChild(li);
        });
    }

    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function checkout() {
    if (cart.length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }
    alert("Thank you for your order! Your flowers will be delivered soon.");
    cart = [];
    updateCartUI();
    
    // Close Bootstrap Cart Modal
    const cartModalElement = document.getElementById('cartModal');
    const modalInstance = bootstrap.Modal.getInstance(cartModalElement);
    if (modalInstance) modalInstance.hide();
}

// Admin Authentication Handlers
function handleAdminAuthClick() {
    if (isAdminLoggedIn) {
        // Logout action
        isAdminLoggedIn = false;
        document.getElementById('admin-panel').classList.add('d-none');
        const authBtn = document.getElementById('admin-auth-btn');
        authBtn.className = "btn btn-outline-light";
        authBtn.innerHTML = '<i class="fa-solid fa-user-lock me-1"></i> Admin Login';
        alert("Admin successfully logged out.");
    } else {
        // Show Login Modal
        document.getElementById('login-error').classList.add('d-none');
        loginModalInstance.show();
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const userIn = document.getElementById('admin-username').value.trim();
    const passIn = document.getElementById('admin-password').value.trim();

    if (userIn === ADMIN_USER && passIn === ADMIN_PASS) {
        isAdminLoggedIn = true;
        loginModalInstance.hide();
        
        // Show Admin Panel
        const adminPanel = document.getElementById('admin-panel');
        adminPanel.classList.remove('d-none');
        adminPanel.scrollIntoView({ behavior: 'smooth' });

        // Update Navbar Button to Logout State
        const authBtn = document.getElementById('admin-auth-btn');
        authBtn.className = "btn btn-warning fw-bold";
        authBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket me-1"></i> Admin Logout';

        // Clear Form Inputs
        document.getElementById('admin-username').value = "";
        document.getElementById('admin-password').value = "";
    } else {
        document.getElementById('login-error').classList.remove('d-none');
    }
}

// Admin: Add Product Logic
function addNewProduct(event) {
    event.preventDefault();
    if (!isAdminLoggedIn) {
        alert("Unauthorized access!");
        return;
    }

    const name = document.getElementById('admin-name').value;
    const price = parseFloat(document.getElementById('admin-price').value);
    const category = document.getElementById('admin-category').value;
    let image = document.getElementById('admin-img').value;

    if (!image) {
        image = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80";
    }

    const newProd = {
        id: Date.now(),
        name: name,
        category: category,
        price: price,
        image: image,
        description: `${category} arrangement`
    };

    products.push(newProd);
    renderProducts(products);
    alert(`Successfully added "${name}" to the store inventory!`);
    event.target.reset();
}

function handleContact(event) {
    event.preventDefault();
    alert("Thank you for reaching out! We will contact you back shortly.");
    event.target.reset();
}

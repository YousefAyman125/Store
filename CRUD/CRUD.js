// State Management
let currentView = 'grid';
let currentSort = 'nameAsc';
let currentCategory = 'all';
let productsData = [];

// Cache DOM elements
const productList = document.getElementById('productList');
const productForm = document.getElementById('productForm');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initializeEventListeners();
});

function initializeEventListeners() {
    productForm.addEventListener('submit', handleProductSubmit);

    // Add listeners for filters and view toggles
    document.getElementById('categoryFilter')?.addEventListener('change', e => handleCategoryFilter(e.target.value));
    document.getElementById('sortSelect')?.addEventListener('change', e => handleSort(e.target.value));

    // Add search functionality if search input exists
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => filterAndDisplayProducts(), 300));
    }
}

// Error Handler
function handleError(error, defaultMessage) {
    console.error('Error:', error);
    let errorMessage = defaultMessage;

    if (error.response) {
        try {
            errorMessage = error.response.data.message;
        } catch (e) {
            errorMessage = defaultMessage;
        }
    }

    showNotification(errorMessage, 'error');
}

// Product Loading and Display
async function loadProducts() {
    try {
        showLoading();
        const response = await fetch('http://store-mu-nine.vercel.app/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        productsData = await response.json();
        filterAndDisplayProducts();
    } catch (error) {
        handleError(error, 'فشل في تحميل المنتجات');
        productList.innerHTML = '<div class="error-message">فشل في تحميل المنتجات</div>';
    } finally {
        hideLoading();
    }
}

function showLoading() {
    productList.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>جاري تحميل المنتجات...</p>
            <small>يرجى الانتظار</small>
        </div>
    `;
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

// Search and Filter Functions
function advancedSearch(products, searchTerm) {
    return products.filter(product => {
        const searchFields = [
            product.name,
            product.description,
            product.category
        ].map(field => field.toLowerCase());

        const terms = searchTerm.toLowerCase().split(' ');
        return terms.every(term =>
            searchFields.some(field => field.includes(term))
        );
    });
}

function filterAndDisplayProducts() {
    let filteredProducts = [...productsData];

    // Apply search filter
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        filteredProducts = advancedSearch(filteredProducts, searchInput.value.trim());
    }

    // Apply category filter
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.category === currentCategory
        );
    }

    // Apply sorting
    sortProducts(filteredProducts);

    // Display products
    displayProducts(filteredProducts);
}

function sortProducts(products) {
    switch (currentSort) {
        case 'nameAsc':
            products.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
            break;
        case 'nameDesc':
            products.sort((a, b) => b.name.localeCompare(a.name, 'ar'));
            break;
        case 'newest':
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
    }
}

function displayProducts(products) {
    if (!Array.isArray(products) || products.length === 0) {
        productList.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>لا توجد منتجات</p>
            </div>
        `;
        return;
    }

    const template = products.map(product => `
        <div class="product-card" data-id="${product._id}">
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="product-image" 
                 loading="lazy"
                 onerror="this.src='placeholder.jpg'">
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <button onclick="deleteProduct('${product._id}')" class="delete-btn">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    productList.innerHTML = template;
}

// Form Handling
async function handleProductSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const imageFile = document.getElementById('productImage').files[0];

    // Validation
    if (!name || !category || !description || !imageFile) {
        showNotification('جميع الحقول مطلوبة', 'error');
        return;
    }

    // Image validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
        showNotification('حجم الصورة يجب أن يكون أقل من 10 ميجابايت', 'error');
        return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(imageFile.type)) {
        showNotification('يجب أن تكون الصورة من نوع JPG أو PNG', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('image', imageFile);

    try {
        const response = await fetch('http://store-mu-nine.vercel.app/api/products', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('تم إضافة المنتج بنجاح', 'success');
            productForm.reset();
            await loadProducts();
        } else {
            throw new Error(data.message || 'فشل في إضافة المنتج');
        }
    } catch (error) {
        handleError(error, 'فشل في إضافة المنتج');
    }
}

// Product Operations
async function updateProduct(id, formData) {
    try {
        const response = await fetch(`http://store-mu-nine.vercel.app/api/products/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            showNotification('تم تحديث المنتج بنجاح', 'success');
            await loadProducts();
        } else {
            throw new Error('فشل في تحديث المنتج');
        }
    } catch (error) {
        handleError(error, 'فشل في تحديث المنتج');
    }
}

async function deleteProduct(id) {
    const product = productsData.find(p => p._id === id);
    if (!product) return;

    const confirmMessage = `
        هل أنت متأكد من حذف المنتج التالي؟
        الاسم: ${product.name}
        الفئة: ${product.category}
    `;

    if (!confirm(confirmMessage)) return;

    try {
        const response = await fetch(`http://store-mu-nine.vercel.app/api/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('تم حذف المنتج بنجاح', 'success');
            await loadProducts();
        } else {
            throw new Error('فشل في حذف المنتج');
        }
    } catch (error) {
        handleError(error, 'فشل في حذف المنتج');
    }
}

// UI Handlers
function handleCategoryFilter(category) {
    currentCategory = category;
    filterAndDisplayProducts();
}

function handleSort(sortType) {
    currentSort = sortType;
    filterAndDisplayProducts();
}

function toggleView(viewType) {
    currentView = viewType;
    productList.className = viewType === 'grid' ? 'products-grid' : 'products-list';

    const gridBtn = document.getElementById('gridBtn');
    const listBtn = document.getElementById('listBtn');

    if (gridBtn && listBtn) {
        gridBtn.innerHTML = '<i class="fas fa-th-large"></i>';
        listBtn.innerHTML = '<i class="fas fa-list"></i>';

        gridBtn.classList.toggle('active', viewType === 'grid');
        listBtn.classList.toggle('active', viewType === 'list');
    }
}

// Utility Functions
function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';

    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
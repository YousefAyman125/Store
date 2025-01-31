// Configuration
const CONFIG = {
    API_URL: 'http://localhost:5000/api/products',
    PLACEHOLDER_IMAGE: '../assets/placeholder.jpg',
    CATEGORIES: {
        'c-ovens': 'الأفران الحرارية',
        'p-ovens': 'افرن بيتزا',
        'fridges': 'الثلاجات',
        'refrigerator': 'ثلاجات تحت الطاولة',
        'dishwashers': 'غسالات الأطباق',
        'ice-machine': 'ماكينة الثلج',
        'bar-equipments': 'معدات البار',
        'bakery-equipments': 'معدات المخابز',
        'processing-equipment': 'معدات التجهيز',
        'stoves': 'بوتاجازات',
        'display-refrigerators': 'ثلاجات عرض'
    }
};

// State Management
const state = {
    products: [],
    currentView: 'grid',
    currentSort: 'nameAsc',
    selectedCategory: localStorage.getItem('selectedCategory') || 'c-ovens'
};

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Product Functions
async function loadProducts() {
    try {
        const response = await fetch(CONFIG.API_URL);
        const products = await response.json();
        state.products = products;

        // Update title
        updateTitle();

        // Filter and display products
        const filteredProducts = products.filter(product =>
            product.category === CONFIG.CATEGORIES[state.selectedCategory]
        );

        sortProducts(filteredProducts, state.currentSort);
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.');
    }
}

function updateTitle() {
    const productTitle = document.getElementById('productTitle');
    if (productTitle) {
        productTitle.innerHTML = `
            <h1 class="section-title">
                ${CONFIG.CATEGORIES[state.selectedCategory]}
            </h1>`;
    }
}

function showError(message) {
    const productList = document.getElementById('productList');
    productList.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="loadProducts()">إعادة المحاولة</button>
        </div>
    `;
}

function sortProducts(products, sortType) {
    switch(sortType) {
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

function handleSort(sortType) {
    state.currentSort = sortType;
    const filteredProducts = state.products.filter(product =>
        product.category === CONFIG.CATEGORIES[state.selectedCategory]
    );
    sortProducts(filteredProducts, sortType);
    displayProducts(filteredProducts);
}

function toggleView(viewType) {
    state.currentView = viewType;
    const productList = document.getElementById('productList');
    const gridBtn = document.getElementById('gridBtn');
    const listBtn = document.getElementById('listBtn');

    productList.className = `products-${viewType}`;
    gridBtn.classList.toggle('active', viewType === 'grid');
    listBtn.classList.toggle('active', viewType === 'list');

    const filteredProducts = state.products.filter(product =>
        product.category === CONFIG.CATEGORIES[state.selectedCategory]
    );
    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (!products.length) {
        productList.innerHTML = '<div class="no-products">لا توجد منتجات في هذه الفئة</div>';
        return;
    }

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = createProductTemplate(product);
        productList.appendChild(productElement);
    });
}

function createProductTemplate(product) {
    return `
        <a href="product.html" 
           data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'
           onclick="handleProductClick(event, this)" 
           style="text-decoration: none">
            <div class="product-card">
                <img src="${product.image}"
                     alt="${product.name}"
                     class="product-image"
                     loading="lazy"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-category">${product.category}</div>
            </div>
        </a>
    `;
}

function handleProductClick(event, element) {
    event.preventDefault();
    const product = JSON.parse(element.dataset.product);
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'product.html';
}

// Category Functions
function handleCategorySelect(event, category) {
    event.preventDefault();
    state.selectedCategory = category;
    localStorage.setItem('selectedCategory', category);
    document.querySelector('.dropdown-content').classList.remove('show');
    loadProducts();
}

function toggleDropdown(event) {
    event.preventDefault();
    const dropdownContent = event.target.nextElementSibling;
    dropdownContent.classList.toggle('show');

    const otherDropdowns = document.querySelectorAll('.dropdown-content');
    otherDropdowns.forEach(content => {
        if (content !== dropdownContent) {
            content.classList.remove('show');
        }
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initializeSearch();

    // Event Listeners
    document.getElementById('sortSelect')?.addEventListener('change',
        (e) => handleSort(e.target.value)
    );

    document.getElementById('gridBtn')?.addEventListener('click',
        () => toggleView('grid')
    );

    document.getElementById('listBtn')?.addEventListener('click',
        () => toggleView('list')
    );

    // Close dropdowns when clicking outside
    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    };
});
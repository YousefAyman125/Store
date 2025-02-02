// Configuration
const CONFIG = {
    API_URL: 'http://localhost:5000/api/products',
    PLACEHOLDER_IMAGE: '../assets/placeholder.jpg',
    CATEGORIES: {
        'p-ovens': 'افران البيتزا',
        'c-ovens': 'الأفران الحراريه',
        'stoves': 'البوتاجازات',
        'fridges': 'الثلاجات',
        'fryers': 'القلايات',
        'refrigerator': 'ثلاجات تحت الطاولة',
        'display-refrigerators': 'ثلاجات عرض',
        'dishwashers': 'غسالات الأطباق',
        'ice-machine': 'ماكينات الثلج',
        'bar-equipments': 'معدات البار',
        'processing-equipment': 'معدات التجهيز',
        'bakery-equipments': 'معدات المخابز'
    }
};

// State Management
const state = {
    products: [],
    currentView: 'grid',
    currentSort: 'nameAsc',
    selectedCategory: localStorage.getItem('selectedCategory')
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
        showLoading();
        console.log('Loading products...');

        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        console.log('Products loaded:', products);

        state.products = products;
        updateTitle();

        const selectedCategory = CONFIG.CATEGORIES[state.selectedCategory];
        console.log('Selected category:', selectedCategory);

        const filteredProducts = products.filter(product => {
            console.log('Checking product:', product.name, 'Category:', product.category);
            return product.category === selectedCategory;
        });

        console.log('Filtered products:', filteredProducts);

        if (filteredProducts.length === 0) {
            console.log('No products found for category:', selectedCategory);
        }

        sortProducts(filteredProducts, state.currentSort);
        displayProducts(filteredProducts);

    } catch (error) {
        console.error('Error loading products:', error);
        showError('فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.');
    }
}

function updateTitle() {
    const productTitle = document.getElementById('productTitle');
    const currentCategory = document.querySelector('.current-category');
    const category = CONFIG.CATEGORIES[state.selectedCategory];

    if (productTitle) productTitle.textContent = category;
    if (currentCategory) currentCategory.textContent = category;
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

function showLoading() {
    const productList = document.getElementById('productList');
    productList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>جاري تحميل المنتجات...</p>
        </div>
    `;
}

function sortProducts(products, sortType) {
    switch (sortType) {
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
        productList.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>لا توجد منتجات في هذه الفئة</p>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}"
                         alt="${product.name}"
                         loading="lazy"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                    <div class="product-overlay">
                        <span>عرض التفاصيل</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="details-btn">
                        <span>عرض التفاصيل</span>
                        <i class="fas fa-arrow-left"></i>
                    </div>
                </div>
            </div>
        `;

        productElement.addEventListener('click', () => {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = 'product.html';
        });

        productList.appendChild(productElement);
    });
}

// Category Functions
function handleCategorySelect(event, category) {
    event.preventDefault();
    state.selectedCategory = category;
    localStorage.setItem('selectedCategory', category);
    document.querySelector('.dropdown-content').classList.remove('show');
    loadProducts();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {

    document.title = `Target - ${CONFIG.CATEGORIES[state.selectedCategory]}`;

    loadProducts();

    // Event Listeners for sorting and view options
    document.getElementById('sortSelect')?.addEventListener('change',
        (e) => handleSort(e.target.value)
    );

    document.getElementById('gridBtn')?.addEventListener('click',
        () => toggleView('grid')
    );

    document.getElementById('listBtn')?.addEventListener('click',
        () => toggleView('list')
    );

    // Product link click handlers
    document.querySelectorAll('.product-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            handleCategorySelect(e, category);
        });
    });

    // Close dropdowns when clicking outside
    window.onclick = function (event) {
        if (!event.target.matches('.dropbtn')) {
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    };
});

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let paginationContainer = null;

function displayProducts(products) {
    const productList = document.getElementById('productList');

    // إزالة حاوية الترقيم القديمة إذا وجدت
    if (paginationContainer) {
        paginationContainer.remove();
    }

    // إنشاء حاوية ترقيم جديدة
    paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    // حساب عدد الصفحات
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    // تحديد المنتجات للصفحة الحالية
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProducts = products.slice(startIndex, endIndex);

    // عرض المنتجات
    productList.innerHTML = '';
    currentProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}"
                         alt="${product.name}"
                         loading="lazy"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                    <div class="product-description">
                        <p>${product.description}</p>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="details-btn">
                        <span>عرض التفاصيل</span>
                        <i class="fas fa-arrow-left"></i>
                    </div>
                </div>
            </div>
        `;

        productElement.addEventListener('click', () => {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = 'product.html';
        });

        productList.appendChild(productElement);
    });

    // إنشاء أزرار الترقيم
    createPagination(totalPages, products);
    productList.after(paginationContainer);
}

function createPagination(totalPages, products) {
    paginationContainer.innerHTML = ''; // مسح المحتوى القديم

    // زر السابق
    const prevButton = document.createElement('button');
    prevButton.className = `pagination-button ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateProductDisplay(products);
        }
    };

    // زر التالي
    const nextButton = document.createElement('button');
    nextButton.className = `pagination-button ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateProductDisplay(products);
        }
    };

    paginationContainer.appendChild(prevButton);

    // أزرار الأرقام
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.onclick = () => {
            if (currentPage !== i) {
                currentPage = i;
                updateProductDisplay(products);
            }
        };
        paginationContainer.appendChild(pageButton);
    }

    paginationContainer.appendChild(nextButton);
}

function updateProductDisplay(products) {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProducts = products.slice(startIndex, endIndex);

    // تحديث عرض المنتجات
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    currentProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}"
                         alt="${product.name}"
                         loading="lazy"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                    <div class="product-description">
                        <p>${product.description}</p>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="details-btn">
                        <span>عرض التفاصيل</span>
                        <i class="fas fa-arrow-left"></i>
                    </div>
                </div>
            </div>
        `;

        productElement.addEventListener('click', () => {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = 'product.html';
        });

        productList.appendChild(productElement);
    });

    // تحديث حالة أزرار الترقيم
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    createPagination(totalPages, products);
}
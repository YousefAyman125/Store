const categories = {
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
};

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Function to handle dropdown toggle
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

// Handle clicks outside dropdown
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// Add event listeners for category selection
document.addEventListener('DOMContentLoaded', function () {
    const productLinks = document.querySelectorAll('.dropdown-content .product-link');

    productLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Get category and index from data attributes
            const category = this.getAttribute('data-category');
            const index = this.getAttribute('data-index');

            // Store in localStorage
            localStorage.setItem('selectedCategory', category);

            console.log(`Selected category: ${category}`);
            console.log(`Index: ${index}`);

            // Close dropdown
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });

            // Navigate to products page
            window.location.href = this.href;
        });
    });
});

// Optional: Function to get current category
function getCurrentCategory() {
    return localStorage.getItem('selectedCategory') || 'c-ovens'; // Default to c-ovens if none selected
}

// Optional: Function to update dropdown button text
function updateDropdownText() {
    const currentCategory = getCurrentCategory();

    const dropbtn = document.querySelector('.dropbtn');
    if (dropbtn && categories[currentCategory]) {
        dropbtn.textContent = `معرض المنتجات - ${categories[currentCategory]}`;
    }
}

// Initialize dropdown state
document.addEventListener('DOMContentLoaded', function () {
    // Update dropdown text if on products page
    if (window.location.href.includes('products.html')) {
        updateDropdownText();
    }
});

// Search functionality
function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // Open search overlay
    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });

    // Close search overlay
    function closeSearch() {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }

    // Close on overlay click
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // Handle search input
    searchInput.addEventListener('input', debounce(async (e) => {
        const searchTerm = e.target.value.trim();

        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        // Show loading
        searchResults.innerHTML = '<div class="search-loading"></div>';

        try {
            const response = await fetch('http://localhost:5000/api/products');
            const products = await response.json();

            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filtered.length === 0) {
                searchResults.innerHTML = `
                    <div class="no-results">
                        لا توجد نتائج للبحث عن "${searchTerm}"
                    </div>
                `;
                return;
            }

            displaySearchResults(filtered);
        } catch (error) {
            searchResults.innerHTML = `
                <div class="no-results">
                    حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.
                </div>
            `;
            console.error('Search error:', error);
        }
    }, 300));
}

// Debounce function to limit API calls
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

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="goToProduct('${product._id}')">
            <img src="${product.image}" alt="${product.name}"
                 onerror="this.src='../assets/placeholder.jpg'">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>${product.category}</p>
            </div>
        </div>
    `).join('');
}

// Navigate to product
function goToProduct(productId) {
    // Implement your product navigation logic here
    console.log('Navigating to product:', productId);
}

// Initialize search when document is ready
document.addEventListener('DOMContentLoaded', initializeSearch);

// Filtering functionality
// Add these functions to your existing JavaScript

let currentView = 'grid';
let currentSort = 'nameAsc';
let productsData = []; // Store the products data globally

// Modified loadProducts function
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();
        productsData = products; // Store the data globally

        // Filter products based on selected category
        const filteredProducts = products.filter(product =>
            product.category === categories[localStorage.getItem('selectedCategory')]
        );

        // Sort products based on current sort option
        sortProducts(filteredProducts, currentSort);

        // Display products in current view
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
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
    currentSort = sortType;
    const filteredProducts = productsData.filter(product =>
        product.category === categories[localStorage.getItem('selectedCategory')]
    );
    sortProducts(filteredProducts, sortType);
    displayProducts(filteredProducts);
}

function toggleView(viewType) {
    currentView = viewType;
    const productList = document.getElementById('productList');
    const gridBtn = document.getElementById('gridBtn');
    const listBtn = document.getElementById('listBtn');

    if (viewType === 'grid') {
        productList.className = 'products-grid';
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    } else {
        productList.className = 'products-list';
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
    }

    // Refresh the display
    const filteredProducts = productsData.filter(product =>
        product.category === categories[localStorage.getItem('selectedCategory')]
    );
    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';

        if (currentView === 'grid') {
            productElement.innerHTML = `
                <a href="product.html" style="text-decoration: none">
                    <div class="product-card">
                        <img src="${product.image}"
                             alt="${product.name}"
                             class="product-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://res.cloudinary.com/your-cloud-name/image/upload/v1/placeholder.jpg';">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-category">${product.category}</div>
                    </div>
                </a>
            `;
        } else {
            productElement.innerHTML = `
                <a href="product.html" style="text-decoration: none">
                    <div class="product-card">
                        <img src="${product.image}"
                             alt="${product.name}"
                             class="product-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://res.cloudinary.com/your-cloud-name/image/upload/v1/placeholder.jpg';">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-category">${product.category}</div>
                    </div>
                </a>
            `;
        }

        productList.appendChild(productElement);
    });
}

// Initialize the view and sorting when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    // Set initial view
    toggleView('grid');
});
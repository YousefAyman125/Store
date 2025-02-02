// Constants
const API_URL = 'http://localhost:5000/api/products';
const PRODUCTS_PER_SLIDE = 4;

// Main Initialization
document.addEventListener('DOMContentLoaded', initializeProductPage);

// Main Functions
async function initializeProductPage() {
    try {
        const currentProduct = getProductFromStorage();
        if (!currentProduct) {
            redirectToProducts();
            return;
        }

        updatePageContent(currentProduct);
        initializeTabs();
        await loadRelatedProducts(currentProduct.category, currentProduct._id);

    } catch (error) {
        handleError(error);
    }
}

function getProductFromStorage() {
    return JSON.parse(localStorage.getItem('selectedProduct'));
}

function redirectToProducts() {
    window.location.href = 'products.html';
}

function updatePageContent(product) {
    // Update Breadcrumb
    updateBreadcrumb(product);

    // Update Product Details
    updateProductDetails(product);

    // Update Page Title
    document.title = `${product.name} - TARGET`;
}

function updateBreadcrumb(product) {
    document.getElementById('categoryLink').textContent = product.category;
    document.getElementById('categoryLink').href = `products.html?category=${product.category}`;
    document.getElementById('productName').textContent = product.name;
}

function updateProductDetails(product) {
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productImage').src = product.image;
    document.getElementById('productDescription').innerHTML = product.description || 'لا يوجد وصف متاح';
}

// Tab Functions
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateActiveTabs(btn, tabBtns, tabContents);
        });
    });
}

function updateActiveTabs(clickedBtn, allBtns, allContents) {
    // Remove active state
    allBtns.forEach(btn => btn.classList.remove('active'));
    allContents.forEach(content => content.classList.remove('active'));

    // Add active state
    clickedBtn.classList.add('active');
    document.getElementById(clickedBtn.dataset.tab).classList.add('active');
}

// Related Products Functions
async function loadRelatedProducts(category, currentProductId) {
    try {
        const response = await fetch(API_URL);
        const allProducts = await response.json();

        const relatedProducts = allProducts.filter(product =>
            product.category === category &&
            product._id !== currentProductId
        );

        if (relatedProducts.length > 0) {
            initializeRelatedProductsSlider(relatedProducts);
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function initializeRelatedProductsSlider(products) {
    const slider = document.getElementById('relatedProductsSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = 0;
    const totalSlides = Math.ceil(products.length / PRODUCTS_PER_SLIDE);

    function showSlide(index) {
        const start = index * PRODUCTS_PER_SLIDE;
        const end = start + PRODUCTS_PER_SLIDE;
        const currentProducts = products.slice(start, end);

        updateSliderContent(slider, currentProducts);
        updateNavigationButtons(prevBtn, nextBtn, index, totalSlides);
    }

    // Initialize slider
    showSlide(0);
    setupNavigationButtons(prevBtn, nextBtn, showSlide, currentIndex, totalSlides);
}

function updateSliderContent(slider, products) {
    slider.innerHTML = products.map(product => createProductCard(product)).join('');

    // Add click event listeners to each related product
    const relatedProducts = slider.querySelectorAll('.related-product');
    relatedProducts.forEach(div => {
        div.addEventListener('click', (event) => {
            event.preventDefault();
            const productData = div.dataset.product;
            const productString = decodeURIComponent(productData);
            handleRelatedProductClick(productString);
        });
    });
}

function createProductCard(product) {
    const productData = encodeURIComponent(JSON.stringify(product));
    return `
        <div class="related-product" data-product="${productData}">
            <a href="#" style="text-decoration: none">
                <div class="related-product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="related-product-info">
                    <h3 class="related-product-title">${product.name}</h3>
                </div>
            </a>
        </div>
    `;
}


function updateNavigationButtons(prevBtn, nextBtn, currentIndex, totalSlides) {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;

    prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
}

function setupNavigationButtons(prevBtn, nextBtn, showSlide, currentIndex, totalSlides) {
    let current = currentIndex;

    prevBtn.addEventListener('click', () => {
        if (current > 0) {
            current--;
            showSlide(current);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (current < totalSlides - 1) {
            current++;
            showSlide(current);
        }
    });

    prevBtn.style.opacity = '1';
    nextBtn.style.opacity = '1';
}

// Event Handlers
function handleRelatedProductClick(productString) {
    try {
        const product = JSON.parse(productString);
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product.html';
    } catch (error) {
        handleError(error, 'Error handling related product click');
    }
}

// Error Handling
function handleError(error, message = 'حدث خطأ في تحميل المنتج') {
    console.error('Error:', error);
    showNotification(message, 'error');
}

// Utility Functions
function showNotification(message, type = 'error') {
    const notification = createNotificationElement(message, type);
    document.body.appendChild(notification);
    setTimeout(() => removeNotification(notification), 3000);
}

function createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    return notification;
}

function removeNotification(notification) {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
}
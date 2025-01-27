// Global variables
let selectedCategory = localStorage.getItem('selectedCategory') || '';

// Products dictionary (moved outside)
const productCategories = {
    0: { name: "افران حراريه", category: "c-ovens" },
    1: { name: "افرن بيتزا", category: "p-ovens" },
    2: { name: "الثلاجات", category: "fridges" },
    3: { name: "ثلاجات تحت الطاولة", category: "refrigerator" },
    4: { name: "غسالات الأطباق", category: "dishwashers" },
    5: { name: "ماكينة الثلج", category: "ice-machine" },
    6: { name: "معدات البار", category: "bar-equipments" },
    7: { name: "معدات المخابز", category: "bakery-equipments" },
    8: { name: "معدات التجهيز", category: "processing-equipment" },
    9: { name: "بوتاجازات", category: "stoves" },
    10: { name: "ثلاجات عرض", category: "display-refrigerators" }
};

// Setup event listeners (separate from loadProductsFromSheet)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.products-grid a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            selectedCategory = category;
            localStorage.setItem('selectedCategory', category);
            console.log(`Selected category: ${selectedCategory}`);
            window.location.href = this.href;
        });
    });
});

async function loadProductsFromSheet() {
    console.log("Loading products for category:", selectedCategory);

    const loadingIndicator = document.getElementById('loadingIndicator');
    const productsGrid = document.getElementById('productsGrid');

    if (!productsGrid) {
        console.error('Products grid element not found');
        return;
    }

    try {
        const sheetId = '1--FYipcgpHcQY9UMf-NY-Vw_PAghBTUhWzv_twnfhko';
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.text();
        const products = parseCSV(data);

        productsGrid.innerHTML = '';

        products.forEach(product => {
            if (product['"category"'].slice(1, -1) === selectedCategory) {
                let imageUrl = product['"image"'].slice(1, -1);

                if (imageUrl.includes('cloudinary.com')) {
                    imageUrl = optimizeCloudinaryUrl(imageUrl);
                }

                const productCard = `
                    <div class="product-card">
                        <img src="${imageUrl}" 
                             alt="${product['"name"'].slice(1, -1)}" 
                             class="product-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://res.cloudinary.com/your-cloud-name/image/upload/v1/placeholder.jpg';">
                        <h3 class="product-name">${product['"name"'].slice(1, -1)}</h3>
                        <div class="product-category">${product['"category"'].slice(1, -1)}</div>
                    </div>
                `;
                productsGrid.innerHTML += productCard;
            }
        });

        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading products:', error);
        if (loadingIndicator) {
            loadingIndicator.textContent = 'حدث خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى.';
        }
    }
}

// Rest of your functions remain the same...

// Initialize when page loads
window.onload = () => {
    // Check if we're on the products page
    if (document.getElementById('productsGrid')) {
        loadProductsFromSheet();
    }
    initializeCloudinaryUpload();
};
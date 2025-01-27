let selectedCategory = '';

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    const productLinks = document.querySelectorAll('.product-link');
    console.log('Found product links:', productLinks.length);

    productLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const category = this.getAttribute('data-category');
            const index = this.getAttribute('data-index');

            selectedCategory = category;

            console.log(`Clicked link with index: ${index}`);
            console.log(`Selected category: ${selectedCategory}`);

            localStorage.setItem('selectedCategory', category);

            setTimeout(() => {
                window.location.href = this.href;
            }, 100);
        });
    });
});

async function loadProductsFromSheet() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const productsGrid = document.getElementById('productsGrid');

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
            if (product['"category"'].slice(1, -1) === 'الأفران الحرارية') {
                let imageUrl = product['"image"'].slice(1, -1);

                // If using Cloudinary URL, you can add transformations
                if (imageUrl.includes('cloudinary.com')) {
                    // Add automatic format and quality optimization
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

        loadingIndicator.style.display = 'none';

    } catch (error) {
        console.error('Error loading products:', error);
        loadingIndicator.textContent = 'حدث خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى.';
    }
}

// Function to optimize Cloudinary URLs
function optimizeCloudinaryUrl(url) {
    // Add Cloudinary transformations
    // c_scale,w_800 = resize to 800px width
    // f_auto = automatic format selection
    // q_auto = automatic quality selection
    return url.replace('/upload/', '/upload/c_scale,w_800,f_auto,q_auto/');
}

// Function to upload images to Cloudinary
function initializeCloudinaryUpload() {
    const myWidget = cloudinary.createUploadWidget({
        cloudName: 'your-cloud-name', // Replace with your cloud name
        uploadPreset: 'your-upload-preset', // Replace with your upload preset
        folder: 'products',
        multiple: true,
        maxFiles: 10,
        clientAllowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
        maxFileSize: 5000000, // 5MB
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            console.log('Upload success:', imageUrl);
            // You can add the URL to your Google Sheet here
        }
    });

    // Optional: Add upload button
    if (document.getElementById('uploadButton')) {
        document.getElementById('uploadButton').addEventListener('click', () => {
            myWidget.open();
        });
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentLine[j].trim();
        }
        result.push(obj);
    }
    return result;
}

// Initialize when page loads
window.onload = () => {
    loadProductsFromSheet();
    initializeCloudinaryUpload(); // Initialize Cloudinary widget
};
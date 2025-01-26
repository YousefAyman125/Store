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

        // Clear the grid
        productsGrid.innerHTML = '';

        // Filter products for this category and display them
        products.forEach(product => {
            if (product['"category"'].slice(1, -1) === 'الأفران الحرارية') {
                // Get the image ID from the Google Drive URL
                let imageUrl = product['"image"'].slice(1, -1);
                if (imageUrl.includes('drive.google.com')) {
                    // Extract file ID from Google Drive URL
                    const fileId = extractGoogleDriveFileId(imageUrl);
                    // Convert to direct image URL
                    imageUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
                }

                const productCard = `
                    <a href="">
                        <div class="product-card">
                            <img src="${imageUrl}" alt="${product['"name"'].slice(1, -1)}" class="product-image">
                            <h3 class="product-name">${product['"name"'].slice(1, -1)}</h3>
                            <div class="product-category">${product['"category"'].slice(1, -1)}</div>
                        </div>
                    </a>
                `;
                productsGrid.innerHTML += productCard;
            }
        });

        // Hide loading indicator
        loadingIndicator.style.display = 'none';

    } catch (error) {
        console.error('Error loading products:', error);
        loadingIndicator.textContent = 'حدث خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى.';
    }
}

function extractGoogleDriveFileId(url) {
    let fileId = '';

    if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1].split('/')[0];
    } else if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
    }

    return fileId;
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

// Load products when page loads
window.onload = loadProductsFromSheet;
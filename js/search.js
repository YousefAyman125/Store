// تحديث دالة عرض نتائج البحث
function displaySearchResults(results, searchTerm) {
    const searchResults = document.getElementById('searchResults');

    if (!results.length) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>لا توجد نتائج للبحث عن "${searchTerm}"</p>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="handleSearchProductClick(${JSON.stringify(product)})">
            <div class="search-result-image">
                <img src="${product.image}" 
                     alt="${product.name}"
                     onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
            </div>
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>${product.category}</p>
            </div>
            <i class="fas fa-chevron-left"></i>
        </div>
    `).join('');
}

// إضافة CSS جديد للبحث
const searchStyles = `
.search-overlay {
    background: rgba(0, 0, 0, 0.8);
    padding-top: 100px;
}

.search-container {
    background: white;
    border-radius: 8px;
    padding: 15px;
    position: relative;
    max-width: 600px;
    margin: 0 auto;
}

.search-input {
    width: 100%;
    padding: 12px 40px 12px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    direction: rtl;
}

.search-result-item {
    display: grid;
    grid-template-columns: 80px 1fr 30px;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.3s;
}

.search-result-item:hover {
    background-color: #f8f8f8;
}

.search-result-image img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 4px;
}

.search-result-info h4 {
    margin: 0 0 5px;
    color: #333;
}

.search-result-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}
`;
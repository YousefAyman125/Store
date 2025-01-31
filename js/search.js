// Search Functions
function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');

    searchBtn?.addEventListener('click', openSearch);
    searchOverlay?.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });
    searchInput?.addEventListener('input', debounce(handleSearch, 300));
}

function openSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    searchOverlay.classList.add('active');
    searchInput.focus();
}

function closeSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
}

async function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    const searchResults = document.getElementById('searchResults');

    if (searchTerm.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    searchResults.innerHTML = '<div class="search-loading"></div>';

    try {
        const filtered = state.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        displaySearchResults(filtered, searchTerm);
    } catch (error) {
        searchResults.innerHTML = '<div class="search-error">حدث خطأ في البحث</div>';
    }
}

function displaySearchResults(results, searchTerm) {
    const searchResults = document.getElementById('searchResults');

    if (!results.length) {
        searchResults.innerHTML = `
            <div class="no-results">
                لا توجد نتائج للبحث عن "${searchTerm}"
            </div>
        `;
        return;
    }

    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" 
             onclick="handleProductClick(event, ${JSON.stringify(product)})">
            <img src="${product.image}" 
                 alt="${product.name}"
                 onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>${product.category}</p>
            </div>
        </div>
    `).join('');
}
// Search functionality
const SearchManager = {
    init() {
        // Add search styles
        this.addSearchStyles();

        // Get elements
        this.searchBtn = document.querySelector('.search-btn');
        this.searchOverlay = document.getElementById('searchOverlay');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.closeBtn = document.querySelector('.close-search');

        if (!this.searchBtn || !this.searchOverlay || !this.searchInput || !this.searchResults) {
            console.error('Search elements not found');
            return;
        }

        // Add event listeners
        this.searchBtn.addEventListener('click', () => this.openSearch());
        this.closeBtn.addEventListener('click', () => this.closeSearch());
        this.searchOverlay.addEventListener('click', (e) => {
            if (e.target === this.searchOverlay) this.closeSearch();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSearch();
        });
        this.searchInput.addEventListener('input', debounce((e) => this.handleSearch(e), 300));

        console.log('Search initialized');
    },

    addSearchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .search-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                padding-top: 80px;
            }

            .search-overlay.active {
                display: block;
            }

            .search-container {
                width: 90%;
                max-width: 600px;
                margin: 0 auto;
                position: relative;
                background: white;
                border-radius: 8px;
                padding: 15px;
            }

            #searchInput {
                width: 100%;
                padding: 12px 40px 12px 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                direction: rtl;
            }

            .search-results {
                width: 90%;
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 8px;
                max-height: 60vh;
                overflow-y: auto;
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
                object-fit: cover;
                border-radius: 4px;
            }

            .close-search {
                position: absolute;
                left: 25px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 20px;
                color: #666;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    },

    openSearch() {
        this.searchOverlay.classList.add('active');
        this.searchInput.focus();
        console.log('Search opened');
    },

    closeSearch() {
        this.searchOverlay.classList.remove('active');
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
        console.log('Search closed');
    },

    async handleSearch(event) {
        const searchTerm = event.target.value.trim();
        console.log('Searching for:', searchTerm);

        if (searchTerm.length < 2) {
            this.searchResults.innerHTML = '';
            return;
        }

        this.searchResults.innerHTML = '<div class="loading">جاري البحث...</div>';

        try {

            const response = await fetch('http://store-mu-nine.vercel.app/api/products');
            const allProducts = await response.json();

            const filtered = allProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            this.displayResults(filtered, searchTerm);
        } catch (error) {
            console.error('Search error:', error);
            this.searchResults.innerHTML = '<div class="error">حدث خطأ في البحث</div>';
        }
    },

    displayResults(results, searchTerm) {
        if (!results.length) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <p>لا توجد نتائج للبحث عن "${searchTerm}"</p>
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="SearchManager.selectProduct(${JSON.stringify(product)})">
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
    },

    selectProduct(product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        this.closeSearch();
        window.location.href = 'product.html';
    }
};

// Initialize search when document is ready
document.addEventListener('DOMContentLoaded', () => {
    SearchManager.init();
});
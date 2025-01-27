document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const product = {
        id: Date.now(), // استخدام الطوابع الزمنية كمعرف فريد
        name: document.getElementById('productName').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        price: document.getElementById('productPrice').value || 'غير متوفر',
        category: document.getElementById('productCategory').value // إضافة الفئة
    };

    saveProduct(product);
    loadProducts();
    this.reset();
});

function saveProduct(product) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    // عرض جميع المنتجات (يمكنك تعديل هذا لعرض منتجات فئة معينة)
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <h3>${product.name}</h3>
            <img src="${product.image}" alt="${product.name}">
            <p>${product.description}</p>
            <p>السعر: ${product.price}</p>
            <p>الفئة: ${product.category}</p>
            <button class="edit" onclick="editProduct(${product.id})">تعديل</button>
            <button class="delete" onclick="deleteProduct(${product.id})">حذف</button>
        `;
        productList.appendChild(productItem);
    });
}

function editProduct(id) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);

    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;

        deleteProduct(id);
    }
}

function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
}
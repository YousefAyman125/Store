document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

document.getElementById('productForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('productImage');
    const file = fileInput.files[0]; // جلب الصورة
    const productName = document.getElementById('productName').value;
    const productCategory = document.getElementById('productCategory').value;
    const productDescription = document.getElementById('productDescription').value;

    if (!file) {
        alert('يرجى اختيار صورة!');
        return;
    }

    const product = {
        name: productName,
        category: productCategory,
        description: productDescription,
        image: file // إرسال الصورة كملف
    };

    await saveProduct(product);
    this.reset();
});

async function saveProduct(product) {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('description', product.description);
    formData.append('image', product.image); // الصورة كملف

    try {
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('فشل في حفظ المنتج!');
        }

        const newProduct = await response.json();
        console.log('تمت إضافة المنتج بنجاح:', newProduct);
        loadProducts(); // إعادة تحميل المنتجات بعد الإضافة
    } catch (error) {
        console.error(error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();

        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <h3>${product.name}</h3>
                <img src="${product.image}" alt="${product.name}">
                <p>الفئة: ${product.category}</p>
                <p>${product.description}</p>
                <button class="delete" onclick="deleteProduct('${product._id}')">حذف</button>
            `;
            productList.appendChild(productItem);
        });

    } catch (error) {
        console.error('فشل في تحميل المنتجات:', error);
    }
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('فشل في حذف المنتج!');
        }

        console.log('تم حذف المنتج بنجاح');
        loadProducts(); // تحديث القائمة
    } catch (error) {
        console.error(error);
    }
}
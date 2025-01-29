const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// تهيئة الخادم
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// اتصال بـ MongoDB بدون useCreateIndex
mongoose.connect('mongodb+srv://seifezz27:Ss12301230%23@product.me02u.mongodb.net/ProductDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Could not connect to MongoDB Atlas', err));


// تهيئة Cloudinary
cloudinary.config({
    cloud_name: 'dhpswotie',
    api_key: '591846536151484',
    api_secret: '-Su4PK3GF0o73ufWqQm27wnyNlA',
    secure: true
});

// إعداد Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// نموذج المنتج
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    image: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort('-createdAt');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image is required' });

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => error ? reject(error) : resolve(result)
            );
            uploadStream.end(req.file.buffer);
        });

        const product = new Product({
            ...req.body,
            image: result.secure_url
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const publicId = product.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
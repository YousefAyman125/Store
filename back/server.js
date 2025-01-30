const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { join } = require("path");
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: join(__dirname, '..', '.env') });

// تهيئة الخادم
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// اتصال بـ MongoDB بدون useCreateIndex
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Could not connect to MongoDB Atlas', err));

// تهيئة Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// إعداد Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 5MB
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
// الحصول على كل المنتجات
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort('-createdAt');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// إضافة منتج جديد
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

// حذف منتج
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

// نموذج الفورم
const contactSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    subject: String,
    message: String
});

const Contact = mongoose.model('Contact', contactSchema);

// Route لتخزين بيانات الفورم
app.post('/api/contact', async (req, res) => {
    try {
        const { fullname, phone, email, subject, message } = req.body;

        const newContact = new Contact({
            fullname,
            phone,
            email,
            subject,
            message
        });

        await newContact.save();
        res.status(201).json({ message: 'Contact data saved successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to save contact data' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

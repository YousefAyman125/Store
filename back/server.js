const mongoose = require('mongoose');
const multer = require('multer');
const {join} = require("path");
const cloudinary = require('cloudinary').v2;
require('dotenv').config({path: join(__dirname, '..', '.env')});
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get("/", (req, res) => {
    res.json({message: "Server is running!"});
});

app.get("/api/test", (req, res) => {
    res.json({message: "API is working!"});
});


app.use((req, res) => {
    res.status(404).json({error: "Route not found"});
});

// Middleware Configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Multer Configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 10 * 1024 * 1024} // 10MB limit
});

// Schemas
const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    category: {type: String, required: true},
    description: String,
    image: {type: String, required: true}
}, {
    timestamps: true,
    versionKey: false
});

const contactSchema = new mongoose.Schema({
    fullname: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    subject: String,
    message: String,
    expiryDate: {
        type: Date,
        default: () => new Date(+new Date() + 28 * 24 * 60 * 60 * 1000)
    }
}, {
    timestamps: true,
    versionKey: false
});

// Models
const Product = mongoose.model('Product', productSchema);
const Contact = mongoose.model('Contact', contactSchema);

// API Routes
// Products Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find()
            .select('-__v')
            .sort('-createdAt')
            .lean();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({error: 'Failed to fetch products'});
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'Image is required'});
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {folder: 'products'},
                (error, result) => error ? reject(error) : resolve(result)
            );
            uploadStream.end(req.file.buffer);
        });

        const product = await Product.create({
            ...req.body,
            image: result.secure_url
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({error: 'Failed to create product'});
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }

        const publicId = product.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);

        res.json({message: 'Product deleted successfully'});
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({error: 'Failed to delete product'});
    }
});

// Contacts Routes
app.get('/api/contacts', async (req, res) => {
    try {
        // حذف الرسائل المنتهية
        await Contact.deleteMany({expiryDate: {$lt: new Date()}});

        // جلب الرسائل غير المنتهية
        const contacts = await Contact.find()
            .sort('-createdAt')
            .lean()
            .exec();

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({error: 'Failed to fetch contacts'});
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        console.log('Delete request for ID:', req.params.id); // للتتبع

        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            console.log('Contact not found');
            return res.status(404).json({error: 'Contact not found'});
        }

        console.log('Contact deleted successfully');
        res.json({message: 'Contact deleted successfully'});
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({error: 'Failed to delete contact'});
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        // التحقق من البيانات المطلوبة
        const {fullname, phone, email} = req.body;
        if (!fullname || !phone || !email) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const contact = await Contact.create({
            ...req.body,
            expiryDate: new Date(+new Date() + 28 * 24 * 60 * 60 * 1000)
        });

        console.log('New contact created:', contact._id);
        res.status(201).json({
            message: 'Contact data saved successfully',
            contact
        });
    } catch (error) {
        console.error('Error in create contact:', error);
        res.status(500).json({
            error: 'Failed to save contact data',
            details: error.message
        });
    }
});
// Test Route
app.get('/api/contacts', async (req, res) => {
    try {
        // حذف الرسائل المنتهية
        const deleteResult = await Contact.deleteMany({
            expiryDate: {$lt: new Date()}
        });
        console.log('Expired contacts deleted:', deleteResult);

        // جلب الرسائل غير المنتهية
        const contacts = await Contact.find()
            .select('-__v')
            .sort('-createdAt')
            .lean()
            .exec();

        console.log(`Found ${contacts.length} active contacts`);
        res.json(contacts);
    } catch (error) {
        console.error('Error in contacts route:', error);
        res.status(500).json({
            error: 'Failed to fetch contacts',
            details: error.message
        });
    }
});


// Handle 404
app.use((req, res) => {
    res.status(404).json({error: 'Route not found'});
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});
module.exports = app;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const { User, Product, Order } = require('./models');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

// Database connection check
const db = require('./models');
db.sequelize.sync().then(() => {
    console.log('Database connected successfully');
}).catch(err => console.log('Error: ' + err));

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];
    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
};

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 5000;

// Routes

// Register Route
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// Protected route to get user profile
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// Route to add a new product (only farmers can add products)
app.post('/products', authenticateToken, async (req, res) => {
    const { name, description, price, quantity, category } = req.body;

    // Check if the logged-in user is a farmer
    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: "Only farmers can add products" });
    }

    // Validate input
    if (!name || !description || !price || !quantity || !category) {
        return res.status(400).json({ message: "Please provide all product details" });
    }

    try {
        // Create new product
        const newProduct = await Product.create({
            name,
            description,
            price,
            quantity,
            category,
            farmerId: req.user.id  // Associate the product with the logged-in farmer
        });

        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// Route to get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Route to get products by a specific farmer
app.get('/my-products', authenticateToken, async (req, res) => {
    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: "Only farmers can view their products" });
    }

    try {
        const farmerProducts = await Product.findAll({ where: { farmerId: req.user.id } });
        res.status(200).json(farmerProducts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Route to edit a product (only for the farmer who owns it)
app.put('/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, quantity, category } = req.body;

    try {
        // Find the product by ID
        const product = await Product.findByPk(id);

        // Check if product exists and belongs to the logged-in farmer
        if (!product || product.farmerId !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own products" });
        }

        // Update the product details
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.quantity = quantity || product.quantity;
        product.category = category || product.category;

        await product.save();

        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
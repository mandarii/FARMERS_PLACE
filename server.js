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

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html')); 
});

app.get('dashbord/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html')); 
});

    



// Register Route
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

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

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
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

        res.json({ token, role: user.role });
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


// Route to add a new product
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
            farmerId: req.user.id 
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
        
        const product = await Product.findByPk(id);

        if (!product || product.farmerId !== req.user.id) {
            return res.status(403).json({ message: "Edit your products" });
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

// Route to delete a product (only for the farmer who owns it)
app.delete('/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
    
        const product = await Product.findByPk(id);

        // Check if product exists and belongs to the logged-in farmer
        if (!product || product.farmerId !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own products" });
        }

        // Delete the product
        await product.destroy();

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// Route to place an order
app.post('/orders', authenticateToken, async (req, res) => {
    const { productId, quantity } = req.body;

    console.log("Received Order Details:", req.body);

    if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
    }

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.quantity < quantity) {
            return res.status(400).json({ message: "Not enough product quantity available" });
        }

        const totalPrice = product.price * quantity;
        const newOrder = await Order.create({
            userId: req.user.id,
            productId: product.id,
            quantity,
            totalPrice
        });

        product.quantity -= quantity;
        await product.save();

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error("Error while placing order:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// Route to get all orders for the logged-in buyer
app.get('/my-orders', authenticateToken, async (req, res) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: "Only buyers can view their orders" });
    }

    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [Product]
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Route for farmers to view orders of their products
app.get('/my-product-orders', authenticateToken, async (req, res) => {
    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: "Only farmers can view orders for their products" });
    }

    try {
        // Find all products that belong to the logged-in farmer
        const farmerProducts = await Product.findAll({
            where: { farmerId: req.user.id },
            include: [Order] 
        });

        res.status(200).json(farmerProducts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Route for farmers to view a specific order by ID
app.get('/orders/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: "Only farmers can view specific orders for their products" });
    }

    try {
        // Find the order by ID
        const order = await Order.findByPk(id, {
            include: [Product] // Include product details
        });

        // Check if the product in the order belongs to the logged-in farmer
        if (!order || order.Product.farmerId !== req.user.id) {
            return res.status(403).json({ message: "You can only view orders for your own products" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Route to cancel an order
app.delete('/orders/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: "Only buyers can cancel their orders" });
    }

    try {
        
        const order = await Order.findByPk(id);

        // Check if the order belongs to the logged-in buyer
        if (!order || order.userId !== req.user.id) {
            return res.status(403).json({ message: "You can only cancel your own orders" });
        }

        
        const product = await Product.findByPk(order.productId);
        product.quantity += order.quantity;
        await product.save();

        // Delete the order
        await order.destroy();

        res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
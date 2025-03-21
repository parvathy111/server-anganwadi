// const express = require('express');
// const router = express.Router();
// const Product = require('./product.model');
// const { verifySupervisor } = require('../../middlewares/authMiddleware');

// // Controller function to add a product
// const addProduct = async (req, res) => {
//     try {
//         console.log(req.body)
//         const { itemid, productname, image } = req.body;
        
//         // Validate required fields
//         if (!itemid || !productname || !image) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         // Check for existing product with the same itemid
//         const existingProduct = await Product.findOne({ itemid });
//         if (existingProduct) {
//             return res.status(400).json({ message: 'Product with this item ID already exists' });
//         }

//         // Create and save the new product
//         const newProduct = new Product({ itemid, productname, image });
//         await newProduct.save();

//         res.status(201).json({ message: 'Product added successfully', product: newProduct });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

// // Get all products
// router.get('/all', async (req, res) => {
//     try {
//         const products = await Product.find();
//         res.status(200).json(products);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// module.exports = addProduct;

const express = require('express');
const router = express.Router();
const Product = require('./product.model');
const { verifySupervisor } = require('../../middlewares/authMiddleware');

// Controller function to add a product
const addProduct = async (req, res) => {
    try {
        console.log(req.body);
        const { itemid, productname, image } = req.body;
        
        // Validate required fields
        if (!itemid || !productname || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check for existing product with the same itemid
        const existingProduct = await Product.findOne({ itemid });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product with this item ID already exists' });
        }

        // Create and save the new product
        const newProduct = new Product({ itemid, productname, image });
        await newProduct.save();

        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Routes
router.post('/add', verifySupervisor, addProduct);

router.get('/all', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

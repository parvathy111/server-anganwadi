const express = require('express');
const router = express.Router();
const Product = require('./product.model');
const { verifySupervisor } = require('../../middlewares/authMiddleware');

// Controller function to add a product
const addProduct = async (req, res) => {
    try {
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


module.exports = addProduct;

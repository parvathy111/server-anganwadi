const express = require('express');
const router = express.Router();
const Product = require('../supervisor/product.model');
const OrderStock = require('./order.model');

// Controller to place an order for a product
const orderProduct = async (req, res) => {
    try {
        const { itemid, quantity } = req.body;

        // Validate required fields
        if (!itemid || !quantity) {
            return res.status(400).json({ message: 'Item ID and quantity are required' });
        }

        // Find the product
        const product = await Product.findOne({ itemid });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create order
        const order = new OrderStock({
            name: product.productname,
            quantity: quantity,
            image: product.image,
            orderDate: new Date(),
            orderStatus: 'Pending'
        });

        await order.save();

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Route without verifySupervisor middleware
router.post('/order', orderProduct);

module.exports = router;



const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OrderStock = require('./order.model');
const Anganwadi = require('../anganawadi/anganawadi.model'); // Anganwadi model

// Worker: Place a new order (with anganwadiNo validation)
const createOrder = async (req, res) => {
    try {
        let { productname, itemid, quantity, anganwadiNo, image } = req.body;

        if (![productname, itemid, quantity, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const anganwadi = await Anganwadi.findOne({ anganwadiNo: anganwadiNo });
        if (!anganwadi) {
            return res.status(404).json({ message: 'Invalid Anganwadi Number. Please check and try again.' });
        }

        const newOrder = new OrderStock({
            _id: new mongoose.Types.ObjectId(),
            productname,
            itemid,
            quantity,
            anganwadiNo,
            image,
            orderStatus: 'Pending',
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order placed successfully, pending supervisor approval', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderStock.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Supervisor: Approve an order
const approveOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await OrderStock.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.orderStatus !== 'Pending') {
            return res.status(400).json({ message: 'Order is not pending approval' });
        }

        order.orderStatus = 'Processing';
        await order.save();
        res.status(200).json({ message: 'Order approved and is now Processing', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark order as completed
const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await OrderStock.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.orderStatus !== 'Processing') {
            return res.status(400).json({ message: 'Order must be Processing to complete' });
        }

        order.orderStatus = 'Completed';
        await order.save();
        res.status(200).json({ message: 'Order marked as Completed', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// "Cancel Order" (hard delete)
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await OrderStock.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order cancelled and removed from system' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update order details
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { productname, quantity, anganwadiNo } = req.body;

        if (![productname, quantity, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const anganwadi = await Anganwadi.findOne({ anganwadiNo: anganwadiNo });
        if (!anganwadi) {
            return res.status(404).json({ message: 'Invalid Anganwadi Number' });
        }

        const updatedOrder = await OrderStock.findByIdAndUpdate(
            orderId,
            { productname, quantity, anganwadiNo },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Routes
router.get('/all', getAllOrders);
router.post('/create', createOrder);
router.put('/approve/:orderId', approveOrder);
router.put('/complete/:orderId', completeOrder);
router.delete('/cancel/:orderId', cancelOrder); // Cancel & hard delete
router.put('/update/:orderId', updateOrder);

module.exports = router;


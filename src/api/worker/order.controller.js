const express = require('express');
const router = express.Router();
const OrderStock = require('./order.model');
const Anganwadi = require('../anganawadi/anganawadi.model');
const Worker = require('../worker/worker.model'); // ✅ Added Worker model
const { verifyWorker, verifySupervisor } = require('../../middlewares/authMiddleware');

// ✅ Worker: Place a new order
const createOrder = async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const { productname, itemid, quantity, anganwadiNo, image } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: Worker ID missing" });
        }

        if (![productname, itemid, quantity, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate Anganwadi Number
        const anganwadi = await Anganwadi.findOne({ anganwadiNo });
        if (!anganwadi) {
            return res.status(404).json({ message: 'Invalid Anganwadi Number' });
        }

        // Create order
        const newOrder = new OrderStock({
            productname,
            itemid,
            quantity,
            anganwadiNo,
            image,
            orderStatus: 'Pending',
            createdBy: req.user.id
        });

        await newOrder.save();

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Worker: View their own orders
const getWorkerOrders = async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: Worker ID missing" });
        }

        // Fetch only the orders created by the logged-in worker
        const workerOrders = await OrderStock.find({ createdBy: req.user.id }).select('-__v'); 

        // Check if there are any orders
        if (workerOrders.length === 0) {
            return res.status(404).json({ message: "No orders found for this worker." });
        }

        res.status(200).json(workerOrders);
    } catch (error) {
        console.error("Get Worker Orders Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Supervisor: Approve an order (with authentication)
const approveOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await OrderStock.findById(orderId);

        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.orderStatus !== "Pending") {
            return res.status(400).json({ message: "Order is not pending approval" });
        }

        order.orderStatus = "Approved";
        await order.save();

        res.status(200).json({ message: "Order approved successfully", order });
    } catch (error) {
        console.error("Approve Order Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Supervisor: Reject an order (with authentication)
const rejectOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await OrderStock.findById(orderId);

        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.orderStatus !== "Pending") {
            return res.status(400).json({ message: "Order is not pending approval" });
        }

        order.orderStatus = "Rejected";
        await order.save();

        res.status(200).json({ message: "Order rejected successfully", order });
    } catch (error) {
        console.error("Reject Order Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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


// ✅ Supervisor: View orders placed by workers under them
const getSupervisorOrders = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: Supervisor ID missing" });
        }

        const workers = await Worker.find({ createdBy: req.user.id }).select('_id');
        const workerIds = workers.map(worker => worker._id);

        const orders = await OrderStock.find({ createdBy: { $in: workerIds } });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Get Supervisor Orders Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// ✅ Routes with authentication
router.post('/create', verifyWorker, createOrder);
router.get('/my-orders', verifyWorker, getWorkerOrders);
router.put('/approve/:orderId', verifySupervisor, approveOrder); // ✅ Only supervisors can approve
router.put('/reject/:orderId', verifySupervisor, rejectOrder);
router.get('/all', verifySupervisor, getSupervisorOrders); // ✅ Only supervisors can view all orders
router.put('/update/:orderId', updateOrder);
router.delete('/cancel/:orderId', cancelOrder); // Cancel & hard delete


module.exports = router;

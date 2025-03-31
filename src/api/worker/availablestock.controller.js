const express = require('express');
const router = express.Router();
const AvailableStock = require('./availablestock.model');
const Worker = require('../worker/worker.model'); 
const { verifyWorker } = require('../../middlewares/authMiddleware');

// ✅ Worker: View Available Stock in Their Anganwadi
const getWorkerAvailableStock = async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: Worker ID missing" });
        }

        // Get worker's details to find their anganwadiNo
        const worker = await Worker.findById(req.user.id);
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        // Fetch available stock for the worker's anganwadi
        const availableStock = await AvailableStock.find({ anganwadiNo: worker.anganwadiNo });

        // If no stock is found, return a message
        if (availableStock.length === 0) {
            return res.status(404).json({ message: "No available stock for your Anganwadi." });
        }

        res.status(200).json(availableStock);
    } catch (error) {
        console.error("Get Worker Available Stock Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Route for worker to view their available stock
router.get('/available-stock', verifyWorker, getWorkerAvailableStock);

module.exports = router;

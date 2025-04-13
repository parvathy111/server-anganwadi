const express = require('express');
const router = express.Router();
const AvailableStock = require('./availablestock.model');
const Worker = require('../worker/worker.model');
const OrderStock = require('./order.model'); // Ensure correct path
const { verifyWorker, verifyBeneficiary } = require('../../middlewares/authMiddleware');


// ✅ Worker: View Available Stock in Their Anganwadi with itemId
const getWorkerAvailableStock = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: Worker ID missing" });
        }

        // Get worker's details to find their anganwadiNo
        const worker = await Worker.findById(req.user.id);
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        // Fetch available stock for the worker's anganwadi
        let availableStock = await AvailableStock.find({ anganwadiNo: worker.anganwadiNo });

        if (availableStock.length === 0) {
            return res.status(404).json({ message: "No available stock for your Anganwadi." });
        }

        // Fetch itemIds from OrderStock table and update in AvailableStock
        const updatedStock = await Promise.all(
            availableStock.map(async (stockItem) => {
                if (!stockItem.itemId) {  // Only update if itemId is missing
                    const orderStock = await OrderStock.findOne({ productname: stockItem.name });
                    if (orderStock) {
                        await AvailableStock.findByIdAndUpdate(stockItem._id, { itemId: orderStock.itemid }, { new: true });
                        return { ...stockItem.toObject(), itemId: orderStock.itemid };
                    }
                }
                return stockItem.toObject();
            })
        );

        // ✅ Merge stock items with the same itemId
        const mergedStock = updatedStock.reduce((acc, stockItem) => {
            const existingItem = acc.find(item => item.itemId === stockItem.itemId);

            if (existingItem) {
                existingItem.quantity += stockItem.quantity; // Sum quantities
            } else {
                acc.push(stockItem);
            }

            return acc;
        }, []);

        res.status(200).json(mergedStock);
    } catch (error) {
        console.error("Get Worker Available Stock Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Update stock quantity
const updateAvailableStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { id } = req.params;

        if (!quantity || quantity < 0) {
            return res.status(400).json({ message: "Invalid quantity provided" });
        }

        const updatedStock = await AvailableStock.findByIdAndUpdate(
            id,
            { quantity },
            { new: true }
        );

        if (!updatedStock) {
            return res.status(404).json({ message: "Stock item not found" });
        }

        res.json({ message: "Stock updated successfully", updatedStock });
    } catch (error) {
        console.error("Update Stock Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// Async function stored in a variable
const getAvailableStockByAnganwadiNo = async (req, res) => {
    const { anganwadiNo } = req.params;
  
    try {
      const stock = await AvailableStock.find({
        anganwadiNo,
        quantity: { $gt: 0 },
      });
  
      res.status(200).json(stock);
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Server error while fetching stock." });
    }
  };


// ✅ Route for worker to view their available stock with itemId
router.get("/:anganwadiNo", getAvailableStockByAnganwadiNo);
router.get('/available-stock', verifyWorker, getWorkerAvailableStock);
router.put("/update-stock/:id", verifyWorker, updateAvailableStock);

module.exports = router;


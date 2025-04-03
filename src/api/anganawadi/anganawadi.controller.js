const express = require('express');
const Anganwadi = require('./anganawadi.model');
const { verifySupervisor } = require('../../middlewares/authMiddleware'); // Ensure authentication middleware is used

const router = express.Router();

// Create a new Anganwadi
const createAnganwadi = async (req, res) => {
    try {
        const { anganwadiNo, localBody, localBodyName, wardNumber } = req.body;
   
        const supervisorId = req.user?.id; // Extracted from authenticated user (Supervisor)

        if (!supervisorId) {
            return res.status(403).json({ message: 'Unauthorized: Supervisor ID missing' });
        }

        // Check if Anganwadi already exists
        
        const existingAnganwadi = await Anganwadi.findOne({ anganwadiNo: anganwadiNo.trim().toLowerCase() });
        if (existingAnganwadi) {
            return res.status(400).json({ message: 'Anganwadi already exists' });
        }

        // Create new Anganwadi
        const newAnganwadi = new Anganwadi({
            anganwadiNo,
            localBody,
            localBodyName,
            wardNumber,
            createdBy: supervisorId
        });

        await newAnganwadi.save();
        res.status(201).json({ message: 'Anganwadi created successfully', data: newAnganwadi });

    } catch (error) {
        console.error("Error creating Anganwadi:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Anganwadi centers created by the logged-in supervisor
const getAllAnganwadi = async (req, res) => {
    try {
        const supervisorId = req.user?.id; // Get logged-in supervisor's ID

        if (!supervisorId) {
            return res.status(403).json({ message: 'Unauthorized: Supervisor ID missing' });
        }

        // Fetch only the Anganwadis created by the logged-in supervisor
        const anganwadis = await Anganwadi.find({ createdBy: supervisorId })
            .populate('createdBy', 'fullname email');

        res.status(200).json({ data: anganwadis });
    } catch (error) {
        console.error("Error fetching Anganwadi:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Delete an Anganwadi
const deleteAnganwadi = async (req, res) => {
    try {
        const { id } = req.params;
        const supervisorId = req.user?.id; // Get logged-in supervisor's ID

        if (!supervisorId) {
            return res.status(403).json({ message: 'Unauthorized: Supervisor ID missing' });
        }

        // Find the Anganwadi by ID and ensure it was created by the logged-in supervisor
        const anganwadi = await Anganwadi.findOne({ _id: id, createdBy: supervisorId });

        if (!anganwadi) {
            return res.status(404).json({ message: 'Anganwadi not found or unauthorized to delete' });
        }

        // Delete the Anganwadi
        await Anganwadi.findByIdAndDelete(id);

        res.status(200).json({ message: 'Anganwadi deleted successfully' });
    } catch (error) {
        console.error("Error deleting Anganwadi:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Routes
router.delete('/deleteanganwadi/:id', verifySupervisor, deleteAnganwadi);
router.get('/getallanganwadi', verifySupervisor, getAllAnganwadi);
router.post('/createanganwadi', verifySupervisor, createAnganwadi);

module.exports = router;

const Anganwadi = require('./anganawadi.model');
const express = require('express');

const router = express.Router();

// Create a new Anganwadi
const createAnganwadi = async (req, res) => {
    try {
        const { anganwadiNo, localBody, localBodyName, wardNumber } = req.body;

        // Check if Anganwadi already exists based on anganwadiNo
        const existingAnganwadi = await Anganwadi.findOne({ anganwadiNo: anganwadiNo.trim().toLowerCase() });
        if (existingAnganwadi) {
            return res.status(400).json({ message: 'Anganwadi already exists' });
        }

        // Create new Anganwadi
        const newAnganwadi = new Anganwadi({
            anganwadiNo,
            localBody,
            localBodyName,
            wardNumber
        });
        await newAnganwadi.save();

        res.status(201).json({ message: 'Anganwadi created successfully', data: newAnganwadi });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all Anganwadis
const getAllAnganwadi = async (req, res) => {
    try {
        const anganwadis = await Anganwadi.find();
        res.status(200).json({ data: anganwadis });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Route to get all Anganwadis
router.get('/getallanganwadi', getAllAnganwadi);

// Route to create Anganwadi
router.post('/createanganwadi', createAnganwadi);

module.exports = router;

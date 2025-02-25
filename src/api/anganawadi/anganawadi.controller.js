const Anganwadi = require('./anganawadi.model');
const express = require('express');

const router = express.Router();


// Create a new Anganwadi
const createAnganwadi = async (req, res) => {
    try {
        const { anganwadi_no, local_body } = req.body;

        // Check if Anganwadi already exists
        const existingAnganwadi = await Anganwadi.findOne({ anganwadi_no });
        if (existingAnganwadi) {
            return res.status(400).json({ message: 'Anganwadi already exists' });
        }

        // Create new Anganwadi
        const newAnganwadi = new Anganwadi({ anganwadi_no, local_body });
        await newAnganwadi.save();

        res.status(201).json({ message: 'Anganwadi created successfully', data: newAnganwadi });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



// Route to create Anganwadi
router.post('/createanganawadi', createAnganwadi);

module.exports = router;




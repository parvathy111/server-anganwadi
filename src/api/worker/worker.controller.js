const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Worker = require('./worker.model');
const { verifySupervisor } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Worker Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if worker exists
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, worker.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: worker._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Route to add a worker (Only Supervisor can add)
router.post('/createworker', verifySupervisor, async (req, res) => {
    try {
        const { name, anganwadi_no, phone, email, address, gender, dob, password } = req.body;
        const existingWorker = await Worker.findOne({ email });

        if (existingWorker) {
            return res.status(400).json({ message: 'Worker already exists' });
        }

        const newWorker = new Worker({ name, anganwadi_no, phone, email, address, gender, dob, password });
        await newWorker.save();

        res.status(201).json({ message: 'Worker created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;

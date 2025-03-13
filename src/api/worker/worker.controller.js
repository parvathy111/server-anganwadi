const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Worker = require('./worker.model');
const { verifySupervisor, verifyWorker } = require('../../middlewares/authMiddleware');
const { sendWorkerWelcomeEmail } = require('../../utils/email');

const router = express.Router();

// Function to generate a random password
const generateRandomPassword = (length = 8) => {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
};

// 🔹 Worker Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if worker exists
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        console.log("hi")
        // Compare passwords
        const isMatch = await bcrypt.compare(password, worker.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: worker._id, role: 'worker' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 🔹 Create Worker Route (Only Supervisor can add)
router.post('/createworker', verifySupervisor, async (req, res) => {
    try {
        const { name, anganwadiNo, phone, email, address, gender, dob } = req.body;

        // Check if worker already exists
        const existingWorker = await Worker.findOne({ email });
        if (existingWorker) {
            return res.status(400).json({ message: 'Worker already exists' });
        }

        // Generate and hash a random password
        const randomPassword = generateRandomPassword();
       

        // Create new worker
        const newWorker = new Worker({
            name,
            anganwadiNo,
            phone,
            email,
            address,
            gender,
            dob,
            password: randomPassword,
        });
        console.log(randomPassword);
        await newWorker.save();

        // Send welcome email with login details
        await sendWorkerWelcomeEmail(email, name, randomPassword);

        res.status(201).json({ message: 'Worker created successfully' });
    } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🔹 Change Password Route (Worker must be logged in)
router.post('/updateworker', verifyWorker, async (req, res) => {
    try {
       const worker = await Worker.findByIdAndUpdate(req.body._id,req.body,{ new: true, runValidators: true })

       if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
    }
       res.json({ message: 'Worker profile updated successfully', worker });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;


const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('./admin.model');

const router = express.Router();

// Login Route

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
        res.json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Create Admin Route
router.post('/createadmin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const newAdmin = new Admin({ username, password });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router ;

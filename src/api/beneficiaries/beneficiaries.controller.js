
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Parent, PregLactWomen } = require('./beneficiaries.model');

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure secret key

// Function to hash password
const hashPassword = async (password) => await bcrypt.hash(password, 10);

// Register Parent
const registerParent = async (req, res) => {
    try {
        const { childname, dob, gender, fathername, mothername, address, phone, email, password } = req.body;
        if (![childname, dob, gender, fathername, mothername, address, phone, email, password].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (await Parent.findOne({ email })) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const hashedPassword = await hashPassword(password);
        const newParent = new Parent({
            _id: new mongoose.Types.ObjectId(),
            childname, dob, gender, fathername, mothername, address, phone, email,
            password: hashedPassword, status: 'Active'
        });
        await newParent.save();
        res.status(201).json({ message: 'Parent registered successfully', parent: newParent });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Register Pregnant/Lactating Woman
const registerPregLactWomen = async (req, res) => {
    try {
        const { fullname, delivery_date, Prev_num_preg, address, phone, email, password } = req.body;
        if (![fullname, delivery_date, Prev_num_preg, address, phone, email, password].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (await PregLactWomen.findOne({ email })) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = new PregLactWomen({
            _id: new mongoose.Types.ObjectId(),
            fullname, delivery_date, Prev_num_preg, address, phone, email,
            password: hashedPassword, status: 'Active'
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login function
const loginBeneficiary = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let user = await Parent.findOne({ email });
        let role = 'Parent';

        if (!user) {
            user = await PregLactWomen.findOne({ email });
            role = 'PregLactWomen';
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token, user: { id: user._id, email: user.email, role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Routes
router.post('/register/:beneficiaries', async (req, res) => {
    const { beneficiaries } = req.params;
    return beneficiaries === 'parent' ? registerParent(req, res) : registerPregLactWomen(req, res);
});

router.post('/login', loginBeneficiary);

module.exports = router;

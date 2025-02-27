const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Supervisor = require('./supervisor.model');
const { verifyAdmin, verifySupervisor } = require('../../middlewares/authMiddleware');

const router = express.Router();
const AnganawadiRoutes = require('../anganawadi/anganawadi.controller');
const addProduct = require('./product.controller');

// Supervisor Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const supervisor = await Supervisor.findOne({ email });

        if (!supervisor) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, supervisor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: supervisor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to add a supervisor (Only Admin can add)
router.post('/createsupervisor', verifyAdmin, async (req, res) => {
    try {
        const { fullname, local_body, gender, address, phone, email, password } = req.body;
        const existingSupervisor = await Supervisor.findOne({ email });

        if (existingSupervisor) {
            return res.status(400).json({ message: 'Supervisor already exists' });
        }

        const newSupervisor = new Supervisor({ fullname, local_body, gender, address, phone, email, password });
        await newSupervisor.save();

        res.status(201).json({ message: 'Supervisor created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.use(AnganawadiRoutes);


// Route to add a new product
router.post('/addProduct', verifySupervisor, addProduct);


module.exports = router;

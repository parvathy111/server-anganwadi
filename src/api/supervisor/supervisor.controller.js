
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Supervisor = require('./supervisor.model');
const { verifyAdmin, verifySupervisor } = require('../../middlewares/authMiddleware');
const { sendWelcomeEmail } = require('../../utils/email');

const router = express.Router();
const AnganawadiRoutes = require('../anganawadi/anganawadi.controller');
const addProduct = require('./product.controller');


// Utility to generate random password
const generateRandomPassword = (length = 8) => {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
};

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
        const { fullname, localBody, gender, address, phone, email } = req.body;
        const existingSupervisor = await Supervisor.findOne({ email });

        if (existingSupervisor) {
            return res.status(400).json({ message: 'Supervisor already exists' });
        }

        // Generate a random password
        const randomPassword = generateRandomPassword();

        // Create new supervisor
        const newSupervisor = new Supervisor({
            fullname,
            localBody,
            gender,
            address,
            phone,
            email,
            password: randomPassword
        });

        console.log(`Generated Password for Supervisor: ${randomPassword}`);

        await newSupervisor.save();

        // Send welcome email with login details
        await sendWelcomeEmail(email, fullname, randomPassword, 'Supervisor');

        res.status(201).json({ message: 'Supervisor created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Supervisor can update password
router.post('/updatesupervisor', verifySupervisor, async (req, res) => {
    try {
        const supervisorId = req.user.id; // getting from verifySupervisor middleware
        const supervisor = await Supervisor.findById(supervisorId);

        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }

        // Handle password update separately
        if (req.body.password) {
            supervisor.password = req.body.password; // this will trigger pre('save') to hash it
            delete req.body.password; // remove from req.body to avoid accidental overwrite below
        }

        // Update other fields dynamically
        Object.assign(supervisor, req.body);

        await supervisor.save();

        res.json({ message: 'Supervisor profile updated successfully', supervisor });
    } catch (error) {
        console.error("Error updating supervisor:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});






// Route to fetch all supervisors (without authentication)
router.get('/viewsupervisors', async (req, res) => {
    try {
        const supervisors = await Supervisor.find({}, '-password'); // exclude password field
        res.status(200).json({ supervisors }); // wrap inside an object
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


//delete by id
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSupervisor = await Supervisor.findByIdAndDelete(id);

        if (!deletedSupervisor) {
            return res.status(404).json({ message: "Supervisor not found" });
        }

        return res.status(200).json({ message: "Supervisor deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error while deleting supervisor" });
    }
});


// other routes
router.use(AnganawadiRoutes);
router.post('/addProduct', verifySupervisor, addProduct);

module.exports = router;


const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Worker = require('./worker.model');
const { verifySupervisor, verifyWorker } = require('../../middlewares/authMiddleware');
const { sendWelcomeEmail } = require('../../utils/email');

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
        const supervisorId = req.user.id; // Assuming `req.user.id` is set after authentication

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
            createdBy: supervisorId   // Assigning the logged-in supervisor ID
        });

        await newWorker.save();
        

        // Send welcome email with login details
        await sendWelcomeEmail(email, name, randomPassword, 'Worker');

        res.status(201).json({ message: 'Worker created successfully' });
    } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🔹 Update Worker Profile (Only the logged-in worker can update their own profile)
router.put('/updateworker', verifyWorker, async (req, res) => {
    try {
        const workerId = req.user.id;
        const worker = await Worker.findById(workerId);

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Update worker details (only allow safe fields to be updated)
        const { name, phone, address } = req.body;
        if (name) worker.name = name;
        if (phone) worker.phone = phone;
        if (address) worker.address = address;

        await worker.save();

        res.json({ message: 'Worker profile updated successfully', worker });
    } catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 🔹 Fetch All Workers (Only the supervisor who created them can view them)
const getAllWorkers = async (req, res) => {
    try {
        const supervisorId = req.user?.id; // Get logged-in supervisor's ID

        if (!supervisorId) {
            return res.status(403).json({ message: 'Unauthorized: Supervisor ID missing' });
        }

        // Fetch only the workers created by the logged-in supervisor
        const workers = await Worker.find({ createdBy: supervisorId })
            .populate('createdBy', 'fullname email') // Populate supervisor details
            .select('-password'); // Exclude password

        res.status(200).json({ data: workers });
    } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Register the GET all workers route
router.get('/allworkers', verifySupervisor, getAllWorkers);

// 🔹 Delete Worker by ID (Only Supervisor can delete)
router.delete('/delete/:id', verifySupervisor, async (req, res) => {
    try {
        const { id } = req.params;
        const supervisorId = req.user.id;

        // Find the worker and check if the supervisor created them
        const worker = await Worker.findOne({ _id: id, createdBy: supervisorId });

        if (!worker) {
            return res.status(404).json({ message: "Worker not found or unauthorized to delete" });
        }

        await Worker.findByIdAndDelete(id);
        return res.status(200).json({ message: "Worker deleted successfully" });
    } catch (error) {
        console.error("Error deleting worker:", error);
        return res.status(500).json({ message: "Server error while deleting worker" });
    }
});

module.exports = router;

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
        // await sendWorkerWelcomeEmail(email, name, randomPassword);
        await sendWelcomeEmail(email, name, randomPassword, 'Worker');


        res.status(201).json({ message: 'Worker created successfully' });
    } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🔹 Change Password Route (Worker must be logged in)
router.post('/updateworker', verifyWorker, async (req, res) => {
    try {
        const worker = await Worker.findById(req.body._id);

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        Object.assign(worker, req.body);

        await worker.save(); // this will trigger your pre('save') hook

        res.json({ message: 'Worker profile updated successfully', worker });
    } catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


//fetch all
router.get('/allworkers', async (req, res) => {
    try {
        const workers = await Worker.find().select('-password'); // Don't send hashed password
        res.json(workers);
    } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// DELETE worker by ID
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedWorker = await Worker.findByIdAndDelete(id);
  
      if (!deletedWorker) {
        return res.status(404).json({ message: "Worker not found" });
      }
  
      return res.status(200).json({ message: "Worker deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error while deleting worker" });
    }
  });
  
module.exports = router;

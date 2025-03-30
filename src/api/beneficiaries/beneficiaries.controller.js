
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Parent, PregLactWomen } = require('./beneficiaries.model');
const Vaccines = require('../worker/vaccine.model');
const { verifyWorker } = require('../../middlewares/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;

// Function to hash password
const hashPassword = async (password) => await bcrypt.hash(password, 10);

// Register Parent
const registerParent = async (req, res) => {
    try {
        const { childname, dob, gender, fathername, mothername, address, phone, email, password, anganwadiNo } = req.body;
        
        // Validate required fields
        if (![childname, dob, gender, fathername, mothername, address, phone, email, password, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check for valid gender value
        if (!['Male', 'Female', 'Other'].includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }
        
        // Check if email is already registered
        if (await Parent.findOne({ email })) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create new parent
        const newParent = new Parent({
            _id: new mongoose.Types.ObjectId(),
            childname, 
            dob, 
            gender, 
            fathername, 
            mothername, 
            address, 
            phone, 
            email,
            password: hashedPassword,
            status: 'Inactive', // Default status as per schema
            role: 'parent', // Immutable default role
            anganwadiNo
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
        const { fullname, deliveryDate, prevNumPreg, address, phone, email, password, anganwadiNo } = req.body;
        
        // Validate required fields
        if (![fullname, deliveryDate, prevNumPreg, address, phone, email, password, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if email is already registered
        if (await PregLactWomen.findOne({ email })) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create new user
        const newUser = new PregLactWomen({
            _id: new mongoose.Types.ObjectId(),
            fullname, 
            deliveryDate, 
            prevNumPreg, 
            address, 
            phone, 
            email,
            password: hashedPassword,
            status: 'Inactive', // Default status as per schema
            role: 'preglac', // Immutable default role
            anganwadiNo
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

        if (user.status !== "Active") {
            return res.status(403).json({ message: "Your account is not active. Please contact the admin." });
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


// Approve Beneficiary (Change status to "Active")
router.put('/approve/:id', async (req, res) => {
    try {
        const beneficiary = await Parent.findById(req.params.id) || await PregLactWomen.findById(req.params.id);

        if (!beneficiary) {
            return res.status(404).json({ message: 'Beneficiary not found' });
        }

        beneficiary.status = "Active";
        await beneficiary.save();

        res.status(200).json({ message: "Beneficiary approved successfully", beneficiary });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Remove Beneficiary
router.delete('/remove/:id', async (req, res) => {
    try {
        const deletedBeneficiary = await Parent.findByIdAndDelete(req.params.id) || await PregLactWomen.findByIdAndDelete(req.params.id);

        if (!deletedBeneficiary) {
            return res.status(404).json({ message: "Beneficiary not found" });
        }

        res.status(200).json({ message: "Beneficiary removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




// Get Beneficiaries under the logged-in worker's Anganwadi
router.get('/all',verifyWorker, async (req, res) => {
    try {
        if (!req.user || !req.user.anganwadiNo) {
            return res.status(403).json({ message: "Unauthorized: Anganwadi number not found" });
        }

        const anganwadiNo = req.user.anganwadiNo;

        const parents = await Parent.find({ anganwadiNo }).select("-password");
        const women = await PregLactWomen.find({ anganwadiNo }).select("-password");

        const beneficiaries = [...parents, ...women];

        if (beneficiaries.length === 0) {
            return res.status(200).json({ message: "No beneficiaries found for this Anganwadi", beneficiaries: [] });
        }

        res.status(200).json({ beneficiaries });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// GET Pregnant and Lactating Women under the logged-in worker's Anganwadi
router.get('/preglactwomen', verifyWorker, async (req, res) => {
    try {
        const { anganwadiNo } = req.user; // Get Anganwadi number from verified worker

        if (!anganwadiNo) {
            return res.status(403).json({ message: "Unauthorized: Anganwadi number not found" });
        }

        // Fetch pregnant/lactating women belonging to this Anganwadi
        const women = await PregLactWomen.find({ anganwadiNo }).select("-password");

        if (women.length === 0) {
            return res.status(200).json({ message: "No pregnant/lactating women found for this Anganwadi", women: [] });
        }

        res.status(200).json(women);
    } catch (err) {
        console.error("Error fetching PregLactWomen:", err);
        res.status(500).json({ message: "Server Error" });
    }
});


// GET Parents under the logged-in worker's Anganwadi
router.get('/parents', verifyWorker, async (req, res) => {
    try {
        const { anganwadiNo } = req.user; // Get Anganwadi number from verified worker

        if (!anganwadiNo) {
            return res.status(403).json({ message: "Unauthorized: Anganwadi number not found" });
        }

        // Fetch parents belonging to this Anganwadi
        const parents = await Parent.find({ anganwadiNo }).select("-password");

        if (parents.length === 0) {
            return res.status(200).json({ message: "No parents found for this Anganwadi", parents: [] });
        }

        res.status(200).json(parents);
    } catch (err) {
        console.error("Error fetching Parents:", err);
        res.status(500).json({ message: "Server Error" });
    }
});


router.post('/vaccinated', async (req, res) => {
    try {
        const { userId, vaccineId } = req.body;

        if (!userId || !vaccineId) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const vaccine = await Vaccines.findById(vaccineId);
        if (!vaccine) {
            return res.status(404).json({ status: 'error', message: 'Vaccine not found' });
        }

        // Prevent duplicate entries
        if (!vaccine.completedPersons.includes(userId)) {
            vaccine.completedPersons.push(userId);
            await vaccine.save();
        }

        res.status(200).json({ status: 'success', message: 'User marked as vaccinated' });
    } catch (error) {
        console.error('Error updating vaccination status:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

router.get('/getallvaccines', async (req, res) => {
    const { vaccinee_role } = req.body;

    const vaccines = await Vaccines.find({ vaccineeRole })

    return res.status(200).json({ vaccines })
    
})




// Routes
router.post('/register/:beneficiaries', async (req, res) => {
    const { beneficiaries } = req.params;
    return beneficiaries === 'parent' ? registerParent(req, res) : registerPregLactWomen(req, res);
});

router.post('/login', loginBeneficiary);

module.exports = router;

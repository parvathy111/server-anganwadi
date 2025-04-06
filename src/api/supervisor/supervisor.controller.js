const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Supervisor = require('./supervisor.model'); 

const Worker = require('../worker/worker.model');
const Parent = require('../beneficiaries/beneficiaries.model');
const PregLac = require('../beneficiaries/beneficiaries.model');

const { verifyAdmin, verifySupervisor, verifyWorker } = require('../../middlewares/authMiddleware');
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
// 

router.post('/createsupervisor', verifyAdmin, async (req, res) => {
    try {
        const { fullname, localBody, localbodyName, gender, address, phone, email } = req.body;

        // Check if the supervisor already exists
        const existingSupervisor = await Supervisor.findOne({ email });
        if (existingSupervisor) {
            return res.status(400).json({ message: 'Supervisor already exists' });
        }

        // Generate a random password
        const randomPassword = generateRandomPassword();

        // Create a new supervisor with the new field
        const newSupervisor = new Supervisor({
            fullname,
            localBody,
            localbodyName, // 👈 Add this line
            gender,
            address,
            phone,
            email,
            password: randomPassword
        });

        await newSupervisor.save();

        // Send welcome email with login details
        await sendWelcomeEmail(email, fullname, randomPassword, 'Supervisor');

        res.status(201).json({ message: 'Supervisor created successfully' });
    } catch (error) {
        console.error("Error creating supervisor:", error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Supervisor can update password

router.post('/changepassword', verifySupervisor, async (req, res) => {
    try {
        const supervisorId = req.user.id; // Getting from verifySupervisor middleware
        const supervisor = await Supervisor.findById(supervisorId);

        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }

        const { oldPassword, newPassword } = req.body; // Extract old and new password

        // Check if the old password is correct
        const isMatch = await bcrypt.compare(oldPassword, supervisor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }


        // Update the password
       supervisor.password = newPassword
       await supervisor.save()

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Error updating password:", error);
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


// Update Profile for Supervisor, Worker, Parent, PregLac
const updateUserProfile = async (req, res) => {
    try {
        const { userType } = req.params;
        const { fullname, name, localBody, gender, address, phone, anganwadiNo, childname, fathername, mothername, dob, prevNumPreg, deliveryDate } = req.body;

        let userModel;

        // Select the appropriate model
        switch (userType) {
            case 'supervisor':
                userModel = Supervisor;
                break;
            case 'worker':
                userModel = Worker;
                break;
            case 'parent':
                userModel = Parent;
                break;
            case 'preglac':
                userModel = PregLac;
                break;
            default:
                return res.status(400).json({ message: 'Invalid user type' });
        }

        // Fetch user data
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: `${userType} not found` });
        }

        // Update common fields
        if (fullname) {
            user.fullname = fullname;
        } else if (name) {
            user.name = name;
        }
        if (gender) user.gender = gender;
        if (address) user.address = address;
        if (phone) user.phone = phone;
        if (localBody) user.localBody = localBody;
       

        // Update userType-specific fields
        if (userType === 'worker' || userType === 'parent' || userType === 'preglac') {
            if (anganwadiNo) user.anganwadiNo = anganwadiNo;
        }

        if (userType === 'parent' || userType === 'worker') {
            if (dob) {
                
                user.dob = new Date(dob);  // Convert string to Date object
            }
        }

        if (userType === 'parent') {
            if (childname) user.childname = childname;
            if (fathername) user.fathername = fathername;
            if (mothername) user.mothername = mothername;
            if (dob) user.dob = dob;
        }
        if (userType === 'preglac') {
            if (prevNumPreg) user.prevNumPreg = prevNumPreg;
            if (deliveryDate) user.deliveryDate = deliveryDate;
        }

        // Save updated data
        await user.save();
        
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { updateUserProfile };


const getUserProfile = async (req, res) => {
    try {
        const { userType } = req.params;
        let userModel;

        switch (userType) {
            case 'supervisor':
                userModel = Supervisor;
                break;
            case 'worker':
                userModel = Worker;
                break;
            case 'parent':
                userModel = Parent;
                break;
            case 'preglac':
                userModel = PregLac;
                break;
            default:
                return res.status(400).json({ message: 'Invalid user type' });
        }

        const user = await userModel.findById(req.user.id);
     
        if (!user) {
            return res.status(404).json({ message: `${userType} profile not found` });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// other routes
router.use(AnganawadiRoutes);
router.post('/addProduct', verifySupervisor, addProduct);
// router.put('/edit-profile', verifySupervisor, updateSupervisorProfile);
router.put('/edit-profile/:userType', verifySupervisor, updateUserProfile);
router.get('/profile/:userType', verifySupervisor, getUserProfile);

module.exports = router;

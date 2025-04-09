const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/authMiddleware');

const { Parent, PregLactWomen } = require('../../api/beneficiaries/beneficiaries.model');
const Worker = require('../../api/worker/worker.model'); 
const Supervisor = require('../../api/supervisor/supervisor.model');

router.get('/me', auth, async (req, res) => {
  try {
    const { userId, role } = req.user;

    let userData;

    // Fetch from correct model based on role
    if (role === 'Parent') {
      userData = await Parent.findById(userId);
    } else if (role === 'PregLactWomen') {
      userData = await PregLactWomen.findById(userId);
    } else if (role === 'Worker') {
      userData = await Worker.findById(userId);
    } else if (role === 'Supervisor') {
      userData = await Supervisor.findById(userId);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userData);
    // console.log("User sent from /auth/me:", userData);

  } catch (error) {
    console.error("Error in /auth/me:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

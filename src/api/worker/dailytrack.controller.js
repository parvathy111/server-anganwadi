const express = require('express');
const mongoose = require('mongoose');
const DailyTrack = require('./dailytrack.model');
const { verifyWorker } = require('../../middlewares/authMiddleware'); // Middleware to verify worker

const router = express.Router();

const multer = require("multer");

// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files in 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, req._id); // Unique filename
    },
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const upload = multer({ storage, fileFilter });


// Add a new DailyTrack entry
router.post('/add', verifyWorker, async (req, res) => {
    try {
        const { openingTime, closingTime, noOfPresents, noOfAbsents, todayMeal, topicLearned, otherActivities } = req.body;

        if (!openingTime || !closingTime || !noOfPresents || !noOfAbsents || !todayMeal || !topicLearned) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }


        // Validate 12-hour time format (AM/PM)
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
        if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
            return res.status(400).json({ message: 'Opening and Closing time must be in 12-hour format (HH:MM AM/PM)' });
        }

        // Get anganwadiNo from logged-in worker
        const anganwadiNo = req.user.anganwadiNo;

        // Save studentImage path if file is uploaded
        const studentImage = req.file ? req.file.path : "";

        const newDailyTrack = new DailyTrack({
            _id: new mongoose.Types.ObjectId(),
            anganwadiNo,
            openingTime,
            closingTime,
            noOfPresents,
            noOfAbsents,
            studentImage,
            todayMeal,
            topicLearned,
            otherActivities
        });

        
        await newDailyTrack.save();
        res.status(201).json({ message: 'Daily track entry added successfully', dailyTrack: newDailyTrack });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Worker views daily track entries for their own Anganwadi
router.get("/view", verifyWorker, async (req, res) => {
    try {
        const anganwadiNo = req.user.anganwadiNo; // Get worker's assigned Anganwadi number from token

        const dailyTracks = await DailyTrack.find({ anganwadiNo }).sort({ createdAt: -1 }); // Fetch records for worker's anganwadi, latest first

        if (!dailyTracks.length) {
            return res.status(404).json({ message: "No daily track entries found for your Anganwadi." });
        }

        res.status(200).json(dailyTracks);
    } catch (error) {
        console.error("Error fetching daily track entries:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;


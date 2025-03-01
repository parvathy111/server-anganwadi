const Vaccine = require('./vaccine.model');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


// Add a new vaccine to the table
const addVaccine = async (req, res) => {
    try {
        const { vaccine, stage, dose, vaccinator, completed_person, date, time } = req.body;
        const newVaccine = new Vaccine({
            _id: new mongoose.Types.ObjectId(),
            vaccine,
            stage,
            dose,
            vaccinator,
            completed_person,
            date,
            time
        });
        await newVaccine.save();
        res.status(201).json({ message: 'New vaccine added successfully', newVaccine });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

router.post('/add', addVaccine);

module.exports = router;

// module.exports = exports;

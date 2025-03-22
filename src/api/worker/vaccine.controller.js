const Vaccine = require('./vaccine.model');
const mongoose = require('mongoose');
const express = require('express');
const { verifyWorker } = require('../../middlewares/authMiddleware');
const router = express.Router();


// Add a new vaccine to the table
const addVaccine = async (req, res) => {
    try {
        // console.log(req.body)
        const { vaccine, stage, dose, vaccinator, lastDate, vaccineeRole } = req.body;
        const existingVaccine = await Vaccine.findOne({ vaccine: vaccine.trim() });
        if (existingVaccine) {
            return res.status(400).json({ status: 'error', message: 'Vaccine with this name already exists' });
        }
        const newVaccine = new Vaccine({
            _id: new mongoose.Types.ObjectId(),
            vaccine,
            stage,
            dose,
            vaccinator,
            lastDate,
            vaccineeRole
        });
        await newVaccine.save();
        res.status(201).json({ message: 'New vaccine added successfully', newVaccine });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllVaccines = async (req, res) => {
    try {
        const vaccines = await Vaccine.find();
        res.status(200).json(vaccines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVaccinatedUsers = async (req, res) => {
    try {
        const { vaccineId } = req.params;
        console.log(vaccineId);
        
        const vaccine = await Vaccine.findById(vaccineId );
        if (!vaccine) return res.status(404).json({ status: 'error', message: 'Vaccine not found' });
        const vaccinatedUsers = vaccine.completedPersons;
        return res.status(200).json({ status: 'success', vaccinatedUsers });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

router.get('/', getAllVaccines);

router.post('/add', verifyWorker, addVaccine);

router.post('/getvaccinatedusers/:vaccineId', getVaccinatedUsers);
module.exports = router;

// module.exports = exports;

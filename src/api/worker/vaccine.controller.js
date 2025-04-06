const Vaccine = require('./vaccine.model');
const mongoose = require('mongoose');
const express = require('express');
const { verifyWorker, verifyBeneficiary } = require('../../middlewares/authMiddleware');
const router = express.Router();


 // Add a new vaccine to the table
const addVaccine = async (req, res) => {
    try {
        const { vaccine, stage, dose, vaccinator, lastDate, vaccineeRole } = req.body;

        // Ensure the worker is logged in and has an anganwadiNo
        if (!req.user || !req.user.anganwadiNo) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized: Anganwadi number not found' });
        }

        // Check if the vaccine already exists (case-insensitive)
        const existingVaccine = await Vaccine.findOne({ vaccine: vaccine.trim().toLowerCase() });
        if (existingVaccine) {
            return res.status(400).json({ status: 'error', message: 'Vaccine with this name already exists' });
        }

        // Create a new vaccine entry
        const newVaccine = new Vaccine({
            _id: new mongoose.Types.ObjectId(),
            vaccine: vaccine.trim(),
            stage,
            dose,
            vaccinator,
            lastDate,
            vaccineeRole,
            anganwadiNo: req.user.anganwadiNo // Automatically assign worker's anganwadiNo
        });

        await newVaccine.save();
        res.status(201).json({ message: 'New vaccine added successfully', vaccine: newVaccine });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

//view vaccines
const getAllVaccines = async (req, res) => {
    try {
        // Ensure the worker is logged in and has an anganwadiNo
        if (!req.user || !req.user.anganwadiNo) {
            return res.status(403).json({ message: "Unauthorized: Anganwadi number not found" });
        }

        // Fetch only the vaccines that belong to the worker's Anganwadi
        const vaccines = await Vaccine.find({ anganwadiNo: req.user.anganwadiNo });

        // If no vaccines are found, return a meaningful message
        if (vaccines.length === 0) {
            return res.status(200).json({ message: "No vaccines found for this Anganwadi", vaccines: [] });
        }

        res.status(200).json(vaccines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getVaccinatedUsers = async (req, res) => {
    try {
        const { vaccineId } = req.params;
        
        const vaccine = await Vaccine.findById(vaccineId );
        if (!vaccine) return res.status(404).json({ status: 'error', message: 'Vaccine not found' });
        const vaccinatedUsers = vaccine.completedPersons;
        return res.status(200).json({ status: 'success', vaccinatedUsers });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// Edit a vaccine by ID
const editVaccine = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Find and update the vaccine
        const updatedVaccine = await Vaccine.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedVaccine) {
            return res.status(404).json({ message: "Vaccine not found" });
        }

        res.status(200).json(updatedVaccine);
    } catch (error) {
        console.error("Error updating vaccine:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteVaccine = async (req, res) => {
    try {
      const vaccine = await Vaccine.findById(req.params.id);
      if (!vaccine) {
        return res.status(404).json({ message: "Vaccine not found" });
      }
  
      await Vaccine.findByIdAndDelete(req.params.id);
      res.json({ message: "Vaccine deleted successfully" });
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      res.status(500).json({ message: "Server error while deleting vaccine" });
    }
  };
  


  const getVaccinesByAnganwadiAndRole = async (req, res) => {
    const { anganwadiNo, role } = req.user;
 
   
    try {
      const vaccines = await Vaccine.find({
        anganwadiNo,
        vaccineeRole: role
      });
  
  
      res.status(200).json(vaccines);
    } catch (err) {
      console.error('Error fetching vaccines:', err);
      res.status(500).json({ error: 'Failed to fetch vaccines' });
    }
  };
  
  // Using the named function in the route
  router.get('/getvaccine',verifyBeneficiary, getVaccinesByAnganwadiAndRole);

router.delete("/delete/:id", deleteVaccine);
router.put("/:id", editVaccine);

router.get('/', verifyWorker, getAllVaccines);

router.post('/add', verifyWorker, addVaccine);

router.post('/getvaccinatedusers/:vaccineId', getVaccinatedUsers);
module.exports = router;



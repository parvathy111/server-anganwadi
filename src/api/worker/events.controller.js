const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('./events.model'); // Import the Event model
const Worker = require('./worker.model');
const { verifyWorker, verifySupervisor, verifyBeneficiary } = require('../../middlewares/authMiddleware');


const addEvent = async (req, res) => {
    try {
        const { eventName, participantType, date, time, conductedBy, anganwadiNo } = req.body;
        const workerId = req.user.id; // Assuming worker's ID is stored in `req.user` after authentication

        // Validate required fields
        if (![eventName, date, time, conductedBy, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newEvent = new Event({
            eventName,
            participantType: participantType || '', // Default empty array if no participants
            date,
            time,
            status: 'Pending Approval', // Default status
            participantCount: 0, // Default participant count
            conductedBy,
            anganwadiNo,
            createdBy: workerId // Automatically assigning the worker's ID
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event added successfully, pending supervisor approval', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//worker view events
const getEvents = async (req, res) => {
    try {
        const workerId = req.user?.id; // Ensure worker's ID is available from authentication

        if (!workerId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const events = await Event.find({ createdBy: workerId }); // Fetch events created by the logged-in worker
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//supervisor view events
const getSupervisorEvents = async (req, res) => {
    try {
        const supervisorId = req.user?.id; // Get logged-in supervisor's ID

        if (!supervisorId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        // Find all workers created by this supervisor
        const workers = await Worker.find({ createdBy: supervisorId }, "_id");

        if (!workers.length) {
            return res.status(404).json({ message: "No workers found under this supervisor" });
        }

        // Extract worker IDs from the result
        const workerIds = workers.map(worker => worker._id);

        // Fetch events created by these workers
        const events = await Event.find({ createdBy: { $in: workerIds } });

        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching supervisor events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// Supervisor: Approve the event (Changes status to "Scheduled")
const approveEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'Pending Approval') {
            return res.status(400).json({ message: 'Event is not pending approval' });
        }

        event.status = 'Scheduled';
        await event.save();

        res.status(200).json({ message: 'Event approved and scheduled', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//Update events
const updateEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Validate event ID
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Update the event using findByIdAndUpdate
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $set: req.body },
            { new: true, runValidators: true } // Return updated event and validate fields
        );


        if (!updatedEvent) {
            return res.status(500).json({ message: "Event update failed" });
        }

        res.status(200).json({ message: "Event details updated successfully", event: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 🗑️ Async function for deleting an event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the event exists
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Delete the event from the database
        await Event.findByIdAndDelete(id);

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const completeEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Update the status to 'Completed'
        event.status = "Completed";
        await event.save();

        res.status(200).json({ message: "Event marked as completed", event });
    } catch (error) {
        console.error("Error updating event status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// GET /vaccines/beneficiary-events?anganwadiNo=ANG001&role=Mother
const getEventsForBeneficiary = async (req, res) => {
    const { anganwadiNo, role } = req.user;
console.log(role)
    try {
        const events = await Event.find({
            anganwadiNo,
            participantType: role,
            status: { $ne: 'Cancelled' }
        }).sort({ date: -1 });

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

module.exports = { getEventsForBeneficiary };



const rejectEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
  
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { status: 'Rejected' },
        { new: true }
      );
  
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      res.status(200).json({ message: 'Event rejected successfully', event: updatedEvent });
    } catch (error) {
      console.error('Error rejecting event:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = {
    rejectEvent,
  };

// Routes

router.delete("/:id", deleteEvent);
router.get('/all', verifyWorker, getEvents);
router.get("/view-events", verifySupervisor, getSupervisorEvents);
router.post('/add', verifyWorker, addEvent); // Worker adds an event
router.put('/approve/:eventId', approveEvent); // Supervisor approves the event
router.put("/update/:eventId", updateEventDetails);
router.put("/complete/:id", completeEvent);
router.get('/beneficiary-events', verifyBeneficiary, getEventsForBeneficiary);
router.put('/reject/:id', rejectEvent);

module.exports = router;

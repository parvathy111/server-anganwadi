const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('./events.model'); // Import the Event model
const Worker = require('./worker.model'); 
const { verifyWorker, verifySupervisor } = require('../../middlewares/authMiddleware');


const addEvent = async (req, res) => {
    try {
        // console.log(req.body);
        const { eventName, participants, date, time, conductedBy, anganwadiNo } = req.body;
        const workerId = req.user.id; // Assuming worker's ID is stored in `req.user` after authentication

        console.log(workerId);
        // Validate required fields
        if (![eventName, date, time, conductedBy, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newEvent = new Event({
            eventName,
            participants: participants || [], // Default empty array if no participants
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

        // console.log(workerId);
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

// Worker: Update Participant_no after event completion
const updateParticipants = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { participantCount } = req.body;

        if (typeof participantCount !== 'number' || participantCount < 0) {
            return res.status(400).json({ message: 'Invalid participant number' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'Completed') {
            return res.status(400).json({ message: 'Event must be completed to update participants' });
        }

        event.participantCount = participantCount;
        await event.save();

        res.status(200).json({ message: 'Participant number updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Routes
router.get('/all', verifyWorker, getEvents);
router.get("/view-events", verifySupervisor, getSupervisorEvents);
router.post('/add', verifyWorker, addEvent); // Worker adds an event
router.put('/approve/:eventId', approveEvent); // Supervisor approves the event
router.put('/update-participants/:eventId', updateParticipants); // Worker updates participant count

module.exports = router;

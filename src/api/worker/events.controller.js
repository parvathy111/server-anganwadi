const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('./events.model'); // Import the Event model

// Worker: Add a new event (Status: "Pending Approval")
const addEvent = async (req, res) => {
    try {
        console.log(req.body);
        const { eventName, participants, date, time, conductedBy, anganwadiNo } = req.body;

        // Validate required fields
        if (![eventName, date, time, conductedBy, anganwadiNo].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newEvent = new Event({
            _id: new mongoose.Types.ObjectId(),
            eventName,
            participants: participants || [], // Default empty array if no participants
            date,
            time,
            status: 'Pending Approval', // Default status
            participantCount: 0, // Default participant count
            conductedBy,
            anganwadiNo
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event added successfully, pending supervisor approval', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find(); // Fetch all events from MongoDB
        res.status(200).json(events);
        console.log(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
router.get('/all', getEvents);
router.post('/add', addEvent); // Worker adds an event
router.put('/approve/:eventId', approveEvent); // Supervisor approves the event
router.put('/update-participants/:eventId', updateParticipants); // Worker updates participant count

module.exports = router;

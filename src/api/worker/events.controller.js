const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('./events.model'); // Import the Event model

// Worker: Add a new event (Status: "Pending Approval")
const addEvent = async (req, res) => {
    try {
        const { Event_name, participants, date, time, Conducted_by } = req.body;

        if (![Event_name, date, time, Conducted_by].every(Boolean)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newEvent = new Event({
            _id: new mongoose.Types.ObjectId(),
            Event_name,
            participants: participants || [], // Default empty array if no participants
            date,
            time,
            status: 'Pending Approval', // Default status
            Participant_no: 0, // Default participant count
            Conducted_by
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event added successfully, pending supervisor approval', event: newEvent });
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
        const { Participant_no } = req.body;

        if (typeof Participant_no !== 'number' || Participant_no < 0) {
            return res.status(400).json({ message: 'Invalid participant number' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'Completed') {
            return res.status(400).json({ message: 'Event must be completed to update participants' });
        }

        event.Participant_no = Participant_no;
        await event.save();

        res.status(200).json({ message: 'Participant number updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Routes
router.post('/add', addEvent); // Worker adds an event
router.put('/approve/:eventId', approveEvent); // Supervisor approves the event
router.put('/update-participants/:eventId', updateParticipants); // Worker updates participant count

module.exports = router;

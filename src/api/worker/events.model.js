const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    participants: { type: [String], required: true }, // Array of participant names or IDs
    date: { type: Date, required: true },
    time: { type: String, required: true }, // Example format: "10:30 AM"
    status: { type: String, enum: ['Pending Approval', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'], default: 'Pending Approval' },
    participantCount: { type: Number, default: 0 }, // Default is 0, Worker can update later
    conductedBy: { type: String, required: true } // Could be a user/admin ID or name
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

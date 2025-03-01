const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    vaccine: {
        type: String,
        required: true
    },
    stage: {
        type: String,
        required: true
    },
    dose: {
        type: Number,
        required: true
    },
    vaccinator: {
        type: String,
        required: true
    },
    completed_person: {
        type: Number,
        required: true,
        default: 0
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Vaccine', VaccineSchema);

const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    vaccine: {
        type: String,
        required: true,
        unique: true
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
    completed_persons: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'vaccinee_role'
    }],
    vaccinee_role: {
        type: String,
        enum: ['Parent', 'PregLactWomen'],
        required: true
    },
    last_date: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Vaccine', VaccineSchema);


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
    completedPersons: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'vaccineeRole'
    }],
    vaccineeRole: {
        type: String,
        enum: ['Parent', 'PregLactWomen'],
        required: true
    },
    lastDate: {
        type: Date,
        required: true
    },
    anganwadiNo: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Vaccine', VaccineSchema);

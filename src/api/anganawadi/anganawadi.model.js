const mongoose = require('mongoose');

const anganwadiSchema = new mongoose.Schema({
    anganwadi_no: {
        type: String,
        required: true,
        unique: true
    },
    local_body: {
        type: String,
        required: true
    }
});

const Anganwadi = mongoose.model('Anganwadi', anganwadiSchema);

module.exports = Anganwadi;

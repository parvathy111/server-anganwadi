const mongoose = require('mongoose');

const anganwadiSchema = new mongoose.Schema({
anganwadiNo: {
        type: String,
        required: true,
        unique: true
    },
    localBody: {
        type: String,
        required: true
    }
});

const Anganwadi = mongoose.model('Anganwadi', anganwadiSchema);

module.exports = Anganwadi;

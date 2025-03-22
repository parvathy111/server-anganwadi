const mongoose = require('mongoose');

const anganwadiSchema = new mongoose.Schema({
    anganwadiNo: {
        type: String,
        required: true,
        unique: true,
        set: (value) => value.trim().toLowerCase()
    },
    localBody: {
        type: String,
        required: true
    }
});

// Pre-save hook to ensure anganwadiNo is always lowercase & trimmed
anganwadiSchema.pre('save', function(next) {
    this.anganwadiNo = this.anganwadiNo.trim().toLowerCase();
    next();
});

const Anganwadi = mongoose.model('Anganwadi', anganwadiSchema);

module.exports = Anganwadi;

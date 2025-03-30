const mongoose = require('mongoose');

const DailyTrackSchema = new mongoose.Schema({
    anganwadiNo: {
        type: String,
        required: true
    },
    openingTime: {
        type: String,
        required: true,
        match: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/ // Ensures 12-hour format
    },
    closingTime: {
        type: String,
        required: true,
        match: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/ // Ensures 12-hour format
    },
    noOfPresents: {
        type: Number,
        required: true,
        min: 0
    },
    noOfAbsents: {
        type: Number,
        required: true,
        min: 0
    },
    studentImage: {
        type: String, // Store image URL or file path
        required: false
    },
    todayMeal: {
        type: String,
        required: true
    },
    topicLearned: {
        type: String,
        required: true
    },
    otherActivities: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Middleware to set anganwadiNo automatically from logged-in worker
DailyTrackSchema.pre('save', async function (next) {
    if (!this.anganwadiNo && this.createdBy) {
        const Worker = mongoose.model('Worker');
        const worker = await Worker.findById(this.createdBy);
        if (worker) {
            this.anganwadiNo = worker.anganwadiNo;
        }
    }
    next();
});

module.exports = mongoose.model('DailyTrack', DailyTrackSchema);

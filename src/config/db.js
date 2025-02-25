const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log("this is mongo uri ",process.env.MONGO_URI)
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;

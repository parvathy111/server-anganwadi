require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = require('./app');

const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});

const mongoose = require('mongoose');

const orderStockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String, // URL or path to the image
        required: false
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
});

const OrderStock = mongoose.model('OrderStock', orderStockSchema);

module.exports = OrderStock;

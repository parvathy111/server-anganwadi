const mongoose = require('mongoose');

const orderStockSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true,
        trim: true
    },
    itemid: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    anganwadiNo: {
        type: String,
        required: true,
        trim: true
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
        enum: ['Pending', 'Approved', 'Processing', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    }
});

const OrderStock = mongoose.model('OrderStock', orderStockSchema);

module.exports = OrderStock;

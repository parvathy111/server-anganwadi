

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    itemid: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    productname: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supervisor',  // Assuming you have a Supervisor model
        required: true
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

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
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

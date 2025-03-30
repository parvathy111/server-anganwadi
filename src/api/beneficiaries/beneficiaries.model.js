// const mongoose = require('mongoose');

// const parentSchema = new mongoose.Schema({
//     childname: { type: String, required: true },
//     dob: { type: Date, required: true },
//     gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
//     fathername: { type: String, required: true },
//     mothername: { type: String, required: true },
//     address: { type: String, required: true },
//     phone: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Inactive' },
//     role: { 
//         type: String, 
//         enum: ['parent'],
//         default: 'parent', 
//         immutable: true 
//     }
// }, { timestamps: true });

// const Parent = mongoose.model('Parent', parentSchema);




// const pregLactWomenSchema = new mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     fullname: { type: String, required: true },
//     deliveryDate: { type: Date, required: true },
//     prevNumPreg: { type: Number, required: true },
//     address: { type: String, required: true },
//     phone: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Inactive' },
//     role: { 
//         type: String, 
//         enum: ['preglac'],
//         default: 'preglac', 
//         immutable: true 
//     }
// }, { timestamps: true });

// const PregLactWomen = mongoose.model('PregLactWomen', pregLactWomenSchema);

// module.exports = { Parent, PregLactWomen };

const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    childname: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    fathername: { type: String, required: true },
    mothername: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Inactive' },
    role: { 
        type: String, 
        enum: ['parent'],
        default: 'parent', 
        immutable: true 
    },
    anganwadiNo: { type: String, required: true } // Added field
}, { timestamps: true });

const Parent = mongoose.model('Parent', parentSchema);

const pregLactWomenSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fullname: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    prevNumPreg: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Inactive' },
    role: { 
        type: String, 
        enum: ['preglac'],
        default: 'preglac', 
        immutable: true 
    },
    anganwadiNo: { type: String, required: true } // Added field
}, { timestamps: true });

const PregLactWomen = mongoose.model('PregLactWomen', pregLactWomenSchema);

module.exports = { Parent, PregLactWomen };

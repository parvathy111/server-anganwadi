// const mongoose = require('mongoose');

// // Define Event Schema
// const eventSchema = new mongoose.Schema(
//     {
//         eventName: { 
//             type: String, 
//             required: true, 
//             trim: true 
//         },

//         participants: { 
//             type: [String], 
//             required: true 
//         }, // Array of participant names or IDs
        
//         date: { 
//             type: Date, 
//             required: true 
//         },

//         time: { 
//             type: String, 
//             required: true 
//         }, // Example format: "10:30 AM"

//         status: { 
//             type: String, 
//             enum: ['Pending Approval', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'], 
//             default: 'Pending Approval' 
//         },

//         participantCount: { 
//             type: Number, 
//             default: 0 
//         }, // Worker can update later
        
//         conductedBy: { 
//             type: String, 
//             required: true 
//         }, // Could be a user/admin ID or name

//         anganwadiNo: { 
//             type: String, 
//             required: true,
//             trim: true 
//         } // Just a normal String (no ObjectId ref)
//     },
//     { 
//         timestamps: true 
//     }
// );

// // Export Event model
// module.exports = mongoose.model('Event', eventSchema);


const mongoose = require('mongoose');

// Define Event Schema
const eventSchema = new mongoose.Schema(
    {
        eventName: { 
            type: String, 
            required: true, 
            trim: true 
        },

        participants: { 
            type: [String], 
            required: true 
        }, // Array of participant names or IDs
        
        date: { 
            type: Date, 
            required: true 
        },

        time: { 
            type: String, 
            required: true 
        }, // Example format: "10:30 AM"

        status: { 
            type: String, 
            enum: ['Pending Approval', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'], 
            default: 'Pending Approval' 
        },

        participantCount: { 
            type: Number, 
            default: 0 
        }, // Worker can update later
        
        conductedBy: { 
            type: String, 
            required: true 
        }, // Could be a user/admin ID or name

        anganwadiNo: { 
            type: String, 
            required: true,
            trim: true 
        }, // Just a normal String (no ObjectId ref)

        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Worker', 
            required: true 
        } // Automatically assigned to the logged-in worker
    },
    { 
        timestamps: true 
    }
);

// Export Event model
module.exports = mongoose.model('Event', eventSchema);

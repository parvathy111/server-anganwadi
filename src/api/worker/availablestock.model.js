const mongoose = require("mongoose");

const availableStockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    anganwadiNo: { type: String, required: true },
    status: { type: String, default: "Completed" }, // Default status is 'Completed'
    itemId: { type: String, required: true }, // Reference to OrderStock
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("AvailableStock", availableStockSchema);

const express = require('express');
const router = express.Router();
const Product = require('./product.model');
const { verifySupervisor } = require('../../middlewares/authMiddleware');
const Worker = require('../worker/worker.model');


// Controller function to add a product
const addProduct = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        
        const { itemid, productname, image } = req.body;

        // Ensure the request has the supervisor ID
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: No supervisor ID found" });
        }

        // Validate required fields
        if (!itemid || !productname || !image) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if a product with the same itemid exists for this supervisor
        const existingProduct = await Product.findOne({ itemid, createdBy: req.user.id });
        if (existingProduct) {
            return res.status(400).json({ message: "Product with this item ID already exists" });
        }

        // Create and save the new product
        const newProduct = new Product({
            itemid,
            productname,
            image,
            createdBy: req.user.id  // Assign supervisor ID
        });

        await newProduct.save();

        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Route for Supervisor to View Only Their Own Products
const getSupervisorProducts = async (req, res) => {
    try {
        // Ensure the request has the supervisor ID
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: No supervisor ID found" });
        }

        // Fetch products only created by the logged-in supervisor
        const products = await Product.find({ createdBy: req.user.id });

        res.status(200).json(products);
    } catch (error) {
        console.error("Get Supervisor Products Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE Product by ID
router.delete("/delete/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json({ message: "Product deleted successfully", product: deletedProduct });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

//   router.get('/all', async (req, res) => {
//     try {
//         const products = await Product.find();
//         res.status(200).json(products);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

router.get('/all', verifySupervisor, async (req, res) => {
    try {
        const workerId = req.user.id;  // This should now be a worker's ID

        // Find the worker's supervisor
        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        const supervisorId = worker.createdBy; // 'createdBy' is the supervisor
        if (!supervisorId) {
            return res.status(404).json({ message: 'Supervisor not assigned to this worker' });
        }

        // Fetch products created by this supervisor
        const products = await Product.find({ createdBy: supervisorId });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Routes
router.post('/add', verifySupervisor, addProduct);
router.get("/my-products", verifySupervisor, getSupervisorProducts);

module.exports = router;

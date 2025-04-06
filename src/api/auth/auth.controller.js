const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/authMiddleware');





//routes
router.get('/me', auth, async (req, res) => {
    res.send(req.user)
});

module.exports = router;
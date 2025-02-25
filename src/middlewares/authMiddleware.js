const jwt = require('jsonwebtoken');
const Admin = require('../api/admin/admin.model');

const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};


// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(403).json({ message: 'Access denied, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(403).json({ message: 'Only admins can perform this action' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error });
    }
};


module.exports = { auth, verifyAdmin };
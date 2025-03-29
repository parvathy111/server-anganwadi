const jwt = require('jsonwebtoken');
const Admin = require('../api/admin/admin.model');
const Supervisor = require('../api/supervisor/supervisor.model');
const Worker = require('../api/worker/worker.model');


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
        
        const token = req.headers.authorization?.split(' ').pop();
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

// Middleware to verify supervisor
const verifySupervisor = (req, res, next) => {
    console.log("hi");
   
    const token = req.headers.authorization?.split(' ').pop();
    
    console.log(req.headers.authorization);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // THIS MUST SET req.
        console.log(decoded);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid' });
    }
};


const verifyWorker = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        // console.log(authHeader);
        const token = authHeader.split(" ").pop();
        console.log(token);
        if (!token) {
            return res.status(403).json({ message: 'Access denied, no token provided' });
        }

        // console.log(token)


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        const worker = await Worker.findById(decoded.id);
        if (!worker) {
            return res.status(403).json({ message: 'Only supervisors can perform this action' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error });
    }
};




module.exports = { auth, verifyAdmin, verifySupervisor, verifyWorker };
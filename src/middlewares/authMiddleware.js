const jwt = require('jsonwebtoken');
const Admin = require('../api/admin/admin.model');
const Supervisor = require('../api/supervisor/supervisor.model');
const Worker = require('../api/worker/worker.model');
const { Parent } = require('../api/beneficiaries/beneficiaries.model');
const { PregLactWomen } = require('../api/beneficiaries/beneficiaries.model');
const { sendwhatsappMessage } = require('../utils/twilio');

const auth = (req, res, next) => {
    
    const authHeader = req.header('Authorization');
    const token = authHeader.split(" ").pop();
    if (!token) {
        return res.status(403).json({ message: 'Access denied, no token provided' });
    }

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
  
   
    const token = req.headers.authorization?.split(' ').pop();
    

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // THIS MUST SET req.
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid' });
    }
};


const verifyWorker = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader.split(" ").pop();
        if (!token) {
            return res.status(403).json({ message: 'Access denied, no token provided' });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const worker = await Worker.findById(decoded.id);
        if (!worker) {
            return res.status(403).json({ message: 'Only worker can perform this action' });
        }

        req.user = { id: worker._id, anganwadiNo: worker.anganwadiNo };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error });
    }
};




const verifyBeneficiary = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.split(" ").pop(); // safer with optional chaining

        if (!token) {
            return res.status(403).json({ message: 'Access denied, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = null;

        if (decoded.role === 'Parent') {
            const parent = await Parent.findById(decoded.id);
            if (!parent) {
                return res.status(403).json({ message: 'Parent not found' });
            }

            if (!parent.anganwadiNo) {
                return res.status(400).json({ message: 'Parent does not have anganwadiNo' });
            }

            user = {
                _id: parent._id,
                name: parent.name,
                anganwadiNo: parent.anganwadiNo,
                role: 'Parent',
            };

        } else if (decoded.role === 'PregLactWomen') {
            const pregLact = await PregLactWomen.findById(decoded.id);
            if (!pregLact) {
                return res.status(403).json({ message: 'PregLactWomen not found' });
            }

            if (!pregLact.anganwadiNo) {
                return res.status(400).json({ message: 'PregLactWomen does not have anganwadiNo' });
            }

            user = {
                _id: pregLact._id,
                name: pregLact.name,
                anganwadiNo: pregLact.anganwadiNo,
                role: 'PregLactWomen',
            };

        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('verifyBeneficiary error:', error);
        return res.status(401).json({ message: 'Invalid token', error });
    }
};


module.exports = { auth, verifyAdmin, verifySupervisor, verifyWorker, verifyBeneficiary };
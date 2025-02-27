const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//routes
const adminRoutes = require('./api/admin/admin.controller');
const supervisorRoutes = require('./api/supervisor/supervisor.controller');
const workerRoutes = require('./api/worker/worker.controller');
const productRoutes = require('./api/supervisor/product.controller');
const beneficiaryRoutes = require('./api/beneficiaries/beneficiaries.controller');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use('/admin',adminRoutes);
app.use('/supervisor', supervisorRoutes);
app.use('/worker', workerRoutes);
app.use('/products', productRoutes);
app.use('/beneficiaries', beneficiaryRoutes); 

module.exports = app;

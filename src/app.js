const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//routes
const adminRoutes = require('./api/admin/admin.controller');
const supervisorRoutes = require('./api/supervisor/supervisor.controller');
const workerRoutes = require('./api/worker/worker.controller');
const productRoutes = require('./api/supervisor/product.controller');
const beneficiaryRoutes = require('./api/beneficiaries/beneficiaries.controller');
const eventRoutes = require('./api/worker/events.controller');
const vaccineRoutes = require('./api/worker/vaccine.controller');
const orderRoutes = require('./api/worker/order.controller');
const anganwadiRoutes = require('./api/anganawadi/anganawadi.controller');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use('/admin',adminRoutes);
app.use('/supervisor', supervisorRoutes);
app.use('/worker', workerRoutes);
app.use('/products', productRoutes);
app.use('/beneficiaries', beneficiaryRoutes); 
app.use('/events', eventRoutes);
app.use('/vaccines', vaccineRoutes); 

app.use('/orders', orderRoutes);
app.use('/anganavadi', anganwadiRoutes);

module.exports = app;

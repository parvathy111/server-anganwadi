const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//routes
const adminRoutes = require('./api/admin/admin.controller');
const supervisorRoutes = require('./api/supervisor/supervisor.controller');
const workerRoutes = require('./api/worker/worker.controller');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use('/admin',adminRoutes);
app.use('/supervisor', supervisorRoutes);
app.use('/worker', workerRoutes);

module.exports = app;

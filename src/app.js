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
const dailyTrackRoutes = require('./api/worker/dailytrack.controller');
const availableStockRoutes = require('./api/worker/availablestock.controller');
const messageRoutes = require('./api/supervisor/message.controller');
const authRoutes = require('./api/auth/auth.controller');
const notificationRoutes = require('./api/worker/notification.controller')

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

app.use('/dailytracks', dailyTrackRoutes);
app.use('/worker-available-stock', availableStockRoutes);

app.use('/messages', messageRoutes);

app.use('/auth', authRoutes);

app.use('/notification', notificationRoutes);

module.exports = app;

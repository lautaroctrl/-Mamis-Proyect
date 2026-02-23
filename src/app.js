const path = require('path');
const express = require('express');
const cors = require('cors');

const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', orderRoutes);
app.use('/api', adminRoutes);
app.use('/api', statsRoutes);

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

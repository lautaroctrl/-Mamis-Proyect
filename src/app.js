const path = require('path');
const express = require('express');
const cors = require('cors');
const { corsOrigins, jsonBodyLimit } = require('./config/appConfig');

const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const requestContextMiddleware = require('./middlewares/requestContextMiddleware');

const app = express();

app.disable('x-powered-by');

app.use(requestContextMiddleware);
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: jsonBodyLimit, strict: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', orderRoutes);
app.use('/api', adminRoutes);
app.use('/api', statsRoutes);
app.use('/api', metricsRoutes);

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        next();
        return;
    }

    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

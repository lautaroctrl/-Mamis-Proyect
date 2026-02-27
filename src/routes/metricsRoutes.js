const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequestMiddleware');
const { metricsSchemas } = require('../utils/requestValidators');
const { trackMetricEvent } = require('../services/metricsService');

const router = express.Router();

router.post('/metrics/events', validateRequest(metricsSchemas.trackEvent), asyncHandler(async (req, res) => {
    const event = await trackMetricEvent(req.body);
    res.status(201).json({ success: true, data: event });
}));

module.exports = router;

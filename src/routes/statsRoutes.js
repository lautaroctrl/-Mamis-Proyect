const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getAdminStats } = require('../services/statsService');

const router = express.Router();

router.get('/estadisticas', asyncHandler(async (_req, res) => {
    const stats = await getAdminStats();
    res.json({ success: true, data: stats });
}));

module.exports = router;

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { loginAdmin, logoutAdmin } = require('../services/adminService');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/admin/login', asyncHandler(async (req, res) => {
    const token = await loginAdmin(req.body.password);
    res.json({
        success: true,
        token,
        message: 'Sesión iniciada correctamente'
    });
}));

router.post('/admin/logout', verifyAdminToken, asyncHandler(async (req, res) => {
    await logoutAdmin(req.adminToken);
    res.json({ success: true, message: 'Sesión cerrada' });
}));

module.exports = router;

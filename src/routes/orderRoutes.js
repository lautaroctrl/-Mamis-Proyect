const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
    listOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderNotes,
    deleteOrder,
    exportOrdersAsJson
} = require('../services/orderService');

const router = express.Router();

router.get('/pedidos', asyncHandler(async (req, res) => {
    const orders = await listOrders(req.query.estado);
    res.json({ success: true, data: orders });
}));

router.get('/pedidos/:id', asyncHandler(async (req, res) => {
    const order = await getOrderById(req.params.id);
    res.json({ success: true, data: order });
}));

router.post('/pedidos', asyncHandler(async (req, res) => {
    const createdOrder = await createOrder(req.body);
    res.status(201).json({
        success: true,
        message: 'Pedido creado correctamente',
        data: createdOrder
    });
}));

router.put('/pedidos/:id/estado', asyncHandler(async (req, res) => {
    await updateOrderStatus(req.params.id, req.body.estado, req.body.notas);
    res.json({ success: true, message: 'Estado actualizado correctamente' });
}));

router.put('/pedidos/:id/notas', asyncHandler(async (req, res) => {
    await updateOrderNotes(req.params.id, req.body.notas);
    res.json({ success: true, message: 'Notas actualizadas correctamente' });
}));

router.delete('/pedidos/:id', asyncHandler(async (req, res) => {
    await deleteOrder(req.params.id);
    res.json({ success: true, message: 'Pedido eliminado correctamente' });
}));

router.get('/exportar/json', asyncHandler(async (_req, res) => {
    const orders = await exportOrdersAsJson();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="pedidos.json"');
    res.json(orders);
}));

module.exports = router;

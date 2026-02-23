const { dbAll, dbGet, dbRun } = require('../db/sqliteClient');
const AppError = require('../utils/appError');
const { getOrderReference, mapOrderForClient } = require('../utils/orderMapper');

const VALID_ORDER_STATES = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];

const assertRequiredOrderFields = (payload) => {
    const { id, telefono, tipo, horario, pago, productos, total } = payload;

    if (!id || !telefono || !tipo || !horario || !pago || !productos || !total) {
        throw new AppError('Faltan campos requeridos', 400);
    }
};

const listOrders = async (estado) => {
    let query = 'SELECT * FROM pedidos ORDER BY fecha DESC';
    const params = [];

    if (estado && estado !== 'todos') {
        query += ' WHERE estado = ?';
        params.push(estado);
    }

    const orders = await dbAll(query, params);
    return orders.map(mapOrderForClient);
};

const getOrderById = async (id) => {
    const order = await dbGet('SELECT * FROM pedidos WHERE id = ?', [id]);

    if (!order) {
        throw new AppError('Pedido no encontrado', 404);
    }

    return mapOrderForClient(order);
};

const createOrder = async (payload) => {
    assertRequiredOrderFields(payload);

    const { id, telefono, nombre, tipo, direccion, horario, pago, aclaracion, productos, total } = payload;

    await dbRun(
        `
            INSERT INTO pedidos (id, telefono, nombre, tipo, direccion, horario, pago, aclaracion, productos, total, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
        `,
        [
            id,
            telefono,
            nombre || null,
            tipo,
            direccion || null,
            horario,
            pago,
            aclaracion || null,
            JSON.stringify(productos),
            total
        ]
    );

    return {
        id,
        telefono,
        nombre,
        tipo,
        direccion: direccion || null,
        referencia: getOrderReference({ tipo, direccion, nombre }),
        horario,
        total
    };
};

const updateOrderStatus = async (id, estado, notas) => {
    if (!estado) {
        throw new AppError('Estado es requerido', 400);
    }

    if (!VALID_ORDER_STATES.includes(estado)) {
        throw new AppError('Estado inválido', 400);
    }

    let query = 'UPDATE pedidos SET estado = ?';
    const params = [estado];

    if (notas) {
        query += ', notas = ?';
        params.push(notas);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const result = await dbRun(query, params);

    if (result.changes === 0) {
        throw new AppError('Pedido no encontrado', 404);
    }
};

const updateOrderNotes = async (id, notas) => {
    if (!notas) {
        throw new AppError('Notas son requeridas', 400);
    }

    const result = await dbRun('UPDATE pedidos SET notas = ? WHERE id = ?', [notas, id]);

    if (result.changes === 0) {
        throw new AppError('Pedido no encontrado', 404);
    }
};

const deleteOrder = async (id) => {
    const result = await dbRun('DELETE FROM pedidos WHERE id = ?', [id]);

    if (result.changes === 0) {
        throw new AppError('Pedido no encontrado', 404);
    }
};

const exportOrdersAsJson = async () => {
    const orders = await dbAll('SELECT * FROM pedidos ORDER BY fecha DESC');
    return orders.map(mapOrderForClient);
};

module.exports = {
    listOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderNotes,
    deleteOrder,
    exportOrdersAsJson
};

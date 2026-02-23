const { dbAll, dbGet } = require('../db/sqliteClient');

const getAdminStats = async () => {
    const totalPedidos = await dbGet('SELECT COUNT(*) as count FROM pedidos');
    const totalVentas = await dbGet('SELECT SUM(total) as total FROM pedidos');
    const pedidosPendientes = await dbGet('SELECT COUNT(*) as count FROM pedidos WHERE estado = "pendiente"');
    const pedidosPreparando = await dbGet('SELECT COUNT(*) as count FROM pedidos WHERE estado = "preparando"');
    const pedidosListos = await dbGet('SELECT COUNT(*) as count FROM pedidos WHERE estado = "listo"');

    const productosTop = await dbAll(`
        SELECT
            json_extract(value, '$.nombre') as nombre,
            SUM(CAST(json_extract(value, '$.cantidad') AS INTEGER)) as total_vendido
        FROM pedidos, json_each(pedidos.productos)
        GROUP BY nombre
        ORDER BY total_vendido DESC
        LIMIT 10
    `);

    const pagoPorTipo = await dbAll('SELECT pago, COUNT(*) as count FROM pedidos GROUP BY pago');

    return {
        totalPedidos: totalPedidos?.count || 0,
        totalVentas: totalVentas?.total || 0,
        pedidosPendientes: pedidosPendientes?.count || 0,
        pedidosPreparando: pedidosPreparando?.count || 0,
        pedidosListos: pedidosListos?.count || 0,
        productosTop: productosTop || [],
        pagoPorTipo: pagoPorTipo || []
    };
};

module.exports = {
    getAdminStats
};

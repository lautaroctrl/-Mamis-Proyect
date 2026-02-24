(function (global) {
    function obtenerSiguienteIdPedido(pedidosExistentes) {
        const maxId = pedidosExistentes.reduce((acumulado, pedido) => {
            const numero = parseInt(String(pedido.id || '').replace('ORD-', ''), 10);
            if (!Number.isFinite(numero)) {
                return acumulado;
            }
            return numero > acumulado ? numero : acumulado;
        }, 0);

        return `ORD-${maxId + 1}`;
    }

    function construirPedido({ id, datosFormulario, carritoItems, fecha }) {
        return {
            id,
            telefono: datosFormulario.telefono,
            nombre: datosFormulario.nombre,
            tipo: datosFormulario.tipo,
            direccion: datosFormulario.direccion,
            horario: datosFormulario.horario,
            pago: datosFormulario.pago,
            aclaracion: datosFormulario.aclaracion,
            productos: carritoItems.map(item => ({
                id: item.id,
                nombre: item.nombre,
                ingredientes: item.ingredientes,
                cantidad: item.cantidad,
                precio: item.precio,
                personalizacion: item.personalizacion || ''
            })),
            total: carritoItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
            fecha
        };
    }

    function construirUrlWhatsApp(numero, mensaje) {
        return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    }

    const api = {
        obtenerSiguienteIdPedido,
        construirPedido,
        construirUrlWhatsApp
    };
    global.OrderService = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);

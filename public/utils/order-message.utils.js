(function exposeOrderMessageUtils(global) {
    const buildWhatsappOrderMessage = (pedido) => {
        let mensaje = `Orden: ${pedido.id}\n\n`;
        mensaje += 'Productos:\n';

        pedido.productos.forEach((producto) => {
            mensaje += `- ${producto.nombre} (${producto.ingredientes.join(', ')}) x${producto.cantidad}\n`;
        });

        mensaje += `\nTotal: $${pedido.total}\n\n`;

        if (pedido.nombre) {
            mensaje += `Nombre: ${pedido.nombre}\n`;
        }

        mensaje += `Teléfono: ${pedido.telefono}\n`;
        mensaje += `Tipo: ${pedido.tipo}\n`;

        if (pedido.direccion) {
            mensaje += `Dirección: ${pedido.direccion}\n`;
        }

        mensaje += `Horario: ${pedido.horario}\n`;
        mensaje += `Pago: ${pedido.pago}\n`;

        if (pedido.aclaracion) {
            mensaje += `Aclaración: ${pedido.aclaracion}\n`;
        }

        return mensaje;
    };

    global.OrderMessageUtils = {
        buildWhatsappOrderMessage
    };
})(window);

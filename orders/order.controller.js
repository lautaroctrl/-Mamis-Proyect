(function (global) {
    function obtenerDatosFormularioPedido(doc) {
        return {
            tipo: doc.getElementById('tipo').value,
            direccion: doc.getElementById('direccion').value,
            horario: doc.getElementById('horario').value,
            pago: doc.getElementById('pago').value,
            telefono: doc.getElementById('telefono').value,
            nombre: doc.getElementById('nombre').value,
            aclaracion: doc.getElementById('aclaracion').value
        };
    }

    function resetHorarioPedido(doc) {
        const selectHorario = doc.getElementById('horario');
        if (selectHorario) {
            selectHorario.value = '';
        }
    }

    function resetFormularioPedido(doc) {
        const form = doc.getElementById('form-pedido');
        if (form) {
            form.reset();
        }
    }

    global.OrderController = {
        obtenerDatosFormularioPedido,
        resetHorarioPedido,
        resetFormularioPedido
    };
})(window);

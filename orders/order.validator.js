(function (global) {
    function validarDatosPedido({ datosFormulario, carritoItems, validarTelefonoFn, horarioEsAnteriorActualFn }) {
        if (!datosFormulario.telefono) {
            return { mensaje: 'Teléfono es obligatorio.' };
        }

        const validacionTel = validarTelefonoFn(datosFormulario.telefono);
        if (!validacionTel.valido) {
            return { mensaje: validacionTel.mensaje };
        }

        if (datosFormulario.tipo === 'Envío' && !datosFormulario.direccion) {
            return { mensaje: 'Dirección es obligatoria para Envío.' };
        }

        if (datosFormulario.tipo === 'Retiro' && !datosFormulario.nombre) {
            return { mensaje: 'Nombre es obligatorio para Retiro.' };
        }

        if (!datosFormulario.horario || horarioEsAnteriorActualFn(datosFormulario.horario)) {
            return {
                mensaje: 'Seleccioná un horario válido (igual o posterior a la hora actual).',
                resetHorario: true
            };
        }

        if (carritoItems.length === 0) {
            return { mensaje: 'El carrito está vacío.' };
        }

        return null;
    }

    global.OrderValidator = {
        validarDatosPedido
    };
})(window);

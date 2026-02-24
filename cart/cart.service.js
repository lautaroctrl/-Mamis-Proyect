(function (global) {
    function normalizarItemCarrito(item) {
        return {
            id: item.id,
            nombre: item.nombre,
            ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
            precio: Number(item.precio) || 0,
            cantidad: Math.max(0, Number(item.cantidad) || 0),
            personalizacion: item.personalizacion || ''
        };
    }

    function normalizarCarritoGuardado(carritoGuardado) {
        if (!Array.isArray(carritoGuardado)) {
            return [];
        }

        return carritoGuardado
            .filter(item => item && typeof item.id === 'number')
            .map(normalizarItemCarrito);
    }

    function filtrarItemsConCantidad(carritoItems) {
        return carritoItems.filter(item => item.cantidad > 0);
    }

    global.CartService = {
        normalizarCarritoGuardado,
        filtrarItemsConCantidad
    };
})(window);

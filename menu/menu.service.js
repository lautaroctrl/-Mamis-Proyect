(function (global) {
    function obtenerItemsCategoria(data, categoriaClave) {
        return Array.isArray(data[categoriaClave]) ? data[categoriaClave] : [];
    }

    function obtenerBaseIdCategoria(categoriaClave, baseIds) {
        const baseId = Number(baseIds[categoriaClave]);
        return Number.isFinite(baseId) ? baseId : 2000;
    }

    function obtenerListaIngredientes(producto, esPromo) {
        if (esPromo) {
            return Array.isArray(producto.incluye) ? producto.incluye : [];
        }
        return Array.isArray(producto.ingredientes) ? producto.ingredientes : [];
    }

    function obtenerPrecioProducto(producto, categoriaClave, precios) {
        const precioProducto = Number(producto.precio);
        if (Number.isFinite(precioProducto)) {
            return precioProducto;
        }

        const precioCategoria = Number(precios[categoriaClave]);
        return Number.isFinite(precioCategoria) ? precioCategoria : 0;
    }

    function construirDatosProductoVista({ producto, index, categoriaClave, categoriaTitulo, baseIds, precios }) {
        const esPromo = categoriaClave === 'promos';
        const baseId = obtenerBaseIdCategoria(categoriaClave, baseIds);
        const productoId = Number(producto.id) || (baseId + index + 1);
        const nombreBase = producto.nombre || `${categoriaTitulo.slice(0, -1)} #${productoId}`;
        const nombreCompleto = esPromo
            ? `#${productoId} ${nombreBase}${producto.personas ? ` (personas ${producto.personas})` : ''}`
            : nombreBase;

        return {
            id: productoId,
            nombre: nombreBase,
            nombreCompleto,
            ingredientes: obtenerListaIngredientes(producto, esPromo),
            precio: obtenerPrecioProducto(producto, categoriaClave, precios),
            esPromo,
            detalle: producto.detalle
        };
    }

    function productoCoincideBusqueda(productoVista, busquedaNormalizada, normalizarTextoFn) {
        const nombreNormalizado = normalizarTextoFn(productoVista.nombreCompleto || productoVista.nombre);
        const ingredientesNormalizados = normalizarTextoFn((productoVista.ingredientes || []).join(' '));
        const detalleNormalizado = productoVista.detalle ? normalizarTextoFn(productoVista.detalle) : '';

        return nombreNormalizado.includes(busquedaNormalizada)
            || ingredientesNormalizados.includes(busquedaNormalizada)
            || detalleNormalizado.includes(busquedaNormalizada);
    }

    const api = {
        obtenerItemsCategoria,
        obtenerBaseIdCategoria,
        obtenerListaIngredientes,
        obtenerPrecioProducto,
        construirDatosProductoVista,
        productoCoincideBusqueda
    };
    global.MenuService = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);

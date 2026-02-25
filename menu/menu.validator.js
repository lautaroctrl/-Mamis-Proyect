(function (global) {
    function esBusquedaVacia(busqueda) {
        return !busqueda || String(busqueda).trim() === '';
    }

    const api = {
        esBusquedaVacia
    };
    global.MenuValidator = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);

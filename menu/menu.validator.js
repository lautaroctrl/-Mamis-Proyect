(function (global) {
    function esBusquedaVacia(busqueda) {
        return !busqueda || String(busqueda).trim() === '';
    }

    global.MenuValidator = {
        esBusquedaVacia
    };
})(window);

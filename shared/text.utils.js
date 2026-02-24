(function (global) {
    function normalizarTexto(texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    global.SharedUtils = {
        normalizarTexto
    };
})(window);

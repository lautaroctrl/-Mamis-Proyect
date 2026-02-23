(function exposeTextUtils(global) {
    const normalizeText = (text = '') => text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const validatePhone = (phone = '') => {
        const cleanedPhone = phone.replace(/[\s\-\(\)+]/g, '');

        if (!/^\d+$/.test(cleanedPhone)) {
            return {
                valido: false,
                mensaje: 'El teléfono solo puede contener números.'
            };
        }

        if (cleanedPhone.length < 8 || cleanedPhone.length > 15) {
            return {
                valido: false,
                mensaje: 'El teléfono debe tener entre 8 y 15 dígitos.'
            };
        }

        return {
            valido: true,
            telefono: cleanedPhone
        };
    };

    global.TextUtils = {
        normalizeText,
        validatePhone
    };
})(window);

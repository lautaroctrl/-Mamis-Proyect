const VALID_ORDER_STATES = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];

const isNonEmptyString = (value, maxLength = 255) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
const isOptionalString = (value, maxLength = 255) => value === undefined || value === null || value === '' || isNonEmptyString(value, maxLength);
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isArray = (value) => Array.isArray(value);

const validateOrderIdParam = (params) => {
    const errors = [];

    if (!isNonEmptyString(params.id, 100)) {
        errors.push({ field: 'id', message: 'id de pedido inválido' });
    }

    return errors;
};

const validatePedidoPayload = (payload) => {
    const errors = [];

    if (!isNonEmptyString(payload.id, 100)) {
        errors.push({ field: 'id', message: 'id es requerido y debe ser texto válido' });
    }

    if (!isNonEmptyString(payload.telefono, 30)) {
        errors.push({ field: 'telefono', message: 'telefono es requerido y debe ser texto válido' });
    }

    if (!isNonEmptyString(payload.tipo, 20)) {
        errors.push({ field: 'tipo', message: 'tipo es requerido y debe ser texto válido' });
    }

    if (!isNonEmptyString(payload.horario, 10)) {
        errors.push({ field: 'horario', message: 'horario es requerido y debe ser texto válido' });
    }

    if (!isNonEmptyString(payload.pago, 30)) {
        errors.push({ field: 'pago', message: 'pago es requerido y debe ser texto válido' });
    }

    if (!isArray(payload.productos) || payload.productos.length === 0) {
        errors.push({ field: 'productos', message: 'productos debe ser un arreglo no vacío' });
    }

    if (!isFiniteNumber(payload.total) || payload.total < 0) {
        errors.push({ field: 'total', message: 'total debe ser un número válido mayor o igual a 0' });
    }

    if (!isOptionalString(payload.nombre, 120)) {
        errors.push({ field: 'nombre', message: 'nombre debe ser texto válido' });
    }

    if (!isOptionalString(payload.direccion, 255)) {
        errors.push({ field: 'direccion', message: 'direccion debe ser texto válido' });
    }

    if (!isOptionalString(payload.aclaracion, 500)) {
        errors.push({ field: 'aclaracion', message: 'aclaracion debe ser texto válido' });
    }

    return errors;
};

const validateOrderStatusPayload = (payload) => {
    const errors = [];

    if (!isNonEmptyString(payload.estado, 30)) {
        errors.push({ field: 'estado', message: 'estado es requerido y debe ser texto válido' });
    }

    if (isNonEmptyString(payload.estado, 30) && !VALID_ORDER_STATES.includes(payload.estado)) {
        errors.push({ field: 'estado', message: 'estado inválido' });
    }

    if (!isOptionalString(payload.notas, 1000)) {
        errors.push({ field: 'notas', message: 'notas debe ser texto válido' });
    }

    return errors;
};

const validateOrderNotesPayload = (payload) => {
    const errors = [];

    if (!isNonEmptyString(payload.notas, 1000)) {
        errors.push({ field: 'notas', message: 'notas es requerida y debe ser texto válido' });
    }

    return errors;
};

const validateAdminLoginPayload = (payload) => {
    const errors = [];

    if (!isNonEmptyString(payload.password, 500)) {
        errors.push({ field: 'password', message: 'password es requerido y debe ser texto válido' });
    }

    return errors;
};

const validateEstadoQuery = (query) => {
    const errors = [];
    const estado = query.estado;

    if (estado === undefined || estado === null || estado === '') {
        return errors;
    }

    if (!isNonEmptyString(estado, 30)) {
        errors.push({ field: 'estado', message: 'estado debe ser texto válido' });
        return errors;
    }

    if (estado !== 'todos' && !VALID_ORDER_STATES.includes(estado)) {
        errors.push({ field: 'estado', message: 'estado de filtro inválido' });
    }

    return errors;
};

const orderSchemas = {
    byId: (req) => validateOrderIdParam(req.params || {}),
    create: (req) => validatePedidoPayload(req.body || {}),
    updateStatus: (req) => validateOrderStatusPayload(req.body || {}),
    updateNotes: (req) => validateOrderNotesPayload(req.body || {}),
    list: (req) => validateEstadoQuery(req.query || {})
};

const adminSchemas = {
    login: (req) => validateAdminLoginPayload(req.body || {})
};

module.exports = {
    orderSchemas,
    adminSchemas,
    VALID_ORDER_STATES
};

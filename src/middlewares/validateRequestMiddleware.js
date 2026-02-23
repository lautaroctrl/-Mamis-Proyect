const AppError = require('../utils/appError');

const validateRequest = (schema) => (req, _res, next) => {
    const errors = schema(req);

    if (!Array.isArray(errors) || errors.length === 0) {
        next();
        return;
    }

    next(new AppError('Solicitud inválida', 400, {
        code: 'VALIDATION_ERROR',
        details: errors
    }));
};

module.exports = validateRequest;

const AppError = require('../utils/appError');

const notFoundHandler = (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
};

const errorHandler = (err, _req, res, _next) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err?.message || 'Error interno del servidor';

    if (statusCode >= 500) {
        console.error('Error no manejado:', err);
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};

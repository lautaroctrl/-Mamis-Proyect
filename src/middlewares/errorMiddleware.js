const AppError = require('../utils/appError');
const { isProduction } = require('../config/appConfig');
const logger = require('../utils/logger');

const notFoundHandler = (req, _res, next) => {
    next(new AppError('Ruta no encontrada', 404, {
        code: 'ROUTE_NOT_FOUND',
        details: [{ field: 'path', message: req.originalUrl }]
    }));
};

const errorHandler = (err, req, res, _next) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const isOperational = err instanceof AppError ? err.isOperational : false;
    const requestId = req.requestId || null;

    const logPayload = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode,
        isOperational,
        error: err
    };

    if (statusCode >= 500) {
        logger.error('HTTP request failed', logPayload);
    } else {
        logger.warn('HTTP request failed', logPayload);
    }

    const responseError = {
        success: false,
        error: (isProduction && statusCode >= 500) ? 'Error interno del servidor' : (err?.message || 'Error interno del servidor'),
        code: err?.code || 'INTERNAL_ERROR',
        requestId
    };

    if (err?.details && statusCode < 500) {
        responseError.details = err.details;
    }

    res.status(statusCode).json(responseError);
};

module.exports = {
    notFoundHandler,
    errorHandler
};

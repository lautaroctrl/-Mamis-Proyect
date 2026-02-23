const crypto = require('crypto');
const logger = require('../utils/logger');

const requestContextMiddleware = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    const startedAt = Date.now();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    res.on('finish', () => {
        const durationMs = Date.now() - startedAt;

        logger.info('HTTP request completed', {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            ip: req.ip
        });
    });

    next();
};

module.exports = requestContextMiddleware;

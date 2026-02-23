require('dotenv').config();

const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeNodeEnv = (value) => {
    const env = (value || 'development').toLowerCase();
    if (['development', 'test', 'production'].includes(env)) {
        return env;
    }

    return 'development';
};

const parseCorsOrigins = (value) => {
    if (!value || value.trim() === '*') {
        return '*';
    }

    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
};

const loadClientConfig = () => {
    try {
        const config = require('../../config.js');
        return config?.CONFIG || {};
    } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') {
            console.warn('⚠️ No se pudo cargar config.js:', error.message);
        }

        return {};
    }
};

const nodeEnv = normalizeNodeEnv(process.env.NODE_ENV);
const isProduction = nodeEnv === 'production';

const getAdminPasswordHash = () => {
    const config = loadClientConfig();
    const adminHash = process.env.ADMIN_PASSWORD_HASH || config.adminPasswordHash;

    if (!adminHash && isProduction) {
        throw new Error('ADMIN_PASSWORD_HASH no está definido para producción');
    }

    return adminHash || null;
};

const port = parseNumber(process.env.PORT, 3000);
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '100kb';
const adminSessionDurationMs = parseNumber(process.env.ADMIN_SESSION_DURATION_MS, 30 * 60 * 1000);
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);

if (port <= 0) {
    throw new Error('PORT debe ser un número positivo');
}

if (adminSessionDurationMs <= 0) {
    throw new Error('ADMIN_SESSION_DURATION_MS debe ser mayor a 0');
}

module.exports = {
    port,
    nodeEnv,
    isProduction,
    jsonBodyLimit,
    adminSessionDurationMs,
    corsOrigins,
    logLevel,
    getAdminPasswordHash
};

const { logLevel, isProduction } = require('../config/appConfig');

const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const activeLevel = LEVELS[logLevel] ?? LEVELS.info;

const canLog = (level) => (LEVELS[level] ?? LEVELS.info) <= activeLevel;

const stringifyError = (error) => {
    if (!error) {
        return undefined;
    }

    return {
        name: error.name,
        message: error.message,
        stack: error.stack
    };
};

const emitLog = (level, message, metadata = {}) => {
    if (!canLog(level)) {
        return;
    }

    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...metadata
    };

    if (payload.error instanceof Error) {
        payload.error = stringifyError(payload.error);
    }

    const serialized = JSON.stringify(payload);

    if (level === 'error') {
        console.error(serialized);
        return;
    }

    if (level === 'warn') {
        console.warn(serialized);
        return;
    }

    if (level === 'debug' && isProduction) {
        return;
    }

    console.log(serialized);
};

const logger = {
    info: (message, metadata) => emitLog('info', message, metadata),
    warn: (message, metadata) => emitLog('warn', message, metadata),
    error: (message, metadata) => emitLog('error', message, metadata),
    debug: (message, metadata) => emitLog('debug', message, metadata)
};

module.exports = logger;

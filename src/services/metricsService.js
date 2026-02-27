const { dbRun } = require('../db/sqliteClient');
const AppError = require('../utils/appError');

const normalizeLevel = (level = 'info') => {
    const allowedLevels = ['info', 'warn', 'error'];
    return allowedLevels.includes(level) ? level : 'info';
};

const trackMetricEvent = async ({ eventName, payload = {}, level = 'info', timestamp }) => {
    if (!eventName || typeof eventName !== 'string') {
        throw new AppError('eventName es requerido y debe ser texto válido', 400);
    }

    const eventDate = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(eventDate.getTime())) {
        throw new AppError('timestamp inválido', 400);
    }

    const safePayload = (payload && typeof payload === 'object' && !Array.isArray(payload)) ? payload : {};

    const normalizedLevel = normalizeLevel(level);
    const normalizedTimestamp = eventDate.toISOString();

    const result = await dbRun(
        `
            INSERT INTO metrics_events (event_name, level, payload, timestamp)
            VALUES (?, ?, ?, ?)
        `,
        [
            eventName,
            normalizedLevel,
            JSON.stringify(safePayload),
            normalizedTimestamp
        ]
    );

    return {
        id: result.lastID,
        eventName,
        level: normalizedLevel,
        payload: safePayload,
        timestamp: normalizedTimestamp
    };
};

module.exports = {
    trackMetricEvent
};

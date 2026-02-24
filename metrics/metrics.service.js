(function (global) {
    const METRICS_STORAGE_KEY = 'metrics_events';
    const MAX_EVENTS = 1000;

    function leerEventos(storage) {
        const raw = storage.getItem(METRICS_STORAGE_KEY);
        if (!raw) return [];

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function guardarEventos(storage, eventos) {
        storage.setItem(METRICS_STORAGE_KEY, JSON.stringify(eventos));
    }

    function normalizarNivel(level) {
        const nivelesPermitidos = ['info', 'warn', 'error'];
        return nivelesPermitidos.includes(level) ? level : 'info';
    }

    function trackEvent(eventName, payload = {}, level = 'info', storage = global.localStorage) {
        if (!eventName || typeof eventName !== 'string') {
            throw new Error('eventName es requerido y debe ser string');
        }

        const evento = {
            eventName,
            timestamp: new Date().toISOString(),
            level: normalizarNivel(level),
            payload: (payload && typeof payload === 'object') ? payload : {}
        };

        const eventos = leerEventos(storage);
        eventos.push(evento);

        if (eventos.length > MAX_EVENTS) {
            eventos.splice(0, eventos.length - MAX_EVENTS);
        }

        guardarEventos(storage, eventos);
        return evento;
    }

    function getEvents(storage = global.localStorage) {
        return leerEventos(storage);
    }

    function clearEvents(storage = global.localStorage) {
        storage.removeItem(METRICS_STORAGE_KEY);
    }

    const api = {
        trackEvent,
        getEvents,
        clearEvents,
        METRICS_STORAGE_KEY
    };

    global.MetricsService = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);

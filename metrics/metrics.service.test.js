const { trackEvent, getEvents, clearEvents } = require('./metrics.service');

describe('MetricsService', () => {
  function createMemoryStorage() {
    const store = new Map();
    return {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key)
    };
  }

  it('registra evento válido con timestamp, nivel y payload', () => {
    const storage = createMemoryStorage();
    const evento = trackEvent('ORDER_CREATED', { orderId: 'ORD-1' }, 'info', storage);

    expect(evento.eventName).toBe('ORDER_CREATED');
    expect(evento.level).toBe('info');
    expect(evento.payload).toEqual({ orderId: 'ORD-1' });
    expect(typeof evento.timestamp).toBe('string');

    const eventos = getEvents(storage);
    expect(eventos).toHaveLength(1);
    expect(eventos[0].eventName).toBe('ORDER_CREATED');
  });

  it('normaliza nivel inválido a info', () => {
    const storage = createMemoryStorage();
    const evento = trackEvent('API_ERROR', { status: 500 }, 'otro', storage);
    expect(evento.level).toBe('info');
  });

  it('lanza error cuando eventName es inválido', () => {
    const storage = createMemoryStorage();
    expect(() => trackEvent('', {}, 'info', storage)).toThrow('eventName es requerido y debe ser string');
    expect(() => trackEvent(null, {}, 'info', storage)).toThrow('eventName es requerido y debe ser string');
  });

  it('limpia eventos', () => {
    const storage = createMemoryStorage();
    trackEvent('ORDER_CREATED', {}, 'info', storage);
    expect(getEvents(storage)).toHaveLength(1);
    clearEvents(storage);
    expect(getEvents(storage)).toHaveLength(0);
  });
});

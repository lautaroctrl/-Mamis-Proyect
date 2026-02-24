const { normalizarTexto } = require('./text.utils');

describe('SharedUtils.normalizarTexto', () => {
  it('normaliza acentos y mayúsculas', () => {
    expect(normalizarTexto('ÁrBol Ñandú')).toBe('arbol nandu');
  });

  it('maneja valores vacíos, null y undefined', () => {
    expect(normalizarTexto('')).toBe('');
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(undefined)).toBe('');
  });
});

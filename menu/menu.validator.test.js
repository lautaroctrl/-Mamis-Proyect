const { esBusquedaVacia } = require('./menu.validator');

describe('MenuValidator.esBusquedaVacia', () => {
  it('devuelve true para null, undefined y vacío', () => {
    expect(esBusquedaVacia(null)).toBe(true);
    expect(esBusquedaVacia(undefined)).toBe(true);
    expect(esBusquedaVacia('')).toBe(true);
    expect(esBusquedaVacia('   ')).toBe(true);
  });

  it('devuelve false para texto válido', () => {
    expect(esBusquedaVacia('pizza')).toBe(false);
  });
});

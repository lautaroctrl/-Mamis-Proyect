const { normalizarCarritoGuardado, filtrarItemsConCantidad } = require('./cart.service');

describe('CartService', () => {
  it('normaliza carrito válido y filtra entradas inválidas', () => {
    const carrito = normalizarCarritoGuardado([
      { id: 1, nombre: 'Simple', ingredientes: 'x', precio: '1000', cantidad: '2' },
      null,
      { id: '2', nombre: 'Mixto', precio: 1300, cantidad: 1 }
    ]);

    expect(carrito).toHaveLength(1);
    expect(carrito[0]).toMatchObject({
      id: 1,
      precio: 1000,
      cantidad: 2,
      ingredientes: []
    });
  });

  it('devuelve array vacío ante input no array', () => {
    expect(normalizarCarritoGuardado(null)).toEqual([]);
    expect(normalizarCarritoGuardado(undefined)).toEqual([]);
  });

  it('filtra solo items con cantidad > 0', () => {
    const filtrado = filtrarItemsConCantidad([
      { id: 1, cantidad: 0 },
      { id: 2, cantidad: 2 }
    ]);

    expect(filtrado).toEqual([{ id: 2, cantidad: 2 }]);
  });
});

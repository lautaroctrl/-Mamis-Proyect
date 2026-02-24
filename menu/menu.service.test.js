const {
  obtenerItemsCategoria,
  obtenerPrecioProducto,
  construirDatosProductoVista,
  productoCoincideBusqueda
} = require('./menu.service');

describe('MenuService', () => {
  it('obtiene items de una categoría o array vacío', () => {
    expect(obtenerItemsCategoria({ pizzas: [{ nombre: 'Pizza' }] }, 'pizzas')).toHaveLength(1);
    expect(obtenerItemsCategoria({}, 'pizzas')).toEqual([]);
  });

  it('calcula precio de producto con fallback por categoría', () => {
    const precios = { pizzas: 6000 };
    expect(obtenerPrecioProducto({ precio: 7500 }, 'pizzas', precios)).toBe(7500);
    expect(obtenerPrecioProducto({}, 'pizzas', precios)).toBe(6000);
  });

  it('construye vista de producto promo correctamente', () => {
    const productoVista = construirDatosProductoVista({
      producto: { id: 7, nombre: 'Bandeja', personas: 4, incluye: ['Triples'] },
      index: 0,
      categoriaClave: 'promos',
      categoriaTitulo: 'Promos',
      baseIds: { promos: 0 },
      precios: { promos: 0 }
    });

    expect(productoVista.nombreCompleto).toContain('(personas 4)');
    expect(productoVista.ingredientes).toEqual(['Triples']);
    expect(productoVista.esPromo).toBe(true);
  });

  it('evalúa coincidencia de búsqueda normalizada', () => {
    const productoVista = {
      nombre: 'Pizza Napolitana',
      nombreCompleto: 'Pizza Napolitana',
      ingredientes: ['Tomate', 'Queso'],
      detalle: 'Con orégano'
    };
    const normalizar = (txt) => txt.toLowerCase();

    expect(productoCoincideBusqueda(productoVista, 'napo', normalizar)).toBe(true);
    expect(productoCoincideBusqueda(productoVista, 'oregano', normalizar)).toBe(false);
  });
});

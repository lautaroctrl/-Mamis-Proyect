const {
  obtenerSiguienteIdPedido,
  construirPedido,
  construirUrlWhatsApp
} = require('./order.service');

describe('OrderService', () => {
  it('calcula el siguiente ID de pedido correctamente', () => {
    const pedidos = [{ id: 'ORD-1' }, { id: 'ORD-7' }, { id: 'ORD-3' }];
    expect(obtenerSiguienteIdPedido(pedidos)).toBe('ORD-8');
  });

  it('construye pedido con total y productos transformados', () => {
    const pedido = construirPedido({
      id: 'ORD-2',
      datosFormulario: {
        telefono: '3425000000',
        nombre: 'Ana',
        tipo: 'Retiro',
        direccion: '',
        horario: '18:30',
        pago: 'Efectivo',
        aclaracion: 'sin cebolla'
      },
      carritoItems: [
        { id: 1, nombre: 'Simple', ingredientes: ['Queso'], cantidad: 2, precio: 1000, personalizacion: 'extra queso' },
        { id: 2, nombre: 'Mixto', ingredientes: ['Jamón'], cantidad: 1, precio: 1300 }
      ],
      fecha: new Date('2026-02-24T10:00:00.000Z')
    });

    expect(pedido.id).toBe('ORD-2');
    expect(pedido.total).toBe(3300);
    expect(pedido.productos).toHaveLength(2);
    expect(pedido.productos[0].personalizacion).toBe('extra queso');
    expect(pedido.productos[1].personalizacion).toBe('');
  });

  it('lanza error con input inválido crítico', () => {
    expect(() => construirPedido({
      id: 'ORD-3',
      datosFormulario: {},
      carritoItems: null,
      fecha: new Date()
    })).toThrow();
  });

  it('genera URL de WhatsApp codificada', () => {
    const url = construirUrlWhatsApp('543425907922', '🧾 Orden: ORD-1');
    expect(url).toContain('https://wa.me/543425907922?text=');
    expect(url).toContain('%F0%9F%A7%BE');
  });
});

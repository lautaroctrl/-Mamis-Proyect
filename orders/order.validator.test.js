const { validarDatosPedido } = require('./order.validator');

describe('OrderValidator.validarDatosPedido', () => {
  const validarTelefonoOk = () => ({ valido: true });
  const validarTelefonoFail = () => ({ valido: false, mensaje: 'Teléfono inválido' });
  const horarioValido = () => false;
  const horarioInvalido = () => true;

  it('retorna error si falta teléfono', () => {
    const resultado = validarDatosPedido({
      datosFormulario: { telefono: '', tipo: 'Retiro' },
      carritoItems: [{ cantidad: 1 }],
      validarTelefonoFn: validarTelefonoOk,
      horarioEsAnteriorActualFn: horarioValido
    });

    expect(resultado).toEqual({ mensaje: 'Teléfono es obligatorio.' });
  });

  it('retorna error si el teléfono es inválido', () => {
    const resultado = validarDatosPedido({
      datosFormulario: { telefono: 'abc', tipo: 'Retiro' },
      carritoItems: [{ cantidad: 1 }],
      validarTelefonoFn: validarTelefonoFail,
      horarioEsAnteriorActualFn: horarioValido
    });

    expect(resultado).toEqual({ mensaje: 'Teléfono inválido' });
  });

  it('retorna error si tipo envío no tiene dirección', () => {
    const resultado = validarDatosPedido({
      datosFormulario: { telefono: '3425000000', tipo: 'Envío', direccion: '', horario: '12:00' },
      carritoItems: [{ cantidad: 1 }],
      validarTelefonoFn: validarTelefonoOk,
      horarioEsAnteriorActualFn: horarioValido
    });

    expect(resultado).toEqual({ mensaje: 'Dirección es obligatoria para Envío.' });
  });

  it('retorna error y resetHorario si horario es inválido', () => {
    const resultado = validarDatosPedido({
      datosFormulario: { telefono: '3425000000', tipo: 'Retiro', nombre: 'Ana', horario: '10:30' },
      carritoItems: [{ cantidad: 1 }],
      validarTelefonoFn: validarTelefonoOk,
      horarioEsAnteriorActualFn: horarioInvalido
    });

    expect(resultado).toEqual({
      mensaje: 'Seleccioná un horario válido (igual o posterior a la hora actual).',
      resetHorario: true
    });
  });

  it('retorna null cuando datos son válidos', () => {
    const resultado = validarDatosPedido({
      datosFormulario: {
        telefono: '3425000000',
        tipo: 'Retiro',
        nombre: 'Ana',
        horario: '18:30',
        direccion: ''
      },
      carritoItems: [{ cantidad: 1 }],
      validarTelefonoFn: validarTelefonoOk,
      horarioEsAnteriorActualFn: horarioValido
    });

    expect(resultado).toBeNull();
  });
});

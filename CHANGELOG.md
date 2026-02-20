# Changelog

Este archivo registra los cambios funcionales del proyecto.
A partir de ahora, cada cambio nuevo debe agregarse aquí antes de hacer push.

## 2026-02-20

### Mejoras de carrito y UI
- Se corrigió el cálculo/actualización del total del carrito agregando la función `calcularTotal`.
- Se implementó comportamiento tipo acordeón en categorías: solo una categoría puede estar abierta a la vez.

### Formulario de pedido
- Se restringió el horario a franjas válidas:
  - 10:30 a 14:00
  - 18:30 a 22:45
- Se cambió el selector de horario para que las opciones avancen de 5 en 5 minutos.
- Se agregó el campo opcional **Aclaración** debajo de Teléfono.
- Se agregó disclaimer debajo de Horario: “El horario puede variar según el trabajo que haya”.
- Se ajustó el campo Aclaración para que tenga el mismo ancho que el resto de los campos.
- Se bloqueó el redimensionado manual del campo Aclaración (`resize: none`).

### Datos de productos
- Se eliminó el catálogo hardcodeado en JavaScript.
- Los productos ahora se cargan dinámicamente desde `productos.json` usando `fetch`.
- Se agregaron validaciones de carga y mensaje de error en UI si falla la lectura del archivo.

### Persistencia
- Se implementó persistencia del carrito en `localStorage`.
- El carrito se restaura al abrir la app y se limpia correctamente al finalizar un pedido.

### Admin y seguridad (frontend)
- Se dejó de comparar contraseña en texto plano directo.
- Se implementó validación por hash SHA-256 en cliente.
- Se agregó límite de intentos fallidos de login de admin.
- Se agregó bloqueo temporal por múltiples intentos fallidos.
- Se agregó sesión admin temporal con expiración.

### Pedidos y salidas
- La aclaración opcional se guarda en el pedido.
- La aclaración opcional se incluye en el mensaje de WhatsApp si fue cargada.
- La aclaración opcional se muestra en el panel admin.

### Testing
- Se ejecutaron pruebas E2E con Playwright y el flujo básico quedó pasando.

### Cobertura de tests (nueva)
- Se agregó setup `beforeEach` para limpiar `localStorage` y aislar escenarios E2E.
- Se agregó test para verificar que el pedido incluya la aclaración en el enlace/mensaje de WhatsApp.
- Se agregó test para validar que el selector de horario solo acepte opciones válidas.
- Se agregó test para bloqueo temporal del panel admin tras múltiples intentos fallidos.
- La suite E2E quedó pasando con 4 tests exitosos.

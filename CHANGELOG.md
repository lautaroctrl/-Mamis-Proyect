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

### UX del formulario (nueva)
- Se reemplazaron los `alert` de validación del formulario de pedido por mensajes visuales inline.
- Se agregó contenedor accesible de feedback (`aria-live`) dentro del formulario.
- Se agregaron estilos para estado de error y éxito en mensajes del formulario.
- El mensaje de feedback se limpia automáticamente cuando el usuario vuelve a editar campos.

### UX de carrito (nueva)
- Se agregó feedback visual al agregar producto: el botón muestra `Agregado ✓` y una micro-animación.
- Se agregó animación breve en la sección del carrito para confirmar que el item se sumó correctamente.
- Se ajustó el botón de agregar para no cambiar su texto durante la animación, evitando movimiento visual.

### Productos (nueva)
- Se normalizó `productos.json` para dejar un único objeto raíz válido.
- Se integraron `hamburguesas` y `lomitos` con el mismo formato que el resto de categorías (`id` + `ingredientes`).
- Se actualizó la carga de productos para renderizar las nuevas categorías en la interfaz.
- Se añadieron precios base para `hamburguesas` y `lomitos`.
- Se acomodaron nuevos bloques de catálogo (`salchichas_calientes`, `super_panchos`, `sandwich_milanesa`, `pizzas`, `fugazzas`, `tartas`, `empanadas`, `promos`) dentro del mismo objeto JSON para mantener formato y validez.
- Se ajustó el orden de visualización para mostrar `promos` al inicio de la lista de categorías.
- Se fortaleció el render de categorías para soportar productos con `nombre` personalizado, con/sin `id` y con/sin `ingredientes`.
- Render específico para `promos`: muestra `id`, nombre y `(personas X)` cuando aplica; usa `incluye` como ingredientes.
- En `promos`, la etiqueta visual se ajustó de `Ingredientes` a `Incluye`.
- La promo `id=7` se muestra solo con `id`, nombre y `detalle`.
- Se agregaron precios individuales en `promos` y el render ahora prioriza `producto.precio` sobre el precio base de categoría.

### Búsqueda de productos (nueva)
- Se agregó campo de búsqueda en tiempo real en la sección de productos.
- La búsqueda filtra por nombre de producto, ingredientes/incluye y detalles.
- Se implementó normalización de texto (sin acentos, case-insensitive) para mejorar la precisión.
- La búsqueda muestra contador de resultados encontrados.
- Los resultados incluyen badge visual con el nombre de la categoría de origen.
- Al borrar la búsqueda, se restaura la vista normal de categorías tipo acordeón.
- Se agregaron estilos con feedback visual (estados focus, resultados, sin resultados).

# Changelog

Este archivo registra los cambios funcionales del proyecto.
A partir de ahora, cada cambio nuevo debe agregarse aquí antes de hacer push.

## 2026-02-21

### Mejoras UX de media prioridad

#### Estado visual de categorías
- Agregados iconos ▶/▼ a los títulos de categoría para indicar estado abierto/cerrado.
- El icono cambia dinámicamente al abrir/cerrar categorías.
- Efecto hover en los títulos de categoría para mejor feedback visual.
- Transición suave en el cambio de iconos.

#### Generación dinámica de horarios
- Eliminadas 104 opciones hardcodeadas del HTML.
- Horarios ahora se generan dinámicamente con JavaScript.
- Configuración basada en rangos (10:30-14:00 y 18:30-22:45).
- Incrementos de 5 minutos generados automáticamente.
- Más fácil de mantener y modificar en el futuro.

#### Personalización de productos
- Agregado campo de texto opcional en cada producto para personalizaciones.
- Los clientes pueden especificar modificaciones (ej: "sin cebolla", "extra queso").
- Las personalizaciones se muestran en el carrito con estilo especial.
- Productos con diferentes personalizaciones se tratan como items separados en el carrito.
- Las personalizaciones se incluyen en el mensaje de WhatsApp.
- Campo se limpia automáticamente después de agregar al carrito.

### Refactorización de código y mejoras UX

#### Refactorización de código duplicado
- Se creó función compartida `crearElementoProducto()` para renderizar productos.
- Se eliminó duplicación de ~60 líneas entre `renderCategoria()` y `filtrarProductos()`.
- Mejorada la mantenibilidad del código al centralizar la lógica de renderizado.

#### Eliminación de funciones globales
- Se reemplazaron `onclick` en HTML generado por event listeners en `actualizarCarrito()`.
- Los botones de incrementar/decrementar cantidad ahora usan addEventListener.
- Mejor aislamiento del código y prácticas más modernas de JavaScript.

#### Indicador de carga visual
- Se agregó spinner animado mientras se cargan los productos.
- Feedback visual claro al usuario durante la carga inicial.
- El spinner se oculta automáticamente al completar la carga o en caso de error.
- Estilos CSS con animación de rotación suave.

### Refactorización y mejoras de configuración
- Se externalizó la configuración a `config.js` para facilitar la personalización.
- Se creó `config.example.js` como plantilla de configuración.
- Se eliminaron constantes hardcodeadas (número de WhatsApp, hash de contraseña, duraciones).
- Se implementó función `getConfig()` para acceder a la configuración de manera centralizada.
- Se agregó `.gitignore` para proteger `config.js` y evitar exponer credenciales.

### Mejoras de funcionalidad
- **Auto-eliminación de productos**: Los productos con cantidad 0 ahora se eliminan automáticamente del carrito.
- **Validación de teléfono**: Se agregó validación del formato de teléfono (8-15 dígitos).
- La validación acepta espacios, guiones y paréntesis que se normalizan automáticamente.

### Documentación
- Se agregó `README.md` completo con:
  - Instrucciones de instalación y ejecución
  - Documentación de características
  - Guía de configuración
  - Guía de personalización
  - Comandos de testing
  - Estructura del proyecto
  - Información de seguridad

### Scripts y desarrollo
- Se renombró el proyecto de "nueva-carpeta" a "sistema-pedidos-comida".
- Se agregaron scripts npm para desarrollo:
  - `npm start`: Inicia servidor local en puerto 8000
  - `npm test`: Ejecuta tests E2E
  - `npm run test:ui`: Tests con interfaz gráfica
  - `npm run test:headed`: Tests en modo visual
  - `npm run test:debug`: Tests en modo debug
- Se agregó `http-server` como dependencia de desarrollo para servir la aplicación localmente.

### Configuración del proyecto
- Se actualizó `package.json` con metadata descriptiva y keywords.
- Se agregó `config.js` a `index.html` antes de `script.js` para asegurar disponibilidad.

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

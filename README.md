# Sistema de Pedidos de Comida

Aplicación web para gestionar pedidos de comida con integración a WhatsApp.

## 📋 Características

- 📦 Catálogo de productos organizado por categorías
- 🔍 Búsqueda de productos por nombre e ingredientes
- 🛒 Carrito de compras con persistencia en LocalStorage
- 📱 Envío automático de pedidos por WhatsApp
- 👨‍💼 Panel de administración con historial de pedidos
- 🔒 Sistema de autenticación para administradores
- 📊 Exportación de pedidos en formato JSON
## 📈 Métricas

Las métricas se registran con:

- `POST /api/metrics/events`

Y se almacenan en SQLite, tabla:

- `metrics_events` en `database.db`

Cada evento guarda `eventName`, `level`, `payload` y `timestamp`.

### Retención automática de métricas

- Se eliminan métricas antiguas automáticamente según `METRICS_RETENTION_DAYS`.

### Backup automático de SQLite

- Se crea backup periódico de `database.db` en la carpeta `backups/`.
- Frecuencia configurable con `DB_BACKUP_INTERVAL_HOURS`.
- Limpieza automática de backups viejos con `DB_BACKUP_RETENTION_DAYS`.

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd "Nueva carpeta"
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura la aplicación:
   - Copia `config.example.js` a `config.js`
   - Edita `config.js` con tu configuración:
     - Número de WhatsApp de destino
     - Contraseña del panel admin

## 🏃 Ejecución

### Backend (recomendado)

Inicia el servidor local:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Servidor estático (solo frontend)

Si solo necesitas servir archivos estáticos (sin API):

```bash
npm run start:static
```

Disponible en `http://localhost:8000`

### Modo Producción

El frontend vive en la carpeta `public/` y se sirve desde Express.

## 🧪 Tests

Ejecuta los tests E2E con Playwright:

```bash
# Asegúrate de tener el servidor corriendo en otra terminal
npm start

# En otra terminal, ejecuta los tests
npm test
```

## 📁 Estructura del Proyecto

```
.
├── server.js              # Arranque del backend
├── src/                   # Backend Express modular
├── public/                # Frontend servido por Express
├── database.db            # SQLite (pedidos, sesiones, métricas)
├── config.js              # Configuración (crear desde config.example.js)
├── config.example.js      # Plantilla de configuración
├── package.json           # Dependencias y scripts
├── tests/
│   └── e2e.spec.js       # Tests end-to-end
└── README.md             # Este archivo
```

## ⚙️ Configuración

### config.js

```javascript
const CONFIG = {
    whatsappNumber: '543425XXXXXX',  // Tu número de WhatsApp
    adminPasswordHash: 'hash_aqui'    // Hash SHA-256 de tu contraseña
};
```

### Generar hash de contraseña

Abre la consola del navegador y ejecuta:

```javascript
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

hashPassword('tu_contraseña').then(console.log);
```

## 📝 Uso

### Para Clientes

1. Navega por las categorías de productos
2. Usa el buscador para encontrar productos específicos
3. Agrega productos al carrito
4. Completa el formulario de pedido
5. Envía el pedido por WhatsApp

### Para Administradores

1. Haz clic en el botón "Admin" (esquina inferior derecha)
2. Ingresa la contraseña configurada
3. Accede al historial de pedidos
4. Exporta pedidos en JSON o limpia el historial

## 🔧 Personalización

### Modificar Productos

Edita `public/productos.json` para agregar, modificar o eliminar productos. La estructura es:

```json
{
  "categoria": [
    {
      "id": 1,
      "nombre": "Nombre del producto",
      "ingredientes": ["Ingrediente 1", "Ingrediente 2"],
      "precio": 1000
    }
  ]
}
```

### Modificar Precios Base

En `public/script.js`, busca el objeto `PRECIOS` y modifica los valores por categoría.

### Modificar Horarios

Los horarios se generan dinámicamente en `public/script.js`.
Busca la función `generarOpcionesHorario()` para ajustar rangos y frecuencia.

## 🛡️ Seguridad

- La contraseña del admin se almacena como hash SHA-256
- Las sesiones de admin expiran después de 30 minutos
- Sistema de bloqueo temporal tras 5 intentos fallidos
- Los datos se almacenan localmente en el navegador (LocalStorage)

**⚠️ Nota:** Esta aplicación está diseñada para uso en entorno confiable. Para producción, considera implementar autenticación del lado del servidor.

## 🐛 Problemas Conocidos

- `config.js` cliente puede exponer datos no sensibles si no se revisa su contenido

## 📄 Licencia

ISC

## 👨‍💻 Autor

[Tu Nombre]

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

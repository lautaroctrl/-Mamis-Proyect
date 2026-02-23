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

### Modo Desarrollo

Inicia el servidor local:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:8000`

### Modo Producción

Simplemente sube los archivos a tu servidor web. Los archivos necesarios son:
- `index.html`
- `script.js`
- `styles.css`
- `productos.json`
- `config.js` (con tu configuración)

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
├── index.html              # Página principal
├── script.js              # Lógica de la aplicación
├── styles.css             # Estilos
├── productos.json         # Catálogo de productos
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

Edita `productos.json` para agregar, modificar o eliminar productos. La estructura es:

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

En `script.js`, busca el objeto `PRECIOS` y modifica los valores por categoría.

### Modificar Horarios

Los horarios se encuentran en `index.html` dentro del select `#horario`.

## 🛡️ Seguridad

- La contraseña del admin se almacena como hash SHA-256
- Las sesiones de admin expiran después de 30 minutos
- Sistema de bloqueo temporal tras 5 intentos fallidos
- Los datos se almacenan localmente en el navegador (LocalStorage)

**⚠️ Nota:** Esta aplicación está diseñada para uso en entorno confiable. Para producción, considera implementar autenticación del lado del servidor.

## 🐛 Problemas Conocidos

- Las variables de configuración están en el cliente (visible en el código)
- No hay validación del lado del servidor
- Los pedidos se almacenan solo en LocalStorage del navegador

## 📄 Licencia

ISC

## 👨‍💻 Autor

[Tu Nombre]

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

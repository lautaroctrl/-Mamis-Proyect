// Variables globales
let productos = [];
let carrito = [];

const CARRITO_STORAGE_KEY = 'carrito';
const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_LOCK_UNTIL_KEY = 'admin_lock_until';
const ADMIN_FAIL_COUNT_KEY = 'admin_fail_count';
const ADMIN_SESSION_DURATION_MS = 30 * 60 * 1000;
const ADMIN_LOCK_DURATION_MS = 5 * 60 * 1000;
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// Precios base por categoría
const PRECIOS = {
    promos: 0,
  simples: 1000,
  mixtos: 1300,
  triples: 1600,
    especiales: 1800,
    hamburguesas: 2200,
    lomitos: 2600,
    salchichas_calientes: 1800,
    super_panchos: 2000,
    sandwich_milanesa: 2800,
    pizzas: 6000,
    fugazzas: 3200,
    tartas: 3500,
    empanadas: 1000
};

const CATEGORIAS = [
    { clave: 'promos', titulo: 'Promos' },
        { clave: 'simples', titulo: 'Simples' },
        { clave: 'mixtos', titulo: 'Mixtos' },
        { clave: 'triples', titulo: 'Triples' },
        { clave: 'especiales', titulo: 'Tostados' },
        { clave: 'hamburguesas', titulo: 'Hamburguesas' },
        { clave: 'lomitos', titulo: 'Lomitos' },
        { clave: 'salchichas_calientes', titulo: 'Salchichas Calientes' },
        { clave: 'super_panchos', titulo: 'Super Panchos' },
        { clave: 'sandwich_milanesa', titulo: 'Sándwich Milanesa' },
        { clave: 'pizzas', titulo: 'Pizzas' },
        { clave: 'fugazzas', titulo: 'Fugazzas' },
        { clave: 'tartas', titulo: 'Tartas' },
        { clave: 'empanadas', titulo: 'Empanadas' }
];

const BASE_ID_CATEGORIA = {
    promos: 0,
        simples: 0,
        mixtos: 100,
        triples: 200,
        especiales: 300,
        hamburguesas: 400,
        lomitos: 500,
        salchichas_calientes: 600,
        super_panchos: 700,
        sandwich_milanesa: 800,
        pizzas: 900,
        fugazzas: 1000,
        tartas: 1100,
        empanadas: 1200
};

// Cargar productos
async function cargarProductos() {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';

    try {
        const response = await fetch('productos.json');
        if (!response.ok) {
            throw new Error(`No se pudo cargar productos.json (${response.status})`);
        }

        const data = await response.json();
        productos = data;

        CATEGORIAS.forEach(categoria => {
            const items = data[categoria.clave] || [];
            if (items.length > 0) {
                renderCategoria(categoria.titulo, items, categoria.clave);
            }
        });
    } catch (error) {
        container.innerHTML = '<p>Error al cargar productos. Intentá recargar la página.</p>';
        console.error(error);
    }
}

function guardarCarrito() {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
}

function cargarCarrito() {
    const carritoGuardado = JSON.parse(localStorage.getItem(CARRITO_STORAGE_KEY)) || [];
    if (!Array.isArray(carritoGuardado)) {
        carrito = [];
        return;
    }

    carrito = carritoGuardado
        .filter(item => item && typeof item.id === 'number')
        .map(item => ({
            id: item.id,
            nombre: item.nombre,
            ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
            precio: Number(item.precio) || 0,
            cantidad: Math.max(0, Number(item.cantidad) || 0)
        }));
}

// Renderizar categoría
function renderCategoria(nombreVisible, productosArray, tipoInterno) {
    const container = document.getElementById('productos-container');
    const section = document.createElement('section');
    const h2 = document.createElement('h2');
    h2.textContent = nombreVisible;
    h2.style.cursor = 'pointer';
    h2.style.userSelect = 'none';
    section.appendChild(h2);
    
    const productosDiv = document.createElement('div');
    productosDiv.className = 'productos-categoria';
    productosDiv.style.display = 'none';
    
    const baseId = BASE_ID_CATEGORIA[tipoInterno] || 2000;

    productosArray.forEach((producto, index) => {
        const div = document.createElement('div');
        div.className = 'producto';
        const productoId = Number(producto.id) || (baseId + index + 1);
        const esPromo = tipoInterno === 'promos';
        const esPromoSiete = esPromo && productoId === 7;
        const nombreBase = producto.nombre || `${nombreVisible.slice(0, -1)} #${productoId}`;
        const nombre = esPromo
            ? `#${productoId} ${nombreBase}${producto.personas ? ` (personas ${producto.personas})` : ''}`
            : nombreBase;
        const ingredientesLista = esPromo
            ? (Array.isArray(producto.incluye) ? producto.incluye : [])
            : (Array.isArray(producto.ingredientes) ? producto.ingredientes : []);
        const ingredientes = ingredientesLista.join(', ');
        const precio = PRECIOS[tipoInterno];
        const mostrarPrecio = typeof precio === 'number' && precio > 0;
        const infoDiv = document.createElement('div');
        if (esPromoSiete) {
            infoDiv.innerHTML = `
            <h3>${nombre}</h3>
            ${producto.detalle ? `<p>Detalle: ${producto.detalle}</p>` : ''}
            ${mostrarPrecio ? `<p>$${precio}</p>` : ''}
        `;
        } else {
            infoDiv.innerHTML = ingredientes
                ? `
            <h3>${nombre}</h3>
            <p>Ingredientes: ${ingredientes}</p>
            ${mostrarPrecio ? `<p>$${precio}</p>` : ''}
        `
                : `
            <h3>${nombre}</h3>
            ${mostrarPrecio ? `<p>$${precio}</p>` : ''}
        `;
        }
        div.appendChild(infoDiv);
        
        const button = document.createElement('button');
        button.textContent = 'Agregar al carrito';
        button.addEventListener('click', () => {
            const ingredientesCarrito = esPromoSiete
                ? (producto.detalle ? [producto.detalle] : [])
                : ingredientesLista;
            agregarAlCarrito(productoId, nombreBase, ingredientesCarrito, precio || 0);
            animarBotonAgregado(button);
        });
        div.appendChild(button);
        
        productosDiv.appendChild(div);
    });
    
    h2.addEventListener('click', () => {
        const isOpen = productosDiv.style.display === 'block';
        // Cerrar todas las categorías abiertas
        const todasLasCategorias = document.querySelectorAll('.productos-categoria');
        todasLasCategorias.forEach(cat => {
            cat.style.display = 'none';
        });
        // Si no estaba abierta, abrirla
        if (!isOpen) {
            productosDiv.style.display = 'block';
        }
    });
    
    section.appendChild(productosDiv);
    container.appendChild(section);
}

// Agregar producto al carrito
function agregarAlCarrito(id, nombre, ingredientes, precio) {
    const item = carrito.find(i => i.id === id);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            ingredientes: ingredientes,
            precio: precio,
            cantidad: 1
        });
    }
    actualizarCarrito();
    guardarCarrito();
    animarCarritoActualizado();
}

function animarBotonAgregado(button) {
    if (!button) return;

    button.classList.remove('agregado');
    void button.offsetWidth;
    button.classList.add('agregado');

    setTimeout(() => {
        button.classList.remove('agregado');
    }, 350);
}

function animarCarritoActualizado() {
    const carritoSection = document.getElementById('carrito');
    if (!carritoSection) return;

    carritoSection.classList.remove('carrito-actualizado');
    void carritoSection.offsetWidth;
    carritoSection.classList.add('carrito-actualizado');

    setTimeout(() => {
        carritoSection.classList.remove('carrito-actualizado');
    }, 500);
}

// Actualizar vista del carrito
function actualizarCarrito() {
    const lista = document.getElementById('lista-carrito');
    lista.innerHTML = '';
    carrito.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-carrito';
        
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <h4>${item.nombre}</h4>
            <p>Ingredientes: ${item.ingredientes.join(', ')}</p>
            <p>Precio unitario: $${item.precio}</p>
        `;
        div.appendChild(infoDiv);
        
        const controlesDiv = document.createElement('div');
        controlesDiv.className = 'controles-cantidad';
        controlesDiv.innerHTML = `
            <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
        `;
        div.appendChild(controlesDiv);
        
        const eliminarBtn = document.createElement('button');
        eliminarBtn.className = 'btn-eliminar';
        eliminarBtn.innerHTML = '🗑️';
        eliminarBtn.setAttribute('aria-label', 'Eliminar producto');
        eliminarBtn.addEventListener('click', () => eliminarDelCarrito(item.id));
        div.appendChild(eliminarBtn);
        
        lista.appendChild(div);
    });
    calcularTotal();
}

// Calcular y mostrar el total del carrito
function calcularTotal() {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    document.getElementById('total').textContent = total;
}

// Cambiar cantidad de producto en carrito
function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad < 0) item.cantidad = 0;
        actualizarCarrito();
        guardarCarrito();
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(id) {
    const index = carrito.findIndex(item => item.id === id);
    if (index > -1) {
        carrito.splice(index, 1);
        actualizarCarrito();
        guardarCarrito();
    }
}

function mostrarMensajeFormulario(texto, tipo = 'error') {
    const mensaje = document.getElementById('mensaje-form');
    mensaje.textContent = texto;
    mensaje.className = `mensaje-form ${tipo}`;
}

function limpiarMensajeFormulario() {
    const mensaje = document.getElementById('mensaje-form');
    mensaje.textContent = '';
    mensaje.className = 'mensaje-form oculto';
}

// Generar pedido y enviar a WhatsApp
function generarPedido(event) {
    event.preventDefault();
    limpiarMensajeFormulario();

    const tipo = document.getElementById('tipo').value;
    const direccion = document.getElementById('direccion').value;
    const horario = document.getElementById('horario').value;
    const pago = document.getElementById('pago').value;
    const telefono = document.getElementById('telefono').value;
    const nombre = document.getElementById('nombre').value;
    const aclaracion = document.getElementById('aclaracion').value;

    // Validaciones
    if (!telefono) {
        mostrarMensajeFormulario('Teléfono es obligatorio.');
        return;
    }
    if (tipo === 'Envío' && !direccion) {
        mostrarMensajeFormulario('Dirección es obligatoria para Envío.');
        return;
    }
    if (tipo === 'Retiro' && !nombre) {
        mostrarMensajeFormulario('Nombre es obligatorio para Retiro.');
        return;
    }
    if (carrito.length === 0) {
        mostrarMensajeFormulario('El carrito está vacío.');
        return;
    }

    // Filtrar productos con cantidad > 0
    const carritoFiltrado = carrito.filter(item => item.cantidad > 0);
    if (carritoFiltrado.length === 0) {
        mostrarMensajeFormulario('No hay productos con cantidad válida en el carrito.');
        return;
    }

    // Generar ID secuencial
    const pedidosExistentes = obtenerPedidos();
    let maxId = 0;
    pedidosExistentes.forEach(p => {
        const num = parseInt(p.id.replace('ORD-', ''));
        if (num > maxId) maxId = num;
    });
    const newId = 'ORD-' + (maxId + 1);

    const pedido = {
        id: newId,
        telefono: telefono,
        nombre: nombre,
        tipo: tipo,
        direccion: direccion,
        horario: horario,
        pago: pago,
        aclaracion: aclaracion,
        productos: carritoFiltrado.map(item => ({
            id: item.id,
            nombre: item.nombre,
            ingredientes: item.ingredientes,
            cantidad: item.cantidad,
            precio: item.precio
        })),
        total: carritoFiltrado.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
        fecha: new Date()
    };

    guardarPedido(pedido);
    const mensaje = generarMensajeWhatsApp(pedido);
    enviarWhatsApp(mensaje);

    // Limpiar carrito y formulario
    carrito = [];
    actualizarCarrito();
    guardarCarrito();
    document.getElementById('form-pedido').reset();
    mostrarMensajeFormulario('Pedido generado correctamente. Se abrió WhatsApp para enviar el mensaje.', 'success');
}

// Guardar pedido en localStorage
function guardarPedido(pedido) {
    const pedidos = obtenerPedidos();
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

// Obtener pedidos de localStorage
function obtenerPedidos() {
    return JSON.parse(localStorage.getItem('pedidos')) || [];
}

// Generar mensaje para WhatsApp
function generarMensajeWhatsApp(pedido) {
    let mensaje = `🧾 Pedido: ${pedido.id}\n\n`;
    mensaje += `📦 Productos:\n`;
    pedido.productos.forEach(prod => {
        mensaje += `- ${prod.nombre} (${prod.ingredientes.join(', ')}) x${prod.cantidad}\n`;
    });
    mensaje += `\n💰 Total: $${pedido.total}\n\n`;
    mensaje += `📱 Teléfono: ${pedido.telefono}\n`;
    if (pedido.nombre) mensaje += `👤 Nombre: ${pedido.nombre}\n`;
    mensaje += `🚚 Tipo: ${pedido.tipo}\n`;
    if (pedido.direccion) mensaje += `📍 Dirección: ${pedido.direccion}\n`;
    mensaje += `🕒 Horario: ${pedido.horario}\n`;
    mensaje += `💳 Pago: ${pedido.pago}\n`;
    if (pedido.aclaracion) mensaje += `📝 Aclaración: ${pedido.aclaracion}\n`;
    return mensaje;
}

// Enviar a WhatsApp
function enviarWhatsApp(mensaje) {
    const numero = '543425907922'; // Número de pruebas
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// Panel Admin
document.getElementById('btn-admin').addEventListener('click', () => {
    document.getElementById('admin').style.display = 'block';
    if (sesionAdminVigente()) {
        document.getElementById('admin-content').style.display = 'block';
        cargarPedidosAdmin();
    }
});

async function hashTexto(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function sesionAdminVigente() {
    const expiresAt = Number(localStorage.getItem(ADMIN_SESSION_KEY)) || 0;
    if (Date.now() < expiresAt) {
        return true;
    }
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
}

function adminBloqueado() {
    const lockUntil = Number(localStorage.getItem(ADMIN_LOCK_UNTIL_KEY)) || 0;
    return Date.now() < lockUntil;
}

function registrarIntentoFallidoAdmin() {
    const failCount = (Number(localStorage.getItem(ADMIN_FAIL_COUNT_KEY)) || 0) + 1;
    localStorage.setItem(ADMIN_FAIL_COUNT_KEY, String(failCount));

    if (failCount >= ADMIN_MAX_ATTEMPTS) {
        localStorage.setItem(ADMIN_LOCK_UNTIL_KEY, String(Date.now() + ADMIN_LOCK_DURATION_MS));
        localStorage.setItem(ADMIN_FAIL_COUNT_KEY, '0');
        return true;
    }

    return false;
}

document.getElementById('admin-login').addEventListener('click', async () => {
    if (adminBloqueado()) {
        alert('Acceso bloqueado temporalmente. Intentá nuevamente en unos minutos.');
        return;
    }

    const password = document.getElementById('admin-password').value;
    const passwordHash = await hashTexto(password);
    if (passwordHash === ADMIN_PASSWORD_HASH) {
        localStorage.setItem(ADMIN_SESSION_KEY, String(Date.now() + ADMIN_SESSION_DURATION_MS));
        localStorage.setItem(ADMIN_FAIL_COUNT_KEY, '0');
        document.getElementById('admin-content').style.display = 'block';
        cargarPedidosAdmin();
    } else {
        const bloqueado = registrarIntentoFallidoAdmin();
        if (bloqueado) {
            alert('Demasiados intentos fallidos. Acceso bloqueado por 5 minutos.');
            return;
        }
        alert('Contraseña incorrecta');
    }
});

// Cargar pedidos en admin
function cargarPedidosAdmin() {
    const lista = document.getElementById('lista-pedidos');
    lista.innerHTML = '';
    const pedidos = obtenerPedidos();
    pedidos.forEach(pedido => {
        const div = document.createElement('div');
        div.className = 'pedido-admin';
        div.innerHTML = `
            <p><strong>ID:</strong> ${pedido.id}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
            <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
            <p><strong>Nombre:</strong> ${pedido.nombre || 'N/A'}</p>
            <p><strong>Aclaración:</strong> ${pedido.aclaracion || 'N/A'}</p>
            <p><strong>Total:</strong> $${pedido.total}</p>
        `;
        lista.appendChild(div);
    });
}

// Exportar pedidos a JSON
document.getElementById('exportar-json').addEventListener('click', () => {
    const pedidos = obtenerPedidos();
    const dataStr = JSON.stringify(pedidos, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pedidos.json';
    link.click();
});

// Limpiar historial
document.getElementById('limpiar-historial').addEventListener('click', () => {
    if (confirm('¿Estás seguro de limpiar el historial?')) {
        localStorage.removeItem('pedidos');
        cargarPedidosAdmin();
    }
});

// Event listeners
document.getElementById('form-pedido').addEventListener('submit', generarPedido);
document.getElementById('form-pedido').addEventListener('input', limpiarMensajeFormulario);

document.getElementById('tipo').addEventListener('change', function() {
    const tipo = this.value;
    if (tipo === 'Envío') {
        document.getElementById('campos-envio').style.display = 'block';
        document.getElementById('campos-retiro').style.display = 'none';
    } else if (tipo === 'Retiro') {
        document.getElementById('campos-envio').style.display = 'none';
        document.getElementById('campos-retiro').style.display = 'block';
    } else {
        document.getElementById('campos-envio').style.display = 'none';
        document.getElementById('campos-retiro').style.display = 'none';
    }
});

// Inicializar
async function inicializarApp() {
    cargarCarrito();
    actualizarCarrito();
    await cargarProductos();
}

document.addEventListener('DOMContentLoaded', inicializarApp);
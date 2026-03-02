// Variables globales
let productos = [];
let carrito = [];
let adminToken = null;

const apiService = window.ApiService;
const textUtils = window.TextUtils;
const orderMessageUtils = window.OrderMessageUtils;
const adminModule = window.AdminModule || { initAdminModule: () => {} };

const CARRITO_STORAGE_KEY = 'carrito';
const ADMIN_TOKEN_KEY = 'admin_token';

// Configuración cargada desde config.js
function getConfig() {
    if (typeof window.CONFIG === 'undefined') {
        console.error('⚠️ CONFIG no está definido. Asegúrate de incluir config.js en el HTML');
        return {
            whatsappNumber: '543425907922',
            adminPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        };
    }
    return window.CONFIG;
}

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
    tartas: 29000,
    empanadas: 1500
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

// ============================================
// LLAMADAS AL API
// ============================================

async function fetchAPI(endpoint, options = {}) {
    return apiService.request(endpoint, options);
}

// Crear pedido en el servidor
async function crearPedidoEnServidor(pedido) {
    return apiService.createOrder(pedido);
}

// Obtener pedidos del servidor
async function obtenerPedidosDelServidor(estado = null) {
    return apiService.getOrders(estado);
}

// Obtener estadísticas
async function obtenerEstadisticas() {
    return apiService.getStats();
}

// Actualizar estado de pedido
async function actualizarEstadoPedido(id, estado, notas = null) {
    return apiService.updateOrderStatus(id, estado, notas);
}

function safeTrackEvent(eventName, payload = {}, level = 'info') {
    if (!apiService || typeof apiService.trackMetricEvent !== 'function') {
        return;
    }

    apiService.trackMetricEvent(eventName, payload, level).catch((error) => {
        console.warn('No se pudo registrar métrica:', error.message);
    });
}

// Login admin
async function loginAdmin(password) {
    const response = await apiService.loginAdmin(password);
    if (response.success) {
        adminToken = response.token;
        localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
        safeTrackEvent('ADMIN_LOGIN_SUCCESS', {}, 'info');
    } else {
        safeTrackEvent('ADMIN_LOGIN_FAILED', { reason: 'INVALID_PASSWORD' }, 'warn');
    }
    return response;
}

// Logout admin
async function logoutAdmin() {
    if (adminToken) {
        try {
            await apiService.logoutAdmin();
        } catch (error) {
            console.error('Error al logout:', error);
        }
        adminToken = null;
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
}

// ============================================
// FUNCIONES DE CARRITO
// ============================================

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
            cantidad: Math.max(0, Number(item.cantidad) || 0),
            personalizacion: item.personalizacion || ''
        }));
}

// Cargar productos
async function cargarProductos() {
    const container = document.getElementById('productos-container');
    const loadingSpinner = document.getElementById('loading-productos');
    
    container.innerHTML = '';
    loadingSpinner.classList.remove('oculto');

    let reintentos = 0;
    const maxReintentos = 3;
    
    while (reintentos < maxReintentos) {
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

            safeTrackEvent('MENU_LOADED', { categories: CATEGORIAS.length });
            
            loadingSpinner.classList.add('oculto');
            return;
        } catch (error) {
            reintentos++;
            console.error(`Intento ${reintentos} fallido:`, error);
            
            if (reintentos >= maxReintentos) {
                safeTrackEvent('API_ERROR', {
                    endpoint: 'productos.json',
                    detail: error.message
                }, 'error');
                loadingSpinner.classList.add('oculto');
                container.innerHTML = `
                    <div class="error-carga">
                        <p>⚠️ Error al cargar productos.</p>
                        <p style="font-size: 0.9em; color: #666;">${error.message}</p>
                        <button onclick="location.reload()" class="btn-reintentar">Reintentar</button>
                    </div>
                `;
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000 * reintentos));
            }
        }
    }
}

// Normalizar texto para búsqueda
function normalizarTexto(texto) {
    return textUtils.normalizeText(texto);
}

// Filtrar productos
function filtrarProductos(busqueda) {
    const container = document.getElementById('productos-container');
    const resultadosDiv = document.getElementById('resultados-busqueda');
    
    if (!busqueda || busqueda.trim() === '') {
        container.style.display = 'block';
        resultadosDiv.classList.add('oculto');
        resultadosDiv.innerHTML = '';
        return;
    }
    
    const busquedaNormalizada = normalizarTexto(busqueda);
    let resultados = [];
    
    CATEGORIAS.forEach(categoria => {
        const items = productos[categoria.clave] || [];
        const baseId = BASE_ID_CATEGORIA[categoria.clave] || 2000;
        
        items.forEach((producto, index) => {
            const productoId = Number(producto.id) || (baseId + index + 1);
            const esPromo = categoria.clave === 'promos';
            const nombreBase = producto.nombre || `${categoria.titulo.slice(0, -1)} #${productoId}`;
            const nombre = esPromo
                ? `#${productoId} ${nombreBase}${producto.personas ? ` (personas ${producto.personas})` : ''}`
                : nombreBase;
            
            const ingredientesLista = esPromo
                ? (Array.isArray(producto.incluye) ? producto.incluye : [])
                : (Array.isArray(producto.ingredientes) ? producto.ingredientes : []);
            const ingredientes = ingredientesLista.join(' ');
            
            const nombreNormalizado = normalizarTexto(nombre);
            const ingredientesNormalizados = normalizarTexto(ingredientes);
            const detalle = producto.detalle ? normalizarTexto(producto.detalle) : '';
            
            if (nombreNormalizado.includes(busquedaNormalizada) || 
                ingredientesNormalizados.includes(busquedaNormalizada) ||
                detalle.includes(busquedaNormalizada)) {
                
                const precioProducto = Number(producto.precio);
                const precioCategoria = Number(PRECIOS[categoria.clave]);
                const precio = Number.isFinite(precioProducto)
                    ? precioProducto
                    : (Number.isFinite(precioCategoria) ? precioCategoria : 0);
                
                resultados.push({
                    id: productoId,
                    nombre: nombreBase,
                    nombreCompleto: nombre,
                    ingredientes: ingredientesLista,
                    precio: precio,
                    categoria: categoria.titulo,
                    categoriaInterna: categoria.clave,
                    esPromo: esPromo,
                    detalle: producto.detalle
                });
            }
        });
    });
    
    container.style.display = 'none';
    resultadosDiv.classList.remove('oculto');
    
    if (resultados.length === 0) {
        resultadosDiv.innerHTML = '<p class="sin-resultados">No se encontraron productos</p>';
        return;
    }
    
    resultadosDiv.innerHTML = `<p class="contador-resultados">${resultados.length} producto${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}</p>`;
    
    resultados.forEach(resultado => {
        const div = crearElementoProducto({
            id: resultado.id,
            nombre: resultado.nombre,
            nombreCompleto: resultado.nombreCompleto,
            ingredientes: resultado.ingredientes,
            precio: resultado.precio,
            esPromo: resultado.esPromo,
            detalle: resultado.detalle,
            categoriaBadge: resultado.categoria,
            categoriaInterna: resultado.categoriaInterna
        });
        
        resultadosDiv.appendChild(div);
    });
}

// Renderizar categoría
function renderCategoria(nombreVisible, productosArray, tipoInterno) {
    const container = document.getElementById('productos-container');
    const section = document.createElement('section');
    const h2 = document.createElement('h2');
    h2.classList.add('categoria-titulo');
    h2.style.cursor = 'pointer';
    h2.style.userSelect = 'none';
    
    const icono = document.createElement('span');
    icono.className = 'icono-categoria';
    icono.textContent = '▶';
    h2.appendChild(icono);
    
    const textoCategoria = document.createTextNode(` ${nombreVisible}`);
    h2.appendChild(textoCategoria);
    
    section.appendChild(h2);

    let avisoPromos = null;
    if (tipoInterno === 'promos') {
        avisoPromos = document.createElement('div');
        avisoPromos.className = 'aviso-promos';
        avisoPromos.setAttribute('role', 'note');
        avisoPromos.textContent = 'ℹ️ En promos no se modifican los sabores, salen armadas así.';
        avisoPromos.style.display = 'none';
        section.appendChild(avisoPromos);
    }

    const categoriasConPapas = [
        'hamburguesas',
        'lomitos',
        'super_panchos',
        'salchichas_calientes',
        'sandwich_milanesa'
    ];

    let avisoAcompanamiento = null;
    if (categoriasConPapas.includes(tipoInterno)) {
        avisoAcompanamiento = document.createElement('div');
        avisoAcompanamiento.className = 'aviso-acompanamiento';
        avisoAcompanamiento.setAttribute('role', 'note');
        avisoAcompanamiento.textContent = 'ℹ️ Vienen acompañados con papas fritas.';
        avisoAcompanamiento.style.display = 'none';
        section.appendChild(avisoAcompanamiento);
    }
    
    const productosDiv = document.createElement('div');
    productosDiv.className = 'productos-categoria';
    productosDiv.style.display = 'none';
    
    const baseId = BASE_ID_CATEGORIA[tipoInterno] || 2000;

    productosArray.forEach((producto, index) => {
        const productoId = Number(producto.id) || (baseId + index + 1);
        const esPromo = tipoInterno === 'promos';
        const nombreBase = producto.nombre || `${nombreVisible.slice(0, -1)} #${productoId}`;
        const nombreCompleto = esPromo
            ? `#${productoId} ${nombreBase}${producto.personas ? ` (personas ${producto.personas})` : ''}`
            : nombreBase;
        const ingredientesLista = esPromo
            ? (Array.isArray(producto.incluye) ? producto.incluye : [])
            : (Array.isArray(producto.ingredientes) ? producto.ingredientes : []);
        const precioProducto = Number(producto.precio);
        const precioCategoria = Number(PRECIOS[tipoInterno]);
        const precio = Number.isFinite(precioProducto)
            ? precioProducto
            : (Number.isFinite(precioCategoria) ? precioCategoria : 0);
        
        const div = crearElementoProducto({
            id: productoId,
            nombre: nombreBase,
            nombreCompleto: nombreCompleto,
            ingredientes: ingredientesLista,
            precio: precio,
            esPromo: esPromo,
            detalle: producto.detalle,
            categoriaInterna: tipoInterno
        });
        
        productosDiv.appendChild(div);
    });
    
    h2.addEventListener('click', () => {
        const isOpen = productosDiv.style.display === 'block';

        const animarAvisoVisible = (aviso) => {
            aviso.classList.remove('aviso-categoria-visible');
            void aviso.offsetWidth;
            aviso.classList.add('aviso-categoria-visible');
        };
        
        const todasLasCategorias = document.querySelectorAll('.productos-categoria');
        const todosLosIconos = document.querySelectorAll('.icono-categoria');
        const todosLosAvisosAcompanamiento = document.querySelectorAll('.aviso-acompanamiento');
        const todosLosAvisosPromos = document.querySelectorAll('.aviso-promos');
        todasLasCategorias.forEach(cat => {
            cat.style.display = 'none';
        });
        todosLosIconos.forEach(icon => {
            icon.textContent = '▶';
        });
        todosLosAvisosAcompanamiento.forEach(aviso => {
            aviso.style.display = 'none';
            aviso.classList.remove('aviso-categoria-visible');
        });
        todosLosAvisosPromos.forEach(aviso => {
            aviso.style.display = 'none';
            aviso.classList.remove('aviso-categoria-visible');
        });
        
        if (!isOpen) {
            productosDiv.style.display = 'block';
            icono.textContent = '▼';
            if (avisoPromos) {
                avisoPromos.style.display = 'block';
                animarAvisoVisible(avisoPromos);
            }
            if (avisoAcompanamiento) {
                avisoAcompanamiento.style.display = 'block';
                animarAvisoVisible(avisoAcompanamiento);
            }
        }
    });
    
    section.appendChild(productosDiv);
    container.appendChild(section);
}

// Crear elemento producto
function crearElementoProducto(datos) {
    const { id, nombre, nombreCompleto, ingredientes, precio, esPromo, detalle, categoriaBadge, categoriaInterna } = datos;
    
    const div = document.createElement('div');
    div.className = 'producto';
    
    const esPromoSiete = esPromo && id === 7;
    const mostrarPrecio = typeof precio === 'number' && precio > 0;
    const ingredientesTexto = Array.isArray(ingredientes) ? ingredientes.join(', ') : '';
    
    const infoDiv = document.createElement('div');
    const badge = categoriaBadge ? ` <span class="categoria-badge">${categoriaBadge}</span>` : '';
    const nombreMostrar = nombreCompleto || nombre;
    
    if (esPromoSiete) {
        infoDiv.innerHTML = `
            <h3>${nombreMostrar}${badge}</h3>
            ${detalle ? `<p>Detalle: ${detalle}</p>` : ''}
            ${mostrarPrecio ? `<p>$${precio}</p>` : ''}
        `;
    } else {
        infoDiv.innerHTML = ingredientesTexto
            ? `
            <h3>${nombreMostrar}${badge}</h3>
            <p>${esPromo ? 'Incluye' : 'Ingredientes'}: ${ingredientesTexto}</p>
            ${mostrarPrecio ? `<p>$${precio}</p>` : ''}
        `
            : `
            <h3>${nombreMostrar}${badge}</h3>
            ${mostrarPrecio ? `<p>$${precio}</p>` : ''}
        `;
    }
    div.appendChild(infoDiv);
    
    const personalizacionDiv = document.createElement('div');
    personalizacionDiv.className = 'personalizacion-producto';
    
    const personalizacionInput = document.createElement('input');
    personalizacionInput.type = 'text';
    personalizacionInput.className = 'input-personalizacion';
    personalizacionInput.placeholder = 'Ej: sin cebolla, extra queso...';
    personalizacionInput.maxLength = 100;
    
    personalizacionDiv.appendChild(personalizacionInput);
    div.appendChild(personalizacionDiv);

    let tamanoTartaSelect = null;
    if (categoriaInterna === 'tartas') {
        const tamanoDiv = document.createElement('div');
        tamanoDiv.className = 'personalizacion-producto';

        tamanoTartaSelect = document.createElement('select');
        tamanoTartaSelect.className = 'input-personalizacion';
        tamanoTartaSelect.setAttribute('aria-label', 'Elegir tamaño de tarta');
        tamanoTartaSelect.innerHTML = `
            <option value="entera">Tarta entera ($29000)</option>
            <option value="media">Media tarta ($15000)</option>
        `;

        tamanoDiv.appendChild(tamanoTartaSelect);
        div.appendChild(tamanoDiv);
    }
    
    const button = document.createElement('button');
    button.textContent = 'Agregar al carrito';
    button.addEventListener('click', () => {
        const ingredientesCarrito = esPromoSiete
            ? (detalle ? [detalle] : [])
            : ingredientes;
        const personalizacion = personalizacionInput.value.trim();
        let nombreCarrito = nombre;
        let precioCarrito = precio || 0;

        if (categoriaInterna === 'tartas' && tamanoTartaSelect) {
            const tamanoSeleccionado = tamanoTartaSelect.value;
            if (tamanoSeleccionado === 'media') {
                nombreCarrito = `${nombre} (Media tarta)`;
                precioCarrito = 15000;
            } else {
                nombreCarrito = `${nombre} (Tarta entera)`;
                precioCarrito = 29000;
            }
        }

        agregarAlCarrito(id, nombreCarrito, ingredientesCarrito, precioCarrito, personalizacion);
        animarBotonAgregado(button);
        personalizacionInput.value = '';
    });
    div.appendChild(button);
    
    return div;
}

// Agregar al carrito
function agregarAlCarrito(id, nombre, ingredientes, precio, personalizacion = '') {
    const item = carrito.find(i => i.id === id && i.nombre === nombre && i.personalizacion === personalizacion);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            ingredientes: ingredientes,
            precio: precio,
            cantidad: 1,
            personalizacion: personalizacion
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

// Actualizar carrito
function actualizarCarrito() {
    const lista = document.getElementById('lista-carrito');
    lista.innerHTML = '';
    carrito.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-carrito';
        
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <h4>${item.nombre}</h4>
            <p>Ingredientes: ${item.ingredientes.join(', ')}</p>
            ${item.personalizacion ? `<p class="personalizacion-item">📝 ${item.personalizacion}</p>` : ''}
            <p>Precio unitario: $${item.precio}</p>
        `;
        div.appendChild(infoDiv);
        
        const controlesDiv = document.createElement('div');
        controlesDiv.className = 'controles-cantidad';
        
        const btnDecrementar = document.createElement('button');
        btnDecrementar.textContent = '-';
        btnDecrementar.addEventListener('click', () => cambiarCantidad(index, -1));
        
        const cantidadSpan = document.createElement('span');
        cantidadSpan.className = 'cantidad';
        cantidadSpan.textContent = item.cantidad;
        
        const btnIncrementar = document.createElement('button');
        btnIncrementar.textContent = '+';
        btnIncrementar.addEventListener('click', () => cambiarCantidad(index, 1));
        
        controlesDiv.appendChild(btnDecrementar);
        controlesDiv.appendChild(cantidadSpan);
        controlesDiv.appendChild(btnIncrementar);
        div.appendChild(controlesDiv);
        
        const eliminarBtn = document.createElement('button');
        eliminarBtn.className = 'btn-eliminar';
        eliminarBtn.innerHTML = '🗑️';
        eliminarBtn.setAttribute('aria-label', 'Eliminar producto');
        eliminarBtn.addEventListener('click', () => eliminarDelCarrito(index));
        div.appendChild(eliminarBtn);
        
        lista.appendChild(div);
    });
    calcularTotal();
}

function calcularTotal() {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    document.getElementById('total').textContent = total;
}

function cambiarCantidad(index, delta) {
    if (index >= 0 && index < carrito.length) {
        carrito[index].cantidad += delta;
        
        if (carrito[index].cantidad <= 0) {
            eliminarDelCarrito(index);
            return;
        }
        
        actualizarCarrito();
        guardarCarrito();
    }
}

function eliminarDelCarrito(index) {
    if (index >= 0 && index < carrito.length) {
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

// Validar teléfono
function validarTelefono(telefono) {
    return textUtils.validatePhone(telefono);
}

// Generar pedido
async function generarPedido(event) {
    event.preventDefault();
    limpiarMensajeFormulario();

    const tipo = document.getElementById('tipo').value;
    const direccion = document.getElementById('direccion').value;
    const horario = 'Sin horario';
    const pago = document.getElementById('pago').value;
    const telefono = document.getElementById('telefono').value;
    const nombre = document.getElementById('nombre').value;
    const aclaracion = document.getElementById('aclaracion').value;

    if (!telefono) {
        safeTrackEvent('VALIDATION_ERROR', { mensaje: 'Teléfono es obligatorio.' }, 'warn');
        safeTrackEvent('ORDER_FAILED', { reason: 'VALIDATION_ERROR', detalle: 'Teléfono es obligatorio.' }, 'warn');
        mostrarMensajeFormulario('Teléfono es obligatorio.');
        return;
    }
    
    const validacionTel = validarTelefono(telefono);
    if (!validacionTel.valido) {
        safeTrackEvent('VALIDATION_ERROR', { mensaje: validacionTel.mensaje }, 'warn');
        safeTrackEvent('ORDER_FAILED', { reason: 'VALIDATION_ERROR', detalle: validacionTel.mensaje }, 'warn');
        mostrarMensajeFormulario(validacionTel.mensaje);
        return;
    }
    if (tipo === 'Envío' && !direccion) {
        safeTrackEvent('VALIDATION_ERROR', { mensaje: 'Dirección es obligatoria para Envío.', tipo }, 'warn');
        safeTrackEvent('ORDER_FAILED', { reason: 'VALIDATION_ERROR', detalle: 'Dirección es obligatoria para Envío.' }, 'warn');
        mostrarMensajeFormulario('Dirección es obligatoria para Envío.');
        return;
    }
    if (tipo === 'Retiro' && !nombre) {
        safeTrackEvent('VALIDATION_ERROR', { mensaje: 'Nombre es obligatorio para Retiro.', tipo }, 'warn');
        safeTrackEvent('ORDER_FAILED', { reason: 'VALIDATION_ERROR', detalle: 'Nombre es obligatorio para Retiro.' }, 'warn');
        mostrarMensajeFormulario('Nombre es obligatorio para Retiro.');
        return;
    }
    if (carrito.length === 0) {
        safeTrackEvent('ORDER_FAILED', { reason: 'EMPTY_CART' }, 'warn');
        mostrarMensajeFormulario('El carrito está vacío.');
        return;
    }

    const carritoFiltrado = carrito.filter(item => item.cantidad > 0);
    if (carritoFiltrado.length === 0) {
        safeTrackEvent('ORDER_FAILED', { reason: 'EMPTY_CART_ITEMS' }, 'warn');
        mostrarMensajeFormulario('No hay productos con cantidad válida en el carrito.');
        return;
    }

    // Generar ID secuencial
    try {
        const pedidosExistentes = await obtenerPedidosDelServidor();
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
            referencia: tipo === 'Envío' ? direccion : nombre,
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
            total: carritoFiltrado.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
        };

        await crearPedidoEnServidor(pedido);
        const mensaje = generarMensajeWhatsApp(pedido);
        enviarWhatsApp(mensaje);
        safeTrackEvent('ORDER_CREATED', {
            orderId: pedido.id,
            total: pedido.total,
            productos: pedido.productos.length,
            tipo: pedido.tipo
        }, 'info');

        carrito = [];
        actualizarCarrito();
        guardarCarrito();
        document.getElementById('form-pedido').reset();
        mostrarMensajeFormulario('Pedido generado correctamente. Se abrió WhatsApp para enviar el mensaje.', 'success');
    } catch (error) {
        safeTrackEvent('ORDER_FAILED', {
            reason: 'REQUEST_EXCEPTION',
            detalle: error.message
        }, 'error');
        mostrarMensajeFormulario('Error al generar pedido: ' + error.message);
    }
}

// Generar mensaje WhatsApp
function generarMensajeWhatsApp(pedido) {
    return orderMessageUtils.buildWhatsappOrderMessage(pedido);
}

// Enviar WhatsApp
function enviarWhatsApp(mensaje) {
    const config = getConfig();
    const numero = config.whatsappNumber;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// Restablecer token admin del localStorage
function restaurarTokenAdmin() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
        adminToken = token;
        apiService.setAdminToken(token);
        return;
    }

    adminToken = null;
    apiService.setAdminToken(null);
}

// ============================================
// EVENT LISTENERS
// ============================================

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

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function configurarValidacionTelefono() {
    const inputTelefono = document.getElementById('telefono');
    if (!inputTelefono) return;
    
    inputTelefono.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
    });
    
    inputTelefono.addEventListener('blur', (e) => {
        const valor = e.target.value.trim();
        if (valor) {
            const validacion = validarTelefono(valor);
            if (!validacion.valido) {
                inputTelefono.setCustomValidity(validacion.mensaje);
                inputTelefono.reportValidity();
            } else {
                inputTelefono.setCustomValidity('');
            }
        }
    });
}

// Inicializar app
async function inicializarApp() {
    cargarCarrito();
    actualizarCarrito();
    configurarValidacionTelefono();
    restaurarTokenAdmin();

    adminModule.initAdminModule({
        restoreAdminToken: restaurarTokenAdmin,
        hasAdminToken: () => Boolean(adminToken),
        loginAdmin,
        getOrders: obtenerPedidosDelServidor
    });

    await cargarProductos();
    
    const inputBusqueda = document.getElementById('buscar-producto');
    if (inputBusqueda) {
        const busquedaDebounced = debounce((valor) => {
            filtrarProductos(valor);
        }, 300);
        
        inputBusqueda.addEventListener('input', (e) => {
            busquedaDebounced(e.target.value);
        });
    }
}

document.addEventListener('DOMContentLoaded', inicializarApp);

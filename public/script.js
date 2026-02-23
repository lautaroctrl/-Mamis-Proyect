// Variables globales
let productos = [];
let carrito = [];
let adminToken = null;
const API_BASE_URL = '/api';

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

// ============================================
// LLAMADAS AL API
// ============================================

async function fetchAPI(endpoint, options = {}) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (adminToken) {
            headers['Authorization'] = `Bearer ${adminToken}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error en ${endpoint}:`, error);
        throw error;
    }
}

// Crear pedido en el servidor
async function crearPedidoEnServidor(pedido) {
    return fetchAPI('/pedidos', {
        method: 'POST',
        body: JSON.stringify(pedido)
    });
}

// Obtener pedidos del servidor
async function obtenerPedidosDelServidor(estado = null) {
    const url = estado ? `/pedidos?estado=${estado}` : '/pedidos';
    const response = await fetchAPI(url);
    return response.data || [];
}

// Obtener estadísticas
async function obtenerEstadisticas() {
    const response = await fetchAPI('/estadisticas');
    return response.data || {};
}

// Actualizar estado de pedido
async function actualizarEstadoPedido(id, estado, notas = null) {
    return fetchAPI(`/pedidos/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado, notas })
    });
}

// Login admin
async function loginAdmin(password) {
    const response = await fetchAPI('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
    });
    if (response.success) {
        adminToken = response.token;
        localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    }
    return response;
}

// Logout admin
async function logoutAdmin() {
    if (adminToken) {
        try {
            await fetchAPI('/admin/logout', { method: 'POST' });
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
            
            loadingSpinner.classList.add('oculto');
            return;
        } catch (error) {
            reintentos++;
            console.error(`Intento ${reintentos} fallido:`, error);
            
            if (reintentos >= maxReintentos) {
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
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
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
            categoriaBadge: resultado.categoria
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

    if (tipoInterno === 'promos') {
        const avisoPromos = document.createElement('div');
        avisoPromos.className = 'aviso-promos';
        avisoPromos.setAttribute('role', 'note');
        avisoPromos.textContent = 'ℹ️ En promos no se modifican los sabores, salen armadas así.';
        section.appendChild(avisoPromos);
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
            detalle: producto.detalle
        });
        
        productosDiv.appendChild(div);
    });
    
    h2.addEventListener('click', () => {
        const isOpen = productosDiv.style.display === 'block';
        
        const todasLasCategorias = document.querySelectorAll('.productos-categoria');
        const todosLosIconos = document.querySelectorAll('.icono-categoria');
        todasLasCategorias.forEach(cat => {
            cat.style.display = 'none';
        });
        todosLosIconos.forEach(icon => {
            icon.textContent = '▶';
        });
        
        if (!isOpen) {
            productosDiv.style.display = 'block';
            icono.textContent = '▼';
        }
    });
    
    section.appendChild(productosDiv);
    container.appendChild(section);
}

// Crear elemento producto
function crearElementoProducto(datos) {
    const { id, nombre, nombreCompleto, ingredientes, precio, esPromo, detalle, categoriaBadge } = datos;
    
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
    
    const button = document.createElement('button');
    button.textContent = 'Agregar al carrito';
    button.addEventListener('click', () => {
        const ingredientesCarrito = esPromoSiete
            ? (detalle ? [detalle] : [])
            : ingredientes;
        const personalizacion = personalizacionInput.value.trim();
        agregarAlCarrito(id, nombre, ingredientesCarrito, precio || 0, personalizacion);
        animarBotonAgregado(button);
        personalizacionInput.value = '';
    });
    div.appendChild(button);
    
    return div;
}

// Agregar al carrito
function agregarAlCarrito(id, nombre, ingredientes, precio, personalizacion = '') {
    const item = carrito.find(i => i.id === id && i.personalizacion === personalizacion);
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
    const telefonoLimpio = telefono.replace(/[\s\-\(\)+]/g, '');
    
    if (!/^\d+$/.test(telefonoLimpio)) {
        return {
            valido: false,
            mensaje: 'El teléfono solo puede contener números.'
        };
    }
    
    if (telefonoLimpio.length < 8 || telefonoLimpio.length > 15) {
        return {
            valido: false,
            mensaje: 'El teléfono debe tener entre 8 y 15 dígitos.'
        };
    }
    
    return {
        valido: true,
        telefono: telefonoLimpio
    };
}

function convertirHorarioAMinutos(horario) {
    if (!horario || !horario.includes(':')) return -1;
    const [hora, minuto] = horario.split(':').map(Number);
    if (!Number.isFinite(hora) || !Number.isFinite(minuto)) return -1;
    return (hora * 60) + minuto;
}

function obtenerHoraArgentina() {
    const partes = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(new Date());

    const hora = Number(partes.find(p => p.type === 'hour')?.value || 0);
    const minuto = Number(partes.find(p => p.type === 'minute')?.value || 0);

    return {
        hora,
        minuto,
        minutosTotales: (hora * 60) + minuto
    };
}

function estaEnFranjaResetHorarios() {
    const ahoraArgentina = obtenerHoraArgentina();
    return ahoraArgentina.hora >= 23;
}

function horarioEsAnteriorActual(horario) {
    if (estaEnFranjaResetHorarios()) {
        return false;
    }

    const minutosHorario = convertirHorarioAMinutos(horario);
    if (minutosHorario < 0) return true;
    const minutosActuales = obtenerHoraArgentina().minutosTotales;
    return minutosHorario < minutosActuales;
}

// Generar pedido
async function generarPedido(event) {
    event.preventDefault();
    limpiarMensajeFormulario();

    const tipo = document.getElementById('tipo').value;
    const direccion = document.getElementById('direccion').value;
    const horario = document.getElementById('horario').value;
    const pago = document.getElementById('pago').value;
    const telefono = document.getElementById('telefono').value;
    const nombre = document.getElementById('nombre').value;
    const aclaracion = document.getElementById('aclaracion').value;

    if (!telefono) {
        mostrarMensajeFormulario('Teléfono es obligatorio.');
        return;
    }
    
    const validacionTel = validarTelefono(telefono);
    if (!validacionTel.valido) {
        mostrarMensajeFormulario(validacionTel.mensaje);
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
    if (!horario || horarioEsAnteriorActual(horario)) {
        mostrarMensajeFormulario('Seleccioná un horario válido (igual o posterior a la hora actual).');
        const selectHorario = document.getElementById('horario');
        if (selectHorario) selectHorario.value = '';
        return;
    }
    if (carrito.length === 0) {
        mostrarMensajeFormulario('El carrito está vacío.');
        return;
    }

    const carritoFiltrado = carrito.filter(item => item.cantidad > 0);
    if (carritoFiltrado.length === 0) {
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

        carrito = [];
        actualizarCarrito();
        guardarCarrito();
        document.getElementById('form-pedido').reset();
        mostrarMensajeFormulario('Pedido generado correctamente. Se abrió WhatsApp para enviar el mensaje.', 'success');
    } catch (error) {
        mostrarMensajeFormulario('Error al generar pedido: ' + error.message);
    }
}

// Generar mensaje WhatsApp
function generarMensajeWhatsApp(pedido) {
    let mensaje = `Orden: ${pedido.id}\n\n`;
    mensaje += `Productos:\n`;
    pedido.productos.forEach(prod => {
        mensaje += `- ${prod.nombre} (${prod.ingredientes.join(', ')}) x${prod.cantidad}\n`;
    });
    mensaje += `\nTotal: $${pedido.total}\n\n`;
    if (pedido.nombre) mensaje += `Nombre: ${pedido.nombre}\n`;
    mensaje += `Teléfono: ${pedido.telefono}\n`;
    mensaje += `Tipo: ${pedido.tipo}\n`;
    if (pedido.direccion) mensaje += `Dirección: ${pedido.direccion}\n`;
    mensaje += `Horario: ${pedido.horario}\n`;
    mensaje += `Pago: ${pedido.pago}\n`;
    if (pedido.aclaracion) mensaje += `Aclaración: ${pedido.aclaracion}\n`;
    return mensaje;
}

// Enviar WhatsApp
function enviarWhatsApp(mensaje) {
    const config = getConfig();
    const numero = config.whatsappNumber;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// ============================================
// PANEL ADMIN
// ============================================

// Restablecer token admin del localStorage
function restaurarTokenAdmin() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
        adminToken = token;
    }
}

document.getElementById('btn-admin').addEventListener('click', () => {
    document.getElementById('admin').style.display = 'block';
    restaurarTokenAdmin();
    if (adminToken) {
        document.getElementById('admin-content').style.display = 'block';
        cargarPedidosAdmin();
    }
});

document.getElementById('admin-login').addEventListener('click', async () => {
    const password = document.getElementById('admin-password').value;
    if (!password) {
        alert('Ingresa la contraseña');
        return;
    }

    try {
        const response = await loginAdmin(password);
        if (response.success) {
            document.getElementById('admin-content').style.display = 'block';
            document.getElementById('admin-password').value = '';
            cargarPedidosAdmin();
        } else {
            alert('Contraseña incorrecta');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

async function cargarPedidosAdmin() {
    try {
        const pedidos = await obtenerPedidosDelServidor();
        const lista = document.getElementById('lista-pedidos');
        lista.innerHTML = '';
        
        pedidos.forEach(pedido => {
            const referencia = pedido.referencia || (pedido.tipo === 'Envío' ? pedido.direccion : pedido.nombre) || 'N/A';
            const fechaArgentina = new Date(pedido.fecha).toLocaleString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires'
            });

            const div = document.createElement('div');
            div.className = 'pedido-admin';
            div.innerHTML = `
                <p><strong>ID:</strong> ${pedido.id}</p>
                <p><strong>Fecha:</strong> ${fechaArgentina}</p>
                <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
                <p><strong>Referencia:</strong> ${referencia}</p>
                <p><strong>Horario:</strong> ${pedido.horario || 'N/A'} (Argentina)</p>
                <p><strong>Total:</strong> $${pedido.total}</p>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        alert('Error al cargar pedidos');
    }
}

document.getElementById('exportar-json').addEventListener('click', async () => {
    try {
        const pedidos = await obtenerPedidosDelServidor();
        const dataStr = JSON.stringify(pedidos, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pedidos.json';
        link.click();
    } catch (error) {
        alert('Error al exportar: ' + error.message);
    }
});

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

// Generar opciones de horario
function generarOpcionesHorario() {
    const selectHorario = document.getElementById('horario');
    if (!selectHorario) return;
    
    const rangos = [
        { inicio: '10:30', fin: '14:00' },
        { inicio: '18:30', fin: '22:45' }
    ];
    
    rangos.forEach(rango => {
        const [horaInicio, minInicio] = rango.inicio.split(':').map(Number);
        const [horaFin, minFin] = rango.fin.split(':').map(Number);
        
        let hora = horaInicio;
        let minuto = minInicio;
        
        while (hora < horaFin || (hora === horaFin && minuto <= minFin)) {
            const valorHorario = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
            const option = document.createElement('option');
            option.value = valorHorario;
            option.textContent = valorHorario;
            selectHorario.appendChild(option);
            
            minuto += 5;
            if (minuto >= 60) {
                minuto = 0;
                hora++;
            }
        }
    });

    actualizarHorariosDisponibles();
}

function actualizarHorariosDisponibles() {
    const selectHorario = document.getElementById('horario');
    if (!selectHorario) return;

    if (estaEnFranjaResetHorarios()) {
        Array.from(selectHorario.options).forEach((option, index) => {
            if (index === 0 || !option.value) return;
            option.disabled = false;
            option.hidden = false;
        });
        return;
    }

    const minutosActuales = obtenerHoraArgentina().minutosTotales;

    Array.from(selectHorario.options).forEach((option, index) => {
        if (index === 0 || !option.value) return;

        const [hora, minuto] = option.value.split(':').map(Number);
        const minutosOpcion = (hora * 60) + minuto;
        const esPasado = minutosOpcion < minutosActuales;
        option.disabled = esPasado;
        option.hidden = esPasado;
    });

    if (selectHorario.value) {
        const seleccion = Array.from(selectHorario.options).find(opt => opt.value === selectHorario.value);
        if (seleccion && seleccion.disabled) {
            selectHorario.value = '';
        }
    }
}

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
    generarOpcionesHorario();
    actualizarHorariosDisponibles();
    setInterval(actualizarHorariosDisponibles, 60 * 1000);
    configurarValidacionTelefono();
    restaurarTokenAdmin();

    const selectHorario = document.getElementById('horario');
    if (selectHorario) {
        selectHorario.addEventListener('change', () => {
            if (selectHorario.value && horarioEsAnteriorActual(selectHorario.value)) {
                selectHorario.value = '';
                mostrarMensajeFormulario('Ese horario ya pasó. Elegí uno actual o posterior.');
            }
        });
    }

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

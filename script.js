// Variables globales
let productos = [];
let carrito = [];

const CARRITO_STORAGE_KEY = 'carrito';
const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_LOCK_UNTIL_KEY = 'admin_lock_until';
const ADMIN_FAIL_COUNT_KEY = 'admin_fail_count';

// Configuración cargada desde config.js
function getConfig() {
    if (typeof window.CONFIG === 'undefined') {
        console.error('⚠️ CONFIG no está definido. Asegúrate de incluir config.js en el HTML');
        return {
            whatsappNumber: '',
            adminPasswordHash: '',
            adminSessionDuration: 30 * 60 * 1000,
            adminLockDuration: 5 * 60 * 1000,
            adminMaxAttempts: 5
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

const ICONOS_CATEGORIA = {
    promos: '🎁',
    simples: '🥪',
    mixtos: '🥙',
    triples: '🥪',
    especiales: '🧀',
    hamburguesas: '🍔',
    lomitos: '🥩',
    salchichas_calientes: '🌭',
    super_panchos: '🌭',
    sandwich_milanesa: '🍗',
    pizzas: '🍕',
    fugazzas: '🫓',
    tartas: '🥧',
    empanadas: '🥟'
};

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
            return; // Éxito, salir de la función
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
                // Esperar antes de reintentar (exponencial backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * reintentos));
            }
        }
    }
}

// Normalizar texto para búsqueda (sin acentos, lowercase)
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function obtenerItemsCategoria(data, categoriaClave) {
    return Array.isArray(data[categoriaClave]) ? data[categoriaClave] : [];
}

function obtenerBaseIdCategoria(categoriaClave, baseIds) {
    const baseId = Number(baseIds[categoriaClave]);
    return Number.isFinite(baseId) ? baseId : 2000;
}

function obtenerListaIngredientes(producto, esPromo) {
    if (esPromo) {
        return Array.isArray(producto.incluye) ? producto.incluye : [];
    }
    return Array.isArray(producto.ingredientes) ? producto.ingredientes : [];
}

function obtenerPrecioProducto(producto, categoriaClave, precios) {
    const precioProducto = Number(producto.precio);
    if (Number.isFinite(precioProducto)) {
        return precioProducto;
    }

    const precioCategoria = Number(precios[categoriaClave]);
    return Number.isFinite(precioCategoria) ? precioCategoria : 0;
}

function construirDatosProductoVista({ producto, index, categoriaClave, categoriaTitulo, baseIds, precios }) {
    const esPromo = categoriaClave === 'promos';
    const baseId = obtenerBaseIdCategoria(categoriaClave, baseIds);
    const productoId = Number(producto.id) || (baseId + index + 1);
    const nombreBase = producto.nombre || `${categoriaTitulo.slice(0, -1)} #${productoId}`;
    const nombreCompleto = esPromo
        ? `#${productoId} ${nombreBase}${producto.personas ? ` (personas ${producto.personas})` : ''}`
        : nombreBase;

    return {
        id: productoId,
        nombre: nombreBase,
        nombreCompleto,
        ingredientes: obtenerListaIngredientes(producto, esPromo),
        precio: obtenerPrecioProducto(producto, categoriaClave, precios),
        esPromo,
        detalle: producto.detalle
    };
}

function productoCoincideBusqueda(productoVista, busquedaNormalizada) {
    const nombreNormalizado = normalizarTexto(productoVista.nombreCompleto || productoVista.nombre);
    const ingredientesNormalizados = normalizarTexto((productoVista.ingredientes || []).join(' '));
    const detalleNormalizado = productoVista.detalle ? normalizarTexto(productoVista.detalle) : '';

    return nombreNormalizado.includes(busquedaNormalizada)
        || ingredientesNormalizados.includes(busquedaNormalizada)
        || detalleNormalizado.includes(busquedaNormalizada);
}

function normalizarItemCarrito(item) {
    return {
        id: item.id,
        nombre: item.nombre,
        ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
        precio: Number(item.precio) || 0,
        cantidad: Math.max(0, Number(item.cantidad) || 0),
        personalizacion: item.personalizacion || ''
    };
}

function normalizarCarritoGuardado(carritoGuardado) {
    if (!Array.isArray(carritoGuardado)) {
        return [];
    }

    return carritoGuardado
        .filter(item => item && typeof item.id === 'number')
        .map(normalizarItemCarrito);
}

function filtrarItemsConCantidad(carritoItems) {
    return carritoItems.filter(item => item.cantidad > 0);
}

function obtenerSiguienteIdPedido(pedidosExistentes) {
    const maxId = pedidosExistentes.reduce((acumulado, pedido) => {
        const numero = parseInt(String(pedido.id || '').replace('ORD-', ''), 10);
        if (!Number.isFinite(numero)) {
            return acumulado;
        }
        return numero > acumulado ? numero : acumulado;
    }, 0);

    return `ORD-${maxId + 1}`;
}

function construirPedido({ id, datosFormulario, carritoItems, fecha }) {
    return {
        id,
        telefono: datosFormulario.telefono,
        nombre: datosFormulario.nombre,
        tipo: datosFormulario.tipo,
        direccion: datosFormulario.direccion,
        horario: datosFormulario.horario,
        pago: datosFormulario.pago,
        aclaracion: datosFormulario.aclaracion,
        productos: carritoItems.map(item => ({
            id: item.id,
            nombre: item.nombre,
            ingredientes: item.ingredientes,
            cantidad: item.cantidad,
            precio: item.precio,
            personalizacion: item.personalizacion || ''
        })),
        total: carritoItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
        fecha
    };
}

function validarDatosPedido({ datosFormulario, carritoItems, validarTelefonoFn, horarioEsAnteriorActualFn }) {
    if (!datosFormulario.telefono) {
        return { mensaje: 'Teléfono es obligatorio.' };
    }

    const validacionTel = validarTelefonoFn(datosFormulario.telefono);
    if (!validacionTel.valido) {
        return { mensaje: validacionTel.mensaje };
    }

    if (datosFormulario.tipo === 'Envío' && !datosFormulario.direccion) {
        return { mensaje: 'Dirección es obligatoria para Envío.' };
    }

    if (datosFormulario.tipo === 'Retiro' && !datosFormulario.nombre) {
        return { mensaje: 'Nombre es obligatorio para Retiro.' };
    }

    if (!datosFormulario.horario || horarioEsAnteriorActualFn(datosFormulario.horario)) {
        return {
            mensaje: 'Seleccioná un horario válido (igual o posterior a la hora actual).',
            resetHorario: true
        };
    }

    if (carritoItems.length === 0) {
        return { mensaje: 'El carrito está vacío.' };
    }

    return null;
}

function construirUrlWhatsApp(numero, mensaje) {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// Filtrar productos por búsqueda
function filtrarProductos(busqueda, dataProductos = productos) {
    const container = document.getElementById('productos-container');
    const resultadosDiv = document.getElementById('resultados-busqueda');
    
    // Si no hay búsqueda, mostrar todas las categorías normalmente
    if (!busqueda || busqueda.trim() === '') {
        container.style.display = 'block';
        resultadosDiv.classList.add('oculto');
        resultadosDiv.innerHTML = '';
        return;
    }
    
    const busquedaNormalizada = normalizarTexto(busqueda);
    let resultados = [];
    
    // Buscar en todas las categorías
    CATEGORIAS.forEach(categoria => {
        const items = obtenerItemsCategoria(dataProductos, categoria.clave);
        
        items.forEach((producto, index) => {
            const productoVista = construirDatosProductoVista({
                producto,
                index,
                categoriaClave: categoria.clave,
                categoriaTitulo: categoria.titulo,
                baseIds: BASE_ID_CATEGORIA,
                precios: PRECIOS
            });

            if (productoCoincideBusqueda(productoVista, busquedaNormalizada)) {
                resultados.push({
                    ...productoVista,
                    categoria: categoria.titulo
                });
            }
        });
    });
    
    // Ocultar categorías normales y mostrar resultados
    container.style.display = 'none';
    resultadosDiv.classList.remove('oculto');
    
    if (resultados.length === 0) {
        resultadosDiv.innerHTML = '<p class="sin-resultados">No se encontraron productos</p>';
        return;
    }
    
    // Mostrar contador de resultados
    resultadosDiv.innerHTML = `<p class="contador-resultados">${resultados.length} producto${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}</p>`;
    
    // Renderizar resultados
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

// Función compartida para crear elemento DOM de producto
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
    
    // Campo de personalización opcional
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
        // Limpiar campo de personalización después de agregar
        personalizacionInput.value = '';
    });
    div.appendChild(button);
    
    return div;
}

function guardarCarrito() {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
}

function cargarCarrito() {
    const carritoGuardado = JSON.parse(localStorage.getItem(CARRITO_STORAGE_KEY)) || [];
    carrito = normalizarCarritoGuardado(carritoGuardado);
}

// Renderizar categoría
function renderCategoria(nombreVisible, productosArray, tipoInterno) {
    const container = document.getElementById('productos-container');
    const section = document.createElement('section');
    const h2 = document.createElement('h2');
    h2.classList.add('categoria-titulo');
    h2.style.cursor = 'pointer';
    h2.style.userSelect = 'none';
    
    // Crear icono de estado
    const icono = document.createElement('span');
    icono.className = 'icono-categoria';
    icono.textContent = '▶'; // Icono cerrado por defecto
    h2.appendChild(icono);

    const iconoTipo = document.createElement('span');
    iconoTipo.className = 'icono-categoria-tipo';
    iconoTipo.textContent = ICONOS_CATEGORIA[tipoInterno] || '🍽️';
    h2.appendChild(iconoTipo);
    
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
    
    productosArray.forEach((producto, index) => {
        const productoVista = construirDatosProductoVista({
            producto,
            index,
            categoriaClave: tipoInterno,
            categoriaTitulo: nombreVisible,
            baseIds: BASE_ID_CATEGORIA,
            precios: PRECIOS
        });
        
        const div = crearElementoProducto({
            id: productoVista.id,
            nombre: productoVista.nombre,
            nombreCompleto: productoVista.nombreCompleto,
            ingredientes: productoVista.ingredientes,
            precio: productoVista.precio,
            esPromo: productoVista.esPromo,
            detalle: productoVista.detalle
        });
        
        productosDiv.appendChild(div);
    });
    
    h2.addEventListener('click', () => {
        const isOpen = productosDiv.style.display === 'block';
        
        // Cerrar todas las categorías abiertas y resetear iconos
        const todasLasCategorias = document.querySelectorAll('.productos-categoria');
        const todosLosIconos = document.querySelectorAll('.icono-categoria');
        todasLasCategorias.forEach(cat => {
            cat.style.display = 'none';
        });
        todosLosIconos.forEach(icon => {
            icon.textContent = '▶';
        });
        
        // Si no estaba abierta, abrirla y cambiar icono
        if (!isOpen) {
            productosDiv.style.display = 'block';
            icono.textContent = '▼';
        }
    });
    
    section.appendChild(productosDiv);
    container.appendChild(section);
}

// Agregar producto al carrito
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

// Actualizar vista del carrito
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
        
        // Botón decrementar
        const btnDecrementar = document.createElement('button');
        btnDecrementar.textContent = '-';
        btnDecrementar.addEventListener('click', () => cambiarCantidad(index, -1));
        
        // Cantidad
        const cantidadSpan = document.createElement('span');
        cantidadSpan.className = 'cantidad';
        cantidadSpan.textContent = item.cantidad;
        
        // Botón incrementar
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

// Calcular y mostrar el total del carrito
function calcularTotal() {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    document.getElementById('total').textContent = total;
}

// Cambiar cantidad de producto en carrito
function cambiarCantidad(index, delta) {
    if (index >= 0 && index < carrito.length) {
        carrito[index].cantidad += delta;
        
        // Auto-eliminar si la cantidad llega a 0
        if (carrito[index].cantidad <= 0) {
            eliminarDelCarrito(index);
            return;
        }
        
        actualizarCarrito();
        guardarCarrito();
    }
}

// Eliminar producto del carrito
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

// Validar formato de teléfono
function validarTelefono(telefono) {
    // Eliminar espacios, guiones, paréntesis y signos +
    const telefonoLimpio = telefono.replace(/[\s\-\(\)+]/g, '');
    
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(telefonoLimpio)) {
        return {
            valido: false,
            mensaje: 'El teléfono solo puede contener números.'
        };
    }
    
    // Validar longitud (entre 8 y 15 dígitos)
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

function estaEnFranjaResetHorarios() {
    const ahora = new Date();
    return ahora.getHours() >= 23;
}

function horarioEsAnteriorActual(horario) {
    if (estaEnFranjaResetHorarios()) {
        return false;
    }

    const minutosHorario = convertirHorarioAMinutos(horario);
    if (minutosHorario < 0) return true;
    const ahora = new Date();
    const minutosActuales = (ahora.getHours() * 60) + ahora.getMinutes();
    return minutosHorario < minutosActuales;
}

// Generar pedido y enviar a WhatsApp
function generarPedido(event) {
    event.preventDefault();
    limpiarMensajeFormulario();

    const datosFormulario = {
        tipo: document.getElementById('tipo').value,
        direccion: document.getElementById('direccion').value,
        horario: document.getElementById('horario').value,
        pago: document.getElementById('pago').value,
        telefono: document.getElementById('telefono').value,
        nombre: document.getElementById('nombre').value,
        aclaracion: document.getElementById('aclaracion').value
    };

    const errorValidacion = validarDatosPedido({
        datosFormulario,
        carritoItems: carrito,
        validarTelefonoFn: validarTelefono,
        horarioEsAnteriorActualFn: horarioEsAnteriorActual
    });

    if (errorValidacion) {
        mostrarMensajeFormulario(errorValidacion.mensaje);
        if (errorValidacion.resetHorario) {
            const selectHorario = document.getElementById('horario');
            if (selectHorario) selectHorario.value = '';
        }
        return;
    }

    const carritoFiltrado = filtrarItemsConCantidad(carrito);
    if (carritoFiltrado.length === 0) {
        mostrarMensajeFormulario('No hay productos con cantidad válida en el carrito.');
        return;
    }

    const pedidosExistentes = obtenerPedidos();
    const newId = obtenerSiguienteIdPedido(pedidosExistentes);

    const pedido = construirPedido({
        id: newId,
        datosFormulario,
        carritoItems: carritoFiltrado,
        fecha: new Date()
    });

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
    let mensaje = `🧾 Orden: ${pedido.id}\n\n`;
    mensaje += `🛒 Productos:\n`;
    pedido.productos.forEach(prod => {
        const ingredientesTexto = Array.isArray(prod.ingredientes) && prod.ingredientes.length > 0
            ? ` (${prod.ingredientes.join(', ')})`
            : '';
        mensaje += `• ${prod.nombre}${ingredientesTexto} x${prod.cantidad}\n`;
        if (prod.personalizacion) {
            mensaje += `  ✏️ Personalización: ${prod.personalizacion}\n`;
        }
    });
    mensaje += `\n💰 Total: $${pedido.total}\n\n`;
    if (pedido.nombre) mensaje += `👤 Nombre: ${pedido.nombre}\n`;
    mensaje += `📞 Teléfono: ${pedido.telefono}\n`;
    mensaje += `📦 Tipo: ${pedido.tipo}\n`;
    if (pedido.direccion) mensaje += `📍 Dirección: ${pedido.direccion}\n`;
    mensaje += `🕒 Horario: ${pedido.horario}\n`;
    mensaje += `💳 Pago: ${pedido.pago}\n`;
    if (pedido.aclaracion) mensaje += `📝 Aclaración: ${pedido.aclaracion}\n`;
    return mensaje;
}

// Enviar a WhatsApp
function enviarWhatsApp(mensaje) {
  const config = getConfig();
  const numero = config.whatsappNumber;
  const url = construirUrlWhatsApp(numero, mensaje);
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
    const config = getConfig();
    const failCount = (Number(localStorage.getItem(ADMIN_FAIL_COUNT_KEY)) || 0) + 1;
    localStorage.setItem(ADMIN_FAIL_COUNT_KEY, String(failCount));

    if (failCount >= config.adminMaxAttempts) {
        localStorage.setItem(ADMIN_LOCK_UNTIL_KEY, String(Date.now() + config.adminLockDuration));
        localStorage.setItem(ADMIN_FAIL_COUNT_KEY, '0');
        return true;
    }

    return false;
}

function mostrarMensajeAdmin(texto, tipo = 'error') {
    const mensaje = document.getElementById('mensaje-admin');
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className = `mensaje-admin ${tipo}`;
}

function limpiarMensajeAdmin() {
    const mensaje = document.getElementById('mensaje-admin');
    if (!mensaje) return;
    mensaje.textContent = '';
    mensaje.className = 'mensaje-admin oculto';
}

document.getElementById('admin-login').addEventListener('click', async () => {
    if (adminBloqueado()) {
        mostrarMensajeAdmin('Acceso bloqueado temporalmente. Intentá nuevamente en unos minutos.');
        return;
    }

    const config = getConfig();
    const password = document.getElementById('admin-password').value;
    const passwordHash = await hashTexto(password);
    if (passwordHash === config.adminPasswordHash) {
        localStorage.setItem(ADMIN_SESSION_KEY, String(Date.now() + config.adminSessionDuration));
        localStorage.setItem(ADMIN_FAIL_COUNT_KEY, '0');
        limpiarMensajeAdmin();
        document.getElementById('admin-content').style.display = 'block';
        cargarPedidosAdmin();
    } else {
        const bloqueado = registrarIntentoFallidoAdmin();
        if (bloqueado) {
            mostrarMensajeAdmin('Demasiados intentos fallidos. Acceso bloqueado por 5 minutos.');
            return;
        }
        mostrarMensajeAdmin('Contraseña incorrecta');
    }
});

document.getElementById('admin-password').addEventListener('input', limpiarMensajeAdmin);

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

// Generar opciones de horario dinámicamente
function generarOpcionesHorario() {
    const selectHorario = document.getElementById('horario');
    if (!selectHorario) return;
    
    // Rangos de horarios: Mañana (10:30 a 14:00) y Noche (18:30 a 22:45)
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
            
            // Incrementar 5 minutos
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

    const ahora = new Date();
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

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

// Debounce función para optimizar búsqueda
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Validación de solo números en tiempo real para teléfono
function configurarValidacionTelefono() {
    const inputTelefono = document.getElementById('telefono');
    if (!inputTelefono) return;
    
    inputTelefono.addEventListener('input', (e) => {
        // Eliminar cualquier carácter que no sea número, espacio, +, - o paréntesis
        e.target.value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
    });
    
    // Validación adicional en blur
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

// Inicializar
async function inicializarApp() {
    cargarCarrito();
    actualizarCarrito();
    generarOpcionesHorario();
    actualizarHorariosDisponibles();
    setInterval(actualizarHorariosDisponibles, 60 * 1000);
    configurarValidacionTelefono();

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
    
    // Event listener para búsqueda de productos con debounce
    const inputBusqueda = document.getElementById('buscar-producto');
    if (inputBusqueda) {
        const busquedaDebounced = debounce((valor) => {
            filtrarProductos(valor);
        }, 300); // 300ms de delay
        
        inputBusqueda.addEventListener('input', (e) => {
            busquedaDebounced(e.target.value);
        });
    }
}

document.addEventListener('DOMContentLoaded', inicializarApp);
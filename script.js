// Variables globales
let productos = [];
let carrito = [];

// Precios base por categoría
const PRECIOS = {
  simples: 1000,
  mixtos: 1300,
  triples: 1600,
  especiales: 1800
};

// Cargar productos
function cargarProductos() {
    const data = {
        "simples": [
            { "id": 1, "ingredientes": ["Queso", "Manteca"] },
            { "id": 2, "ingredientes": ["Jamón cocido", "Manteca"] },
            { "id": 3, "ingredientes": ["Salame de Milán", "Manteca"] },
            { "id": 4, "ingredientes": ["Lengua", "Mayonesa"] },
            { "id": 5, "ingredientes": ["Choclo", "Golf"] },
            { "id": 6, "ingredientes": ["Atún", "Golf"] },
            { "id": 7, "ingredientes": ["Roquefort", "Manteca"] },
            { "id": 8, "ingredientes": ["Arrollado", "Manteca"] },
            { "id": 9, "ingredientes": ["Mortadela", "Manteca"] },
            { "id": 10, "ingredientes": ["Anchoas", "Manteca"] },
            { "id": 11, "ingredientes": ["Peceto", "Mayonesa"] },
            { "id": 12, "ingredientes": ["Palmitos", "Golf"] },
            { "id": 14, "ingredientes": ["Jamón crudo", "Manteca"] },
            { "id": 15, "ingredientes": ["Pollo", "Manteca"] }
        ],
        "mixtos": [
            { "id": 20, "ingredientes": ["Jamón cocido", "Queso", "Manteca"] },
            { "id": 21, "ingredientes": ["Jamón cocido", "Queso", "Aceitunas"] },
            { "id": 22, "ingredientes": ["Jamón cocido", "Ananá", "Golf"] },
            { "id": 23, "ingredientes": ["Jamón crudo", "Ananá", "Golf"] },
            { "id": 24, "ingredientes": ["Jamón cocido", "Palmitos", "Golf"] },
            { "id": 25, "ingredientes": ["Jamón crudo", "Palmitos", "Golf"] },
            { "id": 26, "ingredientes": ["Jamón crudo", "Queso", "Manteca"] },
            { "id": 27, "ingredientes": ["Salame de Milán", "Queso", "Manteca"] },
            { "id": 28, "ingredientes": ["Arrollado", "Queso", "Manteca"] },
            { "id": 29, "ingredientes": ["Mortadela", "Queso", "Manteca"] },
            { "id": 30, "ingredientes": ["Lengua", "Queso", "Mayonesa"] },
            { "id": 31, "ingredientes": ["Lengua", "Huevo", "Mayonesa"] },
            { "id": 32, "ingredientes": ["Crema de choclo", "Queso", "Golf"] },
            { "id": 33, "ingredientes": ["Atún", "Morrones", "Golf o Mayonesa"] },
            { "id": 34, "ingredientes": ["Atún", "Morrones", "Aceitunas", "Golf"] },
            { "id": 35, "ingredientes": ["Anchoas", "Huevos", "Manteca"] },
            { "id": 36, "ingredientes": ["Jamón cocido", "Morrones", "Mayonesa"] },
            { "id": 37, "ingredientes": ["Jamón cocido", "Crema de choclo", "Golf"] },
            { "id": 38, "ingredientes": ["Queso", "Aceitunas", "Morrones", "Huevo"] },
            { "id": 39, "ingredientes": ["Espárragos", "Queso", "Huevo", "Mayonesa"] },
            { "id": 40, "ingredientes": ["Pollo", "Ananá", "Mayonesa"] },
            { "id": 41, "ingredientes": ["Pollo", "Crema de choclo", "Mayonesa"] },
            { "id": 42, "ingredientes": ["Pollo", "Morrones", "Golf"] },
            { "id": 43, "ingredientes": ["Pollo", "Aceitunas", "Golf"] },
            { "id": 44, "ingredientes": ["Pollo", "Palmitos", "Golf"] },
            { "id": 45, "ingredientes": ["Pollo", "Tomate", "Mayonesa"] }
        ],
        "triples": [
            { "id": 50, "ingredientes": ["Queso", "Tomate", "Lechuga", "Huevo", "Mayonesa"] },
            { "id": 51, "ingredientes": ["Jamón cocido", "Tomate", "Lechuga", "Huevo", "Mayonesa"] },
            { "id": 52, "ingredientes": ["Arrollado", "Tomate", "Lechuga", "Huevo", "Mayonesa"] },
            { "id": 53, "ingredientes": ["Mortadela", "Tomate", "Lechuga", "Huevo", "Mayonesa"] },
            { "id": 54, "ingredientes": ["Jamón", "Queso", "Tomate", "Lechuga", "Huevo", "Mayonesa"] },
            { "id": 55, "ingredientes": ["Jamón cocido", "Queso", "Choclo", "Golf"] },
            { "id": 56, "ingredientes": ["Jamón cocido", "Queso", "Morrones", "Tomate", "Mayonesa"] },
            { "id": 57, "ingredientes": ["Jamón crudo", "Queso", "Tomate", "Lechuga", "Mayonesa"] },
            { "id": 58, "ingredientes": ["Jamón crudo", "Palmitos", "Tomate", "Lechuga", "Huevo", "Golf"] },
            { "id": 59, "ingredientes": ["Lengua", "Tomate", "Lechuga", "Huevo", "Mayonesa"] },
            { "id": 60, "ingredientes": ["Jamón crudo", "Ananá", "Tomate", "Lechuga", "Huevo", "Golf"] },
            { "id": 61, "ingredientes": ["Pollo", "Tomate", "Lechuga", "Huevo", "Mayonesa"] },
            { "id": 62, "ingredientes": ["Pollo", "Aceitunas", "Morrones", "Huevo", "Golf"] },
            { "id": 63, "ingredientes": ["Atún", "Tomate", "Lechuga", "Huevo", "Golf"] },
            { "id": 64, "ingredientes": ["Atún", "Morrones", "Lechuga", "Huevo", "Golf"] },
            { "id": 65, "ingredientes": ["Peceto", "Tomate", "Lechuga", "Huevo", "Mayonesa"] }
        ],
        "especiales": [
            { "id": 69, "ingredientes": ["Verduras (Acelga - Zanahoria)"] },
            { "id": 70, "ingredientes": ["Jamón cocido", "Queso", "Kétchup"] },
            { "id": 71, "ingredientes": ["Jamón cocido", "Queso", "Tomate", "Mayonesa"] },
            { "id": 72, "ingredientes": ["Jamón cocido", "Queso", "Manteca"] },
            { "id": 73, "ingredientes": ["Jamón cocido", "Queso", "Morrones", "Huevo", "Mayonesa"] },
            { "id": 75, "ingredientes": ["Jamón cocido", "Queso", "Choclo", "Mayonesa"] },
            { "id": 76, "ingredientes": ["Espárragos", "Choclo", "Queso", "Manteca"] },
            { "id": 77, "ingredientes": ["Pollo", "Queso", "Morrones", "Mayonesa"] },
            { "id": 78, "ingredientes": ["Pollo", "Queso", "Jamón cocido", "Mayonesa"] },
            { "id": 79, "ingredientes": ["Pollo", "Queso", "Morrones", "Aceitunas", "Huevo", "Golf"] }
        ]
    };
    renderCategoria('Simples', data.simples, 'simples');
    renderCategoria('Mixtos', data.mixtos, 'mixtos');
    renderCategoria('Triples', data.triples, 'triples');
    renderCategoria('Tostados', data.especiales, 'especiales');
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
    
    productosArray.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'producto';
        const nombre = `${nombreVisible.slice(0, -1)} #${producto.id}`;
        const ingredientes = producto.ingredientes.join(', ');
        const precio = PRECIOS[tipoInterno];
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <h3>${nombre}</h3>
            <p>Ingredientes: ${ingredientes}</p>
            <p>$${precio}</p>
        `;
        div.appendChild(infoDiv);
        
        const button = document.createElement('button');
        button.textContent = 'Agregar al carrito';
        button.addEventListener('click', () => {
            agregarAlCarrito(producto.id, nombre, producto.ingredientes, precio);
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
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(id) {
    const index = carrito.findIndex(item => item.id === id);
    if (index > -1) {
        carrito.splice(index, 1);
        actualizarCarrito();
    }
}

// Generar pedido y enviar a WhatsApp
function generarPedido(event) {
    event.preventDefault();
    const tipo = document.getElementById('tipo').value;
    const direccion = document.getElementById('direccion').value;
    const horario = document.getElementById('horario').value;
    const pago = document.getElementById('pago').value;
    const telefono = document.getElementById('telefono').value;
    const nombre = document.getElementById('nombre').value;
    const aclaracion = document.getElementById('aclaracion').value;

    // Validaciones
    if (!telefono) {
        alert('Teléfono es obligatorio');
        return;
    }
    if (tipo === 'Envío' && !direccion) {
        alert('Dirección es obligatoria para Envío');
        return;
    }
    if (tipo === 'Retiro' && !nombre) {
        alert('Nombre es obligatorio para Retiro');
        return;
    }
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    // Filtrar productos con cantidad > 0
    const carritoFiltrado = carrito.filter(item => item.cantidad > 0);
    if (carritoFiltrado.length === 0) {
        alert('No hay productos con cantidad válida en el carrito');
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
    document.getElementById('form-pedido').reset();
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
});

document.getElementById('admin-login').addEventListener('click', () => {
    const password = document.getElementById('admin-password').value;
    if (password === 'admin') {
        document.getElementById('admin-content').style.display = 'block';
        cargarPedidosAdmin();
    } else {
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
document.addEventListener('DOMContentLoaded', cargarProductos);
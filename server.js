const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// Base de datos SQLite
// ============================================

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la BD:', err);
    } else {
        console.log('✅ Conectado a SQLite en:', dbPath);
        inicializarBD();
    }
});

// Promisify database methods
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const parsearProductos = (productos) => {
    if (Array.isArray(productos)) {
        return productos;
    }

    try {
        return JSON.parse(productos || '[]');
    } catch {
        return [];
    }
};

const obtenerReferenciaPedido = (pedido) => {
    if (pedido.tipo === 'Envío') {
        return pedido.direccion || null;
    }
    return pedido.nombre || null;
};

const formatearPedidoParaCliente = (pedido) => {
    const pedidoFormateado = {
        ...pedido,
        productos: parsearProductos(pedido.productos),
        referencia: obtenerReferenciaPedido(pedido)
    };

    delete pedidoFormateado.estado;
    return pedidoFormateado;
};

const loadAppConfig = () => {
    try {
        const config = require('./config.js');
        return config?.CONFIG || {};
    } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') {
            console.warn('⚠️ No se pudo cargar config.js:', error.message);
        }
        return {};
    }
};

// Inicializar tablas
function inicializarBD() {
    // Tabla de pedidos
    db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id TEXT PRIMARY KEY,
            telefono TEXT NOT NULL,
            nombre TEXT,
            tipo TEXT NOT NULL,
            direccion TEXT,
            horario TEXT NOT NULL,
            pago TEXT NOT NULL,
            aclaracion TEXT,
            productos JSON NOT NULL,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            notas TEXT
        )
    `);

    // Tabla de admin
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_expiracion DATETIME NOT NULL
        )
    `);

    console.log('✅ Tablas de BD inicializadas');
}

// ============================================
// Rutas del API
// ============================================

// GET: Obtener todos los pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const estado = req.query.estado;
        let query = 'SELECT * FROM pedidos ORDER BY fecha DESC';
        let params = [];

        if (estado && estado !== 'todos') {
            query += ' WHERE estado = ?';
            params.push(estado);
        }

        const pedidos = await dbAll(query, params);
        res.json({
            success: true,
            data: pedidos.map(formatearPedidoParaCliente)
        });
    } catch (error) {
        console.error('Error en GET /api/pedidos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Obtener un pedido específico
app.get('/api/pedidos/:id', async (req, res) => {
    try {
        const pedido = await dbGet('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
        if (!pedido) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }
        res.json({
            success: true,
            data: formatearPedidoParaCliente(pedido)
        });
    } catch (error) {
        console.error('Error en GET /api/pedidos/:id:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Crear nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    try {
        const { id, telefono, nombre, tipo, direccion, horario, pago, aclaracion, productos, total } = req.body;

        // Validación básica
        if (!id || !telefono || !tipo || !horario || !pago || !productos || !total) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan campos requeridos' 
            });
        }

        const stmt = `
            INSERT INTO pedidos (id, telefono, nombre, tipo, direccion, horario, pago, aclaracion, productos, total, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
        `;

        await dbRun(stmt, [
            id,
            telefono,
            nombre || null,
            tipo,
            direccion || null,
            horario,
            pago,
            aclaracion || null,
            JSON.stringify(productos),
            total
        ]);

        res.status(201).json({
            success: true,
            message: 'Pedido creado correctamente',
            data: {
                id,
                telefono,
                nombre,
                tipo,
                direccion: direccion || null,
                referencia: tipo === 'Envío' ? (direccion || null) : (nombre || null),
                horario,
                total
            }
        });
    } catch (error) {
        console.error('Error en POST /api/pedidos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT: Actualizar estado de pedido
app.put('/api/pedidos/:id/estado', async (req, res) => {
    try {
        const { estado, notas } = req.body;
        
        if (!estado) {
            return res.status(400).json({ success: false, error: 'Estado es requerido' });
        }

        const estadosValidos = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ success: false, error: 'Estado inválido' });
        }

        let query = 'UPDATE pedidos SET estado = ?';
        let params = [estado];

        if (notas) {
            query += ', notas = ?';
            params.push(notas);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        const result = await dbRun(query, params);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }

        res.json({
            success: true,
            message: 'Estado actualizado correctamente'
        });
    } catch (error) {
        console.error('Error en PUT /api/pedidos/:id/estado:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT: Agregar notas a un pedido
app.put('/api/pedidos/:id/notas', async (req, res) => {
    try {
        const { notas } = req.body;

        if (!notas) {
            return res.status(400).json({ success: false, error: 'Notas son requeridas' });
        }

        const result = await dbRun('UPDATE pedidos SET notas = ? WHERE id = ?', [notas, req.params.id]);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }

        res.json({
            success: true,
            message: 'Notas actualizadas correctamente'
        });
    } catch (error) {
        console.error('Error en PUT /api/pedidos/:id/notas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: Eliminar pedido
app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM pedidos WHERE id = ?', [req.params.id]);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }

        res.json({
            success: true,
            message: 'Pedido eliminado correctamente'
        });
    } catch (error) {
        console.error('Error en DELETE /api/pedidos/:id:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Estadísticas del panel admin
app.get('/api/estadisticas', async (req, res) => {
    try {
        const totalPedidos = await dbGet('SELECT COUNT(*) as count FROM pedidos');
        const totalVentas = await dbGet('SELECT SUM(total) as total FROM pedidos');
        const pedidosPendientes = await dbGet('SELECT COUNT(*) as count FROM pedidos WHERE estado = "pendiente"');
        const pedidosPreparando = await dbGet('SELECT COUNT(*) as count FROM pedidos WHERE estado = "preparando"');
        const pedidosListos = await dbGet('SELECT COUNT(*) as count FROM pedidos WHERE estado = "listo"');

        const productosTop = await dbAll(`
            SELECT 
                json_extract(value, '$.nombre') as nombre,
                SUM(CAST(json_extract(value, '$.cantidad') AS INTEGER)) as total_vendido
            FROM pedidos, json_each(pedidos.productos)
            GROUP BY nombre
            ORDER BY total_vendido DESC
            LIMIT 10
        `);

        const pagoPorTipo = await dbAll(`
            SELECT pago, COUNT(*) as count FROM pedidos GROUP BY pago
        `);

        res.json({
            success: true,
            data: {
                totalPedidos: totalPedidos?.count || 0,
                totalVentas: totalVentas?.total || 0,
                pedidosPendientes: pedidosPendientes?.count || 0,
                pedidosPreparando: pedidosPreparando?.count || 0,
                pedidosListos: pedidosListos?.count || 0,
                productosTop: productosTop || [],
                pagoPorTipo: pagoPorTipo || []
            }
        });
    } catch (error) {
        console.error('Error en GET /api/estadisticas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Exportar pedidos a JSON
app.get('/api/exportar/json', async (req, res) => {
    try {
        const pedidos = await dbAll('SELECT * FROM pedidos ORDER BY fecha DESC');
        const pedidosFormateados = pedidos.map(formatearPedidoParaCliente);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="pedidos.json"');
        res.json(pedidosFormateados);
    } catch (error) {
        console.error('Error en GET /api/exportar/json:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Rutas de autenticación Admin
// ============================================

// POST: Login admin
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, error: 'Contraseña requerida' });
        }

        const config = loadAppConfig();
        const adminPasswordHash = config.adminPasswordHash || process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH;

        // Generar hash de la contraseña ingresada
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (passwordHash !== adminPasswordHash) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }

        // Crear token de sesión
        const token = crypto.randomBytes(32).toString('hex');
        const fechaExpiracion = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

        await dbRun(
            'INSERT INTO admin_sessions (token, fecha_expiracion) VALUES (?, ?)',
            [token, fechaExpiracion]
        );

        res.json({
            success: true,
            token: token,
            message: 'Sesión iniciada correctamente'
        });
    } catch (error) {
        console.error('Error en POST /api/admin/login:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Middleware para verificar token de admin
const verificarTokenAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'Token no proporcionado' });
        }

        const sesion = await dbGet(
            'SELECT * FROM admin_sessions WHERE token = ? AND fecha_expiracion > datetime("now")',
            [token]
        );

        if (!sesion) {
            return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST: Logout admin
app.post('/api/admin/logout', verificarTokenAdmin, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        await dbRun('DELETE FROM admin_sessions WHERE token = ?', [token]);
        res.json({ success: true, message: 'Sesión cerrada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Servir frontend
// ============================================

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta catch-all para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// Manejo de errores
// ============================================

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// ============================================
// Iniciar servidor
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});

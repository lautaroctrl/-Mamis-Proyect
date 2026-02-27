const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const logger = require('../utils/logger');

const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        logger.error('Error al conectar a SQLite', { error: err, dbPath });
        return;
    }

    logger.info('Conectado a SQLite', { dbPath });
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
        if (err) {
            reject(err);
            return;
        }

        resolve(this);
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) {
            reject(err);
            return;
        }

        resolve(rows || []);
    });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) {
            reject(err);
            return;
        }

        resolve(row);
    });
});

const initializeDatabase = async () => {
    await dbRun(`
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

    await dbRun(`
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_expiracion DATETIME NOT NULL
        )
    `);

    await dbRun(`
        CREATE TABLE IF NOT EXISTS metrics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            level TEXT NOT NULL DEFAULT 'info',
            payload TEXT,
            timestamp DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    logger.info('Tablas de BD inicializadas');
};

module.exports = {
    db,
    dbRun,
    dbAll,
    dbGet,
    initializeDatabase
};

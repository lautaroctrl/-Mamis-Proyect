const crypto = require('crypto');
const { dbGet, dbRun } = require('../db/sqliteClient');
const { getAdminPasswordHash, adminSessionDurationMs } = require('../config/appConfig');
const AppError = require('../utils/appError');

const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

const createSession = async () => {
    const token = crypto.randomBytes(32).toString('hex');
    const expirationDate = new Date(Date.now() + adminSessionDurationMs).toISOString();

    await dbRun(
        'INSERT INTO admin_sessions (token, fecha_expiracion) VALUES (?, ?)',
        [token, expirationDate]
    );

    return token;
};

const loginAdmin = async (password) => {
    if (!password) {
        throw new AppError('Contraseña requerida', 400);
    }

    const expectedHash = getAdminPasswordHash();
    if (!expectedHash) {
        throw new AppError('Configuración de ADMIN_PASSWORD_HASH faltante', 500, {
            code: 'MISSING_ADMIN_HASH',
            expose: false
        });
    }

    const passwordHash = hashPassword(password);

    if (passwordHash !== expectedHash) {
        throw new AppError('Contraseña incorrecta', 401);
    }

    const token = await createSession();
    return token;
};

const validateSessionToken = async (token) => {
    if (!token) {
        throw new AppError('Token no proporcionado', 401);
    }

    const session = await dbGet(
        'SELECT * FROM admin_sessions WHERE token = ? AND datetime(fecha_expiracion) > datetime("now")',
        [token]
    );

    if (!session) {
        throw new AppError('Token inválido o expirado', 401);
    }
};

const logoutAdmin = async (token) => {
    await dbRun('DELETE FROM admin_sessions WHERE token = ?', [token]);
};

module.exports = {
    loginAdmin,
    validateSessionToken,
    logoutAdmin
};

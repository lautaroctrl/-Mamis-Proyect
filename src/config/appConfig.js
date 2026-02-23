require('dotenv').config();

const DEFAULT_ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

const loadClientConfig = () => {
    try {
        const config = require('../../config.js');
        return config?.CONFIG || {};
    } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') {
            console.warn('⚠️ No se pudo cargar config.js:', error.message);
        }

        return {};
    }
};

const getAdminPasswordHash = () => {
    const config = loadClientConfig();
    return config.adminPasswordHash || process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH;
};

module.exports = {
    port: process.env.PORT || 3000,
    getAdminPasswordHash
};

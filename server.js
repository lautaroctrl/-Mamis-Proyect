const app = require('./src/app');
const { port, nodeEnv } = require('./src/config/appConfig');
const { initializeDatabase } = require('./src/db/sqliteClient');
const logger = require('./src/utils/logger');

const shutdownWithError = (reason, error) => {
    logger.error(reason, { error });
    process.exit(1);
};

process.on('uncaughtException', (error) => {
    shutdownWithError('uncaughtException capturada', error);
});

process.on('unhandledRejection', (reason) => {
    const rejectionError = reason instanceof Error ? reason : new Error(String(reason));
    shutdownWithError('unhandledRejection capturada', rejectionError);
});

const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(port, () => {
            logger.info('Servidor inicializado', {
                port,
                env: nodeEnv,
                url: `http://localhost:${port}`
            });
        });
    } catch (error) {
        shutdownWithError('Error al iniciar el servidor', error);
    }
};

startServer();

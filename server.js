const app = require('./src/app');
const {
    port,
    nodeEnv,
    dbBackupIntervalHours,
    dbBackupRetentionDays,
    metricsRetentionDays
} = require('./src/config/appConfig');
const { initializeDatabase } = require('./src/db/sqliteClient');
const { createDatabaseBackup, cleanupOldBackups } = require('./src/services/databaseBackupService');
const { pruneOldMetrics } = require('./src/services/metricsService');
const logger = require('./src/utils/logger');

const shutdownWithError = (reason, error) => {
    logger.error(reason, { error });
    process.exit(1);
};

const runMaintenanceCycle = async () => {
    await createDatabaseBackup();
    await cleanupOldBackups(dbBackupRetentionDays);
    await pruneOldMetrics(metricsRetentionDays);
};

const startMaintenanceScheduler = () => {
    const intervalMs = dbBackupIntervalHours * 60 * 60 * 1000;

    setInterval(async () => {
        try {
            await runMaintenanceCycle();
        } catch (error) {
            logger.error('Fallo en tarea de mantenimiento programada', { error });
        }
    }, intervalMs);
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
        await runMaintenanceCycle();
        startMaintenanceScheduler();

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

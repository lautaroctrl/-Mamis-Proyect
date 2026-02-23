const app = require('./src/app');
const { port } = require('./src/config/appConfig');
const { initializeDatabase } = require('./src/db/sqliteClient');

const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(port, () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${port}`);
            console.log(`📍 http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();

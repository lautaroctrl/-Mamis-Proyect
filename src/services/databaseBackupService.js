const path = require('path');
const fs = require('fs/promises');
const { dbPath } = require('../db/sqliteClient');
const logger = require('../utils/logger');

const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');

const timestampLabel = (date = new Date()) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');
    const second = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hour}${minute}${second}`;
};

const ensureBackupDir = async () => {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
};

const createDatabaseBackup = async () => {
    await ensureBackupDir();

    const backupFileName = `database-${timestampLabel()}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    await fs.copyFile(dbPath, backupPath);

    logger.info('Backup de SQLite creado', {
        source: dbPath,
        backupPath
    });

    return backupPath;
};

const cleanupOldBackups = async (retentionDays) => {
    await ensureBackupDir();

    const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
    const cutoffMs = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

    let deletedCount = 0;

    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.db')) {
            continue;
        }

        const filePath = path.join(BACKUP_DIR, entry.name);
        const stats = await fs.stat(filePath);

        if (stats.mtimeMs < cutoffMs) {
            await fs.unlink(filePath);
            deletedCount += 1;
        }
    }

    if (deletedCount > 0) {
        logger.info('Backups antiguos eliminados', {
            deletedCount,
            retentionDays
        });
    }

    return deletedCount;
};

module.exports = {
    createDatabaseBackup,
    cleanupOldBackups,
    BACKUP_DIR
};

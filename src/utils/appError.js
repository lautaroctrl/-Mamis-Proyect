class AppError extends Error {
    constructor(message, statusCode = 500, options = {}) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = options.code || 'APP_ERROR';
        this.details = options.details;
        this.expose = options.expose ?? statusCode < 500;
    }
}

module.exports = AppError;

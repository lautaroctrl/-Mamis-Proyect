const { validateSessionToken } = require('../services/adminService');

const extractBearerToken = (authorizationHeader = '') => authorizationHeader.replace('Bearer ', '');

const verifyAdminToken = async (req, _res, next) => {
    try {
        const token = extractBearerToken(req.headers.authorization);
        await validateSessionToken(token);
        req.adminToken = token;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyAdminToken,
    extractBearerToken
};

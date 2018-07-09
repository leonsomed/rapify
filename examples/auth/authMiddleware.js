const jwtExpress = require('express-jwt');

const authMiddleware = jwtExpress({
    secret: 'your-256-bit-secret',
    credentialsRequired: true,
    requestProperty: 'jwt',
});

module.exports = authMiddleware;

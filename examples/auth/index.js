const rapify = require('../../src/index');
const userController = require('./controller');
const publicController = require('./publicController');
const authMiddleware = require('./authMiddleware');

rapify.bootstrap({
    onStart: () => console.log('rapify server listening...'),
    port: 3000,
    cors: true,
    bodyParser: true,
    authMiddleware: [
        authMiddleware,
    ],
    controllers: [
        userController,
        publicController,
    ],
});

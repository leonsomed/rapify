const rapify = require('../../src/index');
const userController = require('./controller');

rapify.bootstrap({
    onStart: () => console.log('rapify server listening...'),
    port: 3000,
    cors: true,
    bodyParser: true,
    // middleware: [
    //     (req, res, next) => {},
    //     {
    //         middleware: (req, res, next) => {},
    //         level: 'preDefault',
    //     },
    // ],
    // authMiddleware: [],
    controllers: [
        userController,
    ],
});

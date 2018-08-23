const rapify = require('../../../src/index');
const controller = require('./controller');

const app = rapify.bootstrap({
    onStart: () => console.log('rapify server listening...'),
    cors: true,
    bodyParser: true,
    controllers: [
        controller,
    ],
});

module.exports = app;

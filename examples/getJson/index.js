const rapify = require('../../src/index');
const controller = require('./controller');

rapify.bootstrap({
    onStart: () => console.log('rapify server listening...'),
    port: 3000,
    bodyParser: true,
    // turns off/on getJson for the whole app
    getJson: true,
    controllers: [
        controller,
    ],
});

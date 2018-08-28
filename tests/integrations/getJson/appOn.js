const rapify = require('../../../lib');
const controllerOn = require('./controllerOn');
const controllerOff = require('./controllerOff');
const controllerNone = require('./controllerNone');

const app = rapify.bootstrap({
    onStart: () => console.log('rapify server listening...'),
    bodyParser: true,
    getJson: true,
    controllers: [
        controllerOn,
        controllerOff,
        controllerNone,
    ],
});

module.exports = app;

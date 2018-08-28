const rapify = require('../../../lib');
const controller = require('./controller');

const app = rapify.bootstrap({
    onStart: () => console.log('rapify server listening...'),
    bodyParser: true,
    controllers: [
        controller,
    ],
});

module.exports = app;

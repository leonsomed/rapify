const rapify = require('../../../src/index');
const controller = require('./controller');

const app = rapify.bootstrap({
    onStart: () => console.log('rapify server listening...'),
    bodyParser: true,
    middleware: [
        {
            middleware: (req, res, next) => {
                req.test = {};
                req.test.midApp1 = true;
                next();
            },
            level: 'preDefault',
        },
        (req, res, next) => {
            req.test.midApp2 = true;
            next();
        },
    ],
    controllers: [
        controller,
    ],
});

module.exports = app;

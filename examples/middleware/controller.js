const rapify = require('../../src/index');

const { GET } = rapify.constants.http;

module.exports = {
    prefix: '/middleware',
    middleware: [
        (req, res, next) => {
            console.log('controller level middleware 1');
            next();
        },
        (req, res, next) => {
            console.log('controller level middleware 2');
            next();
        },
    ],
    endpoints: {
        '/controller': {
            [GET]: {
                handler: (req, response) => {
                    response({ message: 'controller' });
                },
            },
        },
        '/controller/ignore': {
            [GET]: {
                ignoreControllerMiddleware: true,
                handler: (req, response) => {
                    response({ message: 'controller ignore' });
                },
            },
        },
        '/endpoint': {
            [GET]: {
                middleware: [
                    (req, res, next) => {
                        console.log('endpoint level middleware 1');
                        next();
                    },
                    (req, res, next) => {
                        console.log('endpoint level middleware 2');
                        next();
                    },
                ],
                handler: (req, response) => {
                    response({ message: 'endpoint' });
                },
            },
        },
    },
};

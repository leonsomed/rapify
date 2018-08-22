const rapify = require('../../../src/index');

const { GET } = rapify.constants.http;

module.exports = {
    prefix: '/middleware',
    public: true,
    middleware: [
        (req, res, next) => {
            req.test.midController1 = true;
            next();
        },
        (req, res, next) => {
            req.test.midController2 = true;
            next();
        },
    ],
    endpoints: {
        '/controller': {
            [GET]: {
                handler: (req, response) => {
                    response(req.test);
                },
            },
        },
        '/controller/ignore': {
            [GET]: {
                ignoreControllerMiddleware: true,
                handler: (req, response) => {
                    response(req.test);
                },
            },
        },
        '/endpoint': {
            [GET]: {
                middleware: [
                    (req, res, next) => {
                        req.test.midEndpoint1 = true;
                        next();
                    },
                    (req, res, next) => {
                        req.test.midEndpoint2 = true;
                        next();
                    },
                ],
                handler: (req, response) => {
                    response(req.test);
                },
            },
        },
    },
};

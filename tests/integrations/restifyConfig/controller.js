const rapify = require('../../../lib');

const NotAuthorizedError = rapify.errors.notAuthorized;
const memoryInterface = rapify.crudInterfaces.memory;
const { POST } = rapify.constants.http;

function authMiddleware(req, res, next) {
    if (req.headers.test === '123') {
        next();
    } else {
        next(new NotAuthorizedError());
    }
}

module.exports = {
    prefix: '/restify',
    middleware: [
        authMiddleware,
    ],
    restify: {
        create: {
            ignoreControllerMiddleware: true,
            middleware: [
                authMiddleware,
            ],
            dataMap(req) {
                return {
                    ...req.rapify.input,
                    extra: 100000,
                };
            },
            body: {
                name: {},
                age: {},
            },
        },
        update: true,
        delete: true,
        read: {
            ignoreControllerMiddleware: true,
        },
        paginate: {
            ignoreControllerMiddleware: true,
        },
    },
    crudInterface: memoryInterface(),
    endpoints: {
        '/x-crud-op/update': {
            [POST]: {
                xCrudOp: 'update',
                body: {
                    id: {},
                    name: {},
                    age: {},
                },
            },
        },
    },
};

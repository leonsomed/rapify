const rapify = require('../../src/index');
const authMiddleware = require('./authMiddleware');

const memoryInterface = rapify.crudInterfaces.memory;

module.exports = {
    prefix: '/users',
    middleware: [
        // all endpoint require auth (this middleware)
        authMiddleware,
    ],
    restify: {
        create: {
            // you can define middleware here for this endpoint only
            middleware: [
                authMiddleware,
            ],
        },
        update: true,
        delete: true,
        read: {
            // this endpoint ignores controller middleware so no auth required
            ignoreControllerMiddleware: true,
        },
        paginate: {
            ignoreControllerMiddleware: true,
        },
    },
    crudInterface: memoryInterface(),
};

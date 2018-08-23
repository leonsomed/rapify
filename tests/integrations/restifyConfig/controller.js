const rapify = require('../../../src/index');
const NotAuthorizedError = require('../../../src/errors/notAuthorized');

const memoryInterface = rapify.crudInterfaces.memory;

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
};

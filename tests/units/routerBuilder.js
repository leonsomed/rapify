const expect = require('chai').expect;
const rapify = require('../../lib');
const controllerMocks = require('../mocks/controller');

const routerBuilder = rapify.routerBuilder;
const memoryInterface = rapify.crudInterfaces.memory;
const { GET, POST, DELETE } = rapify.constants.http;

function getControllerRoutes(controller) {
    const endpointKeys = controller.endpoints ? Object.keys(controller.endpoints) : [];
    let controllerRoutes = endpointKeys.map((key) => {
        const method = Object.keys(controller.endpoints[key])[0];

        return {
            path: key,
            method,
        };
    });

    if (controller.restify) {
        if (typeof controller.restify === 'boolean') {
            controllerRoutes = [
                ...controllerRoutes,
                { path: '/', method: POST },
                { path: '/:id', method: GET },
                { path: '/:id', method: POST },
                { path: '/:id', method: DELETE },
                { path: '/', method: GET },
            ];
        } else {
            if (controller.restify.create) {
                controllerRoutes.push({ path: '/', method: POST });
            }

            if (controller.restify.read) {
                controllerRoutes.push({ path: '/:id', method: GET });
            }

            if (controller.restify.update) {
                controllerRoutes.push({ path: '/:id', method: POST });
            }

            if (controller.restify.delete) {
                controllerRoutes.push({ path: '/:id', method: DELETE });
            }

            if (controller.restify.paginate) {
                controllerRoutes.push({ path: '/', method: GET });
            }
        }
    }

    return controllerRoutes;
}

const validateControllerWrapper = controller => () => {
    const router = routerBuilder.fromController(controller);
    const controllerRoutes = getControllerRoutes(controller);
    const routerRoutes = router.stack.map(({ route }) => ({
        path: route.path,
        method: Object.keys(route.methods)[0],
    }));

    routerRoutes.sort((a, b) => {
        const x = `${a.path}${a.method}`;
        const y = `${b.path}${b.method}`;

        if (x > y) return 1;
        if (x < y) return -1;
        return 0;
    });

    controllerRoutes.sort((a, b) => {
        const x = `${a.path}${a.method}`;
        const y = `${b.path}${b.method}`;

        if (x > y) return 1;
        if (x < y) return -1;
        return 0;
    });

    expect(controllerRoutes).to.eqls(routerRoutes);
};

describe('routerBuilder', () => {
    it('should receive a single parameter: "controllers"', () => {
        expect(routerBuilder.fromController).to.have.lengthOf(1);
    });

    it('should register endpoints', () => {
        const controller = {
            prefix: 'users',
            endpoints: {
                ...controllerMocks.endpoints.default('/validate', GET),
                ...controllerMocks.endpoints.default('/complex/:key', GET),
            },
        };

        expect(validateControllerWrapper(controller)).to.not.throw();
    });

    it('should fail to register restify endpoints', () => {
        const controller = {
            prefix: 'users',
            restify: true,
            // missing crud interface on purpose
        };

        expect(validateControllerWrapper(controller)).to.throw();
    });

    it('should register restify endpoints', () => {
        const controller = {
            prefix: 'users',
            restify: true,
            crudInterface: memoryInterface(),
        };

        expect(validateControllerWrapper(controller)).to.not.throw();
    });

    it('should register some restify endpoints', () => {
        const controller = {
            prefix: 'users',
            restify: {
                create: true,
                read: true,
            },
            crudInterface: memoryInterface(),
        };

        expect(validateControllerWrapper(controller)).to.not.throw();
    });

    it('should register combination of restify and custom endpoints', () => {
        const controller = {
            prefix: 'users',
            restify: {
                create: true,
                read: true,
            },
            crudInterface: memoryInterface(),
            endpoints: {
                ...controllerMocks.endpoints.default('/validate', GET),
            },
        };

        expect(validateControllerWrapper(controller)).to.not.throw();
    });

    it('should register controller level middleware', () => {
        const controller = {
            prefix: 'users',
            middleware: [
                (req, res, next) => {
                    req.test = 'ok';
                    next();
                },
            ],
            endpoints: {
                '/': {
                    [GET]: {
                        handler: (req, response) => {
                            response({ message: req.test });
                        },
                    },
                },
            },
        };

        expect(validateControllerWrapper(controller)).to.not.throw();
    });

    it('should register endpoint level middleware', () => {
        const controller = {
            prefix: 'users',
            endpoints: {
                '/': {
                    [GET]: {
                        middleware: [
                            (req, res, next) => {
                                req.test = 'ok';
                                next();
                            },
                        ],
                        handler: (req, response) => {
                            response({ message: req.test });
                        },
                    },
                },
            },
        };

        expect(validateControllerWrapper(controller)).to.not.throw();
    });

    it('should register restify with custom configuration', () => {
        const controller = {
            prefix: 'users',
            middleware: [
                (req, res, next) => next(),
            ],
            restify: {
                create: {
                    middleware: [
                        (req, res, next) => next(),
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

        expect(validateControllerWrapper(controller)).to.not.throw();
    });
});

const _ = require('lodash');
const express = require('express');
const constants = require('./constants');
const asyncRoute = require('./middleware/asyncRoute');
const endpointValidator = require('./middleware/endpointValidator');
const mongooseCrudInterface = require('./crudInterfaces/mongoose');
const util = require('./helpers/util');

const allowedCrudOps = [
    constants.crud.create,
    constants.crud.read,
    constants.crud.update,
    constants.crud.delete,
    constants.crud.paginate,
];

function parseController(controller) {
    const newController = { ...controller };
    const { model, crudInterface } = newController;

    if (model && crudInterface) {
        throw new Error(`Cannot specify both model and crudInterface for controller: ${controller.prefix}`);
    }

    if (model) {
        newController.crudInterface = mongooseCrudInterface(model);
    }

    if (!controller.middleware) {
        newController.middleware = [];
    }

    return newController;
}

function buildRestEndpoint(operation, controller) {
    const { POST, DELETE, GET } = constants.http;

    switch (operation) {
        case constants.crud.create: {
            return {
                keepExtraFields: true,
                xCrudOp: operation,
                fullRoute: `${controller.prefix}/`,
                relativeRoute: '/',
                method: POST,
                // formatRules
                ignoreControllerMiddleware: false,
                middleware: [],
            };
        }

        case constants.crud.read: {
            return {
                keepExtraFields: true,
                xCrudOp: operation,
                fullRoute: `${controller.prefix}/:id`,
                relativeRoute: '/:id',
                method: GET,
                // formatRules
                ignoreControllerMiddleware: false,
                middleware: [],
            };
        }

        case constants.crud.update: {
            return {
                keepExtraFields: true,
                xCrudOp: operation,
                fullRoute: `${controller.prefix}/:id`,
                relativeRoute: '/:id',
                method: POST,
                // formatRules
                ignoreControllerMiddleware: false,
                middleware: [],
            };
        }

        case constants.crud.delete: {
            return {
                keepExtraFields: true,
                xCrudOp: operation,
                fullRoute: `${controller.prefix}/:id`,
                relativeRoute: '/:id',
                method: DELETE,
                // formatRules
                ignoreControllerMiddleware: false,
                middleware: [],
            };
        }

        case constants.crud.paginate: {
            return {
                keepExtraFields: true,
                xCrudOp: operation,
                fullRoute: `${controller.prefix}/`,
                relativeRoute: '/',
                method: GET,
                ignoreControllerMiddleware: false,
                middleware: [],
                params: formatRules({
                    pagination: {
                        page: {
                            constraints: {
                                numericality: {
                                    onlyInteger: true,
                                    greaterThanOrEqualTo: 1,
                                },
                            },
                            sanitize: val => +val,
                            default: 1,
                        },
                        pageSize: {
                            constraints: {
                                numericality: {
                                    onlyInteger: true,
                                    greaterThanOrEqualTo: 1,
                                    lessThanOrEqualTo: 100,
                                },
                            },
                            sanitize: val => +val,
                            default: 20,
                        },
                        sortBy: {
                            constraints: {
                                inclusion: {
                                    within: [
                                        '_id',
                                    ],
                                    message: '^Invalid sortBy value',
                                },
                            },
                            default: '_id',
                        },
                        sortOrder: {
                            constraints: {
                                inclusion: {
                                    within: [
                                        'asc',
                                        'desc',
                                    ],
                                    message: '^Invalid sortOrder value',
                                },
                            },
                            default: 'desc',
                        },
                    },
                }),
            };
        }
    }

    throw new Error('invalid operation provided');
}

function parseEndpoints(controller) {
    const { restify, crudInterface, prefix } = controller;
    const missingEndpoints = [];

    if (restify) {
        // verify each restify operation has a corresponding CRUD interface operation
        let restOperations = {};

        if (typeof restify === 'boolean') {
            restOperations = {
                [constants.crud.create]: true,
                [constants.crud.read]: true,
                [constants.crud.update]: true,
                [constants.crud.delete]: true,
                [constants.crud.paginate]: true,
            };
        } else {
            restOperations = restify;
        }

        const operationKeys = Object.keys(util.filterObj(restOperations, n => n));

        if (!crudInterface && operationKeys.length) {
            throw new Error(`crudInterface or model is required when restify is enabled for controller: ${prefix}`);
        }

        operationKeys.forEach((op) => {
            if (!crudInterface[op]) {
                throw new Error(`crudInterface operation: ${op} is required because restify operation: ${op} is enabled for controller: ${prefix}`);
            }

            if (typeof crudInterface[op] !== 'function') {
                throw new Error(`crudInterface operation: ${op} must be a function for controller: ${prefix}`);
            }

            missingEndpoints.push(buildRestEndpoint(op, controller));
        });
    }

    // flatten endpoints and add properties
    const newEndpoints = controller.endpoints ?
        _.flatMapDeep(Object.entries(controller.endpoints), ([route, endpoints]) => (
            Object.entries(endpoints).map(([method, endpoint]) => ({
                fullRoute: `${controller.prefix}${route}`,
                relativeRoute: route,
                method,
                ignoreControllerMiddleware: Boolean(endpoint.ignoreControllerMiddleware),
                middleware: endpoint.middleware || [],
                ...formatEndpointRules(endpoint),
            }))
        )) : [];

    // inject any missing endpoints
    for (const missing of missingEndpoints) {
        const found = newEndpoints.find(n => (
            n.fullRoute === missing.fullRoute &&
            n.method === missing.method
        ));

        if (!found) {
            newEndpoints.push(missing);
        }
    }

    return newEndpoints;
}

function formatEndpointRules(endpoint) {
    return {
        ...endpoint,
        ...endpoint.params && { params: formatRules(endpoint.params) },
        ...endpoint.body && { body: formatRules(endpoint.body) },
        ...endpoint.query && { query: formatRules(endpoint.query) },
        ...endpoint.props && { props: formatRules(endpoint.props) },
    };
}

function formatRules(rules) {
    if (!rules) {
        return {};
    }

    rules = _.omit(rules, [
        '__has_children',
        '__is_array',
        'arrayConstraints',
    ]);

    for (const [, rule] of Object.entries(rules)) {
        let isArray = false;
        let hasChildren = false;

        if (Array.isArray(rule)) {
            if (rule.length === 0 || rule.length > 1) {
                throw new Error('missing array validation config');
            }

            isArray = true;

            if (ruleHasChildren(rule[0])) {
                rule[0].__has_children = true;
                hasChildren = true;
            }
        } else if (ruleHasChildren(rule)) {
            rule.__has_children = true;
            hasChildren = true;
        }

        if (hasChildren) {
            formatRules(isArray ? rule[0] : rule);
        }
    }

    return rules;
}

function ruleHasChildren(obj) {
    const knownKeys = [
        'arrayConstraints',
        'constraints',
        'sanitize',
        'default',
    ];
    const strippedObj = _.omit(obj, knownKeys);
    const keys = Object.keys(strippedObj);

    return Boolean(keys.length);
}

function getCrudOpHandler(xCrudOp, crudInterface) {
    return asyncRoute(async (req, res, next) => {
        if (res.locals.wasRouteHandled) {
            next();
            return;
        }

        const temp = crudInterface[xCrudOp](req.rapify);
        const result = temp && typeof temp.then === 'function' ? await temp : temp;

        res.locals.response = { data: result };
        res.locals.wasRouteHandled = true;
        next();
    });
}

function getHandlerWrapper(handler) {
    return asyncRoute(async (req, res, next) => {
        if (res.locals.wasRouteHandled) {
            next();
            return;
        }

        const temp = handler(req, (data) => {
            res.locals.response = data;
            res.locals.wasRouteHandled = true;
            next();
        }, res, next);

        if (temp && typeof temp.then === 'function') {
            await temp;
        }
    });
}

function getSanitizerHandlerWrapper(handler) {
    return asyncRoute(async (req, res, next) => {
        const originalResponse = res.locals.response;

        const temp = handler(req, originalResponse, (data) => {
            res.locals.response = data;
            next();
        }, res, next);

        if (temp && typeof temp.then === 'function') {
            await temp;
        }
    });
}

function getEndpointHandler(endpoint, controller) {
    const {
        fullRoute,
        xCrudOp,
        handler,
    } = endpoint;

    if (!handler && !xCrudOp) {
        throw new Error(`Either xCrudOp or handler is required for route: ${fullRoute}`);
    }

    if (handler && xCrudOp) {
        throw new Error(`Cannot specify both xCrudOp and handler for route: ${fullRoute}`);
    }

    if (xCrudOp && allowedCrudOps.indexOf(xCrudOp) === -1) {
        throw new Error(`Invalid xCrudOp ${xCrudOp} in ${fullRoute}`);
    }

    if (handler) {
        return getHandlerWrapper(handler);
    }

    if (xCrudOp) {
        return getCrudOpHandler(xCrudOp, controller.crudInterface);
    }

    throw new Error('handler or xCrudOp must be specified');
}

function fromController(controller) {
    const router = express.Router();
    const parsedController = parseController(controller);
    const endpoints = parseEndpoints(parsedController);

    for (const endpoint of endpoints) {
        const endpointInjector = (req, res, next) => { req.rapify._endpoint = endpoint; next(); };
        const endpointHandler = getEndpointHandler(endpoint, controller);
        const sanitizeResponse = endpoint.sanitizeResponse;
        const ignoreControllerMiddleware = endpoint.ignoreControllerMiddleware;

        const args = [
            endpoint.relativeRoute,
            endpointInjector,
            endpointValidator,
            ...(ignoreControllerMiddleware ? [] : parsedController.middleware),
            ...endpoint.middleware,
            endpointHandler,
            ...sanitizeResponse ? [getSanitizerHandlerWrapper(endpoint.sanitizeResponse)] : [],
        ];
        // example: router.post('/test', middleware, middleware, handler);
        router[endpoint.method](...args);
    }

    return router;
}

module.exports = {
    fromController,
    formatRules,
    formatEndpointRules,
};

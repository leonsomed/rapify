const express = require('express');
const bodyParserMid = require('body-parser');
const corsMid = require('cors');

const initRequestMiddleware = require('./middleware/initRequest');
const responseMiddleware = require('./middleware/endpointResponse');
const endpointNotFoundMiddleware = require('./middleware/endpointNotFound');
const endpointErrorMiddleware = require('./middleware/endpointError');
const routerBuilder = require('./routerBuilder');
const constants = require('./constants');

const cMidLevels = constants.middlewareLevels;

const middlewareLevels = [
    cMidLevels.preDefault,
    cMidLevels.default,
    cMidLevels.postDefault,
    cMidLevels.preEndpoint,
    cMidLevels.endpoint,
    cMidLevels.postEndpoint,
    cMidLevels.preError,
    cMidLevels.error,
    cMidLevels.postError,
];

function getDefaultMiddleware(options) {
    const { cors, bodyParser } = options;
    const middleware = [initRequestMiddleware];

    if (cors) {
        middleware.push(corsMid({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'DELETE', 'PUT'],
        }));
    }

    if (bodyParser) {
        middleware.push(bodyParserMid.urlencoded({ extended: true }));
        middleware.push(bodyParserMid.json());
    }

    return middleware;
}

function initializeFromOptions(options, builder) {
    const {
        controllers,
        middleware,
    } = options;

    const defaultMiddleware = getDefaultMiddleware(options);
    if (defaultMiddleware && defaultMiddleware.length) {
        for (const mid of defaultMiddleware) {
            builder.registerMiddleware(mid, cMidLevels.default);
        }
    }

    if (middleware && middleware.length) {
        for (const mid of middleware) {
            if (typeof mid === 'function') {
                builder.registerMiddleware(mid, cMidLevels.preDefault);
            } else {
                if (typeof mid.middleware !== 'function' || middlewareLevels.indexOf(mid.level) === -1) {
                    throw new Error('registered middleware has the wrong format');
                }

                builder.registerMiddleware(mid.middleware, mid.level);
            }
        }
    }

    if (controllers && controllers.length) {
        for (const controller of controllers) {
            builder.registerController(controller);
        }
    }

    builder.registerMiddleware(endpointNotFoundMiddleware, cMidLevels.error);
    builder.registerMiddleware(endpointErrorMiddleware, cMidLevels.error);
}

function appBuilder(opts) {
    const options = opts || {};
    const middleware = [];

    const builder = {
        registerMiddleware: (mid, level = cMidLevels.preDefault) => {
            middleware.push({ middleware: mid, level });
        },
        registerController: (originalController) => {
            const controller = {
                ...originalController,
                ...(originalController.getJson === undefined) && { getJson: options.getJson },
            };

            middleware.push({
                middleware: routerBuilder.fromController(controller),
                level: cMidLevels.endpoint,
                prefix: controller.prefix,
            });
        },
        build: (defaultApp) => {
            const { port, onStart } = options;
            const app = !defaultApp ? express() : defaultApp;

            for (const level of middlewareLevels) {
                middleware
                    .filter(n => n.level === level)
                    .forEach(n => (
                        n.prefix ? app.use(n.prefix, n.middleware) : app.use(n.middleware)
                    ));
            }

            if (port) {
                app.listen(port, onStart);
            }

            return app;
        },
    };

    if (options) {
        initializeFromOptions(options, builder);
    }

    builder.registerMiddleware(responseMiddleware, cMidLevels.postEndpoint);

    return builder;
}

module.exports = appBuilder;

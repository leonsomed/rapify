const express = require('express');
const bodyParserMid = require('body-parser');
const corsMid = require('cors');

const initRequestMiddleware = require('./middleware/initRequest');
const responseMiddleware = require('./middleware/endpointResponse');
const endpointNotFoundMiddleware = require('./middleware/endpointNotFound');
const endpointErrorMiddleware = require('./middleware/endpointError');
const routerBuilder = require('./routerBuilder');
const constants = require('./constants');

const middlewareLevels = [
    constants.middlewareLevels.preDefault,
    constants.middlewareLevels.default,
    constants.middlewareLevels.postDefault,
    constants.middlewareLevels.prePublic,
    constants.middlewareLevels.public,
    constants.middlewareLevels.postPublic,
    constants.middlewareLevels.prePrivate,
    constants.middlewareLevels.private,
    constants.middlewareLevels.postPrivate,
    constants.middlewareLevels.preError,
    constants.middlewareLevels.error,
    constants.middlewareLevels.postError,
];

function getDefaultMiddleware(options) {
    const { cors, bodyParser } = options;
    const middleware = [initRequestMiddleware];

    if(cors) {
        middleware.push(corsMid({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'DELETE', 'PUT'],
        }));
    }

    if(bodyParser) {
        middleware.push(bodyParserMid.urlencoded({ extended: true }));
        middleware.push(bodyParserMid.json());
    }

    return middleware;
}

function initializeFromOptions(options, builder) {
    const {
        controllers,
        authMiddleware,
        middleware,
    } = options;

    const defaultMiddleware = getDefaultMiddleware(options);
    if(defaultMiddleware && defaultMiddleware.length) {
        for(const mid of defaultMiddleware)
            builder.registerMiddleware(mid, 'default');
    }

    if(middleware && middleware.length) {
        for(const mid of middleware) {
            if(typeof mid === 'function')
                builder.registerMiddleware(mid, 'preDefault');
            else
                builder.registerMiddleware(mid.middleware, mid.level);
        }
    }

    if(authMiddleware && authMiddleware.length) {
        for(const mid of authMiddleware)
            builder.registerMiddleware(mid, 'private');
    }

    if(controllers && controllers.length) {
        for(const controller of controllers)
            builder.registerController(controller);
    }

    builder.registerMiddleware(endpointNotFoundMiddleware, 'error');
    builder.registerMiddleware(endpointErrorMiddleware, 'error');
}

function appBuilder(options) {
    const middleware = [];

    const builder = {
        registerMiddleware: (mid, level = 'preDefault') => {
            middleware.push({ middleware: mid, level });
        },
        registerAuthMiddleware: mid => {
            middleware.push({ middleware: mid, level: 'postPrivate' });
        },
        registerController: controller => {
            middleware.push({
                middleware: routerBuilder.fromController(controller),
                level: controller.public ? 'public' : 'private',
                prefix: controller.prefix,
            });
        },
        build: (defaultApp) => {
            const { port, onStart } = options;
            const app = !defaultApp ? express() : defaultApp;

            for(const level of middlewareLevels) {
                middleware
                    .filter(n => n.level === level)
                    .forEach(n => n.prefix ? app.use(n.prefix, n.middleware) : app.use(n.middleware));
            }

            if(port)
                app.listen(port, onStart);

            return app;
        },
    };

    initializeFromOptions(options, builder);
    builder.registerMiddleware(responseMiddleware, 'postPublic');
    builder.registerMiddleware(responseMiddleware, 'postPrivate');

    return builder;
}

module.exports = appBuilder;

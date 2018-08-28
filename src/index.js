const bootstrap = require('./bootstrap');
const appBuilder = require('./appBuilder');
const routerBuilder = require('./routerBuilder');
const constants = require('./constants');
const memory = require('./crudInterfaces/memory');
const mongoose = require('./crudInterfaces/mongoose');
const validations = require('./helpers/validation');
const util = require('./helpers/util');
const asyncRoute = require('./middleware/asyncRoute');
const endpointError = require('./middleware/endpointError');
const endpointNotFound = require('./middleware/endpointNotFound');
const endpointResponse = require('./middleware/endpointResponse');
const endpointValidator = require('./middleware/endpointValidator');
const initRequest = require('./middleware/initRequest');
const endpointNotImplemented = require('./errors/endpointNotImplemented');
const invalidApiParameter = require('./errors/invalidApiParameter');
const list = require('./errors/list');
const notAuthorized = require('./errors/notAuthorized');
const resourceNotFound = require('./errors/resourceNotFound');
const unknown = require('./errors/unknown');

module.exports = {
    bootstrap,
    appBuilder,
    routerBuilder,
    crudInterfaces: {
        memory,
        mongoose,
    },
    middleware: {
        asyncRoute,
        endpointError,
        endpointNotFound,
        endpointResponse,
        endpointValidator,
        initRequest,
    },
    errors: {
        endpointNotImplemented,
        invalidApiParameter,
        list,
        notAuthorized,
        resourceNotFound,
        unknown,
    },
    validations,
    constants,
    util,
};

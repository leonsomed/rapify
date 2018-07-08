const EndpointNotImplementedError = require('../errors/endpointNotImplemented');

module.exports = (req, res, next) => next(new EndpointNotImplementedError());

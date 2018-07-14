const UnknownError = require('../errors/unknown');

// NOTE we need the "next" parameter because express will see 4 parameters
// and use this middleware as an error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let parsedError = err;

    if (!err) {
        parsedError = new UnknownError('UnknownError', 500);
    } else if (typeof err.toJSON !== 'function') {
        const message = process.env.NODE_ENV === 'production' ? 'UnknownError' : err.message;
        parsedError = new UnknownError(message, 500);
    }

    const error = parsedError.toJSON();
    const status = error.status || 400;
    const errors = Array.isArray(error.errors) ? { errors: error.errors } : { errors: [error] };

    res.status(status).json(errors);
};

module.exports = errorHandler;

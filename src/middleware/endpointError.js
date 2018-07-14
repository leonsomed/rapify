const UnknownError = require('../errors/unknown');

// NOTE we need the "next" parameter because express will see 4 parameters
// and use this middleware as an error handler
const errorHandler = (err, req, res, next) => {
    if(!err) {
        err = new UnknownError('UnknownError', 500);
    }
    else if(typeof err.toJSON !== 'function') {
        const message = process.env.NODE_ENV === 'production' ? 'UnknownError' : err.message;
        err = new UnknownError(message, 500);
    }

    const error = err.toJSON();
    const status = error.status || 400;
    const errors = Array.isArray(error.errors) ? { errors: error.errors } : { errors: [error] };

    res.status(status).json(errors);
};

module.exports = errorHandler;

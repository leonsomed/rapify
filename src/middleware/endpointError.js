// NOTE we need the "next" parameter because express will see 4 parameters
// and use this middleware as an error handler
const errorHandler = (error, req, res, next) => {
    if(process.env.NODE_ENV !== 'production') {
        console.log(error);
    }

    if(error && typeof error.toJSON === 'function') {
        const e = error.toJSON();
        return res.status(e.status || 400).json(Array.isArray(e) ? { errors: e } : { errors: [e] });
    }

    return res.status(500).json({
        errors: [
            {
                error: 'UnknownError',
                message: process.env.NODE_ENV === 'production' ? 'UnknownError' : error.message,
            },
        ],
    });
};

module.exports = errorHandler;

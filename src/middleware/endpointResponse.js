function responseHandler(req, res, next) {
    const response = res.locals.response;

    if(!response)
        return next();

    res.json(response);
}

module.exports = responseHandler;

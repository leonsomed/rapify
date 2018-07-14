function responseHandler(req, res, next) {
    const response = res.locals.response;

    if (!response) {
        next();
        return;
    }

    res.json(response);
}

module.exports = responseHandler;

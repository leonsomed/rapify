function initRequest(req, res, next) {
    req.rapify = {};

    next();
}

module.exports = initRequest;

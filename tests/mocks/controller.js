function defaultHandler(req, response) {
    response({ data: true });
}

const mocks = {
    endpoints: {
        default(route, method, handler) {
            return {
                [route]: {
                    [method]: {
                        handler: handler || defaultHandler,
                    },
                },
            };
        },
    },
};

module.exports = mocks;

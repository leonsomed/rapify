const httpMocks = require('node-mocks-http');

const mocks = {
    input: {
        pagination: (page, pageSize, sortBy, sortOrder) => ({
            filters: {},
            pagination: {
                page,
                pageSize,
                ...sortBy && { sortBy },
                ...sortOrder && { sortOrder },
            },
        }),
        rapify: ({ body, query, params, props }) => ({
            input: {
                ...body,
                ...query,
                ...params,
                ...props,
            },
            body: body || {},
            query: query || {},
            params: params || {},
            props: props || {},
        }),
    },
    request: {
        default() {
            return httpMocks.createRequest({
                method: 'GET',
                url: '/test/path?myid=312',
                query: {
                    myid: '312',
                },
            });
        },
        rapify: {
            default() {
                const req = httpMocks.createRequest({
                    method: 'GET',
                    url: '/test/path?myid=312',
                    query: {
                        myid: '312',
                    },
                });

                req.rapify = {};

                return req;
            },
            endpoint(endpoint, bundle) {
                const req = httpMocks.createRequest(bundle);

                req.rapify = {
                    rapify: {},
                    _endpoint: endpoint,
                };

                return req;
            },
        },
    },
    response: {
        default(wasRouteHandled = false) {
            const res = httpMocks.createResponse();

            res.locals.wasRouteHandled = wasRouteHandled;

            return res;
        },
    },
};

module.exports = mocks;

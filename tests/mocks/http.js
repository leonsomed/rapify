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
                    myid: '312'
                },
            });
        }
    },
    response: {
        default() {
            return httpMocks.createResponse();
        }
    },
};

module.exports = mocks;

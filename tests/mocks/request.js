const mocks = {
    pagination: (page, pageSize, sortBy, sortOrder) => ({
        filters: {},
        pagination: {
            page,
            pageSize,
            ...sortBy && { sortBy },
            ...sortOrder && { sortOrder },
        },
    }),
    expressReq: ({ body, query, params, props }) => ({
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
};

module.exports = mocks;

module.exports = {
    http: {
        GET: 'get',
        POST: 'post',
        PUT: 'put',
        DELETE: 'delete',
    },
    middlewareLevels: {
        preDefault: 'preDefault',
        default: 'default',
        postDefault: 'postDefault',
        preEndpoint: 'preEndpoint',
        endpoint: 'endpoint',
        postEndpoint: 'postEndpoint',
        preError: 'preError',
        error: 'error',
        postError: 'postError',
    },
    crud: {
        create: 'create',
        read: 'read',
        update: 'update',
        delete: 'delete',
        paginate: 'paginate',
    },
};

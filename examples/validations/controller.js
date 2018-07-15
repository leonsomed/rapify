const rapify = require('../../src/index');

const { POST } = rapify.constants.http;
const memoryInterface = rapify.crudInterfaces.memory();

module.exports = {
    prefix: '/users',
    public: true,
    restify: false,
    crudInterface: memoryInterface,
    endpoints: {
        '/': {
            [POST]: {
                body: {
                    name: {
                        constraints: {
                            format: {
                                pattern: /[a-zA-Z]{3,20}/,
                                message: '^name must be 3 to 20 characters long.',
                            },
                        },
                    },
                    age: {
                        constraints: {
                            numericality: {
                                onlyInteger: true,
                                greaterThanOrEqualTo: 18,
                                message: '^age must greater or equal to 18.',
                            },
                        },
                    },
                    role: {
                        constraints: {
                            inclusion: {
                                within: [
                                    'admin',
                                    'basic',
                                    'guest',
                                ],
                                message: '^Invalid role.',
                            },
                        },
                        default: 'guest',
                    },
                },
                handler: async (req, response) => {
                    const user = await memoryInterface.create(req);

                    response(user);
                },
                sanitizeResponse: async (req, data, response) => {
                    response({
                        message: 'data leak was prevented, but it is right below',
                        ...data,
                    });
                },
            },
        },
        '/:id': {
            [POST]: {
                xCrudOp: 'create',
                propsMap: {
                    role: () => 'basic',
                },
                props: {
                    role: {
                        constraints: {
                            inclusion: {
                                within: [
                                    'admin',
                                    'basic',
                                    'guest',
                                ],
                                message: '^Invalid role from props.',
                            },
                        },
                    },
                },
                customValidation: (req) => {
                    if (req.rapify.input.id < 1000) {
                        throw new Error('id must be greater than 1000');
                    }
                },
            },
        },
    },
};

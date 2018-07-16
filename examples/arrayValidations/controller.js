const rapify = require('../../src/index');

const { POST } = rapify.constants.http;
const memoryInterface = rapify.crudInterfaces.memory;

module.exports = {
    prefix: '/users',
    public: true,
    restify: false,
    crudInterface: memoryInterface(),
    endpoints: {
        '/complex/:key': {
            [POST]: {
                body: {
                    // primitive
                    username: {
                        constraints: {
                            format: {
                                pattern: /[a-zA-Z]{4,20}/,
                                message: '^name must be 4 to 20 characters long.',
                            },
                        },
                    },
                    // // nested objects
                    user: {
                        __has_children: true, // to be removed

                        name: {
                            constraints: {
                                presence: true,
                                format: {
                                    pattern: /abc/,
                                    message: '^the error!',
                                },
                            },
                            default: 'sir leon',
                        },
                        ages: [{
                            constraints: {
                                format: {
                                    pattern: /abc/,
                                    message: '^the error!',
                                },
                            },
                            default: () => ['hha'],
                            // sanitize: val => [...val, 'wuut'],
                        }],
                    },
                    // array of primitives
                    ages: [{
                        constraints: {
                            format: {
                                pattern: /abc/,
                                message: '^the error!',
                            },
                        },
                        // default: () => ['hha'],
                        // sanitize: val => [...val, 'wuut'],
                    }],
                    // // // array of objects
                    users: [{
                        __has_children: true, // to be removed

                        name: {
                            constraints: {
                                format: {
                                    pattern: /abc/,
                                    message: '^the error!',
                                },
                            },
                            default: 'abcde',
                        },
                        ages: [{
                            constraints: {
                                format: {
                                    pattern: /[0-9]+/,
                                    message: '^the error!',
                                },
                            },
                            default: () => [12, 123],
                        }],
                        errors: [{
                            __has_children: true, // to be removed

                            type: {
                                constraints: {
                                    format: {
                                        pattern: /error/,
                                        message: '^the error!',
                                    },
                                },
                                default: 'error',
                            },
                            ages: [{
                                constraints: {
                                    format: {
                                        pattern: /[0-9]+/,
                                        message: '^the error!',
                                    },
                                },
                                default: () => [12, 123],
                            }],
                        }],
                    }],
                },
                handler: (req, response) => {
                    response(req.rapify.input);
                },
            },
        },
    },
};

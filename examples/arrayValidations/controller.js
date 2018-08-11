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
                    // nested objects
                    user: {

                        name: {
                            constraints: {
                                presence: true,
                                format: {
                                    pattern: /abc/,
                                    message: '^value must be abc!',
                                },
                            },
                            default: 'abc',
                        },
                        ages: [{
                            constraints: {
                                format: {
                                    pattern: /abc/,
                                    message: '^value must be abc!',
                                },
                            },
                            default: () => ['abc'],
                            // sanitize: val => [...val, 'wuut'],
                        }],
                    },
                    // array of primitives
                    ages: [{
                        arrayConstraints: {
                            length: {
                                minimum: 1,
                                maximum: 3,
                                message: 'at least one element is required',
                            },
                        },
                        constraints: {
                            format: {
                                pattern: /abc/,
                                message: '^value must be abc!',
                            },
                        },
                        default: () => ['abc'],
                        // sanitize: val => [...val, 'wuut'],
                    }],
                    // array of objects
                    users: [{
                        name: {
                            constraints: {
                                format: {
                                    pattern: /abc/,
                                    message: '^value must be abc!',
                                },
                            },
                            default: 'abc',
                        },
                        ages: [{
                            constraints: {
                                numericality: {
                                    lessThanOrEqualTo: 100,
                                },
                            },
                            sanitize: val => +val,
                            default: () => ["12", 12],
                        }],
                        errors: [{
                            type: {
                                constraints: {
                                    presence: true,
                                    format: {
                                        pattern: /error/,
                                        message: '^must equal error!',
                                    },
                                },
                                // default: 'error',
                            },
                            ages: [{
                                arrayConstraints: {
                                    length: {
                                        minimum: 1,
                                        message: 'at least one element is required',
                                    },
                                },
                                constraints: {
                                    // presence: false,
                                    numericality: {
                                        // lessThanOrEqualTo: 100,
                                    },
                                },
                                sanitize: val => +val,
                                // default: () => [12, 123],
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

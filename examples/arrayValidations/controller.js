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
                            presence: true,
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
                                    pattern: /[a-zA-Z]{3,20}/,
                                    message: '^must include characters a through z',
                                },
                            },
                        },
                        ages: [{
                            arrayConstraints: {
                                presence: true,
                                length: {
                                    minimum: 1,
                                    message: 'at least one element is required',
                                },
                            },
                            constraints: {
                                custom: {
                                    validate(input, value) {
                                        if (input.username === 'leos') {
                                            return 'leos is not a valid username';
                                        }

                                        return undefined;
                                    },
                                },
                            },
                        }],
                    },
                    // array of primitives
                    ages: [{
                        arrayConstraints: {
                            presence: true,
                            length: {
                                minimum: 2,
                                maximum: 3,
                                tooShort: 'at least two elements are required',
                                tooLong: 'at most three elements',
                            },
                        },
                        constraints: {
                            numericality: {
                                integerOnly: true,
                                greaterThanOrEqualTo: 18,
                            },
                        },
                        sanitize: val => +val,
                    }],
                    // array of objects
                    users: [{
                        arrayConstraints: {
                            presence: true,
                            length: {
                                minimum: 1,
                                tooShort: 'at least one element is required',
                            },
                        },

                        name: {
                            constraints: {
                                presence: true,
                                format: {
                                    pattern: /[a-zA-Z]{3,20}/,
                                    message: '^must contain characters a through z!',
                                },
                            },
                        },
                        ages: [{
                            arrayConstraints: {
                                presence: true,
                                length: {
                                    minimum: 1,
                                    tooShort: 'at least one element is required',
                                },
                            },

                            constraints: {
                                numericality: {
                                },
                            },
                            sanitize: val => +val,
                        }],
                        errors: [{
                            type: {
                                constraints: {
                                    presence: true,
                                    format: {
                                        pattern: /Error$/,
                                        message: '^must contain the word Error at the end',
                                    },
                                },
                            },
                            ages: [{
                                arrayConstraints: {
                                    presence: true,
                                    length: {
                                        minimum: 1,
                                        message: 'at least one element is required',
                                    },
                                },
                                constraints: {
                                    numericality: {
                                    },
                                },
                                sanitize: val => +val,
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

const rapify = require('../../../lib');

const { GET } = rapify.constants.http;
const { bundles } = rapify.validations;

module.exports = {
    prefix: '/get-json-none',
    endpoints: {
        '/on': {
            [GET]: {
                getJson: true,
                handler: (req, response) => {
                    response(req.rapify.query);
                },
                query: {
                    user: {
                        name: bundles.field.textLength(3, 30, true),
                    },
                },
            },
        },
        '/off': {
            [GET]: {
                getJson: false,
                handler: (req, response) => {
                    response(req.rapify.query);
                },
                query: {
                    user: {
                        name: bundles.field.textLength(3, 30, true),
                    },
                },
            },
        },
        '/none': {
            [GET]: {
                handler: (req, response) => {
                    response(req.rapify.query);
                },
                query: {
                    user: {
                        name: bundles.field.textLength(3, 30, true),
                    },
                },
            },
        },
    },
};

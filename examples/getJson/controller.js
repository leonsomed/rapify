const rapify = require('../../src/index');

const { GET } = rapify.constants.http;
const { bundles } = rapify.validations;

module.exports = {
    prefix: '/reports',
    // turns off/on getJson for this controller
    // this overrides the app level
    getJson: false,
    endpoints: {
        '/complex': {
            [GET]: {
                // turns off/on getJson for this endpoint
                // this overides the app and controller level
                getJson: true,
                handler: (req, response) => {
                    response(req.rapify.query);
                },
                query: {
                    user: {
                        name: bundles.field.textLength(3, 30, true),
                        age: bundles.field.integerRange(18, 150, true),
                    },
                    types: [{
                        ...bundles.field.arrayLength(1),
                        ...bundles.field.within(['admin', 'basic'], true),
                    }],
                },
            },
        },
        '/simple': {
            [GET]: {
                getJson: false,
                handler: (req, response) => {
                    response(req.rapify.query);
                },
                query: {
                    user: {
                        name: bundles.field.textLength(3, 30, true),
                        age: bundles.field.integerRange(18, 150, true),
                    },
                    types: [{
                        ...bundles.field.arrayLength(1),
                        ...bundles.field.within(['admin', 'basic'], true),
                    }],
                },
            },
        },
    },
};

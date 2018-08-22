const rapify = require('../../src/index');

const { GET } = rapify.constants.http;
const memoryInterface = rapify.crudInterfaces.memory;

module.exports = {
    prefix: '/users',
    restify: {
        create: true,
        read: true,
        update: false,
        delete: false,
        paginate: false,
    },
    crudInterface: memoryInterface(),
    endpoints: {
        '/complex/:key': {
            [GET]: {
                handler: (req, response) => {
                    response({ key: req.rapify.input.key });
                },
            },
        },
        '/complex/sup': {
            [GET]: {
                handler: (req, response) => {
                    response({ sup: 'sup' });
                },
            },
        },
        '/complex': {
            [GET]: {
                handler: (req, response) => {
                    response({ wow: 'yeah' });
                },
            },
        },
    },
};

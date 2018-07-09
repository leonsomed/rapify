const rapify = require('../../src/index');
const memoryInterface = rapify.crudInterfaces.memory;

module.exports = {
    prefix: '/users',
    public: false,
    restify: {
        create: true,
        update: true,
        delete: true,
    },
    crudInterface: memoryInterface(),
};

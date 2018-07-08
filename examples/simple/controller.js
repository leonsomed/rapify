const rapify = require('../../src/index');
const memoryInterface = rapify.crudInterfaces.memory;

module.exports = {
    prefix: '/users',
    public: true,
    restify: true,
    crudInterface: memoryInterface(),
};

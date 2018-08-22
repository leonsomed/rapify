const rapify = require('../../src/index');

const memoryInterface = rapify.crudInterfaces.memory;

module.exports = {
    prefix: '/users',
    restify: true,
    crudInterface: memoryInterface(),
};

const rapify = require('../../src/index');
const memoryInterface = rapify.crudInterfaces.memory;
const { POST, GET, DELETE } = rapify.constants;

module.exports = {
    prefix: 'users',
    public: true,
    restify: true,
    crudInterface: memoryInterface,
};

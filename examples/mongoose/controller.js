const rapify = require('../../src/index');
const userModel = require('./userModel');

const mongooseInterface = rapify.crudInterfaces.mongoose;

module.exports = {
    prefix: '/users',
    public: true,
    restify: true,
    crudInterface: mongooseInterface(userModel),
};

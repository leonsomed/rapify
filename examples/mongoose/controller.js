const rapify = require('../../src/index');
const userModel = require('./userModel');

const mongooseInterface = rapify.crudInterfaces.mongoose;

module.exports = {
    prefix: '/users',
    restify: true,
    crudInterface: mongooseInterface(userModel),
};

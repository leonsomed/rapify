const myInterface = require('./interface');

module.exports = {
    prefix: '/users',
    restify: true,
    crudInterface: myInterface(),
};

const myInterface = require('./interface');

module.exports = {
    prefix: '/users',
    public: true,
    restify: true,
    crudInterface: myInterface(),
};

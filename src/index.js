const bootstrap = require('./bootstrap');
const appBuilder = require('./appBuilder');
const constants = require('./constants');
const memory = require('./crudInterfaces/memory');
const mongoose = require('./crudInterfaces/mongoose');

module.exports = {
    bootstrap,
    appBuilder,
    constants,
    crudInterfaces: {
        memory,
        mongoose,
    },
};

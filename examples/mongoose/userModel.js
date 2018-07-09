const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: String,
    age: Number,
});

const User = mongoose.model('User', schema);

module.exports = User;

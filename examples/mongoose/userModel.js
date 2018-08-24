const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: String,
    age: Number,
    extra: String,
});

const User = mongoose.model('User', schema);

module.exports = User;

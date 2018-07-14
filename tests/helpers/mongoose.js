const Mongoose = require('mongoose').Mongoose;

const mongoose = new Mongoose();

async function init() {
    await mongoose.connect('mongodb://localhost:27017/rapify');

    return mongoose;
}

async function stop() {
    mongoose.connection.close();
}

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    age: Number,
}));

module.exports = {
    models: {
        User,
    },
    init,
    stop,
};

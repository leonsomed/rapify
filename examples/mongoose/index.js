const mongoose = require('mongoose');
const rapify = require('../../src/index');
const userController = require('./controller');

mongoose.connect('mongodb://localhost/rapify')
    .then(() => {
        rapify.bootstrap({
            onStart: () => console.log('rapify server listening...'),
            port: 3000,
            bodyParser: true,
            controllers: [
                userController,
            ],
        });
    });


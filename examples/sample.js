const rapify = require('rapify');

// --------------------------------------------------------------
// OPTION 1
// get an express app with all the necessary middleware
// to quickly bootstrap your server

const app = rapify.bootstrap({
    port: 3000, // undefined by default, if provided the app will automatically listen on this port so no need to call listen on app
    // cors: false, // true by default
    // bodyParser: false, // true by default
    middleware: [
        (req, res, next) => {},
        {
            middleware: (req, res, next) => {},
            level: 'preDefault',
        },
    ],
    authMiddleware: [],
    controllers: [
        // ...
    ],
});

// --------------------------------------------------------------
// OPTION 2
// get a builder object and configure it to get an epxress app
const options = {}; // options same than bootstrap options
const appBuilder = rapify.appBuilder(options);

appBuilder.registerMiddleware(middleware);
appBuilder.registerAuthMiddleware(middleware);
appBuilder.registerController(controller);

const app = appBuilder.build();

// --------------------------------------------------------------

app.listen(3000, () => console.log('API is up son!'));

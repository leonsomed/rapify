const appBuilder = require('./appBuilder');

function bootstrap(options, defaultApp) {
    const builder = appBuilder(options, defaultApp);

    return builder.build();
}

module.exports = bootstrap;

# rapify
Handles all boiler plate required to implement a REST API service.

[![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)](https://github.com/leonsomed/rapify/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/rapify.svg?style=flat)](https://www.npmjs.com/package/rapify)
[![Build Status](https://travis-ci.org/leonsomed/rapify.svg?branch=master)](https://travis-ci.org/leonsomed/rapify)

```javascript
const rapify = require('rapify');

rapify.bootstrap({
    onStart: () => console.log('API server ready...'),
    port: 3000,
    bodyParser: true,
    controllers: [
        {
            prefix: '/users',
            crudInterface: rapify.crudInterfaces.memory(),
            restify: {
                create: true,
                read: true,
                update: true,
                delete: true,
                paginate: true,
            },
        }
    ],
});

```

## Features
* Robust JSON validation.
* Data sanitization for requests and responses.
* CRUD support through built-in mongoose and memory interfaces.
* Support for JSON in GET requests (optional).
* Standarized and customizable error responses.
* Auth Middleware registration support.
* Highly configurable.
* Decoupling of business logic and API service details.
* 3 minute setup to lift a mocking REST API service.
* Works with existing or new express apps.
* Fully tested library.

## Installation
This library is available as an npm package and it requires express as a peer dependency. Which means you have to have express as part of your dependencies.
It has been tested with express version >= 8.0.0.

```
# install express if you haven't already
npm install express
```

Now install rapify
```
npm install rapify
```

## Documentation
The documentation is a work in progress. However, check out the examples directory. It includes all possible configurations organized by feature and implemented as easy to understand minimalistic projects.

## Examples
Go to the examples directory you can run each one independently.

```
cd examples/middleware

node index.js
```

## Tests
After installing dependecies run the tests with npm.

```
npm install
npm test
```

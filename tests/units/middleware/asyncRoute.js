const expect = require('chai').expect;
const rapify = require('../../../lib');
const httpMocks = require('../../mocks/http');

const asyncRoute = rapify.middleware.asyncRoute;

describe('asyncRoute', () => {
    let request;
    let response;

    beforeEach(() => {
        request = httpMocks.request.default();
        response = httpMocks.response.default();
    });

    it('should call next with an error when an error is thrown', async () => {
        // eslint-disable-next-line no-unused-vars
        const middleware = asyncRoute(async (req, res, next) => {
            throw new Error('something went wrong');
        });

        await middleware(request, response, (error) => {
            expect(error).to.be.an('error');
        });
    });

    it('should call next without an error if no error is thrown', async () => {
        const middleware = asyncRoute(async (req, res, next) => {
            req.testing = true;
            next();
        });

        await middleware(request, response, (error) => {
            expect(request).to.include({ testing: true });
            expect(error).to.be.an('undefined');
        });
    });
});

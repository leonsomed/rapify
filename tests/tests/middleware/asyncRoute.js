const expect = require('chai').expect;
const httpMocks = require('../../mocks/http');
const asyncRoute = require('../../../src/middleware/asyncRoute');

describe('asyncRoute', () => {
    let req;
    let res;

    beforeEach(() => {
        req = httpMocks.request.default();
        res = httpMocks.response.default();
    })

    it('should call next with an error when an error is thrown', async () => {
        const middleware = asyncRoute(async (req, res, next) => {
            throw new Error('something went wrong');
        });

        await middleware(req, res, (error) => {
            expect(error).to.be.an('error')
        });
    });

    it('should call next without an error if no error is thrown', async () => {
        const middleware = asyncRoute(async (req, res, next) => {
            req.testing = true;
            next();
        });

        await middleware(req, res, (error) => {
            expect(req).to.include({ testing: true });
            expect(error).to.be.an('undefined')
        });
    });
});
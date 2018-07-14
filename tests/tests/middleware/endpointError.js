const expect = require('chai').expect;
const httpMocks = require('../../mocks/http');
const endpointError = require('../../../src/middleware/endpointError');
const UnknownError = require('../../../src/errors/unknown');
const ListError = require('../../../src/errors/list');

describe('endpointError', () => {
    let req;
    let res;

    beforeEach(() => {
        req = httpMocks.request.default();
        res = httpMocks.response.default();
    });

    it('should return a properly formatted error response', async () => {
        const status = 500;
        const errorMessage = 'there was an error';
        const error = new UnknownError(errorMessage, status);

        endpointError(error, req, res, () => {});

        const response = JSON.parse(res._getData());
        const expectedResponse = {
            errors: [{
                type: 'UnknownError',
                message: errorMessage,
                status,
            }],
        };

        expect(res.statusCode).to.equal(status);
        expect(response).to.eqls(expectedResponse);
    });

    it('should return a single error when toJSON returns a signle error', () => {
        const status = 500;
        const errorMessage = 'there was an error';
        const error = new UnknownError(errorMessage, status);

        endpointError(error, req, res, () => {});

        const response = JSON.parse(res._getData());
        const errorResponse = error.toJSON();

        expect(res.statusCode).to.equal(status);
        expect(response).to.eqls({
            errors: [errorResponse],
        });
    });

    it('should return multiple errors when error.toJSON includes an errors property', () => {
        const errors = [
            new Error('generic error'),
            new UnknownError('tragic error', 500),
        ];
        const error = new ListError(errors);
        const jsonError = error.toJSON();

        expect(jsonError).to.contain.keys(['errors']);
        expect(jsonError.errors).to.be.instanceOf(Array);

        endpointError(error, req, res, () => {});

        const response = JSON.parse(res._getData());

        expect(res.statusCode).to.equal(500);
        expect(response).to.contain.keys(['errors']);
        expect(response.errors.length).to.equal(2);
    });

    it('should return a generic 500 error when toJSON is not defined', async () => {
        const status = 500;
        const errorMessage = 'there was an error';
        const error = new Error(errorMessage);

        endpointError(error, req, res, () => {});

        const response = JSON.parse(res._getData());
        const expectedResponse = {
            errors: [{
                type: 'UnknownError',
                message: errorMessage,
                status,
            }],
        };

        expect(res.statusCode).to.equal(status);
        expect(response).to.eqls(expectedResponse);
    });
});

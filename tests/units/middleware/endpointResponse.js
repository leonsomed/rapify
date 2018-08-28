const expect = require('chai').expect;
const httpMocks = require('../../mocks/http');
const rapify = require('../../../lib');

const endpointResponse = rapify.middleware.endpointResponse;

describe('endpointResponse', () => {
    let request;
    let response;

    beforeEach(() => {
        request = httpMocks.request.default();
        response = httpMocks.response.default();
    });

    it('should call next without arguments when req.locals.response is undefined', () => {
        endpointResponse(request, response, (error) => {
            expect(error).to.eqls(undefined);
        });
    });

    it('should send a json response when req.locals.response is defined', () => {
        response.locals.response = {
            users: [
                { name: 'leo' },
            ],
        };

        endpointResponse(request, response, () => {
            expect.fail({}, {}, 'next function must not be called');
        });

        const data = JSON.parse(response._getData());

        expect(data).to.eqls(response.locals.response);
    });
});

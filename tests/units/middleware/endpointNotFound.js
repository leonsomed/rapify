const expect = require('chai').expect;
const httpMocks = require('../../mocks/http');
const rapify = require('../../../lib');

const endpointNotFound = rapify.middleware.endpointNotFound;
const EndpointNotImplementedError = rapify.errors.endpointNotImplemented;

describe('endpointNotFound', () => {
    let request;
    let response;

    beforeEach(() => {
        request = httpMocks.request.default();
        response = httpMocks.response.default();
    });

    it('should call next with an error: EndpointNotImplementedError', () => {
        endpointNotFound(request, response, (error) => {
            expect(error).to.be.an.instanceOf(EndpointNotImplementedError);
        });
    });
});

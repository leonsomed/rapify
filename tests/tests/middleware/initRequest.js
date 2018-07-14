const expect = require('chai').expect;
const httpMocks = require('../../mocks/http');
const initRequest = require('../../../src/middleware/initRequest');

describe('initRequest', () => {
    let request;
    let response;

    beforeEach(() => {
        request = httpMocks.request.default();
        response = httpMocks.response.default();
    });

    it('should initialize req.rapify to an empty object and call next without errors', () => {
        initRequest(request, response, (...args) => {
            expect(args).to.have.lengthOf(0);
        });

        expect(request.rapify).to.eqls({});
    });
});

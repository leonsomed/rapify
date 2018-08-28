const expect = require('chai').expect;
const httpMocks = require('../../mocks/http');
const rapify = require('../../../lib');

const initRequest = rapify.middleware.initRequest;

describe('initRequest', () => {
    let request;
    let response;

    beforeEach(() => {
        request = httpMocks.request.default();
        response = httpMocks.response.default();
    });

    it('should initialize req.rapify to an empty object and call next without errors', () => {
        initRequest(request, response, (error) => {
            expect(error).to.eqls(undefined);
        });

        expect(request.rapify).to.eqls({});
    });
});

const expect = require('chai').expect;
const bootstrap = require('../../src/bootstrap');

describe('bootstrap', () => {
    it('should accept two parameters: "options" and "defaultApp"', () => {
        expect(bootstrap).to.have.lengthOf(2);
    });

    it('should return an express app', () => {
        const options = {};
        const app = bootstrap(options);

        expect(typeof app.listen).to.eqls('function');
    });
});

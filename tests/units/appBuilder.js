const expect = require('chai').expect;
const rapify = require('../../lib');

const appBuilder = rapify.appBuilder;

describe('appBuilder', () => {
    let builder;

    before(() => {
        builder = appBuilder();
    });

    it('should receive a single argument: "options"', () => {
        expect(appBuilder).to.have.lengthOf(1);
    });

    describe('appBuilder interface', () => {
        it('should have method "registerMiddleware" with exact parameters', () => {
            expect(typeof builder.registerMiddleware).to.eqls('function');
            expect(builder.registerMiddleware).to.have.lengthOf(1);
        });

        it('should have method "registerController" with exact parameters', () => {
            expect(typeof builder.registerController).to.eqls('function');
            expect(builder.registerController).to.have.lengthOf(1);
        });

        it('should have method "build" with exact parameters', () => {
            expect(typeof builder.build).to.eqls('function');
            expect(builder.build).to.have.lengthOf(1);
        });
    });

    describe('appBuilder.build', () => {
        it('should receive a single parameter: "defaultApp"', () => {
            expect(builder.build).to.have.lengthOf(1);
        });

        it('should return an express app', () => {
            const app = builder.build();

            expect(typeof app.listen).to.eqls('function');
        });
    });
});

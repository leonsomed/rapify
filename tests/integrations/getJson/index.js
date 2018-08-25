const chai = require('chai');
const appOn = require('./appOn');
const appOff = require('./appOff');
const appNone = require('./appNone');
const util = require('../../../src/helpers/util');

const expect = chai.expect;

describe('getJson', () => {
    let serverOn;
    let serverOff;
    let serverNone;

    async function getJsonEnabled(app, url) {
        const query = { user: { name: 'dude' } };
        const res = await chai
            .request(app)
            .get(url)
            .query({
                json: JSON.stringify(query),
            });

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.eqls(query);
    }

    async function getJsonDisabled(app, url) {
        const query = { user: { name: 'dude' } };
        const res = await chai
            .request(app)
            .get(url)
            .query({
                json: JSON.stringify(query),
            });

        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.errors).to.have.lengthOf(1);
        expect(res.body.errors[0].type).to.eqls('InvalidApiParameter');
        expect(res.body.errors[0].parameterName).to.eqls('user.name');
    }

    before((done) => {
        const p1 = util.promise();
        const p2 = util.promise();
        const p3 = util.promise();

        serverOn = appOn.listen(2000, p1.resolve);
        serverOff = appOff.listen(4000, p2.resolve);
        serverNone = appNone.listen(5000, p3.resolve);

        Promise.all([p1.promise, p2.promise, p3.promise]).then((() => done()));
    });

    after(() => {
        serverOn.close();
        serverOff.close();
        serverNone.close();
    });

    describe('getJson option priority', () => {
        describe('appOn', () => {
            const app = appOn;

            describe('controllerOn', () => {
                const controllerSegment = 'get-json-on';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });
            });

            describe('controllerOff', () => {
                const controllerSegment = 'get-json-off';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });
            });

            describe('controllerNone', () => {
                const controllerSegment = 'get-json-none';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });
            });
        });

        describe('appOff', () => {
            const app = appOff;

            describe('controllerOn', () => {
                const controllerSegment = 'get-json-on';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });
            });

            describe('controllerOff', () => {
                const controllerSegment = 'get-json-off';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });
            });

            describe('controllerNone', () => {
                const controllerSegment = 'get-json-none';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });
            });
        });

        describe('appNone', () => {
            const app = appNone;

            describe('controllerOn', () => {
                const controllerSegment = 'get-json-on';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });
            });

            describe('controllerOff', () => {
                const controllerSegment = 'get-json-off';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });
            });

            describe('controllerNone', () => {
                const controllerSegment = 'get-json-none';

                describe('endpointOn', () => {
                    const endpointSegment = 'on';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson enabled', () => getJsonEnabled(app, url));
                });

                describe('endpointOff', () => {
                    const endpointSegment = 'off';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });

                describe('endpointNone', () => {
                    const endpointSegment = 'none';
                    const url = `/${controllerSegment}/${endpointSegment}`;

                    it('should have getJson disabled', () => getJsonDisabled(app, url));
                });
            });
        });
    });
});

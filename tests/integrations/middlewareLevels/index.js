const chai = require('chai');
const app = require('./app');

const expect = chai.expect;

describe('middleware levels', () => {
    let requester;
    let server;

    before((done) => {
        server = app.listen(3000, done);
    });

    beforeEach(() => {
        requester = chai.request(app);
    });

    after(() => {
        server.close();
    });

    it('should ignore controller level middleware', async () => {
        const res = await requester.get('/middleware/controller/ignore');

        expect(res).to.have.status(200);
        expect(res).to.be.json;

        const body = res.body;

        expect(body).to.eqls({
            midApp1: true,
            midApp2: true,
        });
    });

    it('should run controller level middleware', async () => {
        const res = await requester.get('/middleware/controller');

        expect(res).to.have.status(200);
        expect(res).to.be.json;

        const body = res.body;

        expect(body).to.eqls({
            midApp1: true,
            midApp2: true,
            midController1: true,
            midController2: true,
        });
    });

    it('should run endpoint level middleware', async () => {
        const res = await requester.get('/middleware/endpoint');

        expect(res).to.have.status(200);
        expect(res).to.be.json;

        const body = res.body;

        expect(body).to.eqls({
            midApp1: true,
            midApp2: true,
            midController1: true,
            midController2: true,
            midEndpoint1: true,
            midEndpoint2: true,
        });
    });
});

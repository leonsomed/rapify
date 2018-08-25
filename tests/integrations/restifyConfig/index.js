const chai = require('chai');
const app = require('./app');

const expect = chai.expect;

describe('restifyConfig', () => {
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

    describe('fail', () => {
        describe('has no auth headers', () => {
            it('should create with errors', async () => {
                const res = await requester.post('/restify');

                expect(res).to.have.status(401);
                expect(res).to.be.json;

                expect(res.body.errors).to.have.lengthOf(1);

                const error = res.body.errors[0];

                expect(error.type).to.eqls('NotAuthorized');
            });

            it('should update with errors', async () => {
                const res = await requester.post('/restify/10001');

                expect(res).to.have.status(401);
                expect(res).to.be.json;

                expect(res.body.errors).to.have.lengthOf(1);

                const error = res.body.errors[0];

                expect(error.type).to.eqls('NotAuthorized');
            });

            it('should delete with errors', async () => {
                const res = await requester.delete('/restify/10001');

                expect(res).to.have.status(401);
                expect(res).to.be.json;

                expect(res.body.errors).to.have.lengthOf(1);

                const error = res.body.errors[0];

                expect(error.type).to.eqls('NotAuthorized');
            });
        });

        describe('has auth headers', () => {
            it('should update with errors missing id x-crud-op', async () => {
                const res = await requester
                    .post('/restify/x-crud-op/update')
                    .set('test', '123')
                    .send({
                        age: 18,
                    });

                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body.errors).to.have.lengthOf(1);
                expect(res.body.errors[0].type).to.eqls('InvalidApiParameter');
                expect(res.body.errors[0].parameterName).to.eqls('id');
            });
        });
    });

    describe('succeed', () => {
        describe('has auth headers', () => {
            it('should create without errors', async () => {
                const res = await requester
                    .post('/restify')
                    .set('test', '123')
                    .send({
                        name: 'leo',
                        age: 123,
                    });

                expect(res).to.have.status(200);
                expect(res).to.be.json;

                expect(res.body.data).to.eqls({
                    id: 100001,
                    name: 'leo',
                    age: 123,
                    extra: 100000,
                });
            });

            it('should update without errors', async () => {
                const res = await requester
                    .post('/restify/100001')
                    .set('test', '123')
                    .send({
                        age: 18,
                    });

                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.data.age).to.eqls(18);
            });

            it('should delete without errors', async () => {
                let res = await requester
                    .post('/restify')
                    .set('test', '123')
                    .send({
                        name: 'leo',
                        age: 123,
                    });

                const id = res.body.data.id;

                res = await chai.request(app)
                    .delete(`/restify/${id}`)
                    .set('test', '123');

                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.data.id).to.eqls(id);
            });

            it('should update without errors x-crud-op', async () => {
                const res = await requester
                    .post('/restify/x-crud-op/update')
                    .set('test', '123')
                    .send({
                        id: 100001,
                        age: 18,
                    });

                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.data.age).to.eqls(18);
            });
        });

        describe('has no auth headers', () => {
            it('should read without errors', async () => {
                const res = await requester.get('/restify/100001');

                expect(res).to.have.status(200);
                expect(res).to.be.json;

                expect(res.body.data.id).to.eqls(100001);
            });

            it('should paginate without errors', async () => {
                const res = await requester.get('/restify');

                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.data).to.have.lengthOf(1);
            });
        });
    });
});

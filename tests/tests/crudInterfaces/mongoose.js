const Mongoose = require('mongoose').Mongoose;
const Mockgoose = require('mockgoose').Mockgoose;
const expect = require('chai').expect;

const mongooseInterface = require('../../../src/crudInterfaces/mongoose');
const requestMock = require('../../../tests/mocks/request');
const ResourceNotFoundError = require('../../../src/errors/resourceNotFound');
const throwWrapper = require('../../../tests/helpers/throwWrapper');

const mongoose = new Mongoose();
const mockgoose = new Mockgoose(mongoose);
const ObjectId = mongoose.Types.ObjectId;

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    age: Number,
}));

before(async () => {
    await mockgoose.prepareStorage();
    await mongoose.connect('mongodb://localhost:27017/TestingDB');
});

describe('mongoose CRUD interface', () => {

    describe('initialization', () => {
        it('should fail by passing an invalid model', () => {
            expect(() => mongooseInterface()).to.throw();
        });

        it('should return CRUD methods', () => {
            const int = mongooseInterface(User);

            expect(typeof int.create).to.equal('function');
            expect(typeof int.read).to.equal('function');
            expect(typeof int.update).to.equal('function');
            expect(typeof int.delete).to.equal('function');
            expect(typeof int.paginate).to.equal('function');
        });
    });

    describe('CRUD operations', () => {

        describe('success', () => {
            let newUser;
            const originalName = 'leo';
            const originalAge = 22;
            const crudInterface = mongooseInterface(User);

            beforeEach(async () => {
                const body = {
                    name: originalName,
                    age: originalAge,
                };
                const rapify = requestMock.expressReq({ body });

                newUser = await crudInterface.create(rapify);
            });

            afterEach(async () => {
                await User.remove({});
            });

            it('should create a document', async () => {
                expect(newUser.name).to.equal(originalName);
                expect(newUser.age).to.equal(originalAge);
            });

            it('should read a document', async () => {
                const params = { id: newUser.id };
                const rapify = requestMock.expressReq({ params });
                const user = await crudInterface.read(rapify);

                expect(user.name).to.equal(originalName);
                expect(user.age).to.equal(originalAge);
            });

            it('should update a document', async () => {
                const name = 'leonso';
                const age = 88;
                const params = { id: newUser.id };
                const body = { name, age };
                const rapify = requestMock.expressReq({ params, body });
                const user = await crudInterface.update(rapify);

                expect(user.name).to.equal(name);
                expect(user.age).to.equal(age);
            });

            it('should delete a document', async () => {
                const params = { id: newUser.id };
                const rapify = requestMock.expressReq({ params });
                await crudInterface.delete(rapify);

                const throwable = await throwWrapper(async () => await crudInterface.read(rapify));
                expect(throwable).to.throw(ResourceNotFoundError);
            });

            it('should paginate a document', async () => {
                const query = requestMock.pagination(1, 20, '_id', 'desc');
                const rapify = requestMock.expressReq({ query });
                const result = await crudInterface.paginate(rapify);

                expect(result).to.have.keys(['pagination', 'documents']);
                expect(result).to.nested.include({
                    'pagination.page': 1,
                    'pagination.pageSize': 20,
                    'pagination.totalPages': 1,
                    'pagination.totalDocuments': 1,
                });
                expect(result.documents).to.have.lengthOf(1);

                const doc = result.documents[0];

                expect(doc).to.include({ name: originalName, age: originalAge });
            });

            it('should paginate 2 pages', async () => {
                await User.remove({});

                const total = 48;
                const pageSize = 25;
                const totalPages = Math.ceil(total / pageSize);
                const docs = [];
                for(let i = 0; i < total; i++)
                    docs.push({ name: 'leos', age: i });

                await User.create(docs);

                let query = requestMock.pagination(1, pageSize, '_id', 'desc');
                let rapify = requestMock.expressReq({ query });
                let result = await crudInterface.paginate(rapify);

                expect(result).to.have.keys(['pagination', 'documents']);
                expect(result).to.nested.include({ 'pagination.page': 1 });
                expect(result).to.nested.include({ 'pagination.pageSize': pageSize });
                expect(result).to.nested.include({ 'pagination.totalPages': totalPages });
                expect(result).to.nested.include({ 'pagination.totalDocuments': total });

                query = requestMock.pagination(2, pageSize, '_id', 'desc');
                rapify = requestMock.expressReq({ query });
                result = await crudInterface.paginate(rapify);

                expect(result).to.have.keys(['pagination', 'documents']);
                expect(result).to.nested.include({ 'pagination.page': 2 });
                expect(result).to.nested.include({ 'pagination.pageSize': pageSize });
                expect(result).to.nested.include({ 'pagination.totalPages': totalPages });
                expect(result).to.nested.include({ 'pagination.totalDocuments': total });
            });

            it('should sort pagination by name', async () => {
                const docs = [
                    { name: 'leo', age: 40 },
                    { name: 'fred', age: 22 },
                    { name: 'zack', age: 21 },
                    { name: 'tom', age: 20 },
                    { name: 'alan', age: 30 },
                    { name: 'john', age: 20 },
                    { name: 'bob', age: 25 },
                ];
                await User.remove({});
                await User.create(docs);

                const query = requestMock.pagination(1, 20, 'name', 'asc');
                const rapify = requestMock.expressReq({ query });
                const result = await crudInterface.paginate(rapify);

                expect(result.documents).to.have.lengthOf(7);

                const doc = result.documents[1];

                expect(doc).to.include({ name: 'bob', age: 25 });
            });
        });

        describe('fail', () => {
            let crudInterface;

            before(() => {
                crudInterface = mongooseInterface(User);
            });

            it('should throw not found error', async () => {
                const rapify = requestMock.expressReq({
                    params: {
                        id: ObjectId(),
                    },
                });

                const throwable = await throwWrapper(async () => await crudInterface.read(rapify));
                expect(throwable).to.throw(ResourceNotFoundError);
            });

            it('should not update a non existant document', async () => {
                const rapify = requestMock.expressReq({
                    params: { id: ObjectId() },
                    body: { name: 'test' },
                });

                const throwable = await throwWrapper(async () => await crudInterface.update(rapify));
                expect(throwable).to.throw(ResourceNotFoundError);
            });

            it('should not delete a non existant document', async () => {
                const rapify = requestMock.expressReq({
                    params: { id: ObjectId() },
                });

                const throwable = await throwWrapper(async () => await crudInterface.delete(rapify));
                expect(throwable).to.throw(ResourceNotFoundError);
            });

            it('should not paginate with invalid pagination options', async () => {
                const rapify = requestMock.expressReq({
                    query: {},
                });

                const throwable = await throwWrapper(async () => await crudInterface.paginate(rapify));
                expect(throwable).to.throw();
            });
        });

    });
});

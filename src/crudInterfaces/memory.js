const ResourceNotFoundError = require('../errors/resourceNotFound');

function interface(defaultValue = []) {
    const docs = defaultValue;
    let idCounter = 100000;

    return {
        create: async (req) => {
            const doc = {
                id: idCounter++,
                ...req.rapify.input,
            };
            docs.push(doc);

            return doc;
        },
        read: async (req) => {
            const doc = docs.find(n => n.id === +req.rapify.input.id);

            if(!doc)
                throw new ResourceNotFoundError(req.rapify.input.id, 'not found');

            return doc;
        },
        update: async (req) => {
            const { id, ...data } = req.rapify.input;
            const index = docs.findIndex(n => n.id === +id);

            if(index === -1)
                throw new ResourceNotFoundError(id, 'not found');

            return docs[index] = {
                ...docs[index],
                ...data,
            };
        },
        delete: async (req) => {
            const { id, ...data } = req.rapify.input;
            const index = docs.findIndex(n => n.id === +id);

            if(index === -1)
                throw new ResourceNotFoundError(id, 'not found');

            const doc = docs[index];

            docs.splice(index, 1);

            return doc;
        },
        paginate: async (req) => {
            return docs;
        },
    };
};

module.exports = interface;

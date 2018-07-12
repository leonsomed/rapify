const ResourceNotFoundError = require('../errors/resourceNotFound');

function interface(defaultValue = []) {
    const docs = defaultValue;
    let idCounter = 100000;

    return {
        create: async (rapify) => {
            const doc = {
                id: idCounter++,
                ...rapify.input,
            };
            docs.push(doc);

            return doc;
        },
        read: async (rapify) => {
            const doc = docs.find(n => n.id === +rapify.input.id);

            if(!doc)
                throw new ResourceNotFoundError(rapify.input.id, 'not found');

            return doc;
        },
        update: async (rapify) => {
            const { id, ...data } = rapify.input;
            const index = docs.findIndex(n => n.id === +id);

            if(index === -1)
                throw new ResourceNotFoundError(id, 'not found');

            return docs[index] = {
                ...docs[index],
                ...data,
            };
        },
        delete: async (rapify) => {
            const { id, ...data } = rapify.input;
            const index = docs.findIndex(n => n.id === +id);

            if(index === -1)
                throw new ResourceNotFoundError(id, 'not found');

            const doc = docs[index];

            docs.splice(index, 1);

            return doc;
        },
        paginate: async (rapify) => {
            return docs;
        },
    };
};

module.exports = interface;

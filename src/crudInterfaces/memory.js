const ResourceNotFoundError = require('../errors/resourceNotFound');

function memoryInterface(defaultValue = []) {
    const docs = defaultValue;
    let idCounter = 100000;

    return {
        create: async (rapify, mappedData) => {
            idCounter += 1;

            const doc = {
                id: idCounter,
                ...mappedData || rapify.input,
            };
            docs.push(doc);

            return doc;
        },
        read: async (rapify) => {
            const doc = docs.find(n => n.id === +rapify.input.id);

            if (!doc) {
                throw new ResourceNotFoundError(rapify.input.id, 'not found');
            }

            return doc;
        },
        update: async (rapify, mappedData) => {
            const { id, ...data } = rapify.input;
            const index = docs.findIndex(n => n.id === +id);

            if (index === -1) {
                throw new ResourceNotFoundError(id, 'not found');
            }

            docs[index] = {
                ...docs[index],
                ...mappedData || data,
            };

            return docs[index];
        },
        delete: async (rapify) => {
            const { id } = rapify.input;
            const index = docs.findIndex(n => n.id === +id);

            if (index === -1) {
                throw new ResourceNotFoundError(id, 'not found');
            }

            const doc = docs[index];

            docs.splice(index, 1);

            return doc;
        },
        paginate: async () => docs,
    };
}

module.exports = memoryInterface;

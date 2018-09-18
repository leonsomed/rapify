const ResourceNotFoundError = require('../errors/resourceNotFound');

function mongooseInterface(model) {
    if (!model) {
        throw Error('model is undefined');
    }

    return {
        create: async (rapify, mappedData) => {
            const doc = await model.create(mappedData || rapify.input);

            return doc;
        },
        read: async (rapify) => {
            const doc = await model.findById(rapify.input.id);

            if (!doc) {
                throw new ResourceNotFoundError(rapify.input.id, 'not found');
            }

            return doc;
        },
        update: async (rapify, mappedData) => {
            const { id, ...data } = rapify.input;
            const doc = await model.findOneAndUpdate({ _id: id }, { $set: mappedData || data }, { new: true });

            if (!doc) {
                throw new ResourceNotFoundError(rapify.input.id, 'not found');
            }

            return doc;
        },
        delete: async (rapify) => {
            const doc = await model.findOneAndRemove({ _id: rapify.input.id });

            if (!doc) {
                throw new ResourceNotFoundError(rapify.input.id, 'not found');
            }

            return doc;
        },
        paginate: async (rapify) => {
            const options = rapify.input.pagination;
            const query = rapify.input.filters;
            const totalDocuments = await model.find(query).count();

            const documentsTask = model.find(query);

            if (options.sortBy) {
                documentsTask.sort({ [options.sortBy]: options.sortOrder === 'asc' ? 1 : -1 });
            }

            documentsTask
                .skip((options.page - 1) * options.pageSize)
                .limit(options.pageSize);

            const documents = await documentsTask;

            return {
                pagination: {
                    page: options.page,
                    pageSize: options.pageSize,
                    totalPages: Math.ceil(totalDocuments / options.pageSize),
                    totalDocuments,
                },
                data: documents,
            };
        },
    };
}

module.exports = mongooseInterface;

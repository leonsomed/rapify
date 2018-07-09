const ResourceNotFoundError = require('../errors/resourceNotFound');

function interface(model) {
    return {
        create: async (req) => {
            return await model.create(req.rapify.input);
        },
        read: async (req) => {
            const doc = await model.findById(req.rapify.input.id);

            if(!doc)
                throw new ResourceNotFoundError(req.rapify.input.id, 'not found');

            return doc;
        },
        update: async (req) => {
            const { id, ...data } = req.rapify.input;
            const doc = await model.findOneAndUpdate({ _id: req.rapify.input.id }, { $set: data }, { new: true });

            if(!doc)
                throw new ResourceNotFoundError(req.rapify.input.id, 'not found');

            return doc;
        },
        delete: async (req) => {
            const doc = await model.findOneAndRemove({ _id: req.rapify.input.id });

            if(!doc)
                throw new ResourceNotFoundError(req.rapify.input.id, 'not found');

            return doc;
        },
        paginate: async (req) => {
            const options = req.rapify.input.pagination;
            const query = req.rapify.input.filters;
            const totalDocuments = await model.find(query).count();

            let documentsTask = model.find(query);

            if(options.sortBy)
                documentsTask.sort({ [options.sortBy]: options.sortOrder === 'asc' ? 1 : -1 });

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
                documents,
            };
        },
    };
};

module.exports = interface;

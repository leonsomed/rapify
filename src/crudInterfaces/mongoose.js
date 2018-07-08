function interface(model) {
    return {
        create: async (req) => {
            return await model.create(req.rapify.input);
        },
        read: async (req) => {
            return await model.findById(req.rapify.input.id);
        },
        update: async (req) => {
            const { id, ...data } = req.rapify.input;
            return await model.findOneAndUpdate({ _id: req.rapify.input.id }, { $set: data }, { new: true });
        },
        delete: async (req) => {
            return await model.findOneAndRemove({ _id: req.rapify.input.id });
        },
        paginate: async (req) => {
            const options = req.rapify.input.pagination;
            const query = req.rapify.input.filters;
            const totalDocuments = await model.find(query).count();

            const documents = await model.find(query, projection)
                .sort({ [options.sortBy]: options.sortOrder === 'asc' ? 1 : -1 })
                .skip((options.page - 1) * options.pageSize)
                .limit(options.pageSize);

            return {
                pagination: {
                    page: options.page,
                    pageSize: options.pageSize,
                    totalPages: Math.ceil(totalDocuments / options.pageSize),
                    totalDocuments,
                },
                documents: documents.map(n => n.toSafeJSON()),
            };
        },
    };
};

module.exports = interface;

class ResourceNotFound extends Error {
    constructor(id, message) {
        super(message);

        this.type = 'ResourceNotFound';
        this.status = 404;
        this.id = id;
    }

    toJSON() {
        return {
            type: this.type,
            message: this.message,
            id: this.id,
            status: this.status,
        };
    }
}

module.exports = ResourceNotFound;

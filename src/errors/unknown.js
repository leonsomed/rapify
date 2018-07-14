class UnknownError extends Error {
    constructor(message, status) {
        super(message);

        this.type = 'UnknownError';
        this.status = status;
    }

    toJSON(stringify) {
        const error = {
            type: this.type,
            message: this.message,
            status: this.status,
        };

        return stringify ? JSON.stringify(error) : error;
    }
}

module.exports = UnknownError;

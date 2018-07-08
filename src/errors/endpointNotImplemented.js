class EndpointNotImplemented extends Error {
    constructor(message) {
        super(message);

        this.type = 'EndpointNotImplemented';
        this.status = 404;
    }

    toJSON() {
        return {
            type: this.type,
            message: this.message,
            parameterName: this.parameterName,
            status: this.status,
        };
    }
}

module.exports = EndpointNotImplemented;

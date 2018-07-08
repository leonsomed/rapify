class InvalidApiParameter extends Error {
    constructor(parameterName, message) {
        super(message);

        this.parameterName = parameterName;
        this.type = 'InvalidApiParameter';
        this.status = 400;
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

module.exports = InvalidApiParameter;

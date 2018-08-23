class NotAuthorized extends Error {
    constructor() {
        super('You do not have access');

        this.type = 'NotAuthorized';
        this.status = 401;
    }

    toJSON() {
        return {
            type: this.type,
            message: this.message,
            status: this.status,
        };
    }
}

module.exports = NotAuthorized;

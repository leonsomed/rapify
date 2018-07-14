const _ = require('lodash');
const UnknownError = require('./unknown');

class ListError extends Error {
    constructor(errors) {
        super('ListError');

        const formattedErrors = errors
            .map(n => (typeof n.toJSON === 'function' ? n : new UnknownError(n.message, 500)))
            .map(n => n.toJSON());

        const maxStatus = _.max(formattedErrors, n => n.status);

        this.type = 'ListError';
        this.errors = formattedErrors;
        this.status = maxStatus ? maxStatus.status : 500;
    }

    toJSON(stringify) {
        const error = {
            type: this.type,
            message: this.type,
            status: this.status,
            errors: this.errors,
        };

        return stringify ? JSON.stringify(error) : error;
    }
}

module.exports = ListError;

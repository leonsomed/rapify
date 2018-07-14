const validateJs = require('validate.js');

const validateEach = (value, options) => {
    if (options.type) {
        for (const n of value) {
            if (options.integersOnly && (isNaN(n) || Math.floor(n) !== n)) {
                return 'is not the correct type';
            } else if (!(n !== undefined && n.constructor === options.type)) {
                return 'is not the correct type';
            }
        }
    }

    if (options.within) {
        for (const n of value) {
            if (options.within.indexOf(n) === -1) {
                return 'contains an invalid element';
            }
        }
    }

    if (options.regex) {
        for (const n of value) {
            if (!options.regex.test(n)) {
                return 'contains an invalid element';
            }
        }
    }

    if (options.campaignPath) {
        const regex = /^(\/|(\/[a-zA-Z0-9\-_*]+)+\/?)$/;
        const wildCardRegex = /\*/g;
        const consecutiveAsteriskRegex = /[*]{2}/g;

        for (const n of value) {
            if (!regex.test(n)) {
                return options.message || 'contains an invalid element';
            }

            const hasWildcards = n.match(wildCardRegex);

            if (hasWildcards) {
                const segments = n.split('/');
                let i = 0;

                for (const segment of segments) {
                    i += 1;
                    const matches = segment.match(wildCardRegex);

                    if (matches && matches.length > 2) {
                        return options.message || 'contains an invalid element';
                    } else if (
                        matches &&
                        matches.length === 2 &&
                        (i !== segments.length || !segment.match(consecutiveAsteriskRegex))
                    ) {
                        return options.message || 'contains an invalid element';
                    }
                }
            }
        }
    }

    return undefined;
};

validateJs.validators.each = (value, options) => {
    if (!value) {
        return undefined;
    }

    if (!Array.isArray(value)) {
        return 'is not an array';
    }

    return validateEach(value, options);
};

validateJs.validators.eachObject = (value, options) => {
    if (!value) {
        return undefined;
    }

    if (typeof value !== 'object') {
        return 'is not an object';
    }

    const keys = Object.keys(value);
    const value2 = keys.map(n => value[n]);

    return validateEach(value2, options);
};

validateJs.validators.custom = (value, options, key, attributes) => {
    if (typeof options.validate === 'function' && value) {
        const success = options.validate(value, options, key, attributes);

        if (!success) {
            return options.message || 'not valid format';
        }
    } else if (value) {
        return options.message || 'not valid format';
    }

    return undefined;
};

validateJs.validators.requiredConditional = (value, options) => {
    if (typeof options._condition === 'function') {
        if (options._condition() && value === undefined) {
            return options.message || 'this field is required';
        }
    }

    return undefined;
};

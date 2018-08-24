const sanitize = {
    boolean(val) {
        if (typeof val === 'boolean') return val;
        else if (val === 'true') return true;
        else if (val === 'false') return false;

        return val;
    },
    numeric: val => +val,
    numbersOnly: val => val.replace(/[^0-9]/g, ''),
    phoneNumber: (val) => {
        if (!val) return val;

        return (/^(\+1)/.test(val) ? val : `+1${val}`).replace(/[^\d+]/g, '');
    },
};

const constraints = {
    mongoId: presence => ({
        presence,
        format: {
            pattern: /^[0-9a-f]{24}$/,
            message: 'must be a valid id 24 characters long',
        },
    }),

    within: (allowedValues, presence, message = 'invalid value') => ({
        presence,
        inclusion: {
            within: Array.isArray(allowedValues) ? allowedValues : Object.keys(allowedValues),
            message,
        },
    }),

    boolean: presence => ({
        presence,
        inclusion: {
            within: [
                true,
                false,
            ],
            message: '^invalid value',
        },
    }),

    integerRange: (from, to, presence) => ({
        presence,
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: from,
            lessThanOrEqualTo: to,
        },
    }),

    numberRange: (from, to, presence) => ({
        presence,
        numericality: {
            greaterThanOrEqualTo: from,
            lessThanOrEqualTo: to,
        },
    }),

    textLength: (minimum, maximum, presence) => ({
        presence,
        length: {
            minimum,
            maximum,
        },
    }),

    arrayLength: (minimum, maximum, presence) => ({
        presence,
        length: {
            ...minimum !== undefined && {
                minimum,
                tooShort: `^at least ${minimum} elements are required`,
            },
            ...maximum !== undefined && {
                maximum,
                tooLong: `^at most ${maximum} elements are accepted`,
            },
        },
    }),

    date: presence => ({
        presence,
        datetime: {
            message: '^must be a valid ISO date string',
        },
    }),

    zip: presence => ({
        presence,
        format: {
            pattern: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
            message: '^zip code must be 5 or 9 digits',
        },
    }),

    phoneNumber: presence => ({
        presence,
        format: {
            pattern: /^(\+1)?[0-9]{10}$/,
            message: 'must contain 10 digits or country code plus 10 digits',
        },
    }),

    email: presence => ({
        presence,
        format: {
            pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: 'must be a valid email address',
        },
    }),
};

const bundles = {
    full: {
        pagination: ({
            defaultPageNumber,
            defaultPageSize,
            sortFields,
            defaultSortField,
            defaultSortOrderAsc,
        }) => ({
            page: {
                constraints: constraints.integerRange(1, 100000, true),
                sanitize: sanitize.numeric,
                ...defaultPageNumber !== undefined && { default: defaultPageNumber },
            },
            pageSize: {
                constraints: constraints.integerRange(1, 100, true),
                sanitize: sanitize.numeric,
                ...defaultPageSize !== undefined && { default: defaultPageSize },
            },
            ...sortFields !== undefined && {
                sortBy: {
                    constraints: constraints.within(sortFields, true),
                    ...defaultSortField !== undefined && { default: defaultSortField },
                },
                sortOrder: {
                    constraints: constraints.within(['asc', 'desc'], true),
                    ...defaultSortOrderAsc !== undefined && { default: defaultSortOrderAsc ? 'asc' : 'desc' },
                },
            },
        }),
    },
    field: {
        boolean: (presence, defaultValue) => ({
            constraints: constraints.boolean(presence),
            sanitize: sanitize.boolean,
            ...typeof defaultValue === 'boolean' && { default: defaultValue },
        }),
        integerRange: (from, to, presence, defaultValue) => ({
            constraints: constraints.integerRange(from, to, presence),
            sanitize: sanitize.numeric,
            ...defaultValue !== undefined && { default: defaultValue },
        }),
        numberRange: (from, to, presence, defaultValue) => ({
            constraints: constraints.numberRange(from, to, presence),
            sanitize: sanitize.numeric,
            ...defaultValue !== undefined && { default: defaultValue },
        }),
        textLength: (min, max, presence, defaultValue) => ({
            constraints: constraints.textLength(min, max, presence),
            ...defaultValue !== undefined && { default: defaultValue },
        }),
        within: (allowedValues, presence, defaultValue) => ({
            constraints: constraints.within(allowedValues, presence),
            ...defaultValue !== undefined && { default: defaultValue },
        }),
        arrayLength: (min, max) => ({
            arrayConstraints: constraints.arrayLength(min, max, true),
        }),
    },
};

const helper = {
    sanitize,
    constraints,
    bundles,
};

module.exports = helper;

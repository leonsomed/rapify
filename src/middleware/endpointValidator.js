
const _ = require('lodash');
const validateJs = require('validate.js');
const InvalidApiParameterError = require('../errors/invalidApiParameter');
const ListError = require('../errors/list');

const hiddenProps = [
    '__has_children',
    '__is_array',
];

validateJs.validators.custom = (value, options) => {
    if (typeof options._validate === 'function') {
        const result = options._validate(value);

        if (result) {
            if (typeof result === 'string') {
                return result;
            }

            return options.message || 'failed validation';
        }
    }

    return undefined;
};

function ignoreExtraFields(input, rules = {}) {
    if (!input) {
        return {};
    }

    const whiteList = {};
    const entries = Object.entries(rules);

    if (!entries.length) {
        return {};
    }

    for (const [key, ruleProps] of entries) {
        if (key === '__has_children') {
            continue;
        }

        if (ruleProps) {
            let temp;

            if (ruleProps.__has_children) {
                temp = ignoreExtraFields(input[key], ruleProps);
            } else {
                temp = input[key];
            }

            if (temp !== undefined) {
                whiteList[key] = temp;
            }
        }
    }

    return whiteList;
}

function sanitize(originalInput, rules) {
    if (!rules) {
        return originalInput;
    }

    const input = originalInput;

    for (const [key, rule] of Object.entries(rules)) {
        const ruleIsArray = Array.isArray(rule);
        const ruleIsNestedObject = Boolean(rule.__has_children ||
            (ruleIsArray && rule[0].__has_children));

        if (!ruleIsNestedObject && !ruleIsArray) {
            // primitive
            const temp = sanitizePrimitive(input[key], rule);

            if (temp !== undefined) {
                input[key] = temp;
            }
        } else if (ruleIsNestedObject && !ruleIsArray) {
            // nested object
            const temp = sanitizeNestedObject(input[key], rule);

            if (temp !== undefined) {
                input[key] = temp;
            }
        } else if (!ruleIsNestedObject && ruleIsArray) {
            // primitive array
            const temp = sanitizeArrayOfPrimitives(input[key], rule[0]);

            if (temp !== undefined) {
                input[key] = temp;
            }
        } else if (ruleIsNestedObject && ruleIsArray) {
            // array of nested objects
            const temp = sanitizeArrayOfNestedObjects(input[key], rule[0]);

            if (temp !== undefined) {
                input[key] = temp;
            }
        } else {
            throw new Error('unknown sanitation classification');
        }
    }

    return _.pickBy(input, n => n !== undefined);
}

function sanitizePrimitive(input, rule) {
    if (!rule) {
        return input;
    }

    let value = input;

    // apply default value if input is undefined
    if (value === undefined) {
        value = typeof rule.default === 'function' ? rule.default() : rule.default;
    }

    // apply sanitize function if available and value is not undefined
    if (typeof rule.sanitize === 'function' && value !== undefined) {
        value = rule.sanitize(value);
    }

    return value;
}

function sanitizeArrayOfPrimitives(input, rule) {
    if (!rule) {
        return input;
    }

    let value = input;

    if (input === undefined) {
        value = typeof rule.default === 'function' ? rule.default() : rule.default;
    }

    // if it is not an array with at least 1 element then return
    if (!value || !Array.isArray(value) || !value.length) {
        return value;
    }

    return value.map(n => sanitizePrimitive(n, rule));
}

function sanitizeNestedObject(input, rules) {
    if (!rules) {
        return input;
    }

    const result = sanitize(input || {}, _.omit(rules, '__has_children'));
    const hasKeys = Object.keys(result).length > 0;

    return hasKeys ? result : input;
}

function sanitizeArrayOfNestedObjects(input, rules) {
    if (!rules) {
        return input;
    }

    // if it is not an array with at least 1 element then return
    if (!input || !Array.isArray(input) || !input.length) {
        return input;
    }

    return input.map(n => sanitizeNestedObject(n, rules));
}

function flattenRules(rules, prefix = '') {
    const newRules = {};

    for (const [key, originalRule] of Object.entries(rules)) {
        const rule = originalRule;
        // const rule = originalRule.__is_array ? originalRule[0] : originalRule;
        // const posfix = rule.__is_array ? '.n' : '';
        const posfix = '';

        if (originalRule.__has_children) {
            const subRules = flattenRules(rule, `${prefix}${key}${posfix}.`);

            for (const [subRuleKey, subRule] of Object.entries(subRules)) {
                newRules[subRuleKey] = subRule;
            }
        } else if (hiddenProps.indexOf(key) === -1) {
            newRules[`${prefix}${key}${posfix}`] = rule;
        }
    }

    return newRules;
}

function bindParams(rule, input) {
    const constraints = rule.constraints || {};
    const arrayConstraints = rule.arrayConstraints || {};
    const custom = constraints.custom || {};
    const customArray = arrayConstraints.custom || {};

    if (typeof custom.validate === 'function') {
        // eslint-disable-next-line
        custom._validate = custom.validate.bind(null, input);
    }

    if (typeof customArray.validate === 'function') {
        // eslint-disable-next-line
        customArray._validate = customArray.validate.bind(null, input);
    }
}

function safeAccess(obj, chain) {
    if (!chain || !chain.length) {
        return obj;
    }

    let temp = obj;
    for (const n of chain) {
        if (temp) {
            temp = temp[n];
        } else {
            return temp;
        }
    }

    return temp;
}

function buildObjectFromPath(chain, value) {
    if (!chain || !chain.length) {
        return null;
    }

    let temp = {};
    const result = temp;
    for (let i = 0; i < chain.length; i += 1) {
        if (i === chain.length - 1) {
            temp = temp[chain[i]] = value;
        } else {
            temp = temp[chain[i]] = {};
        }
    }

    return result;
}

function validate(input, rules = {}, allInput) {
    if (allInput === undefined) {
        allInput = input;
    }

    const newRules = flattenRules(rules);
    const regularRules = {};
    const arrayRules = {};

    const ruleKeys = Object.keys(newRules);
    for (const key of ruleKeys) {
        const next = newRules[key];

        if (Array.isArray(next)) {
            arrayRules[key] = next;
        } else {
            regularRules[key] = next;
        }
    }

    const regularConstraints = _.mapValues(regularRules, (rule) => {
        bindParams(rule, allInput);

        return rule.length ? rule : rule.constraints || {};
    });

    let errors = validateJs(input, regularConstraints);
    errors = _.flatMapDeep(
        errors,
        (message, key) => new InvalidApiParameterError(key, message),
    );

    const arrayRulesKeys = Object.keys(arrayRules);
    for (const ruleKey of arrayRulesKeys) {
        const nextRule = arrayRules[ruleKey][0];
        const nextInput = safeAccess(input, ruleKey.split('.'));

        const inputPath = ruleKey;

        if (nextInput && !Array.isArray(nextInput)) {
            errors = [
                ...errors,
                new InvalidApiParameterError(inputPath, 'must be an array'),
            ];
        } else {
            if (nextRule.arrayConstraints) {
                const obj = buildObjectFromPath(inputPath.split('.'), nextInput);
                const nextErrors = validateJs(obj, { [inputPath]: nextRule.arrayConstraints });
                errors = [
                    ...errors,
                    ..._.flatMapDeep(
                        nextErrors,
                        (message, key) => new InvalidApiParameterError(key, message),
                    ),
                ];
            }

            if (nextInput && nextInput.length) {
                for (let i = 0; i < nextInput.length; i += 1) {
                    const indexInputPath = `${inputPath}.${i}`;
                    const obj = buildObjectFromPath(indexInputPath.split('.'), nextInput[i]);
                    const nextErrors = validate(obj, { [indexInputPath]: _.omit(nextRule, ['arrayConstraints']) }, allInput);
                    errors = [
                        ...errors,
                        ...nextErrors,
                    ];
                }
            }
        }
    }

    return errors;
}

const validateRequest = async (req, res, next) => {
    try {
        if (res.locals.wasRouteHandled) {
            next();
            return;
        }

        const rule = {
            ...req.rapify._endpoint,
            params: req.rapify._endpoint.params,
            query: req.rapify._endpoint.query,
            body: req.rapify._endpoint.body,
            props: req.rapify._endpoint.props,
        };

        let params = req.params;
        let query = req.query;
        let body = req.body;
        let props = {};

        // get props by running the provided function for each propMap
        if (rule.propsMap) {
            Object.entries(rule.propsMap).forEach(async ([key, fn]) => {
                const temp = fn(req);

                if (temp && typeof temp.then === 'function') {
                    props[key] = await temp;
                } else {
                    props[key] = temp;
                }
            });
        }

        if (!rule.keepExtraFields) {
            props = ignoreExtraFields(props, rule.props);
            // do not ignore params because they are part of the URL
            // params = ignoreExtraFields(params, rule.params);
            query = ignoreExtraFields(query, rule.query);
            body = ignoreExtraFields(body, rule.body);
        }

        props = sanitize(props, rule.props);
        params = sanitize(params, rule.params);
        query = sanitize(query, rule.query);
        body = sanitize(body, rule.body);

        const propsErrors = validate(props, rule.props);
        const paramsErrors = validate(params, rule.params);
        const queryErrors = validate(query, rule.query);
        const bodyErrors = validate(body, rule.body);

        const allErrors = [
            ...bodyErrors,
            ...propsErrors,
            ...paramsErrors,
            ...queryErrors,
        ];

        if (allErrors.length) {
            throw new ListError(allErrors);
        }

        const input = {
            ...body,
            ...query,
            ...params,
            ...props,
        };

        req.rapify = {
            input,
            body,
            query,
            params,
            props,
        };

        if (typeof rule.customValidation === 'function') {
            const result = rule.customValidation(req);

            if (result && typeof result.then === 'function') {
                await result;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validateRequest;


const _ = require('lodash');
const validateJs = require('validate.js');
const InvalidApiParameterError = require('../errors/invalidApiParameter');
const ListError = require('../errors/list');

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

function ignoreExtraFields(input, rules = {}) {
    const whiteList = {};
    const rule = rules;

    for (const [key, ruleProps] of Object.entries(rule)) {
        if (key === '__has_children') {
            continue;
        }

        if (ruleProps) {
            if (ruleProps.__has_children) {
                whiteList[key] = ignoreExtraFields(input[key] || {}, ruleProps);
            } else {
                whiteList[key] = input[key];
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
        const ruleIsArray = Boolean(rule.__is_array);
        const ruleIsNestedObject = Boolean(rule.__has_children);

        if (!ruleIsNestedObject && !ruleIsArray) {
            // primitive
            input[key] = sanitizePrimitive(input[key], rule);
        } else if (ruleIsNestedObject && !ruleIsArray) {
            // nested object
            input[key] = sanitizeNestedObject(input[key], rule);
        } else if (!ruleIsNestedObject && ruleIsArray) {
            // primitive array
            input[key] = sanitizeArrayOfPrimitives(input[key], rule);
        } else if (ruleIsNestedObject && ruleIsArray) {
            // array of nested objects
            input[key] = sanitizeArrayOfNestedObjects(input[key], rule);
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

    for (const [key, rule] of Object.entries(rules)) {
        if (rule.__has_children) {
            const subRules = flattenRules(rule, `${prefix}${key}.`);

            for (const [subRuleKey, subRule] of Object.entries(subRules)) {
                newRules[subRuleKey] = subRule;
            }
        } else if (key !== '__has_children' && key !== '__is_array') {
            newRules[`${prefix}${key}`] = rule;
        }
    }

    return newRules;
}

function bindParams(rule, input) {
    const constraints = rule.constraints || {};
    const requiredConditional = constraints.requiredConditional || {};

    if (requiredConditional && typeof requiredConditional.condition === 'function') {
        // eslint-disable-next-line
        requiredConditional._condition = requiredConditional.condition.bind(null, input);
    }
}

function validate(input, rules) {
    const newRules = flattenRules(rules);
    const constraints = _.mapValues(newRules, (rule) => {
        bindParams(rule, input);

        return rule || {};
    });
    const errors = validateJs(input, constraints);

    return _.flatMapDeep(errors, (message, key) => new InvalidApiParameterError(key, message));
}

function formatRules(rules) {
    // TODO move this to an initialization so that it only runs once
    // TODO add logic to assign __has_children that way it does not
    // need to be specified in the endpoints
    if (!rules) {
        return {};
    }

    for (let [key, rule] of Object.entries(rules)) {
        if (Array.isArray(rule)) {
            if (rule.length === 0 || rule.length > 1) {
                throw new Error('missing array validation config');
            }

            rule = rules[key] = rule[0];
            rule.__is_array = true;
        }

        if (rule.__has_children) {
            formatRules(rule);
        }
    }

    return rules;
}

const validateRequest = async (req, res, next) => {
    try {
        if (res.locals.wasRouteHandled) {
            next();
            return;
        }

        const rule = {
            ...req.rapify._endpoint,
            params: formatRules(req.rapify._endpoint.params),
            query: formatRules(req.rapify._endpoint.query),
            body: formatRules(req.rapify._endpoint.body),
            props: formatRules(req.rapify._endpoint.props),
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
            // props = ignoreExtraFields(props, rule.props);
            // do not ignore params because they are part of the URL
            // params = ignoreExtraFields(params, rule.params);
            // query = ignoreExtraFields(query, rule.query);
            body = ignoreExtraFields(body, rule.body);
        }

        // props = sanitize(props, rule.props);
        // params = sanitize(params, rule.params);
        // query = sanitize(query, rule.query);
        body = sanitize(body, rule.body);

        const propsErrors = []; // validate(props, rule.props);
        const paramsErrors = []; // validate(params, rule.params);
        const queryErrors = []; // validate(query, rule.query);
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

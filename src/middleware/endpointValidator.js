
const _ = require('lodash');
const validateJs = require('validate.js');
const InvalidApiParameterError = require('../errors/invalidApiParameter');

const ignoreExtraFields = (input, rules = {}) => {
    const whiteList = {};

    for(const n in rules) {
        if(n.__has_children)
            whiteList[n] = ignoreExtraFields(input[n] || null, n);
        else
            whiteList[n] = input[n];
    }

    return whiteList;
};

const sanitize = (input, rules) => {
    if(!rules)
        return input;

    const theInput = input;

    for(let [key, rule] of Object.entries(rules)) {
        if(rule.__has_children) {
            const result = sanitize(input[key] || {}, _.omit(rule, '__has_children'));

            if(Object.keys(result).length)
                theInput[key] = result;
        }
        else {
            // apply default value if input is undefined
            if(input[key] === undefined) {
                theInput[key] = typeof rule.default === 'function' ?
                    rule.default(input) : rule.default;
            }
            else
                theInput[key] = input[key];

            // apply sanitize function if available and input is not undefined
            if(typeof rule.sanitize === 'function' && theInput[key] !== undefined)
                theInput[key] = rule.sanitize(theInput[key]);
        }
    }

    return _.pickBy(theInput, n => n !== undefined);
};

const flattenRules = (rules, prefix = '') => {
    const newRules = {};

    for(let [key, rule] of Object.entries(rules)) {
        if(rule.__has_children) {
            const subRules = flattenRules(rule, `${prefix}${key}.`);

            for(let [subRuleKey, subRule] of Object.entries(subRules))
                newRules[subRuleKey] = subRule;
        }
        else if(key !== '__has_children')
            newRules[`${prefix}${key}`] = rule;
    }

    return newRules;
};

const bindParams = (constraints, input) => {
    if(constraints && constraints.requiredConditional && typeof constraints.requiredConditional.condition === 'function')
        constraints.requiredConditional._condition = constraints.requiredConditional.condition.bind(null, input);

    return constraints;
};

const validate = (input, rules) => {
    const newRules = flattenRules(rules);
    const constraints = _.mapValues(newRules, rule => bindParams(rule.constraints, input) || {});
    const errors = validateJs(input, constraints);
    return _.flatMapDeep(errors, (message, key) => new InvalidApiParameterError(key, message));
};

const validateRequest = async (req, res, next) => {
    try {
        if(res.locals.wasRouteHandled)
            return next();

        const rule = req.rapify._endpoint;

        let params = req.params;
        let query = req.query;
        let body = req.body;
        let props = {};

        // get props by running the provided function for each propMap
        if(rule.propsMap) {
            Object.entries(rule.propsMap).forEach(async ([key, fn]) => {
                const temp = fn(req);

                if(temp && typeof temp.then === 'function')
                    props[key] = await temp;
                else
                    props[key] = temp;
            });
        }

        if(!rule.keepExtraFields) {
            props = ignoreExtraFields(props, rule.props);
            params = ignoreExtraFields(params, rule.params);
            query = ignoreExtraFields(query, rule.query);
            body = ignoreExtraFields(body, rule.body);
        }

        props = sanitize(props, rule.props || {});
        params = sanitize(params, rule.params || {});
        query = sanitize(query, rule.query || {});
        body = sanitize(body, rule.body || {});

        const propsErrors = validate(props, rule.props || {});

        if(propsErrors.length)
            throw propsErrors[0];

        const paramsErrors = validate(params, rule.params || {});

        if(paramsErrors.length)
            throw paramsErrors[0];

        const queryErrors = validate(query, rule.query || {});

        if(queryErrors.length)
            throw queryErrors[0];

        const bodyErrors = validate(body, rule.body || {});

        if(bodyErrors.length)
            throw bodyErrors[0];

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

        if(typeof rule.customValidation === 'function') {
            const result = rule.customValidation(input, req);

            if(typeof result.then === 'function')
                await result;
        }

        next();
    }
    catch(error) {
        next(error);
    }
};

module.exports = validateRequest;

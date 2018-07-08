const { POST, GET, DELETE } = require('rapify').constants;
const model = require('./mongoModel');

module.exports = {
    prefix: 'campaigns',
    // default true
    public: false,
    // defaults to true if endpoints is undefined, false otherwise
    // it can be set to true and also define endpoints but endpoint collisions will throw an error
    // restify false and endpoints undefined will throw an error
    restify: false,
    // (optional) defaults to undefined, if not set and is required by restify it will throw an error
    model: model,
    // (optional) provide CRUD methods to be used by xCrudOp
    crudInterface: {
        create: (req) => {},
        //...
    },
    endpoints: {
        '/': {
            [POST]: {
                propsMap: {
                    role: req => req.jwt.role,
                },
                props: {
                    ip: {
                        constraints: constraints.resourceName(true),
                    },
                },
                body: {
                    name: {
                        constraints: constraints.resourceName(true),
                    },
                    fqdn: {
                        constraints: constraints.fqdn(false),
                    },
                    trackType: {
                        constraints: {
                            presence: false,
                            inclusion: [
                                constants.campaign.trackType.flagged,
                                constants.campaign.trackType.forms,
                                constants.campaign.trackType.in,
                                constants.campaign.trackType.notIn,
                                constants.campaign.trackType.all,
                                constants.campaign.trackType.none,
                            ],
                        },
                        default: constants.campaign.trackType.all,
                    },
                    trackForms: {
                        constraints: constraints.campaignFormSelector(false),
                        default: [],
                    },
                    trackIn: {
                        constraints: constraints.campaignPaths(false),
                        default: [],
                    },
                    trackNotIn: {
                        constraints: constraints.campaignPaths(false),
                        default: [],
                    },
                },
                customValidation: async (input, user) => {
                    const key = await campaignRepo.findOne({ accountId: user.accountId, name: input.name }).lean();

                    if(key)
                        throw new Error('name is already taken');
                },
                // defaults to undefined, required if handler is not defined defined
                xCrudOp: 'create | read | update | delete | paginate',
                // if handler is not specified it will map to a CRUD operation based the signature (HTTP method, route, crudOp)
                // if no CRUD operation matches the signature an error will be thrown
                handler: async (req, response, res) => {

                },
                // (optional) a function that receives the object returned by the handler and applies a transformation before sending the response to the user
                sanitizeResponse: async (req, data, res) => {

                },
            },
            [GET]: {
                query: {
                    ...pagination.paginate(),
                },
            },
        },

        '/:id': {
            [DELETE]: {
                params: {
                    id: {
                        constraints: constraints.mongoId(true),
                    },
                },
                customValidation: (input, user, req) => customValidations.enforceResourceAccess(input, user, req, campaignRepo),
            },
            [GET]: {
                params: {
                    id: {
                        constraints: constraints.mongoId(true),
                    },
                },
                customValidation: (input, user, req) => customValidations.enforceResourceAccess(input, user, req, campaignRepo),
            },
            [POST]: {
                params: {
                    id: {
                        constraints: constraints.mongoId(true),
                    },
                },
                body: {
                    name: {
                        constraints: constraints.resourceName(false),
                    },
                    fqdn: {
                        constraints: constraints.fqdn(false),
                    },
                    trackType: {
                        constraints: {
                            presence: false,
                            inclusion: [
                                constants.campaign.trackType.flagged,
                                constants.campaign.trackType.forms,
                                constants.campaign.trackType.in,
                                constants.campaign.trackType.notIn,
                                constants.campaign.trackType.all,
                                constants.campaign.trackType.none,
                            ],
                        },
                    },
                    trackForms: {
                        constraints: constraints.campaignFormSelector(false),
                    },
                    trackIn: {
                        constraints: constraints.campaignPaths(false),
                    },
                    trackNotIn: {
                        constraints: constraints.campaignPaths(false),
                    },
                },
                customValidation: (input, user, req) => customValidations.enforceResourceAccess(input, user, req, campaignRepo),
            },
        },

        '/by-page': {
            [GET]: {
                query: {
                    fqdn: {
                        constraints: constraints.fqdn(true),
                    },
                    page: {
                        constraints: constraints.relativeUrl(true),
                    },
                },
            },
        },
    },
};

const expect = require('chai').expect;

const helper = {
    expectErrorListToHaveInvalidApiParameterErrors(errorMap, listError) {
        const missMatch = listError.list.find((n) => {
            const match = errorMap[n.parameterName];

            return !match || match.type !== n.type || match.message !== n.message;
        });

        expect(missMatch).to.eqls(undefined);
    },
};

module.exports = helper;

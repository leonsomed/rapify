const helper = {
    filterObj(obj, fn) {
        const result = {};
        const values = Object.entries(obj);

        for (const [key, value] of values) {
            if (fn(value, key)) {
                result[key] = value;
            }
        }

        return result;
    },

    promise() {
        let resolve;
        const promise = new Promise((reso) => { resolve = reso; });

        return {
            promise,
            resolve,
        };
    },
};

module.exports = helper;

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
};

module.exports = helper;

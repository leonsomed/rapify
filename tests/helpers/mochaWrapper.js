function mochaWrapper(fn) {
    return async (done) => {
        try {
            const temp = fn();

            if(temp && typeof temp.then === 'function')
                await temp;

            done();
        } catch (err) {
            done(err);
        }
    };
}

module.exports = mochaWrapper;

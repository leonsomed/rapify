async function throwWrapper(fn) {
    try {
        await fn();
        return () => {};
    }
    catch(error) {
        return () => { throw error };
    }
}

module.exports = throwWrapper;

const { createHash } = require ("crypto");

class Hash {

    static RepeatableHash (value) {
        var hash = createHash ('blake2s256');
        return hash
            .update(value)
            .digest('hex');
    }   

}

module.exports = Hash;
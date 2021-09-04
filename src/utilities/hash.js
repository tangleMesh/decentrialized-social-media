import { createHash } from "crypto";

class Hash {

    static RepeatableHash (value) {
        var hash = createHash ('blake2s256');
        return hash
            .update(value)
            .digest('hex');
    }   

}

export default Hash;
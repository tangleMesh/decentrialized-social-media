const Hash = require ("../../utilities/hash");

class ApplicationUser {

    constructor (keyPair) {
        this._keyPair = keyPair;
        this._id = Hash.RepeatableHash (this._keyPair.PublicKey);
    }

    get Identifier () {
        return this._id;
    }

    get IsAuthenticated () {
        return this._keyPair.isAuthenticated ();
    }

    get PublicKey () {
        return this._keyPair.PublicKey;
    }

}

module.exports = ApplicationUser;
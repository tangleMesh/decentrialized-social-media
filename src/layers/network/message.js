class NetworkMessage {

    constructor (identifier, content, index = null) {
        this._identifier = identifier;
        this._content = content;
        this._index = index;
    }

    get Identifier () {
        return this._identifier;
    }

    get Content () {
        return this._content;
    }

    get Index () {
        return this._index;
    }

    set _Identifier (id) {
        this._identifier = id;
    }

}

module.exports = NetworkMessage;
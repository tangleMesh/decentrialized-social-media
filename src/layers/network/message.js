class NetworkMessage {

    static get MAX_CONTENT_LENGTH () {
        return 1024 * 4; // 4 KB
    }

    static Create (identifier, index, ...contents) {
        return new NetworkMessage (identifier, contents.join (""), index);
    }

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

    async serialize (idx, rootMessageId) {
        // Count message length and split into multiple chunks if required
        let count = 1;
        let content = this.Content;
        if (content.length > NetworkMessage.MAX_CONTENT_LENGTH) {
            count = Math.ceil (content.length / NetworkMessage.MAX_CONTENT_LENGTH);
        }

        if(idx > count - 1) {
            return null;
        }

        return JSON.stringify ({
            count: count,
            idx: idx || 0,
            content: content.substr (0 + (idx * NetworkMessage.MAX_CONTENT_LENGTH), NetworkMessage.MAX_CONTENT_LENGTH),
            rootMessageId: rootMessageId || null,
        });
    }

}

module.exports = NetworkMessage;
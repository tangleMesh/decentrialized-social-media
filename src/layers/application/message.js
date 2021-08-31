class ApplicationMessage {

    constructor (type) {
        this._type = type;
    }

    get Type () {
        return this._type;
    }

    async _serialize (content) {
        return JSON.stringify ({
            type: this.Type,
            ...content,
        });
    }

}

module.exports = ApplicationMessage;
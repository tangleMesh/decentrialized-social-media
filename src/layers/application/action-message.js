const ApplicationMessage = require ("./message");

class ApplicationActionMessage extends ApplicationMessage {

    constructor (method, property, value) {
        super ("action");
        this._method = method;
        this._property = property;
        this._value = value;
    }

    get Method () {
        return this._method;
    }

    get Property () {
        return this._property;
    }

    get Value () {
        return this._value;
    }

    async serialize () {
        return await this._serialize ({
            method: this.Method,
            property: this.Property,
            value: this.Value,
        });
    }

}

module.exports = ApplicationActionMessage;
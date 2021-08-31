const ApplicationMessage = require ("./message");

class ContentMessage extends ApplicationMessage {

    constructor (format, title, description, content) {
        super ("content");
        this._format = format;
        this._title = title;
        this._description = description;
        this._content = content;
    }

    get Format () {
        return this._format;
    }

    get Title () {
        return this._title;
    }

    get Description () {
        return this._description;
    }

    get Content () {
        return this._content;
    }

    async serialize () {
        return await this._serialize ({
            format: this.Format,
            title: this.Title,
            description: this.Description,
            content: this.Content,
        });
    }

}

module.exports = ContentMessage;
const { v4: uuidv4 } = require ("uuid");

class CommunicationMessage {

    static async Parse (rawMessage) {
         // Check type
         if (typeof rawMessage !== "string") {
            throw new Error (`Wrong type of rawMessage! The type is "${typeof rawMessage}" instead of "string".`);
        }

        // Check format
        let parsedMessage = null;
        try {
            parsedMessage = JSON.parse (rawMessage);
        } catch (e) {
            throw new Error (`The format of the rawMessage is invalid! Should be a stringified JSON-object!`);
        }

        // Check keys
        const messageKeys = Object.keys (parsedMessage);
        for (const key of ["id", "author", "channel", "isPublic", "payload", "signature"]) {
            if (!messageKeys.includes (key)) {
                throw new Error (`The required key "${key}" is missing in the message!`);
            }
        }

        return parsedMessage;
    }

    static async Create (parsedMessage, channel, author) {
         // Check channel
         if (typeof parsedMessage.channel !== "string" || parsedMessage.channel !== channel.Identifier) {
            throw new Error (`The channel property is invalid! Must match your the channel id you specified "${channel.Identifier}" but is "${parsedMessage.channel}".`);
        }

        // Verify signature
        let serializedMessage = {
            id: parsedMessage.id,
            author: parsedMessage.author,
            isPublic: parsedMessage.isPublic,
            channel: parsedMessage.channel,
            payload: parsedMessage.payload,
        };
        if (author._keyPair.verify (JSON.stringify (serializedMessage), parsedMessage.signature) !== true) {
            throw new Error (`The signature of the message is invalid!`);
        }

        // Decrypt the payload if required
        let payload = parsedMessage.payload;
        if (parsedMessage.isPublic !== true) {
            payload = channel._readSecret.decrypt (payload);
        }

        return new CommunicationMessage (author, payload, parsedMessage.id, parsedMessage.isPublic);
    }

    constructor (author, payload, id = null, isPublic = false) {
        this._author = author;
        this._id = id;
        this._payload = payload;
        this._isPublic = isPublic;
        this._channel = null;

        if (this._id === null) {
            this._id = uuidv4 ();
        }
    }

    get Identifier () {
        return this._id;
    }

    set Channel (channel) {
        if (this._channel !== null) {
            throw new Error (`This message ${this.Identifier} has already a channel attatched!`);
        }
        this._channel = channel;
    }

    get Channel () {
        return this._channel;
    }

    get Receivers () {
        if (this._channel === null) {
            return [];
        }
        let receivers = [];
        for (const receiver of this.Channel.Readers) {
            if (!receivers.includes (receivers.Identifier)) {
                receivers.push (receiver.Identifier);
            }
        }
        return receivers;
    }

    get Author () {
        return this._author;
    }

    get Payload () {
        return this._payload;
    }

    get IsPublic () {
        return this._isPublic;
    }

    async serialize () {
        if (this.Channel === null) {
            throw new Error (`The message ${this.Identifier} can not be serialized! The channel information is missing!`);
        }

        let serializedMessage = {};

        // Meta information
        serializedMessage.id = this.Identifier;
        serializedMessage.author = this.Author.Identifier;
        serializedMessage.isPublic = this.IsPublic;
        serializedMessage.channel = this.Channel.Identifier;

        // Content information
        let payload = this.Payload;
        if (!this.IsPublic) {
            payload = this.Channel._publishSecret.encrypt (payload);
        }
        serializedMessage.payload = payload;

        // Verification information
        serializedMessage.signature = this.Author._keyPair.sign (JSON.stringify (serializedMessage));

        return JSON.stringify (serializedMessage);
    }

}

module.exports = CommunicationMessage;
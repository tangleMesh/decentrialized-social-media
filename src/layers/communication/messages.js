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
        for (const key of ["author", "channel", "isEncrypted", "payload", "signature"]) {
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
            author: parsedMessage.author,
            isEncrypted: parsedMessage.isEncrypted,
            channel: parsedMessage.channel,
            payload: parsedMessage.payload,
        };
        if (author._keyPair.verify (JSON.stringify (serializedMessage), parsedMessage.signature) !== true) {
            throw new Error (`The signature of the message is invalid!`);
        }

        // Decrypt the payload if required
        let payload = parsedMessage.payload;
        if (parsedMessage.isEncrypted === true) {
            payload = channel._readSecret.decrypt (payload);
        }

        return new CommunicationMessage (author, payload, parsedMessage.isEncrypted);
    }

    constructor (author, payload, isEncrypted = true) {
        this._author = author;
        this._payload = payload;
        this._isEncrypted = isEncrypted;
        this._channel = null;
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

    get isEncrypted () {
        return this._isEncrypted;
    }

    async serialize () {
        if (this.Channel === null) {
            throw new Error (`The message ${this.Identifier} can not be serialized! The channel information is missing!`);
        }

        let serializedMessage = {};

        // Meta information
        serializedMessage.author = this.Author.Identifier;
        serializedMessage.isEncrypted = this.isEncrypted;
        serializedMessage.channel = this.Channel.Identifier;

        // Content information
        let payload = this.Payload;
        if (this.isEncrypted) {
            payload = this.Channel._publishSecret.encrypt (JSON.stringify (payload));
        }
        serializedMessage.payload = payload;

        // Verification information
        serializedMessage.signature = this.Author._keyPair.sign (JSON.stringify (serializedMessage));

        return JSON.stringify (serializedMessage);
    }

}

module.exports = CommunicationMessage;
class CommunicationMessage {

    static async Parse (rawMessage, decryptionSecretOrDecryptionKeyPair, verificationKeyPair) {
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
        for (const key of ["author", "audience", "isEncrypted", "payload", "signature"]) {
            if (!messageKeys.includes (key)) {
                throw new Error (`The required key "${key}" is missing in the message!`);
            }
        }

        // Verify signature
        let serializedMessage = {
            author: parsedMessage.author,
            isEncrypted: parsedMessage.isEncrypted,
            audience: parsedMessage.channel,
            payload: parsedMessage.payload,
        };
        if (verificationKeyPair.verify (JSON.stringify (serializedMessage), parsedMessage.signature) !== true) {
            throw new Error (`The signature of the message is invalid!`);
        }

        // Decrypt the payload if required
        let payload = parsedMessage.payload;
        if (parsedMessage.isEncrypted === true) {
            payload = decryptionSecretOrDecryptionKeyPair.decrypt (payload);
        }

        return new CommunicationMessage (parsedMessage.author, parsedMessage.audience, payload, parsedMessage.isEncrypted);
    }
 
    constructor (author, audience, payload, isEncrypted = true) {
        this._author = author;
        this._audience = audience;
        this._payload = payload;
        this._isEncrypted = isEncrypted;
    }

    get Audience () {
        return this._audience;
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

    async serialize (encryptionSecretOrEncryptionKeyPair, signKeyPair) {
        let serializedMessage = {};

        // Meta information
        serializedMessage.author = this.Author;
        serializedMessage.isEncrypted = this.isEncrypted;
        serializedMessage.audience = this.Audience;

        // Content information
        let payload = this.Payload;
        if (this.isEncrypted) {
            payload = encryptionSecretOrEncryptionKeyPair.encrypt (JSON.stringify (payload));
        }
        serializedMessage.payload = payload;

        // Verification information
        serializedMessage.signature = signKeyPair.sign (JSON.stringify (serializedMessage));

        return JSON.stringify (serializedMessage);
    }    

}

export default CommunicationMessage;
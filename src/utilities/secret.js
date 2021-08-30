const { createHash, randomBytes, createDecipheriv, createCipheriv } = require ("crypto");

class Secret {

    static get ENCRYPTION_ALGORITHM () {
        return "aes-256-ctr";
    }

    static Generate () {
        const secret = createHash ("sha256")
            .update (randomBytes (256))
            .digest("base64")
            .substr(0, 32);
        return new Secret (secret);
    }

    constructor (secret) {
        this._secret = secret;
    }

    get Secret () {
        return this._secret;
    }

    decrypt (data) {
        const iv = Buffer.from (data.split (":") [0], "hex");
        const decipher = createDecipheriv (Secret.ENCRYPTION_ALGORITHM, String (this.Secret), iv);
        let decryptedData = decipher.update (data.split (":") [1], "hex", "utf-8");
        decryptedData += decipher.final ("utf8");
        return decryptedData;
    }

    encrypt (data) {
        const iv = randomBytes(16);
        const cipher = createCipheriv (Secret.ENCRYPTION_ALGORITHM, String (this.Secret), iv);
        const encrypted = Buffer.concat ([cipher.update (Buffer.from (data, "utf-8")), cipher.final ()]);
        return `${iv.toString ("hex")}:${encrypted.toString ("hex")}`;
    }

}

module.exports = Secret;
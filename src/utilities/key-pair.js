import { generateKeyPairSync, createPublicKey, publicEncrypt, privateDecrypt, sign, verify } from "crypto";

class KeyPair {

    static Generate () {
        const { publicKey, privateKey } = generateKeyPairSync (
            "rsa", 
            // "ed25519", 
            {
                // modulusLength: 1024,
                modulusLength: 1024,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                }
            }
        );
        
        return new KeyPair (
            publicKey.toString ("utf-8"),
            privateKey.toString ("utf-8")
        );
    }

    constructor (publicKey, privateKey = null) {
        this._publicKey = publicKey;
        this._privateKey = privateKey;

        // Generate public key from private key if required
        if (this._privateKey !== null && this._publicKey === null) {
            this._publicKey = createPublicKey (this._privateKey)
                .export ({
                    format: "pem",
                    type: 'spki',
                    format: 'pem',
                });
        }
    }

    get isAuthenticated () {
        return this._privateKey !== null;
    }

    get PublicKey () {
        return this._publicKey;
    }

    get PrivateKey () {
        return this._privateKey;
    }

    // Source: https://www.sohamkamani.com/nodejs/rsa-encryption/
    encrypt (data) {
        try {
            const encryptedData = publicEncrypt (
                {
                    key: this.PublicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha256",
                },
                Buffer.from (data)
            );
            return encryptedData.toString ("hex");
        } catch (e) {
            return null;
        }
    }

    // Source: https://www.sohamkamani.com/nodejs/rsa-encryption/
    decrypt (data) {
        try {
            const decryptedData = privateDecrypt (
                {
                    key: this.PrivateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha256",
                },
                Buffer.from (data, "hex")
            );
            return decryptedData.toString ();
        } catch (e) {
            return null;
        }
    }

    sign (data) {
        const signature = sign (null, Buffer.from (data, "utf-8"), this.PrivateKey);
        return signature.toString ("hex");
    }

    verify (data, signature) {
        const isValid = verify (null, Buffer.from (data, "utf-8"), this.PublicKey, Buffer.from (signature, "hex"));
        return isValid;
    }

}

export default KeyPair;
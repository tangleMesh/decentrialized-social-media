const Hash = require ("../../utilities/hash");

const NetworkMessageTransportation = require ("../network/message-transportation");
const NetworkMessage = require ("../network/message");

const CommunicationMessage = require ("./messages");

class CommunicationChannel {

    // Static properties

    static get USER_ROLE_ADMIN () {
        return "admin";
    }

    static get USER_ROLE_PUBLISHER () {
        return "publisher";
    }

    static get USER_ROLE_READER () {
        return "reader";
    }


    // Object methods

    constructor (keyPair, name, {
        readSecret = null, 
        publishSecret = null, 
        adminSecret = null,
        customPorperties = {},
    } = {}) {
        // Set the required properties
        this._keyPair = keyPair;
        this._name = name;

        // Set the optional properties
        this._readSecret = readSecret;
        this._publishSecret = publishSecret;
        this._adminSecret = adminSecret;
        this._customProperties = customPorperties;
    }

    async initialize () {
        // TODO: if you just joined the channel, simply initialize all values & co.
    }

    get Identifier () {
        return Hash.RepeatableHash (this._keyPair.PublicKey);
    }

    get Name () {
        return this._name;
    }

    get CustomProperties () {
        return this._customProperties;
    }

    get Readers () {
        // TODO:
        return [
            ...this.Participants,
        ];
    }

    get Participants () {
        // TODO:
        return [
            ...this.Admins,
        ];
    }

    get Admins () {
        // TODO:
        return [
            global.test.user,
        ];
    }

    get IsPublic () {
        return this._readSecret === null;
    }

    async sendMessage (author, message) {
        if (!this.Participants.includes (author)) {
            throw Error (`The author ${author.Identifier} is not allowed to publish messages in this channel ${this.Identifier}!`);
        }

        // Set channel if not set already
        if (message.Channel === null) {
            message.Channel = this;
        }

        const msg = new NetworkMessage (null, await message.serialize (), "/" + this.Identifier.substr (0, 24));
        const networkMessage = await NetworkMessageTransportation.NETWORK_INTERFACE.sendMessage (msg);
        return networkMessage;
    }

    async sendActionMessage (author, message, receiverUser = null) {
        if (!this.Admins.includes (author)) {
            throw Error (`The author ${author.Identifier} is not allowed to publish messages in this channel ${this.Identifier}!`);
        }

        // Set channel if not set already
        if (message.Channel === null) {
            message.Channel = this;
        }

        const msg = new NetworkMessage (null, await message.serialize (), "/" + (receiverUser ? receiverUser : this).Identifier.substr (0, 24));
        const networkMessage = await NetworkMessageTransportation.NETWORK_INTERFACE.sendMessage (msg);
        return networkMessage;
    }

    async subscribeMessages (callback = async (channel, message) => {}, lastMessage = null) {
        // TODO: receive all missing messages since lastMessage + regularily fetch new messages
        // If lastMessage is NULL, simply only fetch new messages
        const unsubscribe = await NetworkMessageTransportation.NETWORK_INTERFACE.subscribeMessages (async (rawMessage) => {
            const parsedMessage = await CommunicationMessage.Parse (rawMessage.Content);
            // TODO: search user in local database by identifier and pass it
            // TODO: replace global.test.user
            const message = await CommunicationMessage.Create (parsedMessage, this, global.test.user);
            return await callback (this, message);
        }, {
            indexPath: "/" + this.Identifier.substr (0, 24),
        });
        return unsubscribe;
    }

}

module.exports = CommunicationChannel;
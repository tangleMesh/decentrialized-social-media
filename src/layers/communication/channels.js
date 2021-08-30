const Hash = require ("../../utilities/hash");

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
        return [];
    }

    get IsPublic () {
        return this._readSecret === null;
    }

    async sendMessage (author, message) {
        if (!this.Participants.includes (author)) {
            throw Error (`The author ${author.Identifier} is not allowed to publish messages in this channel ${this.Identifier}!`);
        }
        // TODO: send message to communication layer
    }

    subscribeMessages (callback = async (channel, message) => {}, lastMessage = null) {
        // TODO: receive all missing messages since lastMessage + regularily fetch new messages
        // If lastMessage is NULL, simply only fetch new messages
        // callback (this, );
    }

    async deleteMessage (executingUser, message) {
        // TODO: check if executingUser has right to delete (author or admin) and send message to delete message
    }

    async addUser (executingUser, ...newUsers) {
        // TODO: check if executingUser has right to add new users (admin) and send shared secret to all newUsers
        // TODO: also send all the relevant channel information with it
    }

    async addUser (executingUser, ...usersToRemove) {
        // TODO: check if executingUser has right to remove users (admin) and update the shared secret for all users kept
    }

    async updateUserRole (executingUser, user, role) {
        // TODO: check if executingUser has right to update users role (admin) and update the user (eg. change shared adminSecret)
    }

    async updateName (executingUser, name) {
        // TODO:
    }

    async updateCustomProperties (executingUser, properties = {}) {
        // TODO: broadcast
        this._customProperties = {
            ...properties,
        };
    }

}

module.exports = CommunicationChannel;
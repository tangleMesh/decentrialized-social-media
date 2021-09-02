import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';
import moment from "moment";

class StorageAdapter {

    constructor ({
        storagePath = path.resolve (dirname(fileURLToPath(import.meta.url)), "../../../db.json"),
        cleanupThreshold,
    } = {}) {
        this._adapter = new JSONFile (storagePath);
        this._db = new Low (this._adapter);
        this._cleanupThreshold = cleanupThreshold;
    }

    async initialize () {
        // read database-file
        await this._db.read ();

        // Set default data
        this._db.data ||= { 
            messages: {},
            messageIndexes: {},
            users: [],
            channels: [],
        }

        // write defaults
        await this._db.write()
    }

    async storeMessage (identifier, index, data) {
        if (!this._db.data.messages [identifier]) {
            this._db.data.messages [identifier] = data;
            this._db.data.messageIndexes [index] = [
                ...(this._db.data.messageIndexes [index] || []),
            ];
            this._db.data.messageIndexes [index].push (identifier);
            await this._db.write ();
        }
    }

    async getMessages (index) {
        const messageIds = this._db.data.messageIndexes [index] || [];
        let messages = [];
        for (const messageId of messageIds) {
            if (this._db.data.messages [messageId]) {
                messages.push (
                    this._db.data.messages [messageId]
                );
            }
        }
        return messages;
    }

    async getMessage (identifier) {
        return this._db.data.messages [identifier] || null;
    }

    async addUser (userIdentifier) {
        if (!this._db.data.users.includes (userIdentifier)) {
            this._db.data.users.push (userIdentifier);
        }
        await this._db.write ();
        return true;
    }

    async addChannel (channelIdentifier) {
        if (!this._db.data.channels.includes (channelIdentifier)) {
            this._db.data.channels.push (channelIdentifier);
        }
        await this._db.write ();
        return true;
    }

    async removeUser (userIdentifier) {
        const idx = this._db.data.users.indexOf (userIdentifier);
        if (idx >= 0) {
            this._db.data.users.splice(idx, 1);
        }
        await this._db.write ();
        return true;
    }

    async removeChannel (channelIdentifier) {
        const idx = this._db.data.channels.indexOf (channelIdentifier);
        if (idx >= 0) {
            this._db.data.channels.splice(idx, 1);
        }
        await this._db.write ();
        return true;
    }

    async getUsers () {
        return this._db.data.users;
    }

    async getChannels () {
        return this._db.data.channels;
    }

    async cleanUp () {
        let cleanUpCount = 0;
        for (const messageIdentifier in this._db.data.messages) {
            if (moment (this._db.data.messages [messageIdentifier].timestamp, "YYYY-MM-DD HH:mm:ss").isBefore (moment ().subtract (this._cleanupThreshold, "milliseconds"))) {
                // remove message index
                this._db.data.messageIndexes [this._db.data.messages [messageIdentifier].message.index].splice (this._db.data.messageIndexes [this._db.data.messages [messageIdentifier].message.index].indexOf (messageIdentifier), 1);
                if (this._db.data.messageIndexes [this._db.data.messages [messageIdentifier].message.index].length <= 0) {
                    this._db.data.messageIndexes [this._db.data.messages [messageIdentifier].message.index] = null;
                    delete this._db.data.messageIndexes [this._db.data.messages [messageIdentifier].message.index];
                }

                // remove message
                this._db.data.messages [messageIdentifier] = null;
                delete this._db.data.messages [messageIdentifier];

                cleanUpCount++;
            }
        }
        await this._db.write ();
        return cleanUpCount;
    }
   

}

export default StorageAdapter;
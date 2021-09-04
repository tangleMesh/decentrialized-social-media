import StorageAdapterLowDB from "./storage-adapter.lowdb.js";
import moment from "moment";
import NetworkMessage from "../network/network-message.js";

class StorageAdapter {

    static get ADAPTER_INTERFACE () {
        if (!global.dsm.adapter) {
            global.dsm.adapter = new StorageAdapter (global.dsm.ADAPTER, global.dsm.ADAPTER_SETTINGS);
        }
        return global.dsm.adapter;
    }

    static get ADAPTERS () {
        return {
            "lowdb": StorageAdapterLowDB,
        }
    }

    constructor (adapter = "lowdb", options = {
        cleanupInterval,
        cleanupThreshold,
    }) {
        if (!Object.keys (StorageAdapter.ADAPTERS).includes (adapter)) {
            throw new Error (`The adapter "${adapter}" is currently not supported!`);
        }
        this._options = {
            cleanupInterval: options.cleanupInterval || 1000 * 60 * 5, // each 5 minutes
            cleanupThreshold: options.cleanupThreshold || 1000 * 60 * 60 * 24 * 5, // messages older than 5 days get pruned 
        };
        this._adapterClass = StorageAdapter.ADAPTERS [adapter];
        this._adapter = new this._adapterClass (this._options);
    }

    async initialize () {
        // Initialize everything
        await this._adapter.initialize ();
        // Run cleanup in specific interval
        setInterval (async () => await this.cleanUp (), this._options.cleanupInterval);
    }

    async storeMessage (networkMessage) {
        return await this._adapter.storeMessage (networkMessage.Identifier, networkMessage.Index, {
            timestamp: moment ().format ("YYYY-MM-DD HH:mm:ss"), 
            message: networkMessage.toString (),
            index: networkMessage.Index,
        });
    }

    async getMessages (index, latestMessageIdentifier = null) {
        const messages = await this._adapter.getMessages (index, latestMessageIdentifier);
        let networkMessages = [];
        for (const message of messages) {
            networkMessages.push (
                NetworkMessage.fromString (message.message),
            );
        }
        return networkMessages;
    }

    async getMessage (identifier) {
        return await this._adapter.getMessage (identifier);
    }

    async getUsers () {
        return await this._adapter.getUsers ();
    }

    async getChannels () {
        return await this._adapter.getChannels ();
    }

    async addUser (userIdentifier) {
        return await this._adapter.addUser (userIdentifier);
    }

    async addChannel (channelIdentifier) {
        return await this._adapter.addChannel (channelIdentifier);
    }

    async removeUser (userIdentifier) {
        return await this._adapter.removeUser (userIdentifier);
    }

    async removeChannel (channelIdentifier) {
        return await this._adapter.removeChannel (channelIdentifier);
    }

    async cleanUp () {
        const count = await this._adapter.cleanUp ();
        console.log ("Storage:cleanup", count, "messages");
    }

}

export default StorageAdapter;
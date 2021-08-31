const NetworkMessageTransportationIOTA = require ("./message-transportation.iota");

class NetworkMessageTransportation {

    static get NETWORK_INTERFACE () {
        if (!global.dsm.network) {
            global.dsm.network = new NetworkMessageTransportation (global.dsm.NETWORK, global.dsm.NETWORK_SETTINGS);
        }
        return global.dsm.network;
    }

    static get MESSAGE_ID_PREFIX () {
        return "dsm";
    }

    static get NETWORKS () {
        return {
            "IOTA": NetworkMessageTransportationIOTA,
        }
    }

    constructor (network = "IOTA", options = {}) {
        if (!Object.keys (NetworkMessageTransportation.NETWORKS).includes (network)) {
            throw new Error (`The network "${network}" is currently not supported!`);
        }
        this._networkClass = NetworkMessageTransportation.NETWORKS [network];
        this._network = new this._networkClass (options);
    }

    async initialize () {
        // Initialize everything
        await this._network.initialize ();
    }

    async getMessage (id) {
        return await this._network.getMessage (id);
    }

    async sendMessage (networkMessage) {
        return await this._network.sendMessage (networkMessage, NetworkMessageTransportation.MESSAGE_ID_PREFIX);
    }

    async subscribeMessages (cb = async (rawMessage) => {}, options = {}) {
        return await this._network.subscribeMessages (cb, NetworkMessageTransportation.MESSAGE_ID_PREFIX, options);
    }

}

module.exports = NetworkMessageTransportation;
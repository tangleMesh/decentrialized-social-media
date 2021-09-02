const NetworkMessageTransportationIOTA = require ("./message-transportation.iota");
const NetworkMessage = require ("./message");

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
        const rawMessage = await this._network.getMessage (id);
        return new NetworkMessage (rawMessage.id, rawMessage.content, rawMessage.index);
    }

    async sendMessage (networkMessage) {
        let messageIds = [];
        let messageIdx = 0;
        let messageContent = null;
        do {
            messageContent = await networkMessage.serialize (messageIdx++, messageIds [0]);
            if (messageContent === null) break;
            console.log ("messageContent", messageContent.length);
            messageIds.push (await this._network.sendMessage (messageContent, NetworkMessageTransportation.MESSAGE_ID_PREFIX + (networkMessage.Index !== null ? networkMessage.Index : "")));
        } while (messageContent !== null);
        networkMessage._Identifier = messageIds [0];
        return networkMessage;
    }

    async subscribeMessages (cb = async (rawMessage) => {}, options = {}) {
        return await this._network.subscribeMessages (async (rawMessage) => {
            try {
                // Parse and save new received message
                const parsedContent = JSON.parse (rawMessage);
                const lastReceivedMessage = {
                    idx: parsedContent.idx,
                    count: parsedContent.count,
                    id: rawMessage.id,
                    index: rawMessage.index,
                    content: JSON.stringify (parsedContent.content),
                    rootMessageId: parsedContent.rootMessageId,
                };

                // Directly return message if is a single message
                if (lastReceivedMessage.idx === 0 && lastReceivedMessage.count === 1) {
                    return await cb (new NetworkMessage (lastReceivedMessage.id, lastReceivedMessage.content, lastReceivedMessage.index));
                }

                // Check if all previous and referenced messages for this one are available
                let referenceMessages = [];
                for (const unresolvedMessage of unresolvedMessages) {
                    if (unresolvedMessage.rootMessageId === lastReceivedMessage.rootMessageId || unresolvedMessage.rootMessageId === lastReceivedMessage.id) {
                        referenceMessages.push (unresolvedMessage);
                    }
                } 
                if (referenceMessages.length + 1 === lastReceivedMessage.count) {
                    referenceMessages.push (lastReceivedMessage);
                    referenceMessages.sort((a, b) => a.idx - b.idx);
                    return NetworkMessage.Create (referenceMessages [0].id, referenceMessages [0].index, referenceMessages.map (r => r.content));
                }

            } catch (e) {
                return null;
            }
        }, NetworkMessageTransportation.MESSAGE_ID_PREFIX, options);
    }

}

module.exports = NetworkMessageTransportation;
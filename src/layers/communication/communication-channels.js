import NetworkMessageTransportation from "../network/message-transportation.js";
import NetworkMessage from "../network/network-message.js";

import StorageAdapter from "../storage/storage-adapter";

import CommunicationMessage from "./communication-messages.js";

class CommunicationChannel {

    static _indexPath (applicationChannel) {
        return "/" + communicationMessage.Audience.substr (0, 24);
    }

    static async publishMessage (applicationChannel, authorApplicationUser, communicationMessage) {
        const serializedMessage = await communicationMessage.serialize (applicationChannel._publishSecret, authorApplicationUser._keyPair);
        let networkMessage = new NetworkMessage (null, serializedMessage, CommunicationChannel._indexPath (applicationChannel));
        networkMessage = await NetworkMessageTransportation.NETWORK_INTERFACE.sendMessage (networkMessage);
        return true;
    }

    static async subscribeMessages (applicationChannel, cb = async (communicationMessage) => {}) {
        const unsubscribe = await NetworkMessageTransportation.NETWORK_INTERFACE.subscribeMessages (async (networkMessage) => {
            const communicationMessage = await CommunicationMessage.Parse (networkMessage.Content, applicationChannel._readSecret, applicationChannel._keyPair);
            return communicationMessage;
        }, {
            indexPath: CommunicationChannel._indexPath (applicationChannel),
        });
        return unsubscribe;
    }

    static async getMessages (applicationChannel, lastCommunicationMessage = null) {
        const networkMessages = await StorageAdapter.ADAPTER_INTERFACE.getMessages (CommunicationChannel._indexPath (applicationChannel));
        
        // Filter older messages
        let lastCommunicationMessageIdx = 0;
        if (lastCommunicationMessage) {
            lastCommunicationMessageIdx = networkMessages.find (lCM => lCM.Identifier === lastCommunicationMessage.Identifier);
        }
        return networkMessages.filter ((nM, idx) => idx > lastCommunicationMessageIdx);
    }

}

export default CommunicationChannel;
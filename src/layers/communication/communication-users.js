import NetworkMessageTransportation from "../network/message-transportation.js";
import NetworkMessage from "../network/network-message.js";

import StorageAdapter from "../storage/storage-adapter";

import CommunicationMessage from "./communication-messages.js";

class CommunicationUser {

    static _indexPath (applicationUser) {
        return "/" + applicationUser.Identifier.substr (0, 24);
    }

    static async publishMessage (receiverApplicationUser, authorApplicationUser, communicationMessage) {
        const serializedMessage = await communicationMessage.serialize (authorApplicationUser._keyPair, receiverApplicationUser._keyPair);
        let networkMessage = new NetworkMessage (null, serializedMessage, CommunicationUser._indexPath (receiverApplicationUser));
        networkMessage = await NetworkMessageTransportation.NETWORK_INTERFACE.sendMessage (networkMessage);
        return true;
    }

    static async subscribeMessages (receiverApplicationUser, authorApplicationUser, cb = async (communicationMessage) => {}) {
        const unsubscribe = await NetworkMessageTransportation.NETWORK_INTERFACE.subscribeMessages (async (networkMessage) => {
            // Cache / Store the message
            await StorageAdapter.ADAPTER_INTERFACE.storeMessage (networkMessage);

            // Create communication message
            const communicationMessage = await CommunicationMessage.Parse (networkMessage.Content, receiverApplicationUser._keyPair, authorApplicationUser._keyPair);
            return communicationMessage;
        }, {
            indexPath: CommunicationUser._indexPath (receiverApplicationUser),
        });
        return unsubscribe;
    }

    static async getMessages (receiverApplicationUser, lastCommunicationMessage = null) {
        const networkMessages = await StorageAdapter.ADAPTER_INTERFACE.getMessages (CommunicationUser._indexPath (receiverApplicationUser));
        
        // Filter older messages
        let lastCommunicationMessageIdx = 0;
        if (lastCommunicationMessage) {
            lastCommunicationMessageIdx = networkMessages.find (lCM => lCM.Identifier === lastCommunicationMessage.Identifier);
        }
        return networkMessages.filter ((nM, idx) => idx > lastCommunicationMessageIdx);
    }

}

export default CommunicationUser;
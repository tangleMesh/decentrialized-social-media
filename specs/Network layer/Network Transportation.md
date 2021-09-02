# Network transportation

The network transportation module is responsible for sending and receiving messages from other participants.
The network transportation module does only work with [network messages](./Network\ Messages.md).

There could be more messaging protocols used, but as a default IOTA's tangle is used. Therefore the `network = "IOTA"` is configured.

There are only 3 functionaly methods the neworkt transportation module needs to take care of:

* getMessage (id) – Receive a specific message from the network by it's id
* sendMessage (networkMessage) – Sends a single network message (maybe splitted into smaller chunks)
* subscribeMessages (cb = async (rawMessage) => {}, options = {}) – Subscribe to new messages from the network and re-join chunked messages

## Custom implementation

You are welcome to add another network to be used. 

Therefore a few methods needs to be implemented as the following interface description describes:

```
class NetworkMessageTransportationCUSTOM {

    constructor ({
        …
    } = {}) {
        <!-- Set up your network interface -->
    }

    async initialize () {
        <!-- Initialize everything needed -->
    }

    async getMessage (id) {
        return {
            id: <message-id>,
            content: <content>,
            index: <index|null>,
        };
    }

    async subscribeMessages (cb = async (rawMessage) => {}, index, { indexPath = null } = {}) {
        return {
            id: <message-id>,
            content: <content>,
            index: <index|null>,
        };
    }

    async sendMessage (rawMessage, index) {
        return <message-id>;
    }

}
```
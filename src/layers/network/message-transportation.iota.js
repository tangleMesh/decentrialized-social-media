import { ClientBuilder } from '@iota/client';

class NetworkMessageTransportationIOTA {

    constructor ({
        nodeURL = "https://chrysalis-nodes.iota.org",
    } = {}) {
        // Set up everything
        this.client = new ClientBuilder ()
            .node (nodeURL)
            .localPow (false)
            .build ();
    }

    async initialize () {
        // Initialize everything
    }

    async getMessage (id) {
        const message = (
            await this.client
                .getMessage ()
                .data (id)
        );
        const content = Buffer
            .from (message
                .message
                .payload
                .data, "hex")
            .toString ();
        return {
            id: message.messageId,
            content: content,
            index: null,
        };
    }

    async sendMessage (rawMessage, index) {
        console.log ("rawMessage", rawMessage, "index", index);
        const sentMessage = await this.client.message ()
            .index (index)
            .data (rawMessage)
            .submit ();
        return sentMessage.messageId;
    }

    async subscribeMessages (cb = async (rawMessage) => {}, index, { indexPath = null } = {}) {
        return this._addSubscriber (cb, index, [`messages/indexation/${index}${indexPath !== null ? indexPath : ""}`]);
    }

    _addSubscriber (cb, index, topics = []) {
        this.client
            .subscriber ()
            .topics (topics)
            .subscribe (async (err, data) => {
                if (err) {
                    console.error (err);
                    return;
                }
                await cb ({
                    id: this.client.getMessageId (data.payload),
                    content: Buffer.from (
                        JSON.parse (data.payload).payload.data,
                        "hex"
                    ).toString ("utf-8"),
                    index: topics [0].substr (index.length),
                });
            });
        return () => {
            new Promise ((resolve, reject) => {
                this.client
                    .subscriber ()
                    .topics (topics)
                    .unsubscribe ((err, data) => {
                        if (err) {
                            return reject (err);
                        }
                        return resolve (data);
                    });
                });
        };
    }

}

export default NetworkMessageTransportationIOTA;
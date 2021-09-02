# Network messages

These messages are meant to be sent to the networking layer. As a base structure the network messages cotain an `identifier`, the `content` and an `index`.

## Network structure

Before the network message is sent to the network, it must be serialized. Therefore a JSON structure must be created and stringified:

```JSON
{
    "count": 1,
    "idx": 0,
    "content": "<content>",
    "rootMessageId": null
}
```

The content of a message is limited to approx. 4KB (4096 characters) and if the source content is larger than that, the message must be splitted into multiple chunks. Therefore the fields `count`, `idx` and `rootMessageId` must be adjusted. The `count` property holds the information out of how many chunks the original message exists. The `idx` (index) field is the current index of the chunk and the `rootMessageId` contains for all chunks expect the first one, the network-message id of the very first chunk.

The receivers must fetch all messages/chunks and put them together in the order of the `idx` key.
With this technique also larger messages that are not supported by the transportation layer can be sent to all participants.
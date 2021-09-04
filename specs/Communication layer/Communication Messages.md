# Communication messages

The basic structure of a communication message holds the **author** (public key), a **signature** that verifies the authenticity of the message, the **audience** and the **payload** (which is the content encrypted for private messages and plain-text for public messages).

These messages are meant to be an abstraction of the [network messages](../Network\ layer/Network\ Messages.md). As a base structure the communication messages cotain an `author`, an `audience`, a `payload` and an the flag `isEncrypted`.

## Structure

Before the communication message is sent to the network layer, it must be serialized. Therefore a JSON structure must be created and stringified:

```JSON
{
    "author": "747ec36b6cf484ca377880f5d4c2c671bc739a6a42b1fbf261f0a47eb2562272",
    "isEncrypted": false,
    "audience": "747ec36b6cf484ca377880f5d4c2c671bc739a6a42b1fbf261f0a47eb2562272",
    "payload": "6931958904fa668d89627754055e9ad2:0f808ff97aee4e20fbb7798ee0896682a6199f0583ecbd250c33ca2e",
    "signature": "60595bd25d5d67d24e0ca42b56b0b6689be891a6558c6bdee6794ce99fc17e04e08a5ddc22857ee5b6a6e382aabe48c74f9fa78ccc1b028ad403a08e1c90ed9bc507ba8ab442325a528840825d0c07797b45c24deca0d5109caa51597b636c084105b3f62730f1d6f8c42e6bb6482e70109df190e371f81f92936c5570e6373e"
}
```

### Author

The author key contains the hashed public-key (identifier) of the author, so anybody can see from whom this message was published.

### Is encrypted?

This property states, if the payload content is encrypted or plain-text. If the audience is a channel, the message is encrypted with one of the `secrets` (`readerSecret`, `adminSecret`)

### Payload

The payload is the raw content of the message. It is the content that should be shown to the users and can have any of the following formats.
The payload is in plain-text, if the message is for public presentation and is encrypted with a shared secret (or public key for authentication messages), if the message is private.

### Audience

The audience property defines the scope of the message. All messages are bind to a specific audience and this is the identifier for all users inside this channel. With this identifier they can use the correct shared secret to decrypt all the messages of this channel. For the authentication messages the audience is also used as the identifier of the user's identifier.

### Signature

The signature's purpose is for verifying that the message is really sent from the author's private key. Therefore the complete message (author, payload, audience, isEncrypted) is *stringified* and signed with the private key of the author.

## Message types

### Content messages

In order to share information, write posts or create any other form of communication between participants you can use the **content messages**. 
There is a standard structure of the content-messages but there are many different specifications for different content message formats. Please refer to [Content messages.md](./Content\ messages.md)

<!-- TODO: Maybe we can use https://ogp.me/ as orientation -->

```json
{
    "type": "content",
    "format": "",
    "title": "",
    "description": "",
    "content": "",
}
```

### Action messages

The **action messages** differentiate to the content message with their different structure and purpose. Action messages are not meant for content transportation but for specific actions in the channel. With these messages new users are added to channels, users can be removed, messages can be deleted, user-roles can be changed and the name or other custom properties of channels can be adjusted. The different action messages can be found at [Action messages.md](./Action\ messages.md).

```json
{
    "type": "action",
    "method": "<category:action.detail>",
    "property": "<user-id|…>",
    "value": "<string|array|object>",
}
```
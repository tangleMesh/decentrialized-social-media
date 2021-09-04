# Communication users

The abstraction layer **communication users** is responsible for sending *communication messages* with the correct encryption / sign keys. 
You can fetch a single message (`publishMessage`), subscribe to new messages from the network (`subscribeMessages`) and receive the latest messages (`getMessages`) from the network layer.

It's meant to abstract and "blackbox" all of the deeper layers (network and storage) to provide an easy interface for users to publish and receive any relevant messages. The server can also be configured to cache network messages for a predefined time, so that clients that are not 100% up-to-date can also receive the required messages.
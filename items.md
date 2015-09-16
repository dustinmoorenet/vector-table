Items are defined by their addressablility. An item can be globally addressable, meaning that it can be retrieved and manipulated over the network directly. An item can also be addressable locally, meaning that it is only directly visible within the domain of a globally addressable item.

There will need to be a hashed diff system, similar to git, where changes can be patched. An object notation will need to be devised or utilized to allow forward and backward patching of changes.

Need to rework the system again on the client side, but this make saving on the server side more organized. Each save is just a PATH of new changes. People can be out of date and ask the server for HEAD and get all change sets between what they have and was is HEAD. Since changes over time become less important a compacting method will be needed to reduce the amount of changes needed to pull down a clean copy of the item.

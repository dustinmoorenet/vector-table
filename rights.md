The rights of an entity can be expressed in two types
* Permissions
* Restrictions

Permissions
An entity is given permission to perform functions from a base of nothing. As an example: An entity is given permission to read an item, where before it was
unable to do so.

Permissions layer from top to bottom. If a parent does not have permission but a child does, then the child has that permission.

Restrictions
An entity is given a restriction from performing a function from a base of absolute freedom. As an example: A parent entity set the restriction that it and any child entities can not make items public.

Restrictions layer from bottom to top. If a child does not have a restriction but one of it's parents do, then the child has that restriction.

Permission and restrictions are applied between two entities in a parent/child relationship and between entities and items in a item sharing relationship.

Ownership
Each item is owned by only one entity. Child entities can create items (with permission) that will be owned by one of their parent entities.

Sharing
An owner can share an item by creating a entity/item relationship. That relationship will have permissive and restrictive attributes. Example: An entity can share an item with another entity but only give permission to read.

Organizations
An entity can have multiple parent and child relationships with other entities. Those relationships will have permissive and restrictive attributes. Example: An entity owns an item and gives all children read/write access by default to all items owned by entity.

Scenarios
An entity (userA) creates an item (item1)

userA provides link for other entities to join

An entity follows the link.

The entity is given the opportunity to login or be a guest.

The entity creates a guest entity (userB)

userB is associated with item1 with default permissions

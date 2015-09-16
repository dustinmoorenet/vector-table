CREATE TABLE entity (
    id uuid PRIMARY KEY,
    name text,
    email text,
    created_on timestamp with time zone,
    updated_on timestamp with time zone,
    deleted_on timestamp with time zone
);

CREATE TABLE item (
    id uuid PRIMARY KEY,
    name text,
    data jsonb,
    is_public boolean,
    entity_id uuid REFERENCES entity (id) ON DELETE CASCADE,
    created_on timestamp with time zone,
    updated_on timestamp with time zone,
    deleted_on timestamp with time zone
);

CREATE TABLE entity_entity_bridge (
    parent_entity_id uuid REFERENCES entity (id) ON DELETE CASCADE,
    child_entity_id uuid REFERENCES entity (id) ON DELETE CASCADE,
    meta jsonb,
    created_on timestamp with time zone,
    updated_on timestamp with time zone,
    PRIMARY KEY (parent_entity_id, child_entity_id)
);

CREATE TABLE entity_item_bridge (
    entity_id uuid REFERENCES entity (id) ON DELETE CASCADE,
    item_id uuid REFERENCES item (id) ON DELETE CASCADE,
    meta jsonb,
    created_on timestamp with time zone,
    updated_on timestamp with time zone,
    PRIMARY KEY (entity_id, item_id)
);

CREATE TABLE session (
    id text PRIMARY KEY,
    entity_id uuid REFERENCES entity (id) ON DELETE CASCADE
);

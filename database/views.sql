CREATE OR REPLACE VIEW entity_children AS
SELECT child.*, entity_entity_bridge.meta AS entity_entity_bridge_meta, parent_entity_id
FROM entity_entity_bridge
JOIN entity AS child
    ON child.id = entity_entity_bridge.child_entity_id;

CREATE OR REPLACE VIEW entity_parents AS
SELECT parent.*, entity_entity_bridge.meta AS entity_entity_bridge_meta, child_entity_id
FROM entity_entity_bridge
JOIN entity AS parent
    ON parent.id = entity_entity_bridge.parent_entity_id;

CREATE OR REPLACE VIEW entity_items AS
SELECT item.*, entity_item_bridge.meta as entity_item_bridge_meta, entity_id
FROM entity_item_bridge
JOIN item
    ON item.id = entity_item_bridge.item_id;

CREATE OR REPLACE VIEW item_entities AS
SELECT entity.*, entity_item_bridge.meta as entity_item_bridge_meta, item_id
FROM entity_item_bridge
JOIN entity
    ON entity.id = entity_item_bridge.entity_id;

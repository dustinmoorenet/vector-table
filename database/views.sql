CREATE OR REPLACE VIEW entity_children AS
SELECT child.*, entity_entity_bridge.meta AS entity_entity_bridge_meta, parent.id AS parent_entity_id
FROM entity_entity_bridge
JOIN entity AS parent
    ON parent.id = entity_entity_bridge.parent_entity_id
JOIN entity AS child
    ON child.id = entity_entity_bridge.child_entity_id;

CREATE OR REPLACE VIEW entity_parents AS
SELECT parent.*, entity_entity_bridge.meta AS entity_entity_bridge_meta, child.id AS child_entity_id
FROM entity_entity_bridge
JOIN entity AS parent
    ON parent.id = entity_entity_bridge.parent_entity_id
JOIN entity AS child
    ON child.id = entity_entity_bridge.child_entity_id;

var db = require('../../libs/db');

module.exports = {
    getAll: function(parentID) {
        return db('entity_children')
            .where('parent_entity_id', parentID);
    },

    getChildByParent: function(childID, parentID) {
        return db('entity_children')
            .where({
                id: childID,
                parent_entity_id: parentID
            })
            .then(function(children) {
                return children[0];
            })
    },

    add: function(parentID, childID, data) {
        data = data || {};

        return db.insert({
                parent_entity_id: parentID,
                child_entity_id: childID,
                meta: data.meta
            }).into('entity_entity_bridge');
    },

    update: function(parentID, childID, data) {
        return db('entity_entity_bridge')
            .where({
                parent_entity_id: parentID,
                child_entity_id: childID
            })
            .update(data);
    },

    remove: function(parentID, childID) {
        return db('entity_entity_bridge')
            .where({
                parent_entity_id: parentID,
                child_entity_id: childID
            })
            .del();
    }
};

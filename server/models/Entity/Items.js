var db = require('../../libs/db');

module.exports = {
    getAll: function(entityID) {
        return db('entity_items')
            .where('entity_id', entityID);
    },

    getByID: function(entityID, itemID) {
        return db('entity_items')
            .where({
                entity_id: entityID,
                id: itemID
            })
            .then(function(items) {
                if (items.length === 0) {
                    throw new Error('Item not found');
                }

                return items[0];
            });
    },

    add: function(entityID, itemID, data) {
        data = data || {};

        return db.insert({
                entity_id: entityID,
                item_id: itemID,
                meta: data.meta
            }).into('entity_item_bridge');
    },

    update: function(entityID, itemID, data) {
        return db('entity_item_bridge')
            .where({
                entity_id: entityID,
                item_id: itemID
            })
            .update(data);
    },

    remove: function(entityID, itemID) {
        return db('entity_item_bridge')
            .where({
                entity_id: entityID,
                item_id: itemID
            })
            .del();
    }
};

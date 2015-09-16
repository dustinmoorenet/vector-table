var db = require('../../libs/db');

module.exports = {
    getAll: function(entityID) {
        // TODO expand out to get all items that are owned by parents
        // where permissions are at least read === true
        return db('item')
            .where('entity_id', entityID);
    },

    getByID: function(entityID, itemID) {
        return db('item')
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

    insert: function(item) {
        if (!item.id) {
            item.id = uuid.v4();
        }

        return db
            .insert(item)
            .into('item');
    },

    update: function(item) {
        if (!item.id) {
            return Promise.reject(new Error('Item ID is required to update'));
        }

        return db('item')
            .where('id', item.id)
            .update(item);
    },

    delete: function(id) {
        return db('item')
            .where('id', id)
            .del();
    },

    addShare: function(entityID, itemID, data) {
        data = data || {};

        return db.insert({
                entity_id: entityID,
                item_id: itemID,
                meta: data.meta
            }).into('entity_item_bridge');
    },

    updateShare: function(entityID, itemID, data) {
        return db('entity_item_bridge')
            .where({
                entity_id: entityID,
                item_id: itemID
            })
            .update(data);
    },

    removeShare: function(entityID, itemID) {
        return db('entity_item_bridge')
            .where({
                entity_id: entityID,
                item_id: itemID
            })
            .del();
    }
};

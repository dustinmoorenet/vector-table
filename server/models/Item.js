var uuid = require('node-uuid');

var db = require('../libs/db');

module.exports = {
    getAll: function() {
        return db('item');
    },

    getByID: function(id) {
        return db('item')
            .where('id', id)
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

    update: function(id, item) {
        return db('item')
            .where('id', id)
            .update(item);
    },

    delete: function(id) {
        return db('item')
            .where('id', id)
            .del();
    }
};

var uuid = require('node-uuid');

var db = require('../../libs/db');
var Entities = require('./Entities');

module.exports = {
    Entities: Entities,

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
    }
};

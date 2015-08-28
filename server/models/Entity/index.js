var uuid = require('node-uuid');

var db = require('../../libs/db');
var Children = require('./Children');
var Parents = require('./Parents');
var Items = require('./Items');

module.exports = {
    Children: Children,

    Parents: Parents,

    Items: Items,

    getAll: function() {
        return db('entity');
    },

    getByID: function(id) {
        return db('entity')
            .where('id', id)
            .then(function(entities) {
                if (entities.length === 0) {
                    throw new Error('Entity not found');
                }

                return entities[0];
            });
    },

    insert: function(entity) {
        if (!entity.id) {
            entity.id = uuid.v4();
        }

        return db
            .insert(entity)
            .into('entity');

    },

    update: function(id, entity) {
        return db('entity')
            .where('id', id)
            .update(entity);
    },

    delete: function(id) {
        return db('entity')
            .where('id', id)
            .del();
    }
};

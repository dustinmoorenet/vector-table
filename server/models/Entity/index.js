var uuid = require('node-uuid');
var when = require('when');

var db = require('../../libs/db');
var Children = require('./Children');
var Parents = require('./Parents');
var Items = require('./Items');
var Sessions = require('./Sessions');

module.exports = {
    Children: Children,

    Parents: Parents,

    Items: Items,

    Sessions: Sessions,

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
    },

    getPermissionsForItem: function(entityID, itemID) {
        return Items.getByID(entityID, itemID)
            .then(function(item) {
                if (item) {
                    return item.entity_item_bridge_meta.permissions || {};
                }
                else {
                    return this.getMergedPermissionsOfParentsForItem(entityID, itemID);
                }
            }.bind(this));
    },

    getMergedPermissionsOfParentsForItem: function(entityID, itemID) {
        return Parents.getAll(entityID)
            .then(function(parents) {
                // find all the permissions for each parent and merge into one object
                return when.reduce(parents, this.reduceParentPermissions.bind(this, itemID), {});
            }.bind(this));
    },

    reduceParentPermissions: function(itemID, permissions, parent) {
        return this.getPermissionsForItem(parent.id, itemID)
            .then(function(p) {
                // merge this parent level into one object
                Object.keys(p).forEach(function(key) {
                    // only override if truthy
                    if (p[key]) {
                        permissions[key] = p[key];
                    }
                });

                return permissions;
            });
    }
};

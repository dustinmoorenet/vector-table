var db = require('../../libs/db');

module.exports = {
    getAll: function(entityID) {
        return db('session')
            .where('entity_id', entityID);
    },

    add: function(entityID) {
        var id = 'need to create some random hash yeah?';

        return db.insert({
                id: id,
                entity_id: entityID
            })
            .into('session');
    },

    remove: function(entityID) {
        return db('session')
            .where({entity_id: entityID})
            .del();
    }
};

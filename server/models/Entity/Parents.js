var db = require('../../libs/db');

module.exports = {
    getAll: function(childID) {
        return db('entity_parents')
            .where('child_entity_id', childID);
    }
};

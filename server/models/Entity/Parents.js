var db = require('../../libs/db');

module.exports = {
    getAll: function(childID) {
        return db('entity_parents')
            .where('child_entity_id', childID);
    },

    getParentByChild: function(parentID, childID) {
        return db('entity_parents')
            .where({
                id: parentID,
                child_entity_id: childID
            })
            .then(function(parents) {
                return parents[0];
            })
    }
};

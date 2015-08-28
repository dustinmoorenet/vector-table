var db = require('../../libs/db');

module.exports = {
    getAll: function(itemID) {
        return db('item_entities')
            .where('item_id', itemID);
    }
};

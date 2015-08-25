var knex = require('knex')({
    dialect: 'pg',
    connection: 'postgres://vector:DCiW0A3zeu5eyFoinT01WAD3H2LyrKtl@localhost:5432/vector'
});

module.exports = {
    getAll: function() {
        return knex('item');
    },

    getByID: function(id) {
        return knex('item')
            .where('id', id)
            .then(function(items) {
                if (items.length === 0) {
                    throw new Error('Item not found');
                }

                return items[0];
            });
    },

    insert: function() {

    },

    update: function() {

    },

    delete: function() {

    }
};

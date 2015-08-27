var db = require('knex')({
    dialect: 'pg',
    connection: 'postgres://vector:DCiW0A3zeu5eyFoinT01WAD3H2LyrKtl@localhost:5432/vector'
});

module.exports = db;

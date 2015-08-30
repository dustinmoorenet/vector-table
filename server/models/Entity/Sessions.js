var crypto = require('crypto');

var db = require('../../libs/db');

function randomValueBase64(len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

module.exports = {
    getByID: function(sessionID) {
        return db('session')
            .where({
                id: sessionID
            }).
            then(function(sessions) {
                return sessions[0];
            });
    },

    getAll: function(entityID) {
        return db('session')
            .where('entity_id', entityID);
    },

    add: function(entityID) {
        var id = randomValueBase64(32);

        return db('session')
            .returning('id')
            .insert({
                id: id,
                entity_id: entityID
            })
            .then(function(rows) {
                return {sessionID: rows[0]}
            });
    },

    remove: function(entityID, sessionID) {
        return db('session')
            .where({
                id: sessionID,
                entity_id: entityID
            })
            .del();
    }
};

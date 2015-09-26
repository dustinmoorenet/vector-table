var supertest = require('supertest');

var testHelpers = require('../testHelpers');
var app = require('../../index.js');
var Session = require('../../models/Entity/Sessions');

describe('integration entity', () => {
    var sessionID;

    beforeEach(() => {
        return testHelpers.initDB()
            .then(() => {
                return Session.add('2da38f48-37a3-424b-9b3d-ad20a5d0a871');
            })
            .then((data) => {
                sessionID = data.sessionID;
            });
    });

    it('should do as it is told', () => {

        supertest(app)
            .get('/')
    });
});

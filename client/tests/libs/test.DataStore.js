var expect = require('expect');
var DataStore = require('../../js/libs/DataStore');

describe('libs/DataStore', function() {
    it('should create a empty store', function() {
        var dataStore = new DataStore();

        expect(Object.keys(dataStore.currentStore).length).toBe(0);
    });
});

var expect = require('expect');
var DataStore = require('../../js/libs/DataStore');

describe('libs/DataStore', function() {
    var dataStore;

    beforeEach(function() {
        dataStore = new DataStore();
    });

    it('should create a empty store', function() {
        expect(Object.keys(dataStore.currentStore).length).toBe(0);
    });

    describe('get', function() {
        it('should get undefined for unset IDs', function() {
            expect(dataStore.get('foo')).toNotExist('foo should not be defined in store');

            dataStore.set('bar', {});

            expect(dataStore.get('foo')).toNotExist('foo should not be defined in store after setting another ID');
        });

        it('should get the current value of ID', function() {
            dataStore.set('foo', {'cake': 1});

            expect(dataStore.get('foo')).toEqual({'cake': 1}, 'foo should equal what was set');
        });

        it('should return a copy of the original value', function() {
            var originalValue = {'cake': 1};

            dataStore.set('foo', originalValue);

            expect(dataStore.get('foo')).toEqual(originalValue, 'foo should equal what was set');
            expect(dataStore.get('foo')).toNotBe(originalValue, 'foo should not be what was set');
        });
    });
});

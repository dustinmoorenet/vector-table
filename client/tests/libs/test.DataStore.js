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
            dataStore.set('foo', {cake: 1});

            expect(dataStore.get('foo')).toEqual({cake: 1}, 'foo should equal what was set');
        });

        it('should return a copy of the original value', function() {
            var originalValue = {cake: 1};

            dataStore.set('foo', originalValue);

            expect(dataStore.get('foo')).toEqual(originalValue, 'foo should equal what was set');
            expect(dataStore.get('foo')).toNotBe(originalValue, 'foo should not be what was set');
        });
    });

    describe('set', function() {
        it('should copy the value on set', function() {
            var originalValue = {cake: 1};

            dataStore.set('foo', originalValue);

            expect(dataStore.get('foo')).toEqual(originalValue, 'foo should equal what was set');
            expect(dataStore.get('foo')).toNotBe(originalValue, 'foo should not be what was set');

            originalValue.cake = 2;

            expect(dataStore.get('foo')).toNotEqual(originalValue, 'foo should not equal the original value');
        });

        it('should merge if asked to', function() {
            var originalValue = {cake: 1};

            dataStore.set('foo', originalValue);

            dataStore.set('foo', {brownies: 34}, {merge: true});

            expect(dataStore.get('foo')).toEqual({cake: 1, brownies: 34}, 'values should merge into foo');
        });

        it('should clear if given undefined', function() {
            var originalValue = {cake: 1};

            dataStore.set('foo', originalValue);

            expect(dataStore.get('foo')).toNotBe(undefined, 'value should be set to something');

            dataStore.set('foo');

            expect(dataStore.get('foo')).toBe(undefined, 'value should be cleared');
        });
    });

    describe('merge', function() {
        it('should merge value into store', function() {
            var originalValue = {cake: 1};

            dataStore.set('foo', originalValue);

            dataStore.merge('foo', {brownies: 34});

            expect(dataStore.get('foo')).toEqual({cake: 1, brownies: 34}, 'values should merge into foo');
        });
    });

    describe('clear', function() {
        it('should clear value from store', function() {
            var originalValue = {cake: 1};

            dataStore.set('foo', originalValue);

            expect(dataStore.get('foo')).toNotBe(undefined, 'value should be set to something');

            dataStore.clear('foo');

            expect(dataStore.get('foo')).toBe(undefined, 'value should be cleared');
        });
    });

    describe('events', function() {
        it('should trigger a single event from during one tick', function(done) {
            dataStore.set('foo', {cake: 1});

            dataStore.set('foo', {cake: 2});

            dataStore.set('foo', {cake: 3});

            dataStore.on('foo', function(value, previousValue) {
                expect(value).toEqual({cake: 3}, 'value should be the last value set in tick');

                expect(previousValue).toBe(undefined, 'previous value should be value before tick started');

                done();
            });
        });

        it('should trigger values correctly', function(done) {
            dataStore.set('foo', {cake: 1});

            var tick = 1;
            dataStore.on('foo', function(value, previousValue) {
                if (tick === 1) {
                    expect(value).toEqual({cake: 1}, 'value should be set value 1');

                    expect(previousValue).toBe(undefined, 'value original undefined value');

                    dataStore.set('foo', {cake: 2});
                }
                else if (tick === 2) {
                    expect(value).toEqual({cake: 2}, 'value should be set value 2');

                    expect(previousValue).toEqual({cake: 1}, 'value should be set value 1');

                    dataStore.set('foo', {cake: 3});
                }
                else if (tick === 3) {
                    expect(value).toEqual({cake: 3}, 'value should be set value 3');

                    expect(previousValue).toEqual({cake: 2}, 'value should be set value 2');

                    done();
                }

                tick++;
            });
        });

        it('should trigger separate events for each ID changed', function(done) {
            dataStore.set('foo', {cake: 1});

            dataStore.set('bar', {cake: 2});

            var count = 1;

            dataStore.on('foo', function(value, previousValue) {
                expect(value).toEqual({cake: 1}, 'value should be the last value set in tick for foo');

                expect(previousValue).toBe(undefined, 'previous value should be value before tick started');

                expect(count).toBe(1, 'foo event should fire first');

                count++;
            });

            dataStore.on('bar', function(value, previousValue) {
                expect(value).toEqual({cake: 2}, 'value should be the last value set in tick for bar');

                expect(previousValue).toBe(undefined, 'previous value should be value before tick started');

                expect(count).toBe(2, 'bar event should fire last');

                done();
            });

        })
    });

    describe('undo', function() {
        it('should role back to a prevous state', function(done) {
            dataStore.set('foo', {cake: 1});

            setTimeout(function() {
                expect(dataStore.get('foo')).toEqual({cake: 1}, 'value should be the last value set in tick for foo');

                dataStore.set('foo', {cake: 2});

                setTimeout(function() {
                    expect(dataStore.get('foo')).toEqual({cake: 2}, 'value should be the last value set in tick for foo');

                    dataStore.undo();

                    expect(dataStore.get('foo')).toEqual({cake: 1}, 'value should be set back to previous value');

                    dataStore.on('foo', function(value, previousValue) {
                        expect(value).toEqual({cake: 1}, 'value should be value after undo');

                        expect(previousValue).toEqual({cake: 2}, 'previous value should be value before undo');

                        done();
                    })
                })
            })
        });
    });

    describe('redo', function() {
        it('should role forward to a future state', function(done) {
            dataStore.set('foo', {cake: 1});

            setTimeout(function() {
                expect(dataStore.get('foo')).toEqual({cake: 1}, 'value should be the last value set in tick for foo');

                dataStore.undo();

                expect(dataStore.get('foo')).toBe(undefined, 'value should be initial undefined value');

                setTimeout(function() {
                    expect(dataStore.get('foo')).toBe(undefined, 'value should be initial undefined value');

                    dataStore.redo();

                    expect(dataStore.get('foo')).toEqual({cake: 1}, 'value should be set back to previous value');

                    dataStore.on('foo', function(value, previousValue) {
                        expect(value).toEqual({cake: 1}, 'value should be value after undo');

                        done();
                    })
                })
            })
        });
    });
});

var _ = require('lodash');
var Events = require('ampersand-events');

function DataStore() {
    this.currentStore = {};
    this.history = [{}];
    this.cursor = 0;
    this.notifyList = [];
}

/*
Keep a hash for every history point

On backup saves, save that history hash to the project

All users connected to the project ping master with their current hash

If the hash is different than master, a delta of changes is pass to the client
the master keeps n number of history points, so a delta can only be created when
the remotes user's hash is in the history. If a delta can not be created then
the user must refresh the entire project

During normal changes, the hash is passed with each update to the remote client
and the client pings will be the same as the master so no delta will be needed.

*/

_.extend(DataStore.prototype, Events, {
    MAX_HISTORY: 5,
    restore: function(data) {
        this.history = [data];
        this.currentStore = _.deepClone(this.history[0]);
        this.cursor = 0;
        this.notifyList = [];
    },
    get: function(id) {
        // FIXME deepClone on every get() is not fast
        // reason to do this because changes to the object from the currentStore
        // cause the previousValue in the change event to have future changes
        return _.cloneDeep(this.currentStore[id]);
    },
    set: function(id, object, params) {
        params = params || {};
        this.recordHistory = params.recordHistory !== false;

        if (object === undefined) {
            delete this.currentStore[id];
        }
        else if (params.merge) {
            this.currentStore[id] = _.merge({}, this.currentStore[id], object);
        }
        else {
            this.currentStore[id] = _.cloneDeep(object);
        }

        this.notifyOnNextTick(id);

        return this.get(id);
    },
    merge: function(id, object, params) {
        return this.set(id, object, _.extend({merge: true}, params));
    },
    clear: function(id, params) {
        return this.set(id, undefined, params);
    },
    notifyOnNextTick: function(id) {
        if (!this.notifyList.length) {
            setTimeout(this.timeToNotify.bind(this));
        }

        if (this.notifyList.indexOf(id) === -1) {
            this.notifyList.push(id);
        }
    },
    timeToNotify: function() {
        this.setHistory();

        var list = this.notifyList;

        this.notifyList = [];

        list.forEach(function(id) {
            var previousObject = (this.previousStore || {})[id];

            this.trigger(id, this.get(id), previousObject);
        }.bind(this));
    },
    setHistory: function() {
        if (this.recordHistory === false) {
            return;
        }

        var history = this.currentStore;

        this.currentStore = _.clone(history);

        this.history.splice(0, this.cursor, history);

        this.history.splice(this.MAX_HISTORY, this.history.length);

        this.cursor = 0;

        this.previousStore = this.history[1];
    },
    undo: function() {
        if (this.cursor >= this.MAX_HISTORY - 1) {
            return;
        }

        var now = this.history[this.cursor];

        this.cursor++;

        var before = this.history[this.cursor];

        this.previousStore = _.clone(now);
        this.currentStore = _.clone(before);

        _.forEach(now, function(currentObject, id) {
            var previousObject = before[id];

            if (currentObject !== previousObject) {
                this.set(id, previousObject, {recordHistory: false});
            }
        }.bind(this));
    },
    redo: function() {
        if (this.cursor <= 0) {
            return;
        }

        var now = this.history[this.cursor];

        this.cursor--;

        var after = this.history[this.cursor];

        this.previousStore = _.clone(now);
        this.currentStore = _.clone(after);

        _.forEach(after, function(futureObject, id) {
            var currentObject = now[id];

            if (currentObject !== futureObject) {
                this.set(id, futureObject, {recordHistory: false});
            }
        }.bind(this));
    }
});

module.exports = DataStore;

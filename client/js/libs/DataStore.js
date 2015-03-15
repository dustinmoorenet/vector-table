var _ = require('lodash');
var Events = require('ampersand-events');

function DataStore() {
    this.currentStore = {};
    this.history = [{}];
    this.cursor = 0;
    this.notifyList = [];
}

_.extend(DataStore.prototype, Events, {
    MAX_HISTORY: 5,
    get: function(id) {
        return this.currentStore[id];
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
    },
    merge: function(id, object, params) {
        this.set(id, object, _.extend({merge: true}, params));
    },
    clear: function(id, params) {
        this.set(id, undefined, params);
    },
    notifyOnNextTick: function(id) {
        if (!this.notifyList.length) {
            setTimeout(this.timeToNotify.bind(this));
        }

        if (this.notifyList.indexOf(id) !== -1) {
            this.notifyList.push(id);
        }
    },
    timeToNotify: function() {
        this.setHistory();

        this.notifyList.forEach(function(id) {
            var previousObject = (this.previousStore || {})[id];

            this.trigger(id, this.currentStore[id], previousObject);
        }.bind(this));

        this.notifyList = [];
    },
    setHistory: function() {
        if (this.recordHistory === false) {
            return;
        }

        this.previousStore = this.currentStore;

        this.currentStore = _.clone(this.previousStore);

        this.history.splice(0, this.cursor, this.previousStore);

        this.history.splice(this.MAX_HISTORY, this.history.length);

        this.cursor = 0;
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

        _.forEach(now, function(currentObject, id) {
            var futureObject = after[id];

            if (currentObject !== futureObject) {
                this.set(id, futureObject, {recordHistory: false});
            }
        }.bind(this));
    }
});

module.exports = DataStore;

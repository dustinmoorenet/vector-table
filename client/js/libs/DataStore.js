var _ = require('lodash');
var Events = require('ampersand-events');

function DataStore() {
    this.history = [{}, {}];
    this.cursor = 0;
    this.notifyList = [];
}

_.extend(DataStore.prototype, Events, {
    MAX_HISTORY: 5,
    currentStore: function() {
        return this.history[this.cursor];
    },
    get: function(id) {
        return this.currentStore()[id];
    },
    set: function(id, object, params) {
        params = params || {};
        this.recordHistory = params.recordHistory !== false;

        if (object === undefined) {
            delete this.currentStore()[id];
        }
        else if (params.merge) {
            this.currentStore()[id] = _.merge({}, this.currentStore()[id], object);
        }
        else {
            this.currentStore()[id] = _.cloneDeep(object);
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

        this.notifyList.push(id);
    },
    timeToNotify: function() {
        this.setHistory();

        this.notifyList.forEach(function(id) {
            var previousObject = (this.history[this.cursor + 1] || {})[id];

            this.trigger(id, this.currentStore()[id], previousObject);
        }.bind(this));

        this.notifyList = [];
    },
    setHistory: function() {
        if (this.recordHistory === false) {
            return;
        }

        var newCurrentStore = _.clone(this.currentStore());

        this.history.splice(0, this.cursor, newCurrentStore);

        this.history.splice(this.MAX_HISTORY, this.history.length);

        this.cursor = 0;
    },
    undo: function() {
        if (this.cursor >= this.MAX_HISTORY - 1) {
            return;
        }

        var currentStore = this.currentStore();

        this.cursor++;

        _.forEach(currentStore, function(currentObject, id) {
            var previousObject = this.get(id);

            if (currentObject !== previousObject) {
                this.set(id, previousObject, {recordHistory: false});
            }
        }.bind(this));
    },
    redo: function() {
        if (this.cursor <= 0) {
            return;
        }

        var currentStore = this.currentStore();

        this.cursor--;

        _.forEach(currentStore, function(currentObject, id) {
            var futureObject = this.get(id);

            if (currentObject !== futureObject) {
                this.set(id, futureObject, {recordHistory: false});
            }
        }.bind(this));
    }
});

module.exports = DataStore;

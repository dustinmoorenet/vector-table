var _ = require('lodash');
var when = require('when');
var ajax = require('./Ajax');

function Backup(store, hasRemoteBackup) {
    this.store = store;
    this.sendBuffer = {};
    this.hasRemoteBackup = hasRemoteBackup;
    this.host = 'http://localhost:8077';

    store.on('all', this.registerSend.bind(this));
}

_.extend(Backup.prototype, {
    SEND_TIMEOUT: 5000,
    registerSend: function(id) {
        this.sendBuffer[id] = true;

        if (!this.sendTimeout) {
            this.sendTimeout = setTimeout(this.send.bind(this), this.SEND_TIMEOUT);
        }
    },
    send: function() {
        var allData = {};

        _.forEach(this.sendBuffer, function(value, id) {
            var data = this.store.get(id);

            if (data) {
                allData[id] = data;

                window.localStorage.setItem(id, JSON.stringify(data));
            }
        }, this);

        if (this.hasRemoteBackup) {
            ajax.post({
                uri: this.host + '/data',
                json: allData
            });
        }

        delete this.sendTimeout;
        this.sendBuffer = {};
    },
    get: function(id) {
        if (!id) {
            throw new Error('ID required to get anything (I dont know what you want)');
        }

        var data = window.localStorage.getItem(id);
        var promise = when.resolve(data);

        if (this.hasRemoteBackup) {
            promise = ajax.get({url: this.host + '/data/' + id})
                .tap(function(data) {
                    window.localStorage.setItem(id, data);
                });
        }

        promise = promise.then(function(data) {
            if (!data) {
                throw new Error('Data not found with ID:' + id);
            }

            return JSON.parse(data);
        });

        return promise;
    }
});

module.exports = Backup;

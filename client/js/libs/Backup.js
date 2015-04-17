var _ = require('lodash');
var ajax = require('./Ajax');

function Backup(store) {
    this.store = store;
    this.sendBuffer = {};

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
            }
        }, this);

console.log('about to send', allData);
        ajax.post({
            uri: 'http://localhost:8077/data',
            json: allData
        });

        delete this.sendTimeout;
        this.sendBuffer = {};
    },
    restore: function() {
        ajax.get('/data').then(function(data) {
            this.store.restore(data);
        });
    }
});

module.exports = Backup;

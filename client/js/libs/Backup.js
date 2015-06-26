import _ from 'lodash';
import when from 'when';
import {get, post} from './Ajax';

export default class Backup {
    get SEND_TIMEOUT() { return 5000; }

    constructor(store, hasRemoteBackup) {
        this.store = store;
        this.sendBuffer = {};
        this.hasRemoteBackup = hasRemoteBackup;
        this.host = 'http://localhost:8077';

        store.on('all', this.registerSend.bind(this));
    }

    registerSend(id) {
        this.sendBuffer[id] = true;

        if (!this.sendTimeout) {
            this.sendTimeout = setTimeout(this.send.bind(this), this.SEND_TIMEOUT);
        }
    }

    send() {
        var allData = {};

        _.forEach(this.sendBuffer, function(value, id) {
            var data = this.store.get(id);

            if (data) {
                allData[id] = data;

                window.localStorage.setItem(id, JSON.stringify(data));
            }
        }, this);

        if (this.hasRemoteBackup) {
            post('/data', allData);
        }

        delete this.sendTimeout;
        this.sendBuffer = {};
    }

    get(id) {
        if (!id) {
            throw new Error('ID required to get anything (I dont know what you want)');
        }

        var data = window.localStorage.getItem(id);
        var promise = when.resolve(data);

        if (this.hasRemoteBackup) {
            promise = get('/data/' + id)
                .then(function(data) {
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
}

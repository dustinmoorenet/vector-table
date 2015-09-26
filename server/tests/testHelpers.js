var childProcess = require('child_process');

module.exports = {
    initDB: function() {
        return new Promise((resolve, reject) => {
            childProcess.exec('npm run createDB -- --database test', function(err) {
                if (!err) {
                    resolve();
                }
                else {
                    reject(err);
                }
            });
        });
    },
    clearDB: function() {
        return new Promise((resolve, reject) => {
            childProcess.exec('npm run destoryDB -- --database test', function(err) {
                if (!err) {
                    resolve();
                }
                else {
                    reject(err);
                }
            });
        });
    }
}

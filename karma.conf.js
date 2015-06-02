module.exports = function(config) {
    config.set({
        frameworks: [ 'mocha' ],
        files: ['client/tests/tests.bundle.js'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome'],
        singleRun: true
    });

};

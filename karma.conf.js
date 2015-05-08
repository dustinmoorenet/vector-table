module.exports = function(config) {
    config.set({
        frameworks: [ 'browserify', 'mocha' ],
        files: ['client/tests/**/*.js'],
        preprocessors: {
            'client/tests/**/*.js': [ 'browserify' ]
        },

        browserify: {
            debug: true
        }
    });

};

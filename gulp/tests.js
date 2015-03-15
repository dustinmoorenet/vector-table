var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('tests', ['copy-mocha'], function() {
    return browserifyShare(false);
});

gulp.task('tests-watch', ['copy-mocha'], function() {
    return browserifyShare(true);
});

gulp.task('copy-mocha', function() {
    gulp.src('./node_modules/mocha/mocha.*')
        .pipe(gulp.dest('./client/tests'));
});

function browserifyShare(watch) {
    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true
    });

    if (watch) {
        b = watchify(b);

        b.on('error', function(err) {
            gutil.log(gutil.colors.red('✘'), err.message.trim());
        });

        b.on('update', function(files) {
            gutil.log(gutil.colors.blue('★'), 'Test bundling', files.map(path.basename.bind(path)));
            bundleShare(b);
        });

        b.on('time', function(ms) {
            gutil.log(gutil.colors.green('✔'), 'Tests bundled in', ms + 'ms');
        });
    }

    b.add('./client/tests/index.js')
    bundleShare(b);

    return b;
}

function bundleShare(b) {
    b.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./client/tests'));
}

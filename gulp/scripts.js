var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('scripts', function() {
    return browserifyShare(false);
});

gulp.task('scripts-watch', function() {
    return browserifyShare(true);
});

function browserifyShare(watch) {
    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true,
        debug: true
    });

    if (watch) {
        b = watchify(b);

        b.on('error', function(err) {
            gutil.log(gutil.colors.red('✘'), err.message.trim());
        });

        b.on('update', function(files) {
            gutil.log(gutil.colors.blue('★'), 'Bundling', files.map(path.basename.bind(path)));
            bundleShare(b);
        });

        b.on('time', function(ms) {
            gutil.log(gutil.colors.green('✔'), 'Scripts bundled in', ms + 'ms');
        });
    }

    b.add('./client/js/index.js')
    bundleShare(b);

    return b;
}

function bundleShare(b) {
    b.bundle()
        .pipe(source('app.bundle.js'))
        .pipe(gulp.dest('./client'));
}

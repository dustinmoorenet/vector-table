var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    return browserify()
        .add('./client/js/index.js')
        .bundle()
        .pipe(source('app.bundle.js'))
        .pipe(gulp.dest('./client'));
});

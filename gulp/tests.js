var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('tests', ['copy-mocha'], function() {
    // Single entry point to browserify
    return browserify()
        .add('./client/tests/index.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./client/tests'));
});

gulp.task('copy-mocha', function() {
    gulp.src('./node_modules/mocha/mocha.*')
        .pipe(gulp.dest('./client/tests'));
});

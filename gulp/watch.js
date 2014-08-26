var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');

gulp.task('watch', function() {
  var bundler = watchify(browserify('./client/js/index.js', watchify.args));

  function rebundle() {
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('app.bundle.js'))
      .pipe(gulp.dest('./client'));
  }

  bundler.on('update', rebundle);

  return rebundle();
});

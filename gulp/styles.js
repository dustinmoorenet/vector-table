var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function() {
    gulp.src('./client/sass/index.scss')
        .pipe(sass())
        .pipe(gulp.dest('./client/css'));
});
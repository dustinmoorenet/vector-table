var gulp = require('gulp');

gulp.task('watch', function() {
    gulp.watch('./client/js/**/*.js', ['scripts']);
    gulp.watch('./client/sass/**/*.scss', ['styles']);
});

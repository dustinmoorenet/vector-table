var gulp = require('gulp');

gulp.task('watch', function() {
    gulp.watch('./icons/*.svg', ['iconfont']);
    gulp.watch('./client/js/**/*.html', ['scripts']);
    gulp.watch('./client/js/**/*.js', ['scripts']);
    gulp.watch('./client/sass/**/*.scss', ['styles']);
});

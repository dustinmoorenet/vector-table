var gulp = require('gulp');

gulp.task('watch', ['scripts-watch', 'tests-watch'], function() {
    gulp.watch('./icons/*.svg', ['iconfont']);
    gulp.watch('./client/sass/**/*.scss', ['styles']);
});

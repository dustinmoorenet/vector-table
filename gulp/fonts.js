var iconfont = require('gulp-iconfont');
var gulp = require('gulp');

gulp.task('iconfont', function(){
  gulp.src(['./icons/*.svg'])
    .pipe(iconfont({
      fontName: 'myfont', // required
      appendCodepoints: true // recommended option
    }))
      .on('codepoints', function(codepoints, options) {
        // CSS templating, e.g.
        console.log(codepoints, options);
      })
    .pipe(gulp.dest('./client/fonts/'));
});

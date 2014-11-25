var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var rename = require('gulp-rename');
var gulp = require('gulp');

// gulp.task('iconfont', function(){
//   gulp.src(['./icons/*.svg'])
//     .pipe(iconfont({
//       fontName: 'myfont', // required
//       appendCodepoints: true // recommended option
//     }))
//       .on('codepoints', function(codepoints, options) {
//         // CSS templating, e.g.
//         console.log(codepoints, options);
//       })
//     .pipe(gulp.dest('./client/fonts/'));
// });

var fontName = 'iconFonts';

gulp.task('iconfont', function(){
    var stream = gulp.src(['./icons/*.svg'])
        .pipe(iconfont({
            fontName: fontName,
            fontHeight: 2048,
            appendCodepoints: true
        }))
        .on('codepoints', function(codepoints) {
            var stream = gulp.src('./icons/template.scss')
                .pipe(consolidate('lodash', {
                    glyphs: codepoints,
                    fontName: fontName,
                    fontPath: '../fonts/', // set path to font (from your CSS file if relative)
                    className: 'icon' // set class name in your CSS
                }))
                .pipe(rename({basename: fontName}))
                .pipe(gulp.dest('./client/sass/')); // set path to export your CSS

            return stream;
        })
        .pipe(gulp.dest('./client/fonts/')); // set path to export your fonts

    return stream;
});

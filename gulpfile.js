require('./gulp/scripts');
require('./gulp/styles');
require('./gulp/fonts');
require('./gulp/watch');
var gulp = require('gulp');

gulp.task('default', ['scripts', 'styles', 'watch']);

require('./gulp/scripts');
require('./gulp/styles');
require('./gulp/fonts');
require('./gulp/tests');
require('./gulp/watch');
var gulp = require('gulp');

gulp.task('default', ['watch']);

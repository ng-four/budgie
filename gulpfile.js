var gulp = require('gulp');
var sass = require('gulp-sass');

// var input = './client/assets/scss/stylesheet.scss';
// var output = './client/assets/css';
var input = './client/assets/scss/*.scss';
var output = './client/assets/css';

// define the default task and add the watch task to it
gulp.task('default', ['watch']);

gulp.task('styles', function() {
  return gulp.src(input)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(output))
});

// Watch task
gulp.task('watch', function() {
  gulp.watch(input, ['styles']);
});

var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require('gulp-concat');

gulp.task('default', ['process-sass', 'watch']);

// minify js files
gulp.task('compress-scripts', function() {
  return gulp.src('./server/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// minify css
gulp.task('compress-css', function () {
  gulp.src('./client/assets/css/stylesheet.css')
    .pipe(uglifycss({
      "max-line-len": 80
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./client/assets/css'));
});

// process sass into css
gulp.task('process-sass', function() {
  return gulp.src('./client/assets/scss/stylesheet.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./client/assets/css'))
});

// concat files
// TODO : want all js files in client to be minified
gulp.task('concat-css', function() {
    return gulp.src(['./client/assets/css/*.min.css'])
      .pipe(concat('stylesheets.min.css'))
      .pipe(gulp.dest('./client/assets/css'));
});

// Watch task
gulp.task('watch', function() {
  gulp.watch('./client/assets/scss/stylesheet.scss', ['process-sass']);
});

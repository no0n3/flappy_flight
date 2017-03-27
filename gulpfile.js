'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('js', function() {
    return gulp.src([
            './bower_components/jquery/dist/jquery.js',
            './public/js/app.js'
        ])
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('build', ['js']);

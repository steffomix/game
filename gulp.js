



var gulp = require('gulp');

var express = require('express');





gulp.task('copy', function () {
    gulp.src(express)
        .pipe(gulp.dest('dest/js'));
});
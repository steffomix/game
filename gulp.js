



var gulp = require('gulp');





gulp.task('build', function (cb) {
    gulp.src('src/js/main.js')
        .pipe(browserify({insertGlobals: true}))
        //.pipe(ugly())
        .pipe(gulp.dest('dest/js'));
});
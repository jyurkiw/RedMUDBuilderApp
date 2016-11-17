var gulp = require('gulp');
var server = require('gulp-server-livereload');

gulp.task('serve', function() {
    gulp.src('.')
        .pipe(server({
            livereload: true,
            directoryListing: true,
            open: true
        }));
});

gulp.task('serve-no-reload', function() {
    gulp.src('.')
        .pipe(server({
            livereload: false,
            directoryListing: true,
            open: true
        }));
});
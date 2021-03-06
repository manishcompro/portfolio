// For more information on how to configure a task runner, please visit:
// https://github.com/gulpjs/gulp

var gulp    = require('gulp');
var gutil   = require('gulp-util');
var clean   = require('gulp-clean');
var concat  = require('gulp-concat');
var rename  = require('gulp-rename');
var jshint  = require('gulp-jshint');
var uglify  = require('gulp-uglify');
var less    = require('gulp-less');
var csso    = require('gulp-csso');
var es      = require('event-stream');
var embedlr = require('gulp-embedlr');
var refresh = require('gulp-livereload');
var express = require('express');
var http    = require('http');
var lr      = require('tiny-lr')();

gulp.task('clean', function () {
    // Clear the destination folder
    gulp.src('dist/**/*.*', { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('copy', function () {
    // Copy all application files except *.less and .js into the `dist` folder
    return es.concat(
        gulp.src(['src/images/**'])
            .pipe(gulp.dest('dist/images')),
        gulp.src(['src/fonts/**'])
            .pipe(gulp.dest('dist/fonts')),
        gulp.src(['src/js/**'])
            .pipe(gulp.dest('dist/js')),
        gulp.src(['src/css/**'])
            .pipe(gulp.dest('dist/css')),
        gulp.src(['src/js/vendor/**'])
            .pipe(gulp.dest('dist/js/vendor')),
        gulp.src(['src/*.*'])
            .pipe(gulp.dest('dist'))
    );
});

gulp.task('scripts', function () {
    return es.concat(
        // Detect errors and potential problems in your JavaScript code
        // You can enable or disable default JSHint options in the .jshintrc file
        gulp.src(['src/js/**/*.js', '!src/js/vendor/**'])
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter(require('jshint-stylish'))),

        // Concatenate, minify and copy all JavaScript (except vendor scripts)
        gulp.src(['src/js/**/*.js', '!src/js/vendor/**'])
            //.pipe(concat('main.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'))
            .pipe(refresh(lr))
    );
});

//gulp.task('styles', function () {
//    // Compile LESS files
//    return gulp.src('src/less/app.less')
//        .pipe(less())
//        .pipe(rename('main.css'))
//        .pipe(csso())
//        .pipe(gulp.dest('dist/css'))
//        .pipe(refresh(lr));
//});

gulp.task('server', function () {
    // Create a HTTP server for static files
    var port = process.env.PORT || 8080;
    var app = express();
    var server = http.createServer(app);

    app.use(express.static(__dirname + '/dist'));

    server.on('listening', function () {
        gutil.log('Listening on http://locahost:' + server.address().port);
    });

    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            gutil.log('Address in use, retrying...');
            setTimeout(function () {
                server.listen(port);
            }, 1000);
        }
    });

    server.listen(port);
});

gulp.task('lr-server', function () {
    // Create a LiveReload server
    lr.listen(35729, function (err) {
        if (err) {
            gutil.log(err);
        }
    });
});

gulp.task('watch', function () {
    //// Watch .js files and run tasks if they change
    //gulp.watch('src/js/**/*.js', ['scripts']);

    //// Watch .less files and run tasks if they change
    //gulp.watch('src/less/**/*.less', ['styles']);


    gulp.watch('src/**/*.html',
        gulp.src(['src/*.html'])
            .pipe(embedlr())
            .pipe(gulp.dest('./dist'))
    );

});

// The dist task (used to store all files that will go to the server)
gulp.task('dist', ['clean', 'copy']);

// The default task (called when you run `gulp`)
gulp.task('default', ['clean', 'copy', 'lr-server', 'server', 'watch']);

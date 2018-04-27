var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var rsync = require('gulp-rsync');


// Dev Tasks 
// -----------------

// Start browserSync
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        port: 8000
    })
})

gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({
            includePaths: require('node-normalize-scss').includePaths
        }).on('error', sass.logError))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

// Watchers
gulp.task('watch', function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
})


// Optimization  
// ------------

// CSS and JavaScript 
gulp.task('useref', function() {

    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});

// Images 
gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest('dist/images'))
});


// Copying app.js 
gulp.task('copyapp', function() {
    return gulp.src('app/js/app.js')
        .pipe(gulp.dest('dist/js'))
})


// Copying 3rd party JS 
gulp.task('js-vendor', function() {
    return gulp.src('app/js/vendor/**/*')
        .pipe(gulp.dest('dist/js/vendor'))
})

// Cleaning 
gulp.task('clean', function() {
    return del.sync('dist').then(function(cb) {
        return cache.clearAll(cb);
    });
})

gulp.task('clean:dist', function() {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});



// Build 
// -----

gulp.task('default', function(callback) {
    runSequence(['sass', 'browserSync'], 'watch',
        callback
    )
})

gulp.task('build', function(callback) {
    runSequence(
        'clean:dist',
        'sass', ['useref', 'images', 'copyapp', 'js-vendor'],
        callback
    )
})



// Deploy to FTP
// -------------------------

gulp.task('deploy', function() {
  return gulp.src('dist/**')
    .pipe(rsync({
      root: 'dist/',
      hostname: 'stegaru.com',
      username: 'root',
      destination: '/path/on/your/server'
    }));
});
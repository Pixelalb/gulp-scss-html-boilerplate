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


gulp.task('html', function() {
    return gulp.src('app/*.html')
        .pipe(browserSync.reload({
            stream: true
        }));
})


gulp.task('javascript', function() {
    return gulp.src('app/js/**/*.js')
        .pipe(browserSync.reload({
            stream: true
        }));
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


gulp.task('clean', function() {
    return del(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});



// Watchers
gulp.task('watch', function() {
    gulp.watch('app/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('app/*.html', gulp.series('html'));
    gulp.watch('app/js/**/*.js',gulp.series('javascript'));
})



// Default task - dev 
// -----

gulp.task('default', 
    gulp.parallel('watch', 'browserSync')
);



// Build 
// -----

gulp.task('build',
    gulp.series(
        'clean', 
        'sass',
        'copyapp', 
        'js-vendor',
        'useref',
        'images'
    )
);



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

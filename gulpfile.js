var gulp = require('gulp'),
    // babel = require('gulp-babel'),
    // concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    path = require('path'),
    del = require('del')


// tap может достать из pipe имя обрабатываемого файла и содержимое
// .pipe(tap(file => {
//     console.log(file.path);
// }))

// Пользовательские скрипты проекта

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false,
        open: false,
        reloadOnRestart: true,
        cors: true,
    })
})

/* --- Красивое отображение ошибок --- */
var gutil = require('gulp-util')
var chalk = require('chalk')

function map_error(err) {
    if (err.fileName) {
        // Ошибка в файле
        gutil.log(chalk.red(err.name) +
            ': ' +
            chalk.yellow(err.fileName.replace(__dirname + './app/js/', '')) +
            ': ' +
            'Line ' +
            chalk.magenta(err.lineNumber) +
            ' & ' +
            'Column ' +
            chalk.magenta(err.columnNumber || err.column) +
            ': ' +
            chalk.blue(err.description))
    } else {
        // Ошибка browserify
        gutil.log(chalk.red(err.name) +
            ': ' +
            chalk.yellow(err.message))
    }

    this.emit('end')
}
/* === Красивое отображение ошибок === */

var obfuscator = require('gulp-javascript-obfuscator')
var uglify = require('gulp-uglify')
var tap = require('gulp-tap')

// Фафлы, которые надо обрабатывать с помощью browserify
const browserify_js_files = [
    './app/js/app.js',
    './app/js/modules/scroll-hover.js',
]

// Таск, который вызывается из вотчера
gulp.task('js', function() {
    browserify_js_files.forEach(file => {
        let file_name = path.basename(file);
        let bundler = browserify(file, { debug: true, })
            .transform(babelify, {
                presets: ["@babel/preset-env"]
            });
        bundle_js(bundler, file_name);
    })
})

// Функция, которая выполняет работу с файлами js после browserify
function bundle_js(bundler, name) {
    return bundler.bundle()
        .on('error', map_error)
        .pipe(source(name))
        .pipe(buffer())
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(sourcemaps.init({ loadMaps: true })) // Захват sourcemaps из трансформации
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./app/js'))
        .pipe(tap(file => {
            gutil.log(chalk.yellow(`Browserify: `) + chalk.white(file.path))
        }))
        .pipe(browserSync.reload({ stream: true }))
}

function bundle_js_build(bundler, name) {
    return bundler.bundle()
        .on('error', map_error)
        .pipe(source(name))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(tap(file => {
            gutil.log(chalk.yellow(`Browserify: `) + chalk.white(file.path))
        }))
}


gulp.task('sass', function() {
    return gulp.src('app/sass/**/*.sass')
        .on('error', map_error)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expand' }).on("error", map_error))
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('css', function() {
    return gulp.src([
            'app/css/**/*.css',
            '!app/css/**/*.min.css'
        ])
        .on('error', map_error)
        .pipe(sourcemaps.init())
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({ stream: true }))
})


gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
    // gulp.watch('app/sass/**/*.css', ['css'])
    gulp.watch('app/sass/**/*.sass', ['sass'])
    gulp.watch(['app/**/*.js', '!app/**/*.min.js'], ['js'])
    gulp.watch(['app/**/*.html', 'app/**/*.json'], browserSync.reload)
})

gulp.task('build', ['removedist'], function() {
    let file = './app/js/scroll-hover.min.js';
    let file_name = path.basename(file);
    let bundler = browserify(file, { debug: true, })
        .transform(babelify, {
            presets: ["@babel/preset-env"]
        });
    bundle_js_build(bundler, file_name);
})


gulp.task('removedist', function() {
    try {
        return del.sync('dist')
    } catch (err) {}
})

gulp.task('clearcache', function() { return cache.clearAll() })

gulp.task('default', ['watch'])
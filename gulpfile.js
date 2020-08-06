const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const mincss = require("gulp-clean-css");
const minjs = require("gulp-uglify-es").default;
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const serv = require("browser-sync").create();
const tinpng = require("gulp-tinypng-extended");
const webp = require("gulp-webp");
const babel = require("gulp-babel");
const svgstore = require("gulp-svgstore");
const svgmin = require("gulp-svgmin");
const concat = require('gulp-concat');

// стили
function styles() {
  return gulp
    .src("./dev/scss/style.scss")
    .pipe(sass())
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true,
      })
    )
    .pipe(
      mincss({
        level: 2,
      })
    )
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("./build/css/"))
    .pipe(serv.stream());
}

// php и html
function pages() {
  return gulp
    .src("./dev/pages/**/*.{html,php}")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./build/"))
    .on("end", serv.reload);
}

// собирает js библиотеки из директории /dev/js/libs
function js_libs(){
  let path = './dev/js/';
  return gulp.src([path + 'libs/*.js'])
  .pipe(concat('libs.min.js'))
  .pipe(minjs())
  .pipe(gulp.dest('./build/js/'))
}

// собирает js файлы из директории /dev/js
function js_main_file(){
  let path = './dev/js/';
  return gulp.src([path + '*.js'])
  .pipe(concat('script.min.js'))
  .pipe(babel({
      presets: ['@babel/preset-env']
  }))
  .pipe(minjs())
  .pipe(gulp.dest('./build/js/'))
}

// объединяет файлы, которые образуются в результате выполнения js_libs и js_main_file
function concat_scripts(){
  let path = './build/js/';
  return gulp.src([path + 'libs.min.js', path + 'script.min.js'])
  .pipe(concat('bundle.min.js'))
  .pipe(minjs({
      toplevel:true
  }))
  .pipe(gulp.dest('./build/js/'))
  .pipe(serv.stream());
}

// удаляет временные файлы js, которые образуются в результате выполнения функций js_libs и js_main_file
function del_scripts(){
  return del(['./build/js/script.min.js', './build/js/libs.min.js']);
}

// берет картинки из указанной директории и прогоняет их через tinypng
function tinypng() {
  return gulp
    .src("./dev/images/*.{png,jpg,jpeg}")
    .pipe(
      tinpng({
        key: "vk4MjNSJ4ueyHE97MrY8IAl95xPgNEVR", //paste your own API key here(key in your acciunt on https://tinypng.com/dashboard/api)
      })
    )
    .pipe(gulp.dest("./build/images"));
}

// конвертирует картинки из указанной директории в webp формат
function webpimg() {
  return gulp
    .src("./build/images/*.{png,jpg,jpeg}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("./build/images/webp"));
}

// чистит директорию картикок(используется после прогонки через tinypng и конвертации в webp, дабы избежать повторной прогонки и конвертации)
function cleanimg() {
  return del(["./dev/images/*.{png,jpg,jpeg}"]);
}

// делает спрайт в svg
function svgsprite() {
  return gulp
    .src("./build/images/svg/*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest('./build/images/svg/'));
}

// ватчер за файлами
function watch() {
  serv.init({
    server: "./build"
  });

  gulp.watch("./dev/scss/**/*.scss", styles);
  gulp.watch("./dev/js/**/*.js", gulp.series(js_libs, js_main_file, concat_scripts, del_scripts));
  gulp.watch("./dev/pages/**/*.{html,php}", pages);
}

/*Build tasks*/
gulp.task("css", styles);
gulp.task("pages", pages);
gulp.task("webp", webpimg);
gulp.task("images", gulp.series(tinypng, webpimg, cleanimg));
gulp.task("svgsprite", svgsprite);

/*Watcher Task*/
gulp.task("watch", gulp.series(styles, js_main_file, js_libs, concat_scripts, del_scripts, pages, watch));

import gulp from "gulp";
import pug from "gulp-pug";
import concat from "gulp-concat";
import stylus from "gulp-stylus";
import watch from "gulp-watch";
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import replace from "gulp-string-replace";
import notifier from "node-notifier";
import del from "del";
import imagemin from "gulp-imagemin";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import fs from "fs-extra";
import path from "path";
import plumber from "gulp-plumber";

const sass = gulpSass(dartSass);

const paths = {
  json: {
    dir: "src/data",
    src: "src/data/**/*.json",
  },
  pug: {
    src: [
      "!src/pug/**/*.pug",
      "!src/pug/_*.pug",
      "!src/pug/pages/*.pug",
      "src/pug/pages/**/*.pug",
      "!src/pug/pages/**/_**/*.pug",
    ],
    srcCore: ["src/pug/**/*.pug", "src/pug/**/**/*.pug"],
    dest: "dist/",
  },
  fonts: {
    src: ["src/fonts/*.{ttf,woff,woff2}", "src/fonts/**/*.{ttf,woff,woff2}"],
    dest: "dist/fonts/",
  },
  scss: {
    src: [
      "src/scss/mixins/*.scss",
      "src/scss/__*.scss",
      "src/scss/_*.scss",
      "src/scss/*.scss",
      "src/scss/*.css",
      "src/scss/**/*.scss",
      "src/core/**/*.scss",
      "src/pug/pages/**/*.scss",
      "src/pug/**/*.scss",
    ],
    dest: "dist/css/",
  },
  stylus: {
    src: [
      "src/stylus/mixins/*.styl",
      "src/stylus/_*.styl",
      "src/stylus/*.styl",
      "src/stylus/**/*.styl",
      "src/core/**/*.styl",
    ],
    dest: "dist/css/",
  },
  scripts: {
    src: ["src/pages/**/*.js", "src/js/_*.js", "src/js/*.js"],
    dest: "dist/js/",
  },
  images: {
    src: [
      "src/img/*.{jpg,jpeg,png,svg,gif}",
      "src/img/**/*.{jpg,jpeg,png,svg,gif}",
    ],
    dest: "dist/img/",
  },
  phpPath: {
    src: ["src/pug/pages/*.php"],
    dest: "dist/",
  },
};

export const clean = () => del(["dist"]);

/**
 *  Подключение файлов с контентом и настройками проекта.
 *  Используется для подставновки данных в препроцессоре Pug.
 *  В препроцессоре Pug названия перемнных соответсвуют названиям файлов.
 *  Все символы, кроме букв и цифр в названии файлов будут заменены
 *  на знак нижнего подчеркивания.
 */
export function dataFiles() {
  let DataFiles = {};

  fs.readdirSync(paths.json.dir).forEach(function (file) {
    let varname = path.basename(file, ".json").replace(/[^\w]+/gi, "_");
    DataFiles[varname] = fs.readJsonSync(`${paths.json.dir}/${file}`);
  });

  return DataFiles;
}

/**
 *  Перемещение JSON-файлов с контентом в директорию ./dist/data,
 *  чтобы сделать их доступными на продуктовом сервере для PHP.
 *  По-умолчанию не используется, можно добавить в задание.
 */
export function moveData() {
  return gulp.src(`./src/php/*`).pipe(gulp.dest(`./dist/`));
  // return gulp.src(`./src/data/*.json`).pipe(gulp.dest(`./dist/data`));
}

/**
 *  Перемещение подключаемых в браузере библиотек jQuery и т.д.,
 *  в директорию ./dist/assets. Все необходимые библиотеки должны
 *  устанавливаться через npm, т.к. для перемещения используется
 *  список зависимостей - свойство dependencies из package.json.
 */
export function moveAssets() {
  const packageObj = fs.readJsonSync("./package.json");
  var last;
  for (let asset in packageObj.dependencies) {
    last = gulp
      .src(`./node_modules/${asset}/**/*`)
      .pipe(gulp.dest(`./dist/assets/${asset}/`));
  }
  return last;
}

/**
 *  Задание на компиляцию pug-файлов.
 */
export function pugTask() {
  return gulp
    .src(paths.pug.src)
    .pipe(plumber())
    .pipe(
      pug({
        locals: dataFiles(),
        pretty: !isProd(),
      })
    )
    .pipe(replace("<php>", "<div hidden>"))
    .pipe(replace("</php>", "</div>"))
    .pipe(
      rename(function (path) {
        path.dirname = ".";
      })
    )
    .pipe(gulp.dest(paths.pug.dest));
}

/**
 *  Задание на компиляцию pug-файлов с кодом PHP.
 *  В шаблоне допускается использовать PHP-конструкции.
 */
export function pugPhp() {
  return gulp
    .src(paths.pug.src)
    .pipe(
      plumber({
        errorHandler: errorReport,
      })
    )
    .on("error", errorReport)
    .pipe(
      pug({
        locals: dataFiles(),
        pretty: !isProd(),
      })
    )
    .pipe(replace("<php>", "<?php "))
    .pipe(replace("</php>", " ?>"))
    .pipe(
      rename({
        extname: ".php",
      })
    )
    .pipe(gulp.dest(paths.pug.dest));
}

/**
 *  Перемещение файлов шрифтов в директорию ./dist/fonts
 */
export function moveFonts() {
  return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}

export function movePHPScripts() {
  return gulp.src(paths.phpPath.src).pipe(gulp.dest(paths.phpPath.dest));
}

export function styleSCSS() {
  return gulp
    .src(paths.scss.src)
    .pipe(concat("style.scss"))
    .pipe(
      sass(isProd() ? { outputStyle: "compressed" } : {}).on(
        "error",
        errorReport
      )
    )
    .pipe(gulp.dest(paths.scss.dest));
}

export function styleStylus() {
  return (
    gulp
      .src(paths.stylus.src)
      .pipe(concat("style.styl"))
      .pipe(
        stylus({
          compress: isProd(),
          "include css": true,
        })
      )
      // .pipe(cleanCSS())
      .pipe(
        rename({
          basename: "style",
          // suffix: '.min'
        })
      )
      .pipe(gulp.dest(paths.stylus.dest))
  );
}

/**
 *  Объединение и сжатие js-файлов.
 *  Сжатие только для продуктового сервера.
 */
export function scripts() {
  let sc = gulp.src(paths.scripts.src, { sourcemaps: isProd() });

  isProd() && sc.pipe(uglify());

  return sc.pipe(concat("scripts.min.js")).pipe(gulp.dest(paths.scripts.dest));
  // .pipe(gulp.dest(paths.scripts.dest, { sourcemaps: isProd() }));
}

export function images() {
  let gm = gulp.src(paths.images.src, { since: gulp.lastRun(images) });

  isProd() &&
    gm.pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 89, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    );

  return gm.pipe(gulp.dest(paths.images.dest));
}

export function watchFiles() {
  // gulp.watch(paths.stylus.src, stylus);
  gulp.watch(paths.scss.src, styleSCSS);
  gulp.watch(paths.json.src, isHTML() ? pugTask : pugPhp);
  gulp.watch(paths.pug.srcCore, isHTML() ? pugTask : pugPhp);
  gulp.watch(paths.pug.src, isHTML() ? pugTask : pugPhp);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.phpPath.src, movePHPScripts);
}

function errorReport(err) {
  notifier.notify({
    title: "Gulp error",
    subtitle: "Gulp2 error",
    message: "Ошибка компиляции. См. терминал.",
    sound: true,
    icon: path.join(__dirname, "src/system/error-icon.png"),
    wait: true,
  });
  console.log(err);
}

function isProd() {
  return process.argv[3] === "--mode-prod";
}

function isDev() {
  return process.argv[3] === "--mode-dev";
}

function isHTML() {
  return process.argv[4] === "--pug-html";
}

exports.dev = gulp.series(
  clean,
  gulp.parallel(
    // styleStylus,
    styleSCSS,
    isHTML() ? pugTask : pugPhp,
    scripts,
    images
  ),
  moveData,
  moveFonts,
  moveAssets,
  movePHPScripts,
  watchFiles
);

exports.build = gulp.series(
  clean,
  gulp.parallel(
    // styleStylus,
    styleSCSS,
    isHTML() ? pugTask : pugPhp,
    scripts,
    images
  ),
  moveData,
  moveFonts,
  moveAssets,
  movePHPScripts
);

exports.prod = gulp.series(
  clean,
  gulp.parallel(
    // styleStylus,
    styleSCSS,
    isHTML() ? pugTask : pugPhp,
    scripts,
    images
  ),
  moveData,
  moveFonts,
  moveAssets,
  movePHPScripts
);

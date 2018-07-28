const gulp = require("gulp");
const ts = require("gulp-typescript");
const del = require("del");
const uglify = require("gulp-uglify");
const nodemon = require('gulp-nodemon');

gulp.task('del_old_build', () => {
    return del("./build");
});

gulp.task('ts', () => {
    return gulp.src("./src/**/*.ts")
        .pipe(ts())
        .pipe(uglify())
        .pipe(gulp.dest('./build/'));
});

gulp.task('start', function() {
    return nodemon({
        script: './build/app.js',
        watch: './src',
        ext: 'ts',
        tasks: ['del_old_build', "ts"],
        env: { 'NODE_ENV': 'production' }
    });
});



gulp.task('default',
    gulp.series(
        "del_old_build",
        "ts"
    )
);
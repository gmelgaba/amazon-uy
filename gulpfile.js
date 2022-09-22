'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const cleancss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const zip = require('gulp-zip');
const babel = require('gulp-babel');
const gulpif = require('gulp-if');
const argv = require('yargs/yargs')(process.argv.slice(2)).argv
const isProd = argv.production === 'true';

// Clean build directory
gulp.task('clean', () => {
	return gulp.src('build/*', { read: false })
		.pipe(clean());
});

// Copy and compress HTML files
gulp.task('html', () => {
	return gulp.src('app/**/*.html')
		.pipe(gulp.dest('build'));
});

// Copy vendor scripts and uglify all other scripts, creating source maps
gulp.task('scripts', () => {
	return gulp.src(['app/**/*.js'])
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(gulpif(isProd, uglify()))
		.pipe(gulp.dest('build'));
});

// Minify styles
gulp.task('styles', () => {
	return gulp.src('app/**/*.css')
		.pipe(cleancss())
		.pipe(gulp.dest('build'));
});

// Copy static files/folders to build directory
gulp.task('copy', () => {
	gulp.src('app/**/*.png')
		.pipe(gulp.dest('build'));
	return gulp.src('app/manifest.json')
		.pipe(gulp.dest('build'));
});

// Create zip file in domain folder
gulp.task('compress', () => {
	const manifest = require('./app/manifest');
	const zipname = `${manifest.name} v${manifest.version}.zip`;
	// build distributable extension
	return gulp.src(['build/**'])
		.pipe(zip(zipname))
		.pipe(gulp.dest('dist'));
});

// Builds the chrome extension
gulp.task(
	'default',
	gulp.series(
		'clean',
		'html',
		'scripts',
		'styles',
		'copy'
	)
);

// Builds & compress the chrome extension
gulp.task(
	'zip',
	gulp.series(
		'clean',
		'html',
		'scripts',
		'styles',
		'copy',
		'compress'
	)
);

/**
 * Gulp file for managing tasks
 *
 * To get started first run *sudo npm install* to get all required modules
 * Once setup run *gulp watch* to start watching your files and running their respective tasks
 */

// Main gulp requirement
var gulp = require('gulp'),

// Styles task requirements
sass = require('gulp-ruby-sass'),
autoprefixer = require('gulp-autoprefixer'),
minifycss = require('gulp-minify-css'),

// Scripts task requirements
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
jshint = require('gulp-jshint'),
stylish = require('jshint-stylish'),

// Images task requirements
imagemin = require('gulp-imagemin'),
cache = require('gulp-cache'),

// Notification scripts
plumber = require('gulp-plumber'),
notify = require('gulp-notify'),

// Custom jshint reporter
map = require('map-stream'),
events = require('events'),
path = require('path'),
emmitter = new events.EventEmitter(),

// Renaming files
rename = require('gulp-rename'),

// Gulp utilities
util = require('gulp-util'),

// Browser reloading
browserSync = require('browser-sync');

// Set default variables
var paths = {
	images: 'images',
	scripts: {
		root: 'scripts',
		app: 'scripts/app',
		min: 'scripts/min',
		vendor: 'scripts/vendor'
	},
	styles: {
		sass: 'sass',
		css: 'stylesheets'
	}
}

var app = {
	browser: 'com.google.Chrome.canary',
	command: 'com.apple.Terminal'
}

var location = 'local.iuvo';

var rubyRequires = [
	'breakpoint'
]

// Messages data for gulp-notify to display
var messages = {
	error: function(err) {
		notify.onError({
			title: 'Error',
			message: 'Gulp reported error: <%= error.message %>!',
			sound: 'Basso',
			activate: app.command,
			sender: app.command
		}) (err);

		this.emit('end');
	},
	success: {
		title: 'Success',
		message: 'Gulp tasks completed successfully!',
		activate: app.browser,
		sender: app.command,
		onLast: true
	}
}

// Stylesheets tasks
gulp.task('styles', function() {
	return gulp.src(paths.styles.sass + '/*.scss')
		.pipe(plumber({
			errorHandler: messages.error
		}))
		.pipe(sass({
			require: rubyRequires,
			style: 'compact'
		}))
		.pipe(autoprefixer('last 3 version'))
		.pipe(gulp.dest(paths.styles.css))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest(paths.styles.css))
		.pipe(notify(messages.success));
});

// Custom jshint reporter
var jshintReporter = map(function (file, cb) {
	if (!file.jshint.success) {
		file.jshint.results.forEach(function (err) {
			if (err) {
				// Error message
				var msg = [
					path.basename(file.path),
					'Line: ' + err.error.line,
					'Reason: ' + err.error.reason
				];

				// Emit this error event
				emmitter.emit('error', new Error(msg.join('\n')));
			}
		});
	}

	cb(null, file);
});

// Run app script only task
gulp.task('scripts', function() {
	return gulp.src(paths.scripts.app + '/*.js')
		.pipe(plumber({
			errorHandler: messages.error
		}))
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(jshintReporter)
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(paths.scripts.min))
		.pipe(notify(messages.success))
});

// Run vendor only scripts files task
gulp.task('vendors', function() {
	return gulp.src(paths.scripts.vendor + '/*.js', '!' + paths.scripts.vendor + '/jquery.min.js', '!' + paths.scripts.vendor + '/modernizr.min.js')
		.pipe(plumber({
			errorHandler: messages.error
		}))
		.pipe(concat('vendors.js'))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(paths.scripts.min))
		.pipe(notify(messages.success))
});

// Run image files task
gulp.task('images', function() {
	return gulp.src(paths.images + '/**/*')
		.pipe(plumber({
			errorHandler: messages.error
		}))
		.pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
		.pipe(gulp.dest(paths.images))
		.pipe(notify(messages.success))
});

// Initialize browserSync server
gulp.task('browser-sync', function() {
	browserSync({
		proxy: location
	});
});

// Default Gulp task to Run
gulp.task('default', function() {
	gulp.start('styles', 'scripts', 'vendors', 'images');
});

// Watch changes on files and run their respective tasks
gulp.task('watch', ['browser-sync'], function() {
	// Watch for .scss files
	gulp.watch(paths.styles.sass + '/**/*.scss', ['styles']);

	// Watch for app .js files
	gulp.watch(paths.scripts.app + '/*.js', ['scripts']);

	// Watch for vendor .js files
	gulp.watch(paths.scripts.vendor + '/*.js', ['vendors']);

	// Watch for new images
	gulp.watch(paths.images + '/**/*', ['images']);

	// Watch changes in files and reload after
	gulp.watch([paths.styles.css + '/*.css', paths.scripts.min + '/*.js', paths.images + '/**/*', '*.php'])
		.on('change', browserSync.reload);
});
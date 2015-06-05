/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  // 'styles/*.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

  // Load sails.io before everything else
  'js/dependencies/sails.io.js',

  // Dependencies like jQuery, or Angular are brought in here
  '/components/modernizr/modernizr.js',
  '/components/jstz-detect/jstz.js',
  '/components/lodash/lodash.js',
  '/components/moment/moment.js',
  '/components/moment-timezone/moment-timezone.js',
  '/components/jquery/dist/jquery.js',
  '/components/jquery-mousewheel/jquery.mousewheel.js',
  '/components/accountingjs/accounting.js',
  '/components/jpanelmenu/jquery.jpanelmenu.js',
  '/components/select2/dist/select2.full.js',
  '/components/gridster/dist/jquery.gridster.with-extras.js',
  '/components/pnotify/pnotify.core.js',
  '/components/pnotify/pnotify.buttons.js',
  '/components/pnotify/pnotify.confirm.js',
  '/components/pnotify/pnotify.nonblock.js',
  '/components/pnotify/pnotify.desktop.js',
  '/components/pnotify/pnotify.history.js',
  '/components/pnotify/pnotify.callbacks.js',
  '/components/pnotify/pnotify.reference.js',
  '/components/clndr/src/clndr.js',
  '/components/flippy/jquery.flippy.js',
  '/components/CoolClock/coolclock.js',
  '/components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
  '/components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js',
  '/components/eiyria-bootstrap-slider/dist/bootstrap.slider.min.js',
  'js/dependencies/**/*.js',

  // All of the rest of your client-side js files
  // will be injected here in no particular order.
  'js/internal/*.js',
  'js/init.js',
  'js/tiles/*.js',
  'js/*.js',
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  'templates/**/*.html'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
  return 'assets/' + path;
});

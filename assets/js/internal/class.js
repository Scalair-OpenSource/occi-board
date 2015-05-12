/*jshint eqeqeq:false, newcap:false, noarg:false, undef:false, loopfunc:true, expr: true */

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *
 * Inspired by base2 and Prototype
 */

/**
 *  Class: Class
 *  Provides a minimalistic class ancestor to inherit from.
 *
 *  Example:
 *  |var Person = Class.extend({
 *  |    init: function (isDancing){
 *  |      this.dancing = isDancing;
 *  |    }
 *  |});
 *  |
 *  |var Ninja = Person.extend({
 *  |    init: function () {
 *  |      this._super(false);
 *  |    }
 *  |});
 *  |
 *  |var p = new Person(true);
 *  |p.dancing; // => true
 *  |
 *  |var n = new Ninja();
 *  |n.dancing; // => false
 *  |
 *  |n instanceof Object; // => true
 *  |n instanceof Class; // => true
 *  |n instanceof Person; // => true
 *  |n instanceof Ninja; // => true
 */
(function () {
    var initializing = false,

    fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function () {};

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {

        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var proto = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            proto[name] = typeof prop[name] == "function" &&
                          typeof _super[name] == "function" &&
                          fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init ) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = proto;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();

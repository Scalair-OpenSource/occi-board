/*global Class:true*/
/*global cs:true*/
/*global moment:true*/

/**
 * Class: $od.tiles.storage.Base
 * This object provides basic functions for all storages.
 */
$od.tiles.storage.Base = Class.extend({

    init: function () {
        /**
         * Variable: register (private)
         * Array of tiles that when to be warn when data is updated.
         */
        this._register = {};
        this._owner = false;
        this._credentials = [];

        this.errors = [];

        this._name = 'anonymous-storage';
    },

    pushError: function (errMsg) {
        if (errMsg.trim()) {
            this.errors.push(errMsg);
        }
    },

    popError: function () {
        return this.errors.push();
    },

    errorCount: function () {
        return this.errors.length;
    },

    /**
     * Method: getCredentials
     */
    getCredentials: function () {
        var self = this;
        return self._credentials;
    },

    /**
     * Method: getOwner
     * Returns the identifier of the tile that owns this storage and that refresh its data. False if nobody owns it!
     */
    getOwner: function () {
        var self = this;
        return self._owner;
    },

    /**
     * Method: setOwner
     * The owner of this storage is responsible of the data refresh. There can be only one owner at a time.
     *
     * Returns:
     * true - If ownership as been given,
     * false - If owner is already claimed.
     *
     * Example:
     * | setOwner(123); -> // True, "123" is the first owner
     * | setOwner(456); -> // False, "123" already owns it!
     * | dismissOwner(456); -> // False, "456" is not the owner!
     * | dismissOwner(123); -> // True, "123" dismiss!
     * | setOwner(456); -> // True, "456" is now the owner!
     */
    setOwner: function (id) {
        var self = this;
        if (!self._owner) {
            self._owner = id;
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Method: dismissOwner
     * Release the ownership of this storage if it owns it!
     *
     * Returns:
     * true - If ownership as been released,
     * false - If owner is not given id.
     *
     * Example:
     * | setOwner(123); -> // True, "123" is the first owner
     * | setOwner(456); -> // False, "123" already owns it!
     * | dismissOwner(456); -> // False, "456" is not the owner!
     * | dismissOwner(123); -> // True, "123" dismiss!
     * | setOwner(456); -> // True, "456" is now the owner!
     */
    dismissOwner: function (id) {
        var self = this;
        if (self._owner === id) {
            self._owner = false;
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Method: register
     * This method allow a tile to have a callback fired when data of this storage is updated.
     *
     * Parameters:
     * id - Identifier of the tile that register.
     * callback - This is the callback to run when data are updated. This parameter can be omitted if unregistering.
     * scope - The scope to apply when calling callback function.
     */
    register: function (id, scope, callback) {
        var self = this;
        self._register[id] = {
            callback: callback, // Modify the callback
            scope: scope // Modify the scope
        };

        return true;
    },

    unRegister: function (id) {
        var self = this;
        if (self._register[id]) {
            delete(self._register[id]); // Remove the callback
            return true;
        }

        return false;
    },

    registerExec: function () {
        var self = this;

        console.log(moment().format('HH:mm:ss.SSS'), '[registerExec]', self._name, ' refresh/sec:', self.LOAD_PERIOD ? self.LOAD_PERIOD/1000: 'dashboard loop!');

        $.each(self._register, function (id, prop) {
            try {
                // console.log(moment().format('HH:mm:ss.ss'), prop.scope);
                prop.callback.call(prop.scope || this, self);
            }
            catch (e) {
                console.error(id, e);
            }
        });
    }
});

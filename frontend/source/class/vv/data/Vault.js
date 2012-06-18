/* ************************************************************************
   Copyright: 2012 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * The Vault uses SJCL to encryp and decrypt data as it goes to the localStorage of
 * the webbrowser. It also handles syncing data with the server.
 */
// realy make these variables private
var cache = {
    dbCfg    : null,
    data     : {},
    lastSync : null
};

var key;

qx.Class.define("vv.data.Vault", {
    extend : qx.core.Object,
    type : 'singleton',

    construct : function() {
        this.base(arguments);
        data = [];
        key = null;

        if (!localStorage) {
            throw new Error(this.tr("Sorry, this browser does not support localStorage. VeryVault requires localStorage to work."));
        }

        var as = this.__askPass = new vv.page.AskSecret();
        as.addListener('key', this._tryUnlockEvent, this);
        as.addListener('reset', this._clearLocalStorageEvent, this);
        var ans = this.__askNewPass = new vv.page.AskNewSecret();
        ans.addListener('key', this._setNewKeyEvent, this);
    },

    events : {
        open      : 'qx.event.type.Event',
        dataReady : 'qx.event.type.Event'
    },

    members : {
        __storeName : "VeryVaultStore",
        __askPassPage : null,
        __askNewPassPage : null,


        /**
         * Unlock the Vault. Once the vault is properly opened, it will emit an 'open' event.
         *
         */
        unlock : function() {
            if (key != null) {
                this.fireEvent('open');
                return;
            }

            var cache_in = localStorage.getItem(this.__storeName);

            if (cache_in) {
                this.__askPass.show();
            } else {
                this.__askNewPass.show();
            }
        },


        /**
         * Use the key from the unlock event to decrytp the localy stored configuration data.
         * If succesfull, go and try getting the latest config from the server.
         *
         * @param e {Event} unlock event carring the key data.
         */
        _tryUnlockEvent : function(e) {
            var newKey = e.getData();
            var sjcl = vv.data.Sjcl.getInstance();
            var cache_in = localStorage.getItem(this.__storeName);

            try {
                cache = sjcl.decrypt(newKey, cfg_in);
            }
            catch(err) {
                vv.popup.MsgBox.getInstance().error(this.tr('Wrong Key'), this.tr('The key does not work. Try again.'));
                return;
            }

            key = newKey;
            this._fetchConfig();
            this._updateItems();
        },


        /**
         * A new key has been setup. Go and fetch the data.
         *
         * @param e {Event} the new key event.
         */
        _setNewKeyEvent : function(e) {
            key = e.getData();
            this._fetchConfig();
            this._updateItems();
        },


        /**
         * If the browser is online, go and fetch the config data from the server.
         * If we are not known to the server, this will cause the association screen 
         * to be displayed.
         *
         */
        _fetchConfig : function() {
            if (window.navigator.onLine) {
                var rpc = vv.data.Rpc.getInstance();
                var that = this;

                rpc.callAsyncSmart(function(ret) {
                    cache.dbCfg = ret;

                    for (var itemKey in ret) {
                        var js = ret[itemKey].label_js || '"No Label Defined"';

                        try {
                            ret[itemKey].label_js = eval('function(item){ return ' + ret[itemKey].label_js + '}');
                        }
                        catch(err) {
                            ret[itemKey].label_js = function(item) {
                                return 'failed to compile lible_js';
                            };
                        }
                    }

                    that.__save();
                    that.fireEvent('open');
                },
                'getConfig');
            }
            else {
                if (cache.dbCfg) {
                    this.fireEvent('open');
                } else {
                    vv.popup.MsgBox.getInstance().error(this.tr('No Off Line Config'), this.tr('There is no off line copy of the configuration in cache. Get on line and re-start the app'));
                }
            }
        },


        /**
         * Handle the clear store event and show a dialog asking for a new password.
         *
         */
        _clearLocalStorageEvent : function() {
            this.clearLocalStorage();
            this.__askNewPass.show();
        },


        /**
         * Return the configuration hash
         *
         * @return {Map} configuration hash
         * @throws Error if no key is set
         */
        getConfig : function() {
            if (!key) {
                throw new Error("Key is not set. Can't accesss data.");
            }

            return cache.dbCfg;
        },


        /**
         * Store an item in local storage, encrypting it while doing so
         *
         * @throws Error if no key is set
         */
        __save : function() {
            if (!key) {
                throw new Error("Key is not set. Can't store data.");
            }

            var sjcl = vv.data.Sjcl.getInstance();
            localStorage.setItem(this.__storeName, sjcl.encrypt(key, qx.lang.Json.stringify(cache)));
        },


        /**
         * Remove all data from the localStorage.
         *
         */
        clearLocalStorage : function() {
            key = null;

            cache = {
                dbCfg    : null,
                data     : {},
                lastSync : null
            };

            localStorage.removeItem(this.__storeName);
        },


        /**
         * TODOC
         *
         * @param store {var} TODOC
         * @param callback {var} TODOC
         * @param context {var} TODOC
         */
        getItems : function(store, callback, context) {
            if (window.navigator.onLine) {
                var rpc = vv.data.Rpc.getInstance();
                var that = this;

                rpc.callAsyncSmart(function(ret) {
                    ret.forEach(function(item) {
                        if (item.savetime > config.lastSync) {
                            cache.lastSync = item.savetime;
                        }

                        var localItem = cache.data[item.id];

                        if (localItem) {
                            if (item.rmtime && localItem.savetime < item.rmtime) {
                                delete data[item.id];
                                return;
                            }

                            if (localItem.savetime < localItem.updatetime) {
                                localItem.merge = item;
                                return;
                            }
                        }

                        data[item.id] = item;
                    });

                    that.__save();
                    that.__runItemCallback(store, callback, context);
                },
                'getItems', cache.lastSync);
            }
            else {
                this.__runItemCallback(store, callback, context);
            }
        },


        /**
         * TODOC
         *
         * @param store {var} TODOC
         * @param callback {var} TODOC
         * @param context {var} TODOC
         */
        __runItemCallback : function(store, callback, context) {
            var data = new qx.data.Array();

            for (var key in cache.data) {
                var item = cache.data[key];

                if (item.type == store) {
                    ret.push(item);
                }
            }

            callback.call(context, data);
        }
    }
});
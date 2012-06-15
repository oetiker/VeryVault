/* ************************************************************************
   Copyright: 2012 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * The Vault uses SJCL to encryp and decrypt data as it goes to the localStore of
 * the webbrowser. This module throws exceptions if it is unhappy.
 */
// realy make this private
var data;
var key;
var config;

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
        as.addListener('reset', this._clearLocalStoreEvent, this);
        var ans = this.__askNewPass = new vv.page.AskNewSecret();
        ans.addListener('key', this._setNewKeyEvent, this);
    },

    events : { open : 'qx.event.type.Event' },

    members : {
        __storeName : "VeryVaultStore",
        __askPassPage : null,
        __askNewPassPage : null,


        /**
         * TODOC
         *
         */
        unlock : function() {
            if (key != null) {
                this.fireEvent('open');
                return;
            }

            var cfg_in = localStorage.getItem(this.__storeName);

            if (cfg_in) {
                this.__askPass.show();
            } else {
                this.__askNewPass.show();
            }
        },


        /**
         * TODOC
         *
         * @param e {Event} TODOC
         * @return {boolean} TODOC
         */
        _tryUnlockEvent : function(e) {
            var newKey = e.getData();
            var sjcl = vv.data.Sjcl.getInstance();
            var cfg_in = localStorage.getItem(this.__storeName);

            try {
                config = sjcl.decrypt(newKey, cfg_in);
            }
            catch(err) {
                vv.popup.MsgBox.getInstance().error(this.tr('Wrong Key'), this.tr('The key does not work. Try again.'));
                return false;
            }

            key = newKey;
            this._fetchConfig();
        },


        /**
         * TODOC
         *
         * @param e {Event} TODOC
         */
        _setNewKeyEvent : function(e) {
            key = e.getData();
            this._fetchConfig();
        },


        /**
         * TODOC
         *
         */
        _fetchConfig : function() {
            if (window.navigator.onLine) {
                var rpc = vv.data.Rpc.getInstance();
                var that = this;

                rpc.callAsyncSmart(function(ret) {
                    config = ret;
                    that.__set('', config);
                    that.fireEvent('open');
                },
                'getConfig');
            }
            else {
                if (config) {
                    this.fireEvent('open');
                } else {
                    vv.popup.MsgBox.getInstance().error(this.tr('No Off Line Config'), this.tr('There is no off line copy of the configuration in cache. Get on line and re-start the app'));
                }
            }
        },


        /**
         * TODOC
         *
         */
        _clearLocalStoreEvent : function() {
            this.clearData();
            this.__askNewPass.show();
        },


        /**
         * TODOC
         *
         * @return {var} TODOC
         * @throws TODOC
         */
        getConfig : function() {
            if (!key) {
                throw new Error("Key is not set. Can't accesss data.");
            }

            return config;
        },


        /**
         * TODOC
         *
         * @param name {var} TODOC
         * @param data {var} TODOC
         * @throws TODOC
         */
        __set : function(name, data) {
            if (!key) {
                throw new Error("Key is not set. Can't store data.");
            }

            var sjcl = vv.data.Sjcl.getInstance();
            localStorage.setItem(this.__storeName + name, sjcl.encrypt(key, qx.lang.Json.stringify(data)));
        },


        /**
         * TODOC
         *
         * @param key {var} TODOC
         * @param data {var} TODOC
         */
        setData : function(key, data) {
            this.__set('.' + key, data);
        },


        /**
         * TODOC
         *
         * @param key {var} TODOC
         * @return {Map | var} TODOC
         * @throws TODOC
         */
        getData : function(key) {
            var item = localStorage.getItem(this.__storeName + '.' + key);

            if (item == null) {
                return {};
            }

            if (item && !key) {
                throw new Error("There is local data but no key is set");
            }

            var sjcl = vv.data.Sjcl.getInstance();
            return qx.lang.Json.parse(sjcl.decrypt(key, item));
        },


        /**
         * TODOC
         *
         */
        clearData : function() {
            key = null;
            config = null;
            data = [];
            var rx = new RegExp('^' + this.__storeName);

            for (var i=localStorage.length; i>=0; i--) {
                var key = localStorage.key(i);

                if (key && key.match(rx)) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
});
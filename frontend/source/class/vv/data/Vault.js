/* ************************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
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
qx.Class.define("vv.data.Vault",{
    extend : qx.core.Object,
    type: 'singleton',
    construct: function(){
        this.base(arguments);
        data = [];
        key = null;
        if (!localStorage){
            throw new Error(this.tr("Sorry, this browser does not support localStorage. VeryVault requires localStorage to work."));
        }
    },
    members : {
        __storeName: "VeryVaultStore",
        unlock: function(newKey){
            var cfg_in = localStorage.getItem(this.__storeName+".config");
            if (cfg_in){
                var sjcl = vv.data.Sjcl.getInstance();
                try { 
                    config = sjcl.decrypt(newKey,cfg_in);
                }
                catch (err) {
                    return false;
                }
            }
            key = newKey;
            return true;
        },
        isEmpty: function(){
            return (localStorage.getItem(this.__storeName + '.config') == null);
        },
        getConfig: function(){
            if (!key){
                throw new Error("Key is not set. Can't accesss data.");
            }
            return config;
        },
        __set: function (name,data){
            if (!key){
                throw new Error("Key is not set. Can't store data.");
            }
            var sjcl = vv.data.Sjcl.getInstance();        
            localStorage.setItem(
                this.__storeName+'.'+name,
                sjcl.encrypt(
                    key,
                    qx.lang.Json.stringify(data)
                )
            );
        },
        setConfig: function (cfg){
            this.__set('config',cfg);
        },
        setData: function (data){
            this.__set('data',data);
        },

        getData: function (){
            var item = localStorage.getItem(this.__storeName + '.data');
            if (item == null){
                return {};
            };
            if (item && !key){
                throw new Error("There is local data but no key is set");
            }
            var sjcl = vv.data.Sjcl.getInstance();
            return qx.lang.Json.parse(
                sjcl.decrypt(key,item)
            );
        },
        clearData: function(){
            key = null;
            data = [];
            localStorage.removeItem(this.__storeName + '.data');
            localStorage.removeItem(this.__storeName + '.config');
        }
    }
});


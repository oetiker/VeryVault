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
qx.Class.define("vv.Vault",{
    extend : qx.core.Object,
    type: 'singleton',
    construct: function(){
        data = [];
        key = null;
        if (!localStorage){
            throw new Error("this browser does not support localStorage");
        }
    },
    members : {
        __storeName: "VeryVaultStore",
        setKey: function(p){
            key = p;
            this.__loadStore();
        },
        gotData: function (){
            return localStorage.getItem(this.__storeName) != null
        }
        setData: function (){
            if (!key){
                throw new Error("Key is not set. Can't store data.");
            }
            var sjcl = vv.Sjcl.getInstance();        
            localStorage.setItem(
                this.__storeName,
                sjcl.encrypt(
                    key,
                    qx.lang.Json.stringify(data)
                )
            );
        },
        getData: function (){
            var item = localStorage.getItem(this.__storeName);
            if (item == null){
                return data;
            };
            if (item && !key){
                throw new Error("There is local data but no key is set");
            }
            var sjcl = vv.Sjcl.getInstance();
            return = qx.lang.Json.parse(
                sjcl.decrypt(key,item)
            );
        },
        clearData: function(){
            key = null;
            data = [];
            localStorage.removeItem(this.__storeName);
        }
    },
    desctruct: function(){
        key = null;
        data = null;
    }
});


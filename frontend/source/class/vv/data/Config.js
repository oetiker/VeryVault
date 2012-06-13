/* ************************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Configuration holder object
 */

qx.Class.define("vv.data.Config",{
    extend : qx.core.Object,
    type: 'singleton',
    construct: function(){
        this.base(arguments);
    },
    events : {
        'ready': 'qx.event.type.Event'
    },
    members : {
        __config: null,
        load: function(){
            var vault = vv.data.Vault.getInstance();
            var that = this;
            if (window.navigator.onLine){
                var rpc = vv.data.Rpc.getInstance();            
                rpc.callAsyncSmart(function(ret){                
                    vault.setConfig(ret);
                    that.__config = ret;
                    that.fireEvent('ready');
                },'getConfig');
            }
            else {
                var config = vault.getConfig();
                if (config){
                    this.__config = config;
                    this.fireEvent('ready');
                } else {
                    vv.popup.MsgBox(this.tr('No Off Line Config'),this.tr('There is no off line copy of the configuration in cache. Get on line and re-start the app'));
                }
            }
        },
        getConfig: function(){
            return this.__config;
        }
    }
});


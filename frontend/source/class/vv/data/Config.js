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
        'config': 'qx.event.type.Event'
    },
    members : {
        __config: null,
        fetch: function(){
            var rpc = vv.data.Rpc.getInstance();
            var that = this;
            rpc.callAsyncSmart(function(ret){
                that.fireDataEvent('config',ret);
                that.__config = ret;
            },'getConfig');
        },
        getConfig: function(){
            return this.__config;
        }
    }
});


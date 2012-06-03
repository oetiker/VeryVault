/* ***********************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü

************************************************************************ */

/* ************************************************************************
#asset(vv/css/styles.css)
#asset(qx/mobile/icon/android/*)
#asset(qx/mobile/icon/ios/*)
************************************************************************ */

/**
 * This is the main application class of your custom application "vv"
 */
qx.Class.define("vv.Application",{
    extend : qx.application.Mobile,
    members : {
        main : function() {
            // Call super class
            this.base(arguments);
            var cfg = vv.data.Config.getInstance();
            cfg.addListenerOnce('config',function(e){
                // build interface
            },this);
            cfg.fetch();
        }        
    }
});


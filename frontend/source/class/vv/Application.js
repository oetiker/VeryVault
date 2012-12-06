/* ***********************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü

************************************************************************ */

/* ************************************************************************
#asset(vv/css/styles.css)
#asset(qx/mobile/icon/common/*)
#asset(qx/mobile/icon/android/*)
#asset(qx/mobile/icon/ios/*)
************************************************************************ */

/**
 * This is the main application class of your custom application "vv"
 */
qx.Class.define("vv.Application", {
    extend : qx.application.Mobile,

    members : {
        /**
         * TODOC
         *
         */
        main : function() {
            // Call super class
            this.base(arguments);

            // Add log appenders
            if (qx.core.Environment.get("qx.debug")) {
                qx.log.appender.Native;
                qx.log.appender.Console;
            }
            // initialize the manager
            var vault = vv.data.Vault.getInstance();
            vault.addListenerOnce('open', function() {
                vv.page.Overview.getInstance().show();
            }, this);
            vault.unlock();
        }
    }
});

/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(pws/css/styles.css)
#asset(qx/mobile/icon/android/*)
#asset(qx/mobile/icon/ios/*)
************************************************************************ */

/**
 * This is the main application class of your custom application "pws"
 */
qx.Class.define("pws.Application",{
    extend : qx.application.Mobile,
    members : {
        main : function() {
            // Call super class
            this.base(arguments);

            if (! localStorage ){
                alert("Application requires localStorage object");
                return;
            }

            // Enable logging in debug variant
            if (qx.core.Environment.get("qx.debug")) {
                // support native logging capabilities, e.g. Firebug for Firefox
                qx.log.appender.Native;
                // support additional cross-browser console. Press F7 to toggle visibility
                qx.log.appender.Console;
            }
            (new pws.Login()).show();
        }        
    }
});

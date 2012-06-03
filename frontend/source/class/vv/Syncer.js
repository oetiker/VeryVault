/* ************************************************************************
   Copyright: 2012 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü

************************************************************************ */

/**
 * Synchronize the locally stored data with the data on the server.
 */
qx.Class.define('vv.Syncer', {
    extend : qx.core.Object,
    type : "singleton",

    construct : function() {
        this.base(arguments);
    },

    members : {
    }
});

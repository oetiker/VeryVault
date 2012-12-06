/* ************************************************************************

   Copyrigtht: OETIKER+PARTNER AG
   License:    GPL V3 or later
   Authors:    Tobias Oetiker
   Utf8Check:  äöü

************************************************************************ */

/**
 * Display while the application is loading
 */
qx.Class.define("vv.page.Loading", {
    extend : qx.ui.mobile.page.NavigationPage,

    construct : function() {
        var layout = new qx.ui.mobile.layout.VBox().set({ alignY : 'middle' });
        this.base(arguments, layout);
        this.setTitle(this.tr('VeryVault'));
    },

    members : {
        /**
         * TODOC
         *
         */
        _initialize : function() {
            this.base(arguments);
            var title = new qx.ui.mobile.basic.Atom(this.tr("Loading VeryVault.<br/>One moment Please!"));
            title.addCssClass('largeLabel');
            this.add(title);
        }
    }
});

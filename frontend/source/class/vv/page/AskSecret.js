/* ************************************************************************

   Copyrigtht: OETIKER+PARTNER AG
   License:    GPL V3 or later
   Authors:    Tobias Oetiker
   Utf8Check:  äöü

************************************************************************ */

/**
 * A popup asking the user to provide association details.
 * Once successful the server will add our username to the
 * our encrypted and signed cookie
 */
qx.Class.define("vv.page.AskSecret", {
    extend : qx.ui.mobile.page.NavigationPage,

    construct : function() {
        var layout = new qx.ui.mobile.layout.VBox().set({ alignY : 'middle' });
        this.base(arguments, layout);

        this.set({
            title          : this.tr('Secret'),
            showBackButton : false
        });
    },

    events : {
        key   : 'qx.event.type.Data',
        reset : 'qx.event.type.Event'
    },

    members : {
        /**
         * TODOC
         *
         */
        _initialize : function() {
            this.base(arguments);
            var body = this.getContent();
            var info = new qx.ui.mobile.basic.Label(this.tr("VeryVault uses encryption to block unauthorized access to your data. Please enter your Secret!"));
            info.addCssClass('infoBlock');
            body.add(info);
            var formAccess = new qx.ui.mobile.form.Form();
            var vault = vv.data.Vault.getInstance();

            var secret = new qx.ui.mobile.form.PasswordField().set({
                placeholder : this.tr("secret"),
                required    : true
            });

            formAccess.add(secret, this.tr("Secret"));
            var formAccessWidget = new qx.ui.mobile.form.renderer.Single(formAccess);
            body.add(formAccessWidget);

            var unlock = new qx.ui.mobile.form.Button(this.tr("Unlock"));
            body.add(unlock);

            unlock.addListener("tap", function() {
                this.fireDataEvent('key', secret.getValue());
            }, this);

            var clear = new qx.ui.mobile.form.Button(this.tr("Clear Cached Data"));
            body.add(clear);

            clear.addListener("tap", function() {
                this.fireEvent('reset');
            }, this);

            this.addListener("stop", function() {
                formAccess.reset();
            });
        }
    }
});
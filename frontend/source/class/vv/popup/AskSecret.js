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
qx.Class.define("vv.popup.AskSecret", {
    extend : qx.ui.mobile.dialog.Dialog,

    construct : function() {
        this.base(arguments);
        this.set({
            title          : this.tr('Secret')
        });
        this._initialize();
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
        _initialize : function(body) {
            var layout = new qx.ui.mobile.layout.VBox(); // .set({ alignY : 'middle' });
            var body = new qx.ui.mobile.container.Composite(layout);
            this.add(body);
            var info = new qx.ui.mobile.basic.Label(this.tr("VeryVault uses encryption to block unauthorized access to your data. Please enter your Secret!"));
            info.addCssClass('infoBlock');
            body.add(info);
            var formAccess = new qx.ui.mobile.form.Form();

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
                this.hide();
            }, this);
        },
        /* positioning is a bit broken on 2.0.0 */
        show: function(){
            this.base(arguments);
            this._updatePosition();
            this._updatePosition();
            this._updatePosition();
            this._updatePosition();
        }
    }
});

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
        var layout = new qx.ui.mobile.layout.VBox().set({
            alignY: 'middle'
        });
        this.base(arguments,layout);
        this.set({
            title: this.tr('Secret'),
            showBackButton: false
        });
    },
    events : {
        'ready': 'qx.event.type.Event'
    },
    members: {
        _initialize: function (){
            this.base(arguments);
            var body = this.getContent();
            var info = new qx.ui.mobile.basic.Label(this.tr("VeryVault uses encryption to block unauthorized access to your data. Please enter your Secret!"));
            var formAccess = new qx.ui.mobile.form.Form();
            var vault = vv.data.Vault.getInstance();
            var secret = new qx.ui.mobile.form.PasswordField().set({
                placeholder:this.tr("secret"),
                required: true
            });
            formAccess.add(secret,this.tr("Secret"));
            var formAccessWidget = new qx.ui.mobile.form.renderer.Single(formAccess);
            body.add(formAccessWidget);

            var formNew = new qx.ui.mobile.form.Form();
            var secret1 = new qx.ui.mobile.form.PasswordField().set({
                placeholder:this.tr("your secret key"),
                required: true
            });
            formNew.add(secret1,this.tr("New Secret"));

            var secret2 = new qx.ui.mobile.form.PasswordField().set({
                placeholder:this.tr("enter the same secret again"),
                required: true
            });
            formNew.add(secret2,this.tr("New Secret (second time)"));
            var formNewWidget = new qx.ui.mobile.form.renderer.Single(formNew);
            body.add(formNewWidget);


            var unlock = new qx.ui.mobile.form.Button(this.tr("Unlock"));
            body.add(unlock);
            unlock.addListener("tap", function(){
                if (vault.unlock(secret.getValue())){
                    this.fireEvent('ready');
                }
                else {
                    vv.popup.MsgBox.getInstance().warn(this.tr('Wrong Key'),this.tr('The key does not work. Try again.'));
                    formAccess.reset();
                }
            },this);

            var clear = new qx.ui.mobile.form.Button(this.tr("Clear Cached Data"));
            body.add(clear);
            clear.addListener("tap", function(){
                vault.clearData();
                this.start();
            },this);

            var create = new qx.ui.mobile.form.Button(this.tr("Create Secret Store"));
            body.add(create);

            create.addListener("tap", function(){
                var sa = secret1.getValue();
                var sb = secret2.getValue();
                if (sa && sa == sb){
                    vault.unlock(sa);
                    this.fireEvent('ready');
                } else {
                    vv.popup.MsgBox.getInstance().warn(this.tr('Keys do not match'),this.tr('Make sure to enter the same key twice.'));
                    formNew.reset();
                }
            },this);

            this.addListener("stop",function(){
                formAccess.reset();
                formNew.reset();
            });

            this.addListener("start",function(){
                if (vault.isEmpty()){
                    formAccessWidget.exclude();
                    formNewWidget.show();
                    unlock.exclude();
                    clear.exclude();
                    create.show();
                }
                else {
                    formAccessWidget.show();
                    formNewWidget.exclude();
                    unlock.show();
                    clear.show();
                    create.exclude();
                }
            });

            if (qx.core.Environment.get("qx.debug")) {
                ['os.name','browser.name'].forEach(function(key){
                    body.add(new qx.ui.mobile.basic.Label(key + ': '+qx.core.Environment.get(key)));
                });
            }

        }
    }
});

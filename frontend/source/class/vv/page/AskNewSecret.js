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
qx.Class.define("vv.page.AskNewSecret", {
    extend : qx.ui.mobile.page.NavigationPage,
    construct : function() {
        var layout = new qx.ui.mobile.layout.VBox().set({
            alignY: 'middle'
        });
        this.base(arguments,layout);
        this.set({
            title: this.tr('New Secret'),
            showBackButton: false
        });
    },   
    events: {
        key: 'qx.event.type.Data'
    },
    members: {        
        _initialize: function (){
            this.base(arguments);
            var body = this.getContent();
            var info = new qx.ui.mobile.basic.Label(this.tr("VeryVault uses encryption to block unauthorized access to your data. Please enter your Secret!"));
            info.addCssClass('infoBlock');
            body.add(info);
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

            var create = new qx.ui.mobile.form.Button(this.tr("Create Secret Store"));
            body.add(create);

            create.addListener("tap", function(){
                var sa = secret1.getValue();
                var sb = secret2.getValue();
                if (sa && sa == sb){
                    this.fireDataEvent('key', sa);
                } else {
                    vv.popup.MsgBox.getInstance().warn(this.tr('Keys do not match'),this.tr('Make sure to enter the same key twice.'));
                    formNew.reset();
                }
            },this);

            this.addListener("stop",function(){
                formNew.reset();
            });
        }
    }
});

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
qx.Class.define("vv.popup.Associate", {
    extend : qx.ui.mobile.dialog.Dialog,
    type : "singleton",

    construct : function() {
        var box = new qx.ui.mobile.container.Composite(
            new qx.ui.mobile.layout.VBox('left')
        );

        var form = new qx.ui.mobile.form.Form();
        var email = new qx.ui.mobile.form.TextField().set({
            placeholder:this.tr("eMail"),
            required: true
        });
        form.add(email,this.tr("eMail"));

        var password = new qx.ui.mobile.form.PasswordField().set({
            placeholder:this.tr("Password"),
            required: true
        });
        form.add(password,this.tr("Password"));
        
        box.add(new qx.ui.mobile.form.renderer.Single(form));
        var submit = new qx.ui.mobile.form.Button("Associate");
        box.add(submit);
        
        submit.addListener("tap", function(){
            var rpc = vv.data.Rpc.getInstance();
            var pop = vv.popup.MsgBox.getInstance();
            var that = this;
            rpc.callAsync(function(ret,exc){
                if (exc){
                    pop.addListenerOnce('disappear',function(){
                        that.show();
                    });
                    pop.exc(exc);                   
                }
                else {
                    that.hide();
                    that.fireEvent('associated');
                    pop.info(
                        that.tr("Success"),
                        that.tr("Your VeryVault instance is now properly associated.")
                    );
                }
            },'associate',email.getValue(),password.getValue());
        },this);
        this.base(arguments,box);
        this.set({
            title: 'Associate',
            modal: true
        });
    },
    events : { 
        'associated' : 'qx.event.type.Event' 
    }
});

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
qx.Class.define("vv.page.Associate", {
    extend : qx.ui.mobile.page.NavigationPage,
    type : "singleton",

    construct : function() {
        var layout = new qx.ui.mobile.layout.VBox();
        this.base(arguments,layout);
        this.set({
            title: this.tr('Associate'),
            showBackButton: false
        });
    },
    members: {
        _initialize: function (){
            this.base(arguments);
            var body = this.getContent();
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
        
            body.add(new qx.ui.mobile.form.renderer.Single(form));
            var submit = new qx.ui.mobile.form.Button("Associate");
            body.add(submit);
            
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
        }
    },
    events : { 
        'associated' : 'qx.event.type.Event' 
    }
});

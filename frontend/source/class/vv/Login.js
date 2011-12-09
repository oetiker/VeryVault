/* ************************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
************************************************************************ */

/**
 * This is the main application class of your custom application "vv"
 */
qx.Class.define("vv.Login",{
    extend : qx.ui.mobile.page.NavigationPage,

    construct: function(){
        this.base(arguments);
        this.set({
            title: "VeryVault"
        });
        this.addListener("initialize", this._setupPage,this);
    },

    members : {
        __model: null,
        __controller: null,
        __form: null,
        __clearBtn: null,
        __status: null,
        _setupPage: function() {
            var vault = vv.Vault.getInstance();
            var initStore = vault.countNotes() == 0;

            var form = this.__form = new qx.ui.mobile.form.Form();
            var password = new qx.ui.mobile.form.PasswordField();
            password.setRequired(true);
            form.add(password,"Enter your key",null,'password');

            if (initStore){
                var manager = form.getValidationManager();
                var password2 = new qx.ui.mobile.form.PasswordField();
                password2.setRequired(true);
                form.add(password2,"Enter your key again",null,'password2');
                manager.setValidator(function(items){
                    var valid = password.getValue() == password2.getValue();
                    if (!valid){
                        var message = "Passwords must be equal.";
                        password.setInvalidMessage(message);
                        password2.setInvalidMessage(message);
                        password.setValid(false);
                        password2.setValid(false);
                    }                
                    return valid;
                });
            }
            var text = initStore ? "Setup Encrypted Store" : "Unlock Notes";

            var login = new qx.ui.mobile.form.Button(text).set({
                enabled: false
            });
            login.addListener("tap",this._login,this);

            this.__controller = new qx.data.controller.Form(null, form, true);            
            this.__model = this.__controller.createModel();
            var content = this.getContent();
            content.add(new qx.ui.mobile.form.renderer.SinglePlaceholder(form));
            content.add(login);            
            this.__status = new vv.AppCacheStatus(login);
            content.add(this.__status);
            var clear = this.__clearBtn = new qx.ui.mobile.form.Button("Delete existing Notes").set({
                visibility: 'excluded'
            });
            content.add(clear);
            clear.addListener("tap",function(){
                vv.Vault.getInstance().removeAll();                
                location.reload();
            },this);
        },
        _login: function(e){
            // with out manual update it seems we are not getting data
            // from the last entry edited before tapping the unlock
            // button.
            this.__controller.updateModel();            
            if (this.__form.validate()){                    
                var pass = this.__model.getPassword();
                var vault = vv.Vault.getInstance();
                vault.login(pass);
                try {
                    if (vault.countNotes() > 0){
                        vault.getNoteById(0);
                    }
                } catch (err){
                    if (err.message == "ccm: tag doesn't match"){
                        this.__status.setValue("Invalid Key. Try Again.");
                        this.__clearBtn.setVisibility('visible');
                    }
                    else {
                        window.alert(err);
                    }
                    return;
                }
                // do not keep this pw around too long
                var listPage = new vv.List();
                listPage.show();
            }
        }
    }
});


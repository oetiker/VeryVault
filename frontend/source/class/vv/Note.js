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
qx.Class.define("vv.Note", {
    extend : qx.ui.mobile.page.NavigationPage,

    construct : function() {
        this.base(arguments);

        this.set({
            title          : "Note",
            showBackButton : true,
            backButtonText : "Back"
        });

        this.addListener("initialize", this._setupPage, this);
        this.addListener("start", this._prepForm, this);
    },

    properties : { key : { nullable : true } },

    members : {
        __model : null,
        __form : null,
        __controller : null,


        /**
         * TODOC
         *
         */
        _setupPage : function() {
            var form = this.__form = new qx.ui.mobile.form.Form();

            var subject = new qx.ui.mobile.form.TextField();

            // subject.setRequired(true);
            form.add(subject, "Subject", null, 'subject');

            var body = new qx.ui.mobile.form.TextArea();

            // body.setRequired(true);
            form.add(body, "Body", null, 'body');

            var save = new qx.ui.mobile.form.Button("Save");
            save.addListener("tap", this._onBackButtonTap, this);

            var del = new qx.ui.mobile.form.Button("Delete");
            del.addListener("tap", this.deleteNote, this);

            this.__controller = new qx.data.controller.Form(null, form, true);
            this.__model = this.__controller.createModel();

            var content = this.getContent();
            content.add(new qx.ui.mobile.form.renderer.SinglePlaceholder(this.__form));
            content.add(save);
            content.add(del);
        },


        /**
         * TODOC
         *
         * @param e {Event} TODOC
         */
        _onBackButtonTap : function(e) {
            if (this.saveNote()) {
                this.back();
            }
        },


        /**
         * TODOC
         *
         * @param e {Event} TODOC
         * @return {boolean} TODOC
         */
        saveNote : function(e) {
            this.__controller.updateModel();
            var model = this.__model;
            var vault = vv.Vault.getInstance();

            if (this.__form.validate()) {
                var key = vault.saveNote({
                    key     : this.getKey(),
                    body    : model.getBody(),
                    subject : model.getSubject()
                });

                this.setKey(key);
                return true;
            }

            return true;
        },


        /**
         * TODOC
         *
         * @param e {Event} TODOC
         */
        deleteNote : function(e) {
            var key = this.getKey();

            if (key) {
                var vault = vv.Vault.getInstance();
                vault.removeNoteByKey(key);
            }

            this.back();
        },


        /**
         * TODOC
         *
         */
        _prepForm : function() {
            var model = this.__model;

            //          this.__form.reset();
            //          this.__form.getValidationManager().reset();
            var key = this.getKey();

            if (key) {
                var note = vv.Vault.getInstance().getNoteByKey(key);

                model.set({
                    body    : note.body,
                    subject : note.subject
                });
            }
            else {
                model.set({
                    body    : null,
                    subject : null
                });
            }
        }
    }
});
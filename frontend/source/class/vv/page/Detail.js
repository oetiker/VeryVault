/* ************************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
// #asset(qx/icon/Tango/22/*)
************************************************************************ */

/**
 * This is the main application class of your custom application "vv"
 */
qx.Class.define("vv.page.Detail", {
    extend : qx.ui.mobile.page.NavigationPage,

    construct : function(itemType) {
        this.base(arguments);
        this.__type = itemType;
        this.__cfg = vv.data.Vault.getInstance().getConfig();
        var item = this.__itemCfg = this.__cfg.items[itemType];

        this.set({
            title          : item.name,
            showButton     : false,
            showBackButton : true,
            backButtonText : this.tr('Overview')
        });
    },

    members : {
        __type : null,
        __cfg : null,
        __itemCfg : null,


        /**
         * TODOC
         *
         */
        _initialize : function() {
            this.base(arguments);
            var body = this.getContent();
            var form = new qx.ui.mobile.form.Form();
            var search = new qx.ui.mobile.form.TextField().set({ required : true });
            form.add(search, this.tr("Search"));
            body.add(new qx.ui.mobile.form.renderer.SinglePlaceholder(form));
            var list = this.__list = this._makeList();
            body.add(list);
        },


        /**
         * TODOC
         *
         */
        _start : function() {
            var vault = vv.data.Vault.getInstance();

            vault.getItems(this.__type, function(data) {
                this.__list.setModel(model);
            }, this);
        },

        // ...
        /**
         * TODOC
         *
         * @return {var} TODOC
         */
        _makeList : function() {
            return new qx.ui.mobile.list.List({
                configureItem : function(item, model, row) {
                    item.set({
                        title      : this.__itemCft.list_js(model.getItem(row)),
                        selectable : true,
                        showArrow  : true
                    });
                }
            });
        }
    }
});
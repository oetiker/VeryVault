/* ************************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/*)
************************************************************************ */

/**
 * This is the main application class of your custom application "vv"
 */
qx.Class.define("vv.page.Overview", {
    extend : qx.ui.mobile.page.NavigationPage,
    type : 'singleton',

    construct : function() {
        this.base(arguments);
        var mgr = vv.page.Manager.getInstance();
        this.set({
            title      : this.tr("VeryVault"),
            showButton : false
        });
        mgr.addMaster(this);
        this.__detailPages = {};
    },

    members : {
        __detailPages : null,
        __model : null,


        /**
         * TODOC
         *
         */
        _initialize : function() {
            this.base(arguments);
            var body = this.getContent();
            var list = this._makeList();
            body.add(list);
        },


        /**
         * TODOC
         *
         * @return {var} TODOC
         */
        _makeList : function() {
            var model = this.__model = new qx.data.Array();

            var list = new qx.ui.mobile.list.List({
                configureItem : function(item, model, row) {
                    item.set({
                        image      : "qx/icon/Tango/22/" + model.icon + ".png",
                        title      : model.title,
                        selectable : true,
                        showArrow  : true
                    });
                }
            }).set({ model : model });

            var cfg = vv.data.Vault.getInstance().getConfig();

            cfg.itemList.forEach(function(key, i) {
                var item = cfg.items[key];

                model.push({
                    icon  : item.icon,
                    title : item.name,
                    key   : key
                });
            });

            list.addListener("changeSelection", this._showDetailPage, this);
            return list;
        },


        /**
         * TODOC
         *
         * @param e {Event} TODOC
         */
        _showDetailPage : function(e) {
            var id = e.getData();
            var key = this.__model.getItem(id).key;
            var page = this.__detailPages[key];

            if (page == null) {
                page = this.__detailPages[key] = new vv.page.Detail(key);

                page.addListener('back', function() {
                    this.show({ reverse : true });
                }, this);
            }

            page.show();
        }
    }
});

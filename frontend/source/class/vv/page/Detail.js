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
qx.Class.define("vv.page.Detail",{
    extend : qx.ui.mobile.page.NavigationPage,

    construct: function(key){    
        this.base(arguments);
        this.__key = key;
        this.__cfg =  vv.data.Vault.getInstance().getConfig();
        var item = this.__item = this.__cfg.items[key];
        this.set({
            title: item.name,
            showButton: false,
            showBackButton: true,
            backButtonText: this.tr('Overview')
        });
    },
    properties: {
        model: {}
    },
    members : {
        __key: null,
        __cfg: null,
        __item: null,
        _initialize: function() {
            this.base(arguments);
            var body = this.getContent();
            var form = new qx.ui.mobile.form.Form();
            var search = new qx.ui.mobile.form.TextField().set({
                required: true
            });
            form.add(search,this.tr("Search"));
            body.add(new qx.ui.mobile.form.renderer.SinglePlaceholder(form));
            var list = this._makeList();
            body.add(list);
        },
        _start: function(){
            var model = this.getModel();
            var cfg = this.__cfg;
            // ...
        },
        _makeList: function(){
            this.setModel(new qx.data.Array());            
            var list = new qx.ui.mobile.list.List({
                configureItem : function(item, model, row) {
                    item.set({
                        title: model.title,
                        selectable: true,
                        showArrow: true
                    });
                }
            }).set({
                model: this.getModel()
            });
            return list;
        }
    }
});

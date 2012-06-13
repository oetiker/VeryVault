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
qx.Class.define("vv.page.Overview",{
    extend : qx.ui.mobile.page.NavigationPage,
    type: 'singleton',
    construct: function(){
        this.base(arguments);
        this.set({
            title: this.tr("VeryVault"),
            showButton: false
        });
    },
    members : {
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
        _makeList: function(){
            var model = new qx.data.Array();            
            
            var list = new qx.ui.mobile.list.List({
                configureItem : function(item, model, row) {
                    item.set({
                        image: "qx/icon/Tango/22/"+model.icon+".png",
                        title: model.title,
                        selectable: true,
                        showArrow: true
                    });
                }
            }).set({
                model: model
            });

            var cfg = vv.data.Config.getInstance().getConfig();
            cfg.itemList.forEach(function(key,i){
                var item = cfg.items[key];
                model.push({
                    icon: item.icon,
                    title: item.name,
                    key: key
                });
            });
            list.addListener("changeSelection",function(e){
                var id = e.getData();
                var key = model.getItem(id).key;
            },this);
            return list;
        }
    }
});

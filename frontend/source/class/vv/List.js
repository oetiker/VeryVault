/* ************************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/apps/internet-mail.png)
************************************************************************ */

/**
 * This is the main application class of your custom application "vv"
 */
qx.Class.define("vv.List",{
    extend : qx.ui.mobile.page.NavigationPage,
    construct: function(){
        this.__model = new qx.data.Array();
        var notePage = this.__notePage = new vv.Note();

        this.base(arguments);
        this.set({
            title: "Notes",
            showButton: true,
            buttonText: "New Note"
        });
        notePage.addListener("back", function() {
            this.show({
                reverse:true
            });
        },this);
        this.addListener("initialize", this._pageSetup,this);
        this.addListener("action", this._newNote, this);
        this.addListener("start", this._fillList, this);
    },
    members : {
        __notePage: null,
        _newNote: function(e){
            var notePage = this.__notePage;
            notePage.resetKey();
            notePage.show();
        },
        _pageSetup: function() {
            var notePage = this.__notePage;
            var list = new qx.ui.mobile.list.List({
                configureItem : function(item, model, row) {
                    item.set({
                        image: "qx/icon/Tango/22/apps/internet-mail.png",
                        title: model.subject || 'no subject',
                        selectable: true,
                        showArrow: true
                    });
                }
            }).set({
                model: this.__model
            });

            list.addListener("changeSelection",function(e){
                var id = e.getData();
                var selected = this.__model.getItem(id);
                notePage.setKey(selected.key);
                notePage.show();
            },this);
            this.getContent().add(list);            
        },
        _fillList: function(){
            var vault = vv.Vault.getInstance();
            var model = this.__model; 
            model.removeAll();           
            var len = vault.countNotes();
            if (len == 0){
                var pm = qx.ui.mobile.page.Page.getManager();
                pm.addListenerOnce('animationEnd',this._newNote,this);
            }
            for (var i = 0;i<len;i++){
                var note = vault.getNoteById(i);
                // skip notes without key
                if (!note.key){
                    continue;
                }
                model.push({
                    subject: note.subject,
                    key: note.key
                });
            }
            model.sort(function(a, b){  
                return ( a.subject < b.subject ? -1 : a.subject > b.subject ? 1 : 0 );
            });
        }  
    }
});

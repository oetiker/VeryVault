/* ************************************************************************

   Copyrigtht: OETIKER+PARTNER AG
   License:    GPL V3 or later
   Authors:    Tobias Oetiker
   Utf8Check:  äöü

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/status/dialog-error.png)
#asset(qx/icon/Tango/22/status/dialog-information.png)
#asset(qx/icon/Tango/22/status/dialog-warning.png)
************************************************************************ */

/**
 * A status window singelton. There is only one instance, several calls to
 * open will just change the windows content on the fly.
 *
 * <pre code='javascript'>
 * var msg = vv.MsgBox.getInstance();
 * msg.error('Title','Message');
 * </pre>
 */
qx.Class.define("vv.popup.MsgBox", {
    extend : qx.ui.mobile.dialog.Dialog,
    type : "singleton",

    construct : function() {
        var box = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
        var lb = this.__label = new qx.ui.mobile.basic.Label();
        box.add(lb);
        var bt = this.__btn = new qx.ui.mobile.form.Button(this.tr('Ok'));        
        box.add(bt);
        bt.addListener("tap", function(){
            this.hide();
            this.__showNext();
        },this);
        this.base(arguments,box);
        this.__queue = [];
        this.hide();
    },
    members : {
        __label : null,
        __btn : null,
        __queue: null,
        __showNext: function(){
            if (this.__queue.length > 0 && ! this.isVisible() ){
                var item = this.__queue.shift();
                this.setTitle(String(item.title));
                this.setIcon(item.icon);
                this.__label.setValue(item.text);    
                this.show();
            }
        },
        /**
         * Open the message box
         *
         * @param title {String} window title
         * @param text {String} contents
         * @return {void} 
         */
        __show : function(icon, title, text) {
            this.__queue.push({
                icon: icon,
                title: title,
                text: text
            });
            this.__showNext();
        },


       /**
         * Open the Error popup
         *
         * @param title {String} title
         * @param text {String} body
         * @return {void} 
         */
        error : function(title, text) {
            this.__show("qx/icon/Tango/22/status/dialog-error.png",title,text);
        },


        /**
         * Show server error message
         *
         * @param exc {Map} callAsync exception
         * @return {void} 
         */
        exc : function(exc) {
            this.__show("qx/icon/Tango/22/status/dialog-error.png",
                        this.tr('RPC Error %1', exc.code), 
                        this.tr('%1 (Error Code %2)', exc.message, exc.code)
            );
        },


        /**
         * Open the Info popup
         *
         * @param title {String} title
         * @param text {String} body
         * @return {void} 
         */
        info : function(title, text) {
            this.__show("qx/icon/Tango/22/status/dialog-information.png",title,text);
        },


        /**
         * Open the Warning popup with optional callback
         *
         * @param title {String} window title
         * @param text {String} content
         * @return {void} 
         */
        warn : function(title, text) {
            this.__show("qx/icon/Tango/22/status/dialog-warning.png",title,text);
        }
    }
});

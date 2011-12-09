/* ************************************************************************
   Copyright: 2011 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
************************************************************************ */

/**
 * This is the main application class of your custom application "pws"
 */
qx.Class.define("pws.AppCacheStatus",{
    extend : qx.ui.mobile.form.Title,

    construct: function(button){
        this.base(arguments,"Status:");
        var ac = window.applicationCache;
        if (! ac || ac.status == ac.UNCACHED ){
            this.setValue("Status: running live copy");
            button.setEnabled(true);
            return;
        }
        if (!window.navigator.onLine){
            this.setValue("Status: running offline copy");
            button.setEnabled(true);
            return;
        }
        if ( ac.status == ac.IDLE ){
             this.setValue("Status: running cached copy");
            button.setEnabled(true);
            return;
        }
        var infoMap = {
            checking: { m: 'checking for update ...', a: 'progress' },
            noupdate: { m: 'application up to date', a: 'login' },
            downloading: {m: 'downloading update ...', a: 'progress' },
            cached: { m: 'application cache ready', a: 'login' },
            updateready: { m:'update is ready ...', a: 'reload' },
            obsolete: { m: 'cache obsolete ...', a:  'login' },
            error: { m: 'fetch failure ...', a: 'login' }
        };
        var that = this;
        for (var key in infoMap){ (function(){
            var status = 'Status: '+infoMap[key].m;
            var action = infoMap[key].a;
            ac.addEventListener(key, function(e){
                that.setValue(status);
                switch(action){
                    case 'login':
                        button.setEnabled(true);
                        break;
                    case 'reload':
                        location.reload();
                        break;                
                }
            });
        })()}
    }
});


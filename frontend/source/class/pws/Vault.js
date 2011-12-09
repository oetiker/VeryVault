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

// realy make this private
var pass;

qx.Class.define("pws.Vault",{
    extend : qx.core.Object,
    type: 'singleton',
    
    members : {
        login: function(p){
            pass = p;
        },
        countNotes: function(){
            return localStorage.length;
        },
        getNoteById: function(id){
            var key = localStorage.key(id);
            return this.getNoteByKey(key);
        },
        getNoteByKey: function(key){
            var sjcl = pws.Sjcl.getInstance();
            var note = qx.lang.Json.parse(sjcl.decrypt(pass, localStorage.getItem(key)));
            return note;
        },
        saveNote: function(note){
            var sjcl = pws.Sjcl.getInstance();
            note.update = new Date().getTime();
            if (! note.key){
                note.key = 'pws.' + sjcl.hash(note.subject + note.body + note.update);
            }
            localStorage.setItem(note.key,sjcl.encrypt(pass,qx.lang.Json.stringify(note)));
            return note.key;
        },
        removeNoteByKey: function(key){
            localStorage.removeItem(key);
        },
        removeAll: function(){
            var len = this.countNotes();
            for (var i = len-1; i>=0;i--){
                var key = localStorage.key(i);
                localStorage.removeItem(key);
                console.log('removing ' + key);
            }
        }        
    }
});


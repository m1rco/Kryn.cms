var admin_system_module_add = new Class({
    initialize: function(pWin){
        this.win = pWin;
        this.checkName( this.win.params.name );
    },

    checkName: function( pName ){
        this.win.content.empty();
        new Element('div', {
            style: 'color: gray; text-align: center; padding: 5px;',
            html: _('Checking extensioncode: ')+pName+'<br />'+_('Please wait ...')
        }).inject( this.win.content );

        new Request.JSON({url: _path+'admin/system/module/addCheckCode', noCache: 1, onComplete: function(res){
            if( res['status'] == 'exist' ){
                this.win._prompt(_('Extensioncode already in use. Please choose another:'), pName, function(res){
                    if(!res){ this.win.close(); return;}
                    this.checkName( res );
                }.bind(this));
            }
            if( res['status'] == 'ok' ){
                this.win.content.empty();
                new Element('h3', {
                    html: _('Valid extensioncode.'),
                    style: 'color: green'
                }).inject( this.win.content );
                var d = new Element('div', {
                    style: 'color: gray;padding: 5px 2px;',
                    html: _('Extensions folders created.')
                }).inject( this.win.content );

                new Element('div', {
                    text: 'inc/modules/'+pName
                }).inject( d );
                new Element('div', {
                    text: 'inc/modules/'+pName+'/config.json'
                }).inject( d );
                new Element('div', {
                    text: 'inc/template/'+pName
                }).inject( d );

                new ka.Button(_('Open extension editor'), function(){
                    ka.wm.open('admin/system/module/edit', {name: pName});
                }).inject( d );

            }
        }.bind(this)}).post({name: pName});

    }
});

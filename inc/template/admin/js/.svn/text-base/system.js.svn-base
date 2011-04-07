var admin_system = new Class({
    initialize: function( pWindow ){
        this.win = pWindow;
        this.loadInfos();
    },
    
    loadInfos: function(){
        var _this = this;
        new Request.JSON({url: _path+'admin/system/', noCache: 1, onComplete: function(res){
            _this.infos = res;
            _this._createLayout();
        }}).get();
    },
    
    _createLayout: function(){
        this.content = new Element('div', {
            html: '<h3>Kryn.cms 0.9</h3>'+
            '<br />Core version: '+(ka.settings.configs.kryn.version)+'<br /><br />'+
            '<b style="color: gray;">'+_('License')+'</b><br />'+
            'Free (noncommercial)<br /><br />'+
            '<b style="color: gray;">'+_('Support')+'</b><br />'+
            _('Forum')+': <a href="http://forum.kryn.org" target="_blank">forum.kryn.org</a><br />'+
            _('Email')+': <a href="mailto:support@kryn.org">support@kryn.org</a><br />'+
            _('Wiki')+': <a href="http://wiki.kryn.org" target="_blank">wiki.kryn.org</a><br /><br />'+
            '<div>&copy; <a target="_blank" href="http://www.kryn.org">www.kryn.org</a>. All Rights Reserved.<br />'+
            _('Kryn.cms is a product by <a target="_blank" href="http://www.krynlabs.com/">Kryn.labs</a>')+'</div>',
            styles: {
                'text-align': 'center'
            }
        }).inject( this.win.content );
    }
});


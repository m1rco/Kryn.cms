var admin_system_settings = new Class({
    
	systemValues: {},
	
    initialize: function( pWin ){

        this.win = pWin;
        this.preload();

    },

    preload: function(){

        this.tabGroup = this.win.addSmallTabGroup();
        this.tabButtons = $H();
        this.tabButtons['general'] = this.tabGroup.addButton(_('General'), this.changeType.bind(this,'general'));
        this.tabButtons['system'] = this.tabGroup.addButton(_('System'), this.changeType.bind(this,'system'));;
        this.tabButtons['database'] = this.tabGroup.addButton(_('Database'), this.changeType.bind(this,'database'));
        this.tabButtons['caching'] = this.tabGroup.addButton(_('Caching'), this.changeType.bind(this,'caching'));

//       this.tabButtons['install'] = this.tabGroup.addButton('Neue installieren', '', this.changeType.bind(this,'install'));

        this.saveGrp = this.win.addButtonGroup();
        this.saveButton = this.saveGrp.addButton( _('Save'), _path+'inc/template/admin/images/button-save.png', this.save.bind(this));

        this.panes = {};
        this.tabButtons.each(function(item,key){
	        this.panes[key] = new Element('div', {
	            'class': 'admin-system-settings-pane',
	            lang: key
	        }).inject( this.win.content );
        }.bind(this))

        this.loader = new ka.loader().inject( this.win.content );

        this.loader.show();

        new Request.JSON({url: _path+'admin/system/settings/preload', noCache: 1, onComplete: function(res){
            this.langs = res.langs;
            this.timezones = [];
            res.timezones.each(function(timezone){
                this.timezones.include({l: timezone});
            }.bind(this));
            this._createLayout();
            this.load();
        }.bind(this)}).post();
    },

    _createLayout: function(){

//        this.panes['install'] = new Element('div', {
//            'class': 'admin-system-module-pane'
//        }).inject( this.win.content );


        this.fields = {};

        var p = this.panes['general'];
        this.fields['systemtitle'] = new ka.field({
            label: _('System title'), desc: 'Adds a title to the administration titel'
        }).inject( p );
        
        this.fields['sessiontime'] = new ka.field({
            label: _('Session timeout'), empty: false
        }).inject( p );

        this.fields['communityEmail'] = new ka.field({
            label: _('Community connect'), desc: _('If you want to develop your own extensions, layoutpacks or other stuff, you have to connect with the community server. Enter your community email to connect with.')
        }).inject( p );

        this.fields['languages'] = new ka.field({
            label: _('Languages'), desc: _('Limit the language selection. (systemwide)'), empty: false,
            type: 'select', size: 10,
            multiple: true, tableItems: this.langs, table_key: 'rsn', table_label: 'title'
        }).inject(p);

        this.changeType( 'general' );
        
        var p = this.panes['system'];
        
        this.fields['display_errors'] = new ka.field({
            label: _('Display errors'), desc: _('Prints errors to the frontend clients. You should deactivate this in productive systems'), type: 'checkbox'
        }).inject( p );
        
        this.fields['log_errors'] = new ka.field({
            label: _('Log errors'), desc: _('Log all errors into specified (below) file'), type: 'checkbox'
        }).inject( p );
        
        this.fields['log_errors_file'] = new ka.field({
            label: _('Log errors target'), desc: _('If Log errors is activated, all errors will be written in this file. Example: inc/kryn.log')
        }).inject( p );
      
        
        this.fields['timezone'] = new ka.field({
            label: _('Server timezone'), type: 'select', tableItems: this.timezones, table_key: 'l', table_label: 'l'
        }).inject( p );
        
        var p = this.panes['database'];
        
        this.fields['db_type'] = new ka.field({
            label: _('Database type'), empty: false, type: 'select',
            tableItems: [
                {i: 'mysql', v:'MySQL'},
                {i: 'postgresql', v:'PostgreSQL'},
                {i: 'sqlite', v:'SQLite'}
            ],
            table_id: 'i',
            table_label: 'v'
        }).inject( p );
        
        this.fields['db_server'] = new ka.field({
            label: _('Database server'), desc:_('Example: localhost'), empty: false
        }).inject( p );
        
        this.fields['db_user'] = new ka.field({
            label: _('Database login'), empty: false
        }).inject( p );
        
        this.fields['db_passwd'] = new ka.field({
            label: _('Database password'), type: 'password'
        }).inject( p );
        
        this.fields['db_name'] = new ka.field({
            label: _('Database name'), empty: false
        }).inject( p );
        
        this.fields['db_prefix'] = new ka.field({
            label: _('Database prefix'), empty: false
        }).inject( p );
        
        this.fields['db_forceutf8'] = new ka.field({
            label: _('Force UTF8'), desc: _('If your mysql does not use utf8 as default, enable force utf8'), type: 'checkbox'
        }).inject( p );
        
        

        var p = this.panes['caching'];
        
        
        this.fields['template_cache'] = new ka.field({
        	label: _('Template cache path'), desc: 'Default is inc/tcache/. This folder is for caching template files, so it should be available via HTTP.'
        }).inject( p );
        
        this.fields['caching_type'] = new ka.field({
            label: _('Internal caching type'), desc: _('Internal data caching.'), empty: false, type: 'select',
            tableItems: [
                {i: 'files', v:'Files'},
                {i: 'memcache', v:'Memcache'}
            ],
            table_id: 'i',
            table_label: 'v'
        })
        .addEvent('change', function(){
        	
        	this.chachingPane.empty();

        	this.fields['memcache_server'] = null;
        	this.fields['memcache_port'] = null;
        	this.fields['memcache_files'] = null;
        	
        	if( this.fields['caching_type'].getValue() == 'memcache' ){
        		
        		 this.fields['memcache_server'] = new ka.field({
    	            label: _('Memcache Server'), value: this.systemValues['memcache_server'],
	   	            empty: false
    	        }).inject( this.chachingPane );
        		 
        		 this.fields['memcache_port'] = new ka.field({
     	            label: _('Memcache Port'), value: this.systemValues['memcache_port'],
	   	            empty: false,
     	            desc: 'Default is 11211', 'default': '11211', type: 'integer'
     	        }).inject( this.chachingPane );
        		
        	}
        	if( this.fields['caching_type'].getValue() == 'files' ){
        		
        		if( !this.systemValues['files_path'] )
        			this.systemValues['files_path'] = 'inc/cache/';
        		
	       		this.fields['files_path'] = new ka.field({
	   	            label: _('Internal caching path'), value: this.systemValues['files_path'],
	   	            empty: false,
	   	            desc: 'Default is inc/cache/. Please define the path for the cache folder.'
	   	        }).inject( this.chachingPane );
	       	}
        	
        	
        	
        	
        }.bind(this))
        .inject( p );
        
        this.chachingPane = new Element('div').inject( p );
        
        this.fields['caching_type'].fireEvent('change');
        
    },

    changeType: function( pType ){
        this.tabButtons.each(function(button, id){ 
            button.setPressed( false );
            this.panes[id].setStyle('display', 'none');
        }.bind(this));
        this.tabButtons[ pType ].setPressed(true);
        this.panes[ pType ].setStyle('display', 'block');
    },

    load: function(){
        if( this.lr )
            this.lr.cancel();

        this.loader.show();


        this.lr = new Request.JSON({url: _path+'admin/system/settings/loadSettings', noCache: 1, onComplete: function(res){

        	this.systemValues = res.system;
            $H(this.fields).each(function(field,key){
            	if( !field ) return;
            	
                if( res.system[key] )
                    field.setValue(res.system[key]);
                if( key == 'caching_type' )
                	field.fireEvent('change');
            });
            this.oldCommunityEmail = res.system['communityEmail'];
            
            var langs = [];
            $H(res.langs).each(function(l,k){
                langs.include(l.rsn+'');
            });
            this.fields['languages'].setValue(langs);
            

            this.loader.hide();
        }.bind(this)}).post();
    },

    save: function(){
        var req = new Hash();
        var dontGo = false;
        
        $H(this.fields).each(function(field,key){
        	if( !field ) return;
            if( dontGo ) return;
            logger(key);
            if( !field.isOk() ){
                dontGo = true;
                var parent = field.main.getParent();
                if( !parent.get('lang') )
                	parent = field.main.getParent().getParent();
                
                this.changeType( parent.get('lang') );
            }
            req.set(key, field.getValue());
        }.bind(this));
        
        if( dontGo ) return;
        
        this.saveButton.startTip( _('Saving ...') );

        this.loader.show();

        if( this.ls )
            this.ls.cancel();

        this.ls = new Request.JSON({url: _path+'admin/system/settings/saveSettings', noCache: 1, onComplete: function(r){
            if( r.needPw ){
                this.saveButton.startTip( _('Wating ...') );
                this.win._passwordPrompt( _('Please enter your password'), '', this.saveCommunity.bind(this));
            } else {
                this.saveButton.stopTip( _('Saved') );
                this.loader.hide();
            }
            ka.loadSettings();
        }.bind(this)}).post(req);
    },

    saveCommunity: function( pPasswd ){
        if( !pPasswd )
                this.loader.hide();
        if( this.lsc )
            this.lsc.cancel();
        this.lsc = new Request.JSON({url: _path+'admin/system/settings/saveCommunity', noCache: 1, onComplete: function(r){
            this.loader.hide();
            if(r == 2){
                this.saveButton.stopTip( _('Error') );
                this.win._alert(_('Cannot connect to community server.'));
                return;
            }
            if(r == 0){
                this.saveButton.stopTip( _('Error') );
                this.win._alert(_('Access denied'));
                this.fields['communityEmail'].setValue( this.oldCommunityEmail );
                return;
            }
            this.saveButton.stopTip( _('Saved') );
            ka.loadSettings();
        }.bind(this)}).post({email: this.fields['communityEmail'].getValue(), passwd: pPasswd });
    }
});

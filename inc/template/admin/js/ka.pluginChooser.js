ka.pluginChooser =  new Class({
    Implements: Events,
    initialize: function( pTypes, pTarget ){
        this.modules = [];
        this.target = pTarget;

        var w = pTarget.getWindow();

        this._load();

        var opts = [];
        if( $type(pTypes) == 'string' )
            opts = pTypes.split( '::' );

        this.choosen = {};
        this.choosen.module = opts[0];
        this.choosen.plugin = opts[1];
        this.choosen.options = JSON.decode( opts[2] );
        this.options = {}

        this.activeOptions = new Hash(); 
    },

    _load: function(){
        var _this = this;

        this.main = new Element( 'div', {
            style: ' ',
            'class': 'ka-pluginchooser-main'
        }).inject( this.target );
        
        this.head = new Element('div', {
            'style': 'position: absolute; left: 0px; top: 0px; right: 0px; height: 50px; padding: 10px;'
        }).inject( this.main );
        
        this.optionsPane = new Element('div', {
            'class': 'ka-pluginchooser-options'
        }).inject( this.main );

        this.bottom = new Element('div', {
            'class': 'ka-pluginchooser-bottom'
        }).inject( this.main );
        
        new ka.Button(_('OK'))
        .addEvent('click', function(){
            this.fireEvent('ok');
        }.bind(this)).inject( this.bottom );

        //module
        var table = new Element('table', {
            width: '100%'
        }).inject( this.head );    
        var tbody = new Element('tbody').inject( table );
        
        var tr = new Element('tr').inject( tbody );
        var td = new Element('td', {
            html: _('Extension:'),
            width: 100,
            style: 'font-size: 12px; font-weight: bold; padding: 0px 4px;'
        }).inject( tr );
        var td = new Element('td', {
            width: 200
        }).inject( tr );
        var selectModules = new Element('select', {style: 'width: 190px;', size:1, name: 'dummy'}).inject( td );
        
        this.pluginDescription = new Element('td', {
            rowspan: 2,
            html: _('Please choose a extension and a plugin.')
        }).inject( tr );
        
        this.windowEnlarger = new Element('td', {
            width: '25px',
            rowspan: 2,
            valign: 'top',
        }).inject(tr);
        
        this.btnLarger = new Element('img', {
            title: 'Enlarge window',
            src: 'inc/template/admin/images/icons/tree_up.png',
            style: 'width: 11px; height: 11px; border: 0; cursor: pointer; float: right;',
        })
        .addEvent('click', function() {
            this.btnLarger.hide();
            this.btnSmaller.show();
            this.target.setStyle('height', '90%');
        }.bind(this))
        .inject(this.windowEnlarger);
        
        this.btnSmaller = new Element('img', {
            title: 'Shrink window',
            src: 'inc/template/admin/images/icons/tree_minus.png',
            style: 'width: 11px; height: 11px; border: 0; cursor: pointer; float: right;'
        })
        .addEvent('click', function() {
            this.btnSmaller.hide();
            this.btnLarger.show();
            this.target.setStyle('height', '221px');
        }.bind(this))
        .inject(this.windowEnlarger);
        
        // Hide smaller button as window is already at small size
        this.btnSmaller.hide();

        
        var tr = new Element('tr').inject( tbody );
        var td = new Element('td', {
            html: _('Plugin:'),
            style: 'font-size: 12px; font-weight: bold; padding: 0px 4px;'
        }).inject( tr );
        var td = new Element('td').inject( tr );
        var pluginsDiv = new Element( 'span').inject( td );
        
        
        /*var tplDiv = new Element( 'div', { 'class': 'ka-field-main ka-field-main-small' } ).inject( this.main );
        new Element( 'span', { html: '<div class="title">'+_('Extension')+'</div>', 'class': 'ka-field-title' } ).inject( tplDiv );
        var tpl = new Element( 'div', { 'class': 'ka-field-field' } ).inject( tplDiv );
        */

        //plugins

        var selectModulesChange = function(){

            if( _this.optionsPanel )
                _this.optionsPanel.destroy();
                
            pluginsDiv.set( 'html', '' );


            if( selectModules.value == '' ){
                _this.pluginDescription.set('html', _('Please choose a extension and a plugin.'));
                return;
            }
            _this.pluginDescription.set('html', _('Please select a plugin.'));

            _this.choosen.module = selectModules.value;

			if( _this.lastGetRequest )
				_this.lastGetRequest.cancel();

            _this.lastGetRequest = new Request.JSON({url: _path+'admin/backend/plugins/get/', onComplete: function(res){

                pluginsDiv.set( 'html', _('Loading')+' ...' );
                if(!res){
                    pluginsDiv.set( 'html', _('No plugins found') );
                    return;
                }
                pluginsDiv.set( 'html', '' );

                //new Element( 'span', { html: '<div class="title">'+_('Plugin')+'</div>', 'class': 'ka-field-title' } ).inject( pluginsDiv ); 
                //var pVal = new Element( 'div', { 'class': 'ka-field-field' } ).inject( pluginsDiv );
                var pSelect = new Element( 'select', {style: 'width: 190px;', size:1, name: 'dummy'} );

                var pSelectChange = function(){
                    
                    if( _this.optionsPanel )
                        _this.optionsPanel.destroy();

                    if( pSelect.value == '' ){
                        _this.pluginDescription.set('html', _('Please select a plugin.'));
                        return;
                    }

                    _this.choosen.plugin = pSelect.value;
                    _this.loadOptions( pSelect.value );
                };

                pSelect.addListener( 'change', pSelectChange.bind(_this));

                new Element( 'option', {
                    value: '',
                    html: _('-- Please choose --')
                }).inject( pSelect );

                res = new Hash(res);
                _this.module = selectModules.value;
                _this.options = res;

                res.each(function(item, key){
                    new Element( 'option', {
                      value: key,
                      html: _(item[0])
                    }).inject( pSelect ); 
                });
                pSelect.inject( pluginsDiv );

                if( _this.choosen.plugin != '' ){
                    pSelect.value = _this.choosen.plugin;
                    pSelectChange();
                }

            }}).post({ module: selectModules.value, resultType: 'json' });
        }
        selectModules.addListener( 'change', selectModulesChange.bind(selectModules));

        //load modules
        new Element( 'option', {
            value: '',
            html: _('-- Please choose --')
        }).inject( selectModules );

        new Request.JSON({url: _path+'admin/system/module/getModules/', onComplete: function(res){
            res.each(function(item){
                new Element( 'option', {
                    value: item.name,
                    html: item.title
                }).inject( selectModules );
            });
            if( _this.choosen.module != '' ){
                selectModules.value = _this.choosen.module;
                selectModulesChange();
            }
        }}).post();

        return;
        //this._loadMenu();
        //this.choosePlugin( this.modules[0].name );
    },


    loadOptions: function( pId ){
        var _this = this;
        if( this.optionsPanel )
            this.optionsPanel.destroy();

        this.optionsPanel = new Element( 'div', {
            styles: {
                'clear': 'both'
            }
        }).inject( this.optionsPane );
        
        this.table = new Element('table', {width: '100%'}).inject( this.optionsPanel );
        this.tbody = new Element('tbody').inject( this.table );
        
        this.pluginDescription.set('html', _('No plugin description.'));
        if( this.options[ pId ][2] )
            this.pluginDescription.set('html', this.options[ pId ][2]);
        
        var options = new Hash( _this.options );
        _this.activeOptions = new Hash({});
        
        new Hash(options[ pId ][1]).each(function(option,key){

//            _this.activeOptions[key] = _this.buildOption( option, key );
        	option.tableitem = 1;
            option.label = _(option.label);
            option.desc = _(option.desc);
            _this.activeOptions[key] = new ka.field( option, key ).inject( this.tbody );
            
            if( option.depends ){
            	this._renderDependProperties( _this.activeOptions[key], option.depends );
            	
            }
            
            if( this.choosen.options && this.choosen.options[key] ){
                _this.activeOptions[key].setValue( this.choosen.options[ key ] );
                _this.activeOptions[key].fireEvent('change', this.choosen.options[ key ]);
            }
            
        }.bind(this));
        new Element( 'br', {
            styles: { clear: 'both' }
        }).inject( this.optionsPanel );
    },
    
    _renderDependProperties: function( pField, pDepends ){
    	
    	/*new Element( 'br', {
            styles: { clear: 'both' }
        }).inject( this.optionsPanel );
        
    	var pane = new Element('div', {
    		style: 'border-left: 2px solid #555; margin-left: 3px;'
    	}).inject( this.optionsPanel );
    	*/
    	
    	$H(pDepends).each(function(item, key){
    		
    		item.tableitem = 1;
            item.label = _(item.label);
            item.desc = _(item.desc);
            //logger( item.type );
    		var field = new ka.field( item, key ).inject( this.tbody );

    		field.hide();
    		
    		if( item.depends ){
    			this._renderDependProperties( field, item.depends );
    		}
    		
    		pField.addEvent('change', function( pValue ){
    			//logger( '['+key+']: '+pValue+' => Need: '+item.needValue );
    			if( pValue == item.needValue ){
    				field.show();
    			} else {
    				field.hide();
    			}
    		});
    		
    		this.activeOptions[ key ] = field;

    		if( this.choosen.options && this.choosen.options[key] )
    			this.activeOptions[key].setValue( this.choosen.options[ key ] );
		
    	}.bind(this));
    	
    	
    	
    },

    getValue: function(){
        var res = this.choosen.module + '::' + this.choosen.plugin + '::';
        options = new Hash();
        this.activeOptions.each(function(item,key){
            if( item.field.type == 'headline' ) return;
            options.include( key, item.getValue() );
        });
        res += JSON.encode( options );
        return res;
    },

    choosePlugin: function( pName ){
        
    },

    inject: function( pTarget ){
        this.main.inject( pTarget );
        return this;
    }
});
ka.windowEdit = new Class({
    initialize: function( pWin ){
        this.win = pWin;
        this.win.content.setStyle('overflow', 'visible');
        this.load();
    },

    load: function(){
        var _this = this;
        new Request.JSON({url: _path+'admin/backend/window/loadClass/', noCache: true, onComplete: function(res){
            _this.render( res );
        }}).post({ module: this.win.module, 'code': this.win.code });
    },

    loadItem: function( pVersion ){
        var _this = this;
        var req = $H({});
        req.include( 'module', this.win.module );
        req.include( 'code', this.win.code );
        
        if( pVersion )
        	req.version = pVersion;

        if( _this.win.params ){
            this.values.primary.each(function(prim){
                req.include( 'primary:'+prim, _this.win.params.values[prim] );
            });
        }

        this.loader.show();
        new Request.JSON({url: _path+'admin/backend/window/loadClass/getItem', noCache: true, onComplete: function(res){
            _this._loadItem( res );
        }}).post(req);
    },

    addField: function( pField, pFieldId, pContainer ){
    
        if( !pField ) return;
    
        if( pField.type == 'wysiwyg' && !this.windowAdd ){
            pField.withOutTinyInit = true;
        }
        pField.win = this.win;
        pField.label = _(pField.label);
        pField.desc = _(pField.desc);
        
        if( this.languageSelect && pField.multiLanguage )
        	pField.lang = this.languageSelect.value;
        
        var field = new ka.field(pField, pFieldId );
        field.inject( pContainer );

        if( pField.type == 'wysiwyg' && this.windowAdd ){
            //var contentCss = _path+"inc/template/css/kryn_tinyMceContentElement.css";
            //initResizeTiny( field.lastId, contentCss );
            ka._wysiwygId2Win.include( field.lastId, this.win );
            initResizeTiny( field.lastId, _path+'inc/template/css/kryn_tinyMceContent.css' );
        }

        this.fields.include( pFieldId, field );
        this._fields.include( pFieldId, pField );
        return field;
    },


    _loadItem: function( pItem ){
        this.item = pItem;
        this.fields.each(function(field, fieldId){
            try {
                if( $type(pItem.values[fieldId]) == false )
                    field.setValue( '' );
                else if( !this._fields[fieldId].startempty )
                    field.setValue( pItem.values[fieldId] );

                if( !this.windowAdd ){
                    var contentCss = _path+"inc/template/css/kryn_tinyMceContentElement.css";
                    initResizeTiny( field.lastId, contentCss );
                    ka._wysiwygId2Win.include( field.lastId, this.win );
                }
            } catch(e) {
                logger( "Error with "+fieldId+": "+e);
            }
        }.bind(this));
        
        
        if( this.values.multiLanguage ){
        	this.languageSelect.value = this.item.values.lang;
        	this.changeLanguage();
        }
        
        this.versioningSelect.empty();
    	
        new Element('option', {
            text: _('-- LIVE --'),
            value: ''
        }).inject( this.versioningSelect );
        
        if( $type( this.item.versions) == 'array' ){
	        this.item.versions.each(function(version, id){
	        	
	        	 new Element('option', {
	                 text: version.title,
	                 value: version.version
	             }).inject( this.versioningSelect );
	        	
	        }.bind(this));
        }
        
        if( this.item.version )
        	this.versioningSelect.value = this.item.version;
        
        this.loader.hide();
    },

    render: function( pValues ){
        this.values = pValues;


        this.loader = new ka.loader().inject( this.win.content );
        this.loader.show();
        this.renderContent();

        this.fields = $H({});
        this._fields = $H({});
        
        var versioningSelectRight = 5;
        
        /*multilang*/
        if( this.values.multiLanguage ){
        	this.win.extendHead();
        	
        	this.languageSelect = new Element('select', {
                style: 'position: absolute; right: 5px; top: 27px; width: 160px;'
            }).inject( this.win.border );

            this.languageSelect.addEvent('change', this.changeLanguage.bind(this));
            new Element('option', {
                text: _('-- Please select --'),
                value: ''
            }).inject( this.languageSelect );

            $H(ka.settings.langs).each(function(lang,id){
                new Element('option', {
                    text: lang.langtitle+' ('+lang.title+', '+id+')',
                    value: id
                }).inject( this.languageSelect );
            }.bind(this));
            
            if( this.win.params )
                this.languageSelect.value = this.win.params.lang;
            
            versioningSelectRight = 170;
        }
        
        if( this.values.versioning == true ){
        	
        	this.versioningSelect = new Element('select', {
                style: 'position: absolute; right: '+versioningSelectRight+'px; top: 27px; width: 160px;'
            }).inject( this.win.border );
        	
        	this.versioningSelect.addEvent('change', this.changeVersion.bind(this));
            
        }
        
        
        if( this.values.fields && $type(this.values.fields) != 'array'  ){
            //backward compatible
            this.form = new Element('div', {
                'class': 'ka-windowEdit-form'
            })
            .inject( this.win.content );
            
            var target = this.form;
            
            if( this.values.layout ){
            	this.form.set('html', this.values.layout);
            }
            
            $H(this.values.fields).each(function(field, fieldId){

            	if( field.target )
            		field.target = '#'+field.target;
            	
                if( this.values.layout ){
                	target = this.form.getElement( field.target || '#default' );
                	this.win._alert(_('Layout is defined but target is invalid for field %s'.replace('%s', fieldId)));
                }
            	
                this.addField( field, fieldId, target );
            }.bind(this));
            
        } else if( this.values.tabFields ){
            this.topTabGroup = this.win.addSmallTabGroup();
            this._panes = {};
            this._buttons = $H({});
            this.firstTab = '';
            
            $H(this.values.tabFields).each(function(fields,title){
                if( this.firstTab == '' ) this.firstTab = title;
                this._panes[ title ] = new Element('div', {
                    'class': 'ka-windowEdit-form',
                    style: 'display: none;'
                }).inject( this.win.content );
                
                if( this.values.tabLayouts && this.values.tabLayouts[title] )
                	this._panes[title].set('html', this.values.tabLayouts[title]);
                
                this._renderFields( fields, this._panes[ title ] );
                
                this._buttons[ title ] = this.topTabGroup.addButton(_(title), this.changeTab.bind(this,title));
            }.bind(this));
            this.changeTab(this.firstTab);
        }

        this.loadItem();
    },
    
    changeVersion: function(){
    	var value = this.versioningSelect.value;
    	this.loadItem( value );
    },

    changeLanguage: function(){
    	var newFields = {};
        this.fields.each(function(item, fieldId){

        	if( item.field.type == 'select' && item.field.multiLanguage ){
        		item.field.lang = this.languageSelect.value;
        		var value = item.getValue();
        		var field = new ka.field( item.field );
        		field.inject( item.main, 'after' );
        		item.destroy();
        		field.setValue( value );
        		newFields[fieldId] = field;
        	}
        }.bind(this));
        
        $H(newFields).each(function(item,fieldId){
        	this.fields.set(fieldId, item);
        }.bind(this));
    },
    
    _renderFields: function( pFields, pContainer, pParentField ){
        if(!pFields.each) pFields = $H(pFields);
        
        
        pFields.each(function(field,id){

        	if( field.target )
        		field.target = '#'+field.target;

        	var target = pContainer.getElement( field.target || '#default' );
            if( !target )
            	target = pContainer;
        	
            var fieldOnj = this.addField( field, id, target );

            if( pParentField && field.needValue ){
            	
            	fieldOnj.hide();
            	pParentField.addEvent('change', function( pValue ){
            		if( pValue == field.needValue ){
            			fieldOnj.show();
            		} else {
            			fieldOnj.hide();
            		}
            	});
            	pParentField.fireEvent('change', pParentField.getValue());
            }
            
            if( field.depends ){
                var depends = new Element('div', {
                	style: 'margin-left: 26px; padding: 3px; border-left: 1px dotted gray'
                }).inject( target );
                this._renderFields( field.depends, depends, fieldOnj );
            }
        }.bind(this));
    },

    changeTab: function( pTab ){
    	this.currentTab = pTab;
        this._buttons.each(function(button,id){
            button.setPressed(false);
            this._panes[ id ].setStyle('display', 'none');
        }.bind(this));
        this._panes[ pTab ].setStyle('display', 'block');
        this._buttons[ pTab ].setPressed(true);
        this._buttons[ pTab ].stopTip();
    },
    
    renderContent: function(){
        var _this = this;

        this.actions = new Element('div', {
            'class': 'ka-windowEdit-actions'
        }).inject( this.win.content );

        this.exit = new ka.Button(_('Cancel'))
        .addEvent( 'click', function(){
            _this.win.close();
        })
        .inject( this.actions );

        this.saveNoClose = new ka.Button(_('Save'))
        .addEvent('click', function(){
            _this._save();
        })
        .inject( this.actions );

        this.save = new ka.Button(_('Save and close'))
        .addEvent('click', function(){
            _this._save( true );
        })
        .inject( this.actions );
    },

    _save: function( pClose ){
        var go = true;
        var _this = this;
        var req = $H();
        
        if( this.item )
            req = $H(this.item.values);
        
        req.include( 'module', this.win.module );
        req.include( 'code', this.win.code );

        //var id = this.win.id+'_'+Math.ceil(Math.random()*100);
        
        /*
        var form = new Element('form', {
            target: 'iframe_'+id,
            method: 'post',
            action: _path+'admin/backend/window/loadClass/saveItem?noCache='+(new Date().getTime()),
            enctype: 'multipart/form-data'
        }).inject( document.hidden );
        */
        this.fields.each(function(item, fieldId){
            if( !item.isHidden() && !item.isOk() ){
            	
            	if( this.currentTab && this.values.tabFields){
            		var currenTab2highlight = false;
            		$H(this.values.tabFields).each(function(fields,key){
            			$H(fields).each(function(field, fieldKey){
            				if( fieldKey == fieldId ){
            					currenTab2highlight = key;
            				}
            			})
            		});
            		
            		if( currenTab2highlight && this.currentTab != currenTab2highlight ){
            			var button = this._buttons[ currenTab2highlight ];
            			this._buttons[ currenTab2highlight ].startTip(_('Please fill!'));
            			button.toolTip.loader.set('src', _path+'inc/template/admin/images/icons/error.png');
            			button.toolTip.loader.setStyle('position', 'relative');
            			button.toolTip.loader.setStyle('top', '-2px');
            		}
            	}
            	
                item.highlight();
                
                go = false;
            }
            /*if( item.field.type == 'file' ){
                item.input.inject( form );
                item.renderFile();
            } else {
            */
            var value = item.getValue();
            
            if( item.field.relation == 'n-n' )
                req.set( fieldId, JSON.encode(value) );
            else if( $type(value) == 'object' )
                req.set( fieldId, JSON.encode(value) );
            else
                req.set( fieldId, value );
            //}
            //if( item.field.type == 'wysiwyg' && pClose ){
            //    tinyMCE.execCommand('mceRemoveControl', false, item.lastId);
            //}
        }.bind(this));
        
        /*
        var iframe = new Element('iframe', {
            name: 'iframe_'+id,
            src: _path+'admin/backend/nothing'
        }).inject( document.hidden );
        
        req.each(function(value,id){
            new Element('input', {
                type: 'text',
                value: value,
                name: id
            }).inject( form );
        });
        */
        if( this.values.multiLanguage ){
        	req.set('lang', this.languageSelect.value);
        }
        
        if( !pClose ){
            this.saveNoClose.startTip(_('Save ...'));
        }
        
        if( go ){
            /*iframe.addEvent('load', function(){
                ka.wm.softReloadWindows( _this.win.module, _this.win.code.substr(0, _this.win.code.lastIndexOf('/')) );
                if( pClose )
                    _this.win.close(); 
            });
            form.submit();
            */
            this.loader.show();
            if( _this.win.module == 'users' && (_this.win.code == 'users/edit/'
                || _this.win.code == 'users/edit'
                || _this.win.code == 'users/editMe'
                || _this.win.code == 'users/editMe/'
                ) ){
                ka.settings.get('user').set('adminLanguage', req.get('adminLanguage') );
            }
            new Request.JSON({url: _path+'admin/backend/window/loadClass/saveItem', noCache: true, onComplete: function(res){
                ka.wm.softReloadWindows( _this.win.module, _this.win.code.substr(0, _this.win.code.lastIndexOf('/')) );
                _this.loader.hide();
                
                if( !pClose ){
                    _this.saveNoClose.stopTip(_('Done'));
                }
                
                if( pClose )
                    _this.win.close();
            }}).post(req);
        }
    }

});

var users_users_acl_pages = new Class({

	Implements: [Events],
	parentObject: false,
	
	initialize: function( pAcl, pParent ){
	
		this.acl = pAcl;
		
		
		this.main = new Element('div', {
			'class': 'users-acl-item-main'
		});
		
		this.main.store('acl', this);
		this.main.inject( pParent );
		this.render();
		
	},

	render: function(){
		var title = '';
		this.main.empty();
		var title = '#'+this.acl.code+' Loading ...';
		
		var h2 = new Element('h2').inject(this.main);
		
		this.title = new Element('div', {html: _('Loading ...')}).inject(h2);
		
		var text = new Element('div',{
			style: 'font-weight: normal; font-size: 11px; color: gray;'
		}).inject( h2 );
		
		var withSub = new Element('div', {
			text: _('with all sub areas.')
			}).inject(text);
		
		this.withSubCheck = new Element('input',{
			type: 'checkbox',
			value: 1,
			style: 'margin: 5px; position: relative; top: 2px;',
			checked: this.acl.code.test('%')
		})
		.addEvent('change', function(){
			this.acl.code = this.acl.code.replace('%', '');
			if( this.withSubCheck.checked ){
				this.acl.code = this.acl.code+'%';
			}
			this.fireEvent('change');
		}.bind(this))
		.inject(withSub, 'top');
		
		
		this.path = new Element('div',{
			style: 'padding-left: 0px;',
			text: '...'
		}).inject( text );
		
		
		var _this = this;
		
		var updateImgs = function(){
			
			if( this.acl.access == 1){
				this.imgGranted.setStyle('opacity', 1);
				this.imgDenied.setStyle('opacity', 0.2);
			} else {
				this.imgGranted.setStyle('opacity', 0.2);
				this.imgDenied.setStyle('opacity', 1);
			}
			this.fireEvent('change');
		}.bind(this);
		
		this.imgGranted = new Element('img', {
			src :  _path+'inc/template/admin/images/icons/accept.png',
			title: _('Click to enable access'),
			'style': 'cursor: pointer;',
			'class': 'users-acl-item-main-access'
		})
		.addEvent('click', function(){
			this.acl.access = 1;
			updateImgs();
		}.bind(this))
		.inject( this.main );
		
		this.imgDenied = new Element('img', {
			src :  _path+'inc/template/admin/images/icons/stop.png',
			title: _('Click to disable access'),
			'style': 'cursor: pointer; top: 41px;',
			'class': 'users-acl-item-main-access'
		})
		.addEvent('click', function(){
			this.acl.access = 0;
			updateImgs();
		}.bind(this))
		.inject( this.main );
		
		updateImgs();
		
		var actionBox = new Element('div', {
			'class': 'users-acl-item-main-actionbox' 
		}).inject( this.main );
		
		
		var _this = this;
		this.checkboxes = {};
		
		
		this.tableContainer = new Element('div', {
			'class': 'users-acl-item-main-table'
		}).inject( this.main );
		
		this.toggler = new Element('div', {
			'class': 'users-acl-item-main-toggler'
		}).inject( this.tableContainer );
		
		new Element('span', {
			text: '['
		}).inject( this.toggler );
		
		this.togglerA = new Element('a', {
			text: _('select all'),
			href: 'javascript: ;'
		})
		.addEvent('click', function(){
			if( this.lang != 1 ){
				$H(_this.checkboxes).each(function(chk, id){
					chk.checked = true;
				});
				this.set('text', _('deselect all'));
				this.lang = 1;
			} else {
				$H(_this.checkboxes).each(function(chk){
					chk.checked = false;
				});
				this.set('text', _('select all'));
				this.lang = 0;
			}
			_this.fireEvent('toggleAll');
			
		})
		.inject( this.toggler );
		
		new Element('span', {
			text: ']'
		}).inject( this.toggler );
		
		
		
		this.withDomain = false;
		if( this.acl.code.substr(0,1) == 'd' )
			this.withDomain = true;
		
		
		this.tabPane = new ka.tabPane( this.tableContainer );

		if( this.withDomain )
			this.domainPane = this.tabPane.addPane( _('Domain'), _path+'inc/template/admin/images/icons/world.png' );
		
		this.pagesPane = this.tabPane.addPane( _('Pages'), _path+'inc/template/admin/images/icons/page_green.png' );

		this.accordion = new ka.Accordion( this.pagesPane.pane );
		this.accordion.togglerHeight = 29;
		
		this.tabPane.paneBox.setStyle('padding', 0);
		this.tabPane.paneBox.setStyle('overflow', 'hidden');

		this.pagesAclPanes = {};

		this.pagesAclPanes['tree'] = this.accordion.addSection( _('Tree') );
		this.pagesAclPanes['general'] = this.accordion.addSection( _('General') );
		this.pagesAclPanes['access'] = this.accordion.addSection( _('Access') );
		this.pagesAclPanes['contents'] = this.accordion.addSection( _('Contents') );
		this.pagesAclPanes['resources'] = this.accordion.addSection( _('Resources') );
		this.pagesAclPanes['properties'] = this.accordion.addSection( _('Properties') );
		this.pagesAclPanes['search'] = this.accordion.addSection( _('Search') );
		this.pagesAclPanes['versions'] = this.accordion.addSection( _('Versions') );
		
		
		this.accordion.addEvent('ready', function(){
			this.accordion.display(0);	
		}.bind(this));
		
		if( this.withDomain )
			this.tabPane.to(1);
		else
			this.tabPane.to(0);
		
		
		
		if( this.withDomain ) {
			this.accordionDomain = new ka.Accordion( this.domainPane.pane );
			this.accordionDomain.togglerHeight = 29;
			this.domainAclPanes = {};
			this.domainAclPanes['tree'] = this.accordionDomain.addSection( _('Tree') );
			this.domainAclPanes['domain'] = this.accordionDomain.addSection( _('General') );
			this.domainAclPanes['theme'] = this.accordionDomain.addSection( _('Theme') );
			this.domainAclPanes['domainProperties'] = this.accordionDomain.addSection( _('Properties') );
			this.domainAclPanes['settings'] = this.accordionDomain.addSection( _('Settings') );
		}
		
		
		this.domainVals = {
				'tree': {
					showDomain: 'Show domain', //xx
					deleteDomain: 'Delete domain',//xx
				},
				'domain': {//x
					'domainName': _('Domain'), //xx
					'domainTitle': _('Title'),//xx
					'domainStartpage': _('Startpage'),//xx
					'domainPath': _('Path'),//xx
					'domainFavicon': _('Favicon'),//xx
					'domainLanguage': _('Language'),//xx
					'domainLanguageMaster': _('Language master'),//xx
					'domainEmail': _('Email')//xx
				},
				'theme': {//x
					'themeProperties': _('Theme properties'),//xx
					'limitLayouts': _('Limit selectable layouts')//xx
				},
				'domainProperties': {//x
				},
				'settings': {//x
					'aliasRedirect': _('Alias and redirects'),//xx
					'phpLocale': _('PHP-Locale'),//xx
					'robotRules': _('Robot rules'),//xx
					'404': ('404-Management'),//xx
					'domainOther': ('Other')//xx
				}
		}
		
		this.pageVals = {
				'tree': {
					showPage: 'Show pages',
					addPages: 'Add pages',//x
					movePages: 'Move pages',//x
					deletePages: 'Delete pages',//x
				},
				'general': {//x_
					type: _('Type'),//xx
					title: _('Title'),//xx
					page_title: _('Alternative title'),//xx
					url: _('URL'),//xx
					meta: _('Metas')//xx 
				},
				'access': {//xx
					visible: _('Visible'),//xx
					access_denied: _('Access denied'),//xx
					force_https: _('Force HTTPS'),//xx
					releaseDates: _('Release/Hide dates'),//xx
					limitation: _('Group limitations')//xx
				},
				'contents': {//x
					canPublish: _('Can publish contents'),//xx
					canChangeLayout: _('Can change layout'),//xx
					'content-text': _('Text contents'),//x
					'content-layoutelement': _('Layout element'),//x
					'content-picture': _('Picture contents'),//x
					'content-plugin': _('Plugin contents'),//x
					'content-pointer': _('Pointer contents'),//x
					'content-navigation': _('Navigation contents'),//x
					'content-template': _('Template contents'),//x
					'content-html': _('HTML contents'),//x
					'content-php': _('PHP contents')//x
				},
				'resources': {//xx
					css: _('CSS'),//xx
					js: _('Javascript')//xx
				},
				'properties': {//x
				},
				'search': {//x
					setBlacklist: _('Set to blacklist'),//x
					exludeSearch: _('Exlude from search'),//xx
					searchKeys: _('Search words'),//xx
				},
				versions: {//xx
					setLive: 'Set live',//x
					loadVersion: 'Load other version'//x
				}
		}
		
		var id = new Date().getTime();
		
		var _this = this;
		
		var _renderCheckboxes = function( pVals, pPanes, pPane ){
			
			var tab = this.domainPane;
			
			/*
			var needForGlobal = 'showDomain';
			if( pPane == 'pages' ){
				tab = this.pagesPane;
				needForGlobal = 'showPage';
			}
			
			var setCurrentState = function( pState ){
				if( pState ){
					tab.pane.getElements('input').set('disabled', false);
					tab.pane.setStyle('color', 'black');
					tab.button.getElement('img').setStyle('opacity', 1);
					tab.button.setStyle('color', 'black');
					tab.pane.getElements('.ka-Accordion-toggler a').setStyle('display', 'inline');
				} else {
					tab.pane.getElements('input').set('disabled', true);
					tab.pane.setStyle('color', 'silver');
					tab.button.getElement('img').setStyle('opacity', 0.6);
					tab.button.setStyle('color', 'gray');
					tab.pane.getElements('.ka-Accordion-toggler a').setStyle('display', 'none');
				}
			}
			
			this.addEvent('toggleAll', function(){
				setCurrentState( this.checkboxes[needForGlobal].checked );
			}.bind(this));
			
			this.checkboxes[needForGlobal] = new Element('input', {
				type: 'checkbox',
				title: _('Is this visible?')
			})
			.addEvent('change', function(){
				setCurrentState(this.checked);
			})
			.addEvent('click', function(e){
				new Event(e).stopPropagation();
			})
			.inject( tab.button, 'top' );
			*/
			
			$H(pVals).each(function(items,key){
				
				var pane = pPanes[ key ];
				var toggler = pane.getParent().getPrevious();
				
				new Element('a', {
					text: _('select all')
				})
				.addEvent('click', function(e){
					
					if( this.lang != 1 ){
						this.lang = 1;
						this.set('text', _('deselect all'));
						_this.checkboxes[ key ].set('checked', true);
						pane.getElements('input').set('checked', true);
					} else {
						this.lang = 0;
						this.set('text', _('select all'));
						_this.checkboxes[ key ].set('checked', false);
						pane.getElements('input').set('checked', false);
					}
					new Event(e).stopPropagation();
					
				})
				.inject( toggler );
				
				if( key != 'tree' ){
					
					
					var setTabSub = function( pState ){
						if( pState ){
							pane.getElements('input').set('disabled', false);
							pane.setStyle('color', 'black');
							toggler.getElement('img').setStyle('opacity', 1);
							toggler.setStyle('color', 'black');
							toggler.getElements('.ka-Accordion-toggler a').setStyle('display', 'inline');
						} else {
							pane.getElements('input').set('disabled', true);
							pane.setStyle('color', 'silver');
							toggler.getElement('img').setStyle('opacity', 0.6);
							toggler.setStyle('color', 'gray');
							pane.getElements('.ka-Accordion-toggler a').setStyle('display', 'none');
						}
					}
					
					this.checkboxes[ key ] = new Element('input', {
						type: 'checkbox',
						'class': 'users-acl-tabitem',
						title: _('Access to this tab')
					})
					.addEvent('click', function(e){
						new Event(e).stopPropagation();
					})
					.addEvent('change', function(e){
						
						//disable this, because it makes no sense
						//setTabSub( this.checked );
						
					})
					.inject(toggler, 'top');
				} else {
					new Element('input', {
						type: 'checkbox',
						disabled: true
					}).inject(toggler, 'top');
				}
				
				$H(items).each(function(aclTitle, aclKey){
					
					var div = new Element('div').inject(pane);
					this.checkboxes[aclKey] = new Element('input', {
						type: 'checkbox',
						'class': 'users-acl-lastitem',
						id: id+"-users-acl-aclitem-"+aclKey
					}).inject( div );
					
					new Element('label', {
						text: aclTitle,
						'for': id+"-users-acl-aclitem-"+aclKey
					}).inject( div );
					
				}.bind(this));
				
			}.bind(this));
			
		}.bind(this);

		_renderCheckboxes( this.pageVals, this.pagesAclPanes, 'pages' );
		
		if( this.withDomain ){
			_renderCheckboxes( this.domainVals, this.domainAclPanes, 'domain' );
		}
		
		this.updateHeight();
		this.tabPane.rerender();
		
		//load checked persmissions
		var t = this.acl.code.split('[');
		//d2%[canPublish,canEdit,addPages,movePages,deletePages,propeties,ressources,search,type,title,altTitle,url,meta,access,visible,contentText,contentPicture,contentPlugin,contentPointer,contentNavi,contentTemplate,contentHTML,contentPHP]
		var t = t[1].split(']');
		var items = t[0].split(',');
		if( $type(items) == 'array' ){
			items.each(function(item){
				
				if( item != '' && this.checkboxes[ item ] )
					this.checkboxes[ item ].checked = true;
					
			}.bind(this));
		}
		
		/*
		if( this.acl.target_rsn == 1 && this.acl.code == 'admin/%' && this.acl.target_type == 1 ){

			this.imgDenied.removeEvents('click');
			this.imgDenied.set('title', '');
			this.imgGranted.removeEvents('click');
			this.imgGranted.set('title', '');
			
			this.withSubCheck.disabled = true;
			
		} else {
		*/
			new ka.Button(_('Delete')).addEvent('click', this.remove.bind(this)).inject( actionBox );
		//}
		

		_this.fireEvent('toggleAll');
		
        new Request.JSON({url: _path+'admin/users/users/acl/getPageItemInfo', onComplete: function( pRes ){
        	
        	this.title.set('html', pRes.title);
        	this.path.set('html', pRes.path);
        	
        }.bind(this)}).post({ code: this.acl.code });

	},
	
	updateHeight: function(){
		
		var height = this.main.getSize().y;
		//height = height - ( 20*($H(this.pagesAclPanes).getLength()+1) );
		//height = height - 69 - 10; // x - top - bottom
		height = height - 69 - 35; // x - top - bottom
		this.pagesPane.pane.setStyle('height', height);
		if( this.withDomain )
			this.accordionDomain.setHeight( height );
		
		this.accordion.setHeight( height );
		
	},
	
	edit: function(){
		
		this.parentObject.showDialog(this.acl, function( pAcl ){
			this.acl = pAcl;
			this.render();
		}.bind(this));
		
	},
	
	remove: function(){

		this.main.destroy();
		this.fireEvent('remove');
		
	},
	
	getValue: function(){
		
		this.acl.code = this.acl.code.split('[')[0].replace('%','');
		
		var modes = [];
		$H(this.checkboxes).each(function(item,code){
			
			
			if( item.checked )
				modes.include(code);
			
		});
		
		if( this.withSubCheck.checked )
			this.acl.code += '%';
		
		this.acl.code += '['+modes.join(',')+']';
		
		
		return this.acl;
	},
	
	inject: function( pTarget, pLocation ){
		this.main.inject( pTarget, pLocation );
		
		this.updateHeight();
		
	}
	
});




var users_users_acl_admin = new Class({
	Implements: [Events],
	parentObject: false,
	
	initialize: function( pAcl ){
	
		this.acl = pAcl;
		
		this.main = new Element('div', {
			'class': 'users-acl-item-main'
		});
		
		this.main.store('acl', this);
		this.render();
		
	},

	render: function(){
		var title = '';
		this.main.empty();
		var path = users_users_acl_getPath( this.acl.code );
		
		var title = path.split(' » ')[ path.split(' » ').length-1 ];
		
		if( this.acl.code.test('/%') ){
			
		}
		
		
		title = title + '<br />';
		
		var h2 = new Element('h2', {html: title}).inject(this.main);
		
		var text = new Element('div',{
			style: 'font-weight: normal; font-size: 11px; color: gray;'
		}).inject( h2 );
		
		var withSub = new Element('div', {
			text: _('with all sub areas.')
		}).inject(text);
		
		if( this.acl.code == 'admin/%' )
			withSub.set('text', _('with all sub areas and all extensions.'));
		
		this.withSubCheck = new Element('input',{
			type: 'checkbox',
			value: 1,
			style: 'margin: 5px; position: relative; top: 2px;',
			checked: this.acl.code.test('/%')
		})
		.addEvent('change', function(){
			this.acl.code = this.acl.code.replace('%', '');
			if( this.withSubCheck.checked ){
				this.acl.code = this.acl.code+'%';
			}
			this.fireEvent('change');
		}.bind(this))
		.inject(withSub, 'top');
		
		new Element('div',{
			style: 'padding-left: 0px;',
			text: path
		}).inject( text );
		
		
		var _this = this;
		
		var updateImgs = function(){
			
			if( this.acl.access == 1){
				this.imgGranted.setStyle('opacity', 1);
				this.imgDenied.setStyle('opacity', 0.2);
			} else {
				this.imgGranted.setStyle('opacity', 0.2);
				this.imgDenied.setStyle('opacity', 1);
			}
			this.fireEvent('change');
			
		}.bind(this);
		
		this.imgGranted = new Element('img', {
			src :  _path+'inc/template/admin/images/icons/accept.png',
			title: _('Click to enable access'),
			'style': 'cursor: pointer;',
			'class': 'users-acl-item-main-access'
		})
		.addEvent('click', function(){
			this.acl.access = 1;
			updateImgs();
		}.bind(this))
		.inject( this.main );
		
		this.imgDenied = new Element('img', {
			src :  _path+'inc/template/admin/images/icons/stop.png',
			title: _('Click to disable access'),
			'style': 'cursor: pointer; top: 41px;',
			'class': 'users-acl-item-main-access'
		})
		.addEvent('click', function(){
			this.acl.access = 0;
			updateImgs();
		}.bind(this))
		.inject( this.main );
		
		updateImgs();
		
		var actionBox = new Element('div', {
			'class': 'users-acl-item-main-actionbox' 
		}).inject( this.main );

		if( this.acl.code == 'admin/%' ){

			if( this.acl.target_rsn == 1 && this.acl.target_type == 1 ){
				this.imgDenied.removeEvents('click');
				this.imgDenied.set('title', '');
				this.imgGranted.removeEvents('click');
				this.imgGranted.set('title', '');
			}
			
			this.withSubCheck.disabled = true;
			
		}

		if( this.acl.target_rsn == 1 && this.acl.code == 'admin/%' && this.acl.target_type == 1 ){
		} else {
		 
			new ka.Button(_('Delete')).addEvent('click', this.remove.bind(this)).inject( actionBox );
		}
		
	},
	
	edit: function(){
		
		this.parentObject.showDialog(this.acl, function( pAcl ){
			this.acl = pAcl;
			this.render();
		}.bind(this));
		
	},
	
	remove: function(){
		this.main.destroy();
		this.fireEvent('remove');
		
	},
	
	getValue: function(){
		return this.acl;
	},
	
	inject: function( pTarget, pLocation ){
		this.main.inject( pTarget, pLocation );
	}
	
});

var users_users_acl_admins = {};

var users_users_acl_getPath = function( pCode ){
	var path = '';
	var aCode = pCode.split('/');
	
	var curMod = false;
	aCode.each(function(item, index){
		
		if( item != '%' && item != '' ){
			if( !curMod )
				curMod = ka.settings.configs[item];
			else if( curMod.admin ){
				curMod = curMod.admin[item]; 
			} else if( curMod ){
				curMod = curMod.childs[item];
			}
			if( !curMod ) return;
		
			if( $type(curMod.title) == 'object' ){
				pathtitle = curMod.title[window._session.lang];
				if( !pathtitle )
					pathtitle = curMod.title['en'];
			} else {
				pathtitle = curMod.title;
			}
			if( path != '' )
				path = path +" » "+ pathtitle;
			else
				path = pathtitle;
		}
	}.bind(this));
	return path;
}

var users_users_acl_aclTree = new Class({
	
	initialize: function( pContainer, pAclContainer, pAclObj ){
	
		this.container = pContainer;
		this.aclContainer = pAclContainer;
		this.aclObj = pAclObj;
		
		this.main = new Element('div', {'class': 'users-acl-tree-main'}).inject(this.container);
		
		this.renderTree();
	},

	addTree: function( ext, extCode ){
		
		var title = ext.title[window._session.lang];
		if( !title )
			title = ext.title['en'];
		
		
		var target = this.main;
		if( this.extContainer ){
			target = new Element('div', {
				style: 'padding-top: 5px; margin-top: 5px; border-top: 1px dashed silver;'
			}).inject( this.extContainer );
		}
		
		var a = new Element('a', { href: 'javascript:;', text: title, style: 'font-weight: bold;'}).inject( target );
		
		var childContainer = new Element('div', {'class': 'users-acl-tree-childcontainer', style: 'padding-left: 25px;'}).inject( a, 'after' );
		
		if( extCode == 'admin' )
			this.extContainer = childContainer; 
		
		var code = extCode+'/';
		
		a.store('code', code);
		
		/*if( ext.widgets ){
			
			var widgetAdmin = {
					widgets: {
						title: _('Widgets'),
						childs: {}
					}
			};
			
			$H(ext.widgets).each(function(item, key){
				widgetAdmin.widgets.childs[key] = item;
			});
			this.loadChilds( widgetAdmin, code, childContainer );
			
		}*/
		
		this.loadChilds( ext.admin, code, childContainer );
		
		//this.users_users_acl_admins[extCode] = {title: ext.title, childs: ext.admin};
		
	},
	
	renderTree: function(){
		this.mainContainer = this.main;
		
		this.addTree( ka.settings.configs['admin'], 'admin' );
		
    	$H(ka.settings.configs).each(function(ext, extCode){
        	if( extCode != 'admin' && ext.admin ){
        		this.addTree( ext, 'admin/'+extCode );
        	}
        }.bind(this));
    	
    	var _this = this;
    	this.main.getElements('a').each(function(element){
    		
    		var code = element.retrieve('code');
    		
    		element.addEvent('click', function(){
    			
    			this.aclObj.renderAcl( code, 1, element );
    			
    		}.bind(this))
    		
    		
    	}.bind(this));
    	
    },
    
    loadChilds: function( pAdmin, pCode, pChildContainer ){
    	
    	if( $type(pAdmin) == false ) return;
    	
    	var _this = this;
    	$H(pAdmin).each(function(item, index){
    		
    		if( item.acl == false ) return;
    		
    		var element = new Element('a', {href: 'javascript:;', text: _(item.title)}).inject( pChildContainer );
    		
    		var code = pCode+index+'/';
    		element.store('code', code);
    		var childContainer = new Element('div', {'class': 'users-acl-tree-childcontainer', style: 'padding-left: 25px;'}).inject( pChildContainer );
 		
    		this.loadChilds( item.childs, code, childContainer );

    	}.bind(this));
	}
	
});


var users_users_acl = new Class({
    initialize: function( pWindow ){
        this.win = pWindow;
        this.win.content.setStyle('overflow', 'hidden');
        this._createLayout();
        
        //this.loadExts();
        
        //this.loadTree();
    },
    
    _createLayout: function(){
        var boxNavi = this.win.addTabGroup();
        this.tabGroup = boxNavi;
        boxNavi.box.setStyle('left', 190 );

        this.tabButtons = new Hash();
        this.tabButtons['general'] = boxNavi.addButton( _('Backend'), _path+'inc/template/admin/images/admin-pages-viewType-general.png', this.setType.bind(this,'general'));
        this.tabButtons['pages'] = boxNavi.addButton( _('Pages'), _path+'inc/template/admin/images/admin-pages-viewType-content.png', this.setType.bind(this,'pages'));

        this.saveGroup = this.win.addButtonGroup();
        this.saveGroup.box.setStyle('left', 190 );
        this.saveBtn = this.saveGroup.addButton(_('Save'), _path+'inc/template/admin/images/button-save.png', this.save.bind(this));

        this.treeUser = new Element('div', {
            style: "position: absolute; top: 0px; left: 0px; height: 50%; width: 200px;"
        }).inject( this.win.content );
        
        new Element('div', {
            style: 'position: absolute; left: 3px; top: 8px; font-weight: bold; font-size: 12px;',
            text: _('Users')
        }).inject( this.treeUser );
        
        this.listUserWrapper = new Element('div', {
            'class': 'users-acl-list',
            style: 'position: absolute; bottom: 0px; left: 3px; right: 0px; top: 47px;'
        }).inject( this.treeUser );

        this.listUser = new Element('select', {
            'size': 2,
            style: "height: 100%; width: 100%"
        })
        .addEvent('change', this.loadAcl.bind(this, 'user'))
        .addEvent('click', this.loadAcl.bind(this, 'user'))
        .inject( this.listUserWrapper );

        this.searchUser = new Element('input', {
            'class': 'text users-acl-search',
            value: _('Search ...')
        })
        .addEvent('focus', function(){
        	if( this.value == _('Search ...') ){
        		this.value = '';
        		this.setStyle('color', 'gray');
        	}
        })
        .addEvent('blur', function(){
        	if( this.value == '' ){
        		this.value = _('Search ...');
        		this.setStyle('color', 'silver');
        	}
        })
        .addEvent('keyup', this.doSearch.bindWithEvent(this, 'user') )
        .inject( this.treeUser );

        this.tabGroup.hide();
        this.saveGroup.hide();

        this.treeGroup = new Element('div', {
            style: "position: absolute; bottom: 3px; left: 0px; height: 50%; width: 200px;"
        }).inject( this.win.content );

        this.listGroupWrapper = new Element('div', {
            'class': 'users-acl-list',
            style: 'position: absolute; bottom: 0px; left: 3px; right: 0px; top: 48px;'
        }).inject( this.treeGroup );

        this.listGroup = new Element('select', {
            'size': 2,
            style: "height: 100%; width: 100%"
        })
        .addEvent('change', this.loadAcl.bind(this, 'group'))
        .addEvent('click', this.loadAcl.bind(this, 'group'))
        .inject( this.listGroupWrapper );

        new Element('div', {
            style: 'position: absolute; left: 3px; top: 8px; font-weight: bold; font-size: 12px;',
            text: _('Groups')
        }).inject( this.treeGroup );

        this.searchGroup = new Element('input', {
            'class': 'text users-acl-search',
            value: _('Search ...'),
            style: 'position: absolute; left: 3px; top: 25px;'
        })
        .addEvent('focus', function(){
        	if( this.value == _('Search ...') ){
        		this.value = '';
        		this.setStyle('color', 'gray');
        	}
        })
        .addEvent('blur', function(){
        	if( this.value == '' ){
        		this.value = _('Search ...');
        		this.setStyle('color', 'silver');
        	}
        })
        .addEvent('keyup', this.doSearch.bindWithEvent(this, 'group') )
        .inject( this.treeGroup );


        this.searchGroup.fireEvent('keyup');
        this.searchUser.fireEvent('keyup');

        this.mainContentPane = new Element('div', {
            'class': 'users-acl-contentPane'
        }).inject( this.win.content );
        
        new Element('div', {
            style: 'padding: 25px; font-size: 25px; color: gray;',
            text: _('Please choose a user or a group.')
        }).inject( this.mainContentPane );

        this.tabPanes = new Hash();
        this.tabPanes['general'] = new Element('div', {
            'class': 'users-acl-panel'
        }).inject( this.mainContentPane );

        this.tabPanes['pages'] = new Element('div', {
            'class': 'users-acl-panel'
        }).inject( this.mainContentPane );

        this.aclPanelPanel = this.tabPanes['general'];
        
        
        this.aclContainer = {};
        this.aclTrees = {};
        
        ['general', 'pages'].each(function(item){
        	  
        	var container = this.tabPanes[item];
        	container.empty();
        	
            //create layout of the tabpane
            var aclTree = new Element('div', {
            	'class': 'users-acl-aclTree treeContainer'
            }).inject(container);
            
           
            this.aclContainer[item] = new Element('div', {
            	'class': 'users-acl-aclContainer'
            }).inject(container);
            
            if( item == 'general' ){

            	aclTree.setStyle('top', 0);
            	this.aclTrees[item] = new users_users_acl_aclTree( aclTree, container, this);
            	
            } else {

            	var barTop = new Element('div',{
            		'class': 'users-acl-infoBar',
            		style: 'left: 0px;'
            	}).inject( container );

            	aclTree.setStyle('width', '41%');
            	this.aclContainer[item].setStyle('width', '59%');
            	barTop.setStyle('width', '41%');
            	
            	var barTopDiv = new Element('div', {'class': '', style: 'position: absolute; left: 0px; top: 0px; right: 0px; bottom: 0px; overflow: atuo;'}).inject( barTop );
            	
            	this.aclPageTreeContainer = new Element('div').inject( aclTree );            	

            	this.languageChooser = new Element('select')
            	.addEvent('change', this.loadPageTrees.bind(this))
            	.inject( barTopDiv );
            	
                $H(ka.settings.langs).each(function(lang,id){
                    new Element('option', {
                        text: lang.langtitle+' ('+lang.title+', '+id+')',
                        value: id
                    }).inject( this.languageChooser );
                }.bind(this));
            	
            	
            	this.languageChooser.fireEvent('change');
            }
            
            //new ka.Button(_('Add Rule')).addEvent('click', this.addRule.bind(this)).inject( menuTop );
            
        }.bind(this));
        
    },
    
    loadPageTrees: function(){

    	this.pageTrees = {};
    	
        if( this.lastPageTreesLoad )
        	this.lastPageTreesLoad.cancel();
        
        this.aclPageTreeContainer.empty();
        
        var _this = this;
        this.lastPageTreesLoad = new Request.JSON({url: _path+'admin/users/users/acl/loadDomains', noCache: 1, onComplete: function( pDomains){
        	
        	pDomains.each(function(domain){
        	
	        	this.pageTrees[domain['rsn']] = new ka.pagesTree( this.aclPageTreeContainer, domain['rsn'], {
	                onClick: function( pPage ){
	                    $H(_this.pageTrees).each(function(_domain){
	                        _domain.unselect();
	                    });
	                    //_this.loadPage( pPage.rsn );
	                },
	                onDomainClick: function( pDomain ){
	                	 $H(_this.pageTrees).each(function(_domain){
	                        _domain.unselect();
	                    });
	                    //_this.showDomain( pDomain );
	                },
	                noDrag: true,
	                viewAllPages: true,
	                win: this.win,
	                onReady: function(){
	                	_this.prepareDragnDropPagesTree( _this.pageTrees[domain['rsn']] );
	                	_this.updatePageTreeInfos( domain['rsn'] );
	                }
	            });
        	}.bind(this));
        
        }.bind(this)}).post({lang: this.languageChooser.value});
        
    },
    
    prepareDragnDropPagesTree: function( pPageTree ){
        var _this = this;
		pPageTree.pane.getElements('div.pagesTree-pageItem div.title').each(function(element){
		
			var item = element.getParent().retrieve('item');
			
			var rsn = 'p'+item.rsn;
			if( item.rsn == 0 )
				rsn = 'd'+item.domain_rsn;
			
			element.addEvent('click', function(){
				this.renderAcl( rsn, 2 );
			}.bind(this));
			
		}.bind(this));
    },

    /*loadExts: function(){
    	
    	this.loader.show();
        new Request.JSON({url: _path+'admin/users/users/acl/loadTree', noCache: 1, onComplete: function(res){
            this.loader.hide();
            
            users_users_acl_admins = {};
            
            $H(res).each(function(ext, extCode){
            	if( ext.admin ){
            		users_users_acl_admins[extCode] = {title: ext.title, childs: ext.admin};
            	}
            }.bind(this));
            
        }.bind(this)}).post();
    },*/

    
    loadPages: function(){

        var lang = this.languageSelect.value;
        this.domainPanel.empty();;

        var _this = this;
        this._domains = new Hash({});
        this.domainTrees = new Hash();
        this.pleaseSeletPage.setStyle('display', 'block');

        new Request.JSON({url: _path+'admin/pages/getDomains/', onComplete: function(res){
            if(! res ) return;
            res.each(function(domain){
                _this._domains.include( domain.rsn, domain );
                _this.domainTrees.include(domain.rsn, new ka.pagesTree( _this.domainPanel, domain.rsn, {
                    onClick: function( pPage ){
                        _this.domainTrees.each(function(_domain){
                            _domain.unselect();
                        });
                        _this.loadPageAcl( pPage.rsn );
                    },
                    onDomainClick: function( pDomain ){
                        _this.domainTrees.each(function(_domain){
                            _domain.unselect();
                        });
                        _this.loadDomainAcl( pDomain );
                    }
                }));
            });
        }}).post({language: lang});
    },

    loadPageAcl: function( pPage ){
        this.pleaseSeletPage.setStyle('display', 'none');
    },

    loadDomainAcl: function( pDomain ){
        this.pleaseSeletPage.setStyle('display', 'none');
    },

    save: function(){
        /*this.acls = this.acls.filter(function(item, index){
            return item < 2;
        });*/

    	this.saveBtn.startTip( _('Save ...') );
        
        this.readCurrentAcl();
        
        var aclsAdmin = {};
        var aclsPages = {};
        
        $H(this.currentAcls).each(function(acl){
        	if( acl.type == 1 ){
        		aclsAdmin[acl.code] = acl.access;
        	}
        	if( acl.type == 2 ){
        		aclsPages[acl.code] = acl.access;
        	}
        });

        new Request.JSON({url: _path+'admin/users/users/acl/save', noCache: 1, onComplete: function(res){
        	this.saveBtn.stopTip( _('Saved') );
            ka.loadMenu();
            ka.loadSettings();
        }.bind(this)}).post({
        	acl_target_rsn: this.acl_target_rsn,
        	acl_target_type: this.acl_target_type,
        	aclsadmin: JSON.encode(aclsAdmin),
        	aclspages: JSON.encode(aclsPages)
        });
    },

    setType: function( pType ){
        this.type = pType;
        this.tabButtons.each(function(button, id){
            button.setPressed(false);
            this.tabPanes[id].setStyle('display', 'none');
        }.bind(this));
        this.tabButtons[pType].setPressed(true);
        this.tabPanes[pType].setStyle('display', 'block');


		this.updatePageTreeInfos();
		
    },
    
    updatePageTreeInfos: function( pDomainRsn ){
    	
    	if( pDomainRsn ){
    		
    		this._updatePageTreeInfos( this.pageTrees[pDomainRsn], pDomainRsn );
    		
    	} else {
	    	$H(this.pageTrees).each(function(domainTree, domainRsn){
	    		domainTree.updateDomainBar();
	    		this._updatePageTreeInfos( domainTree, domainRsn );
	    	}.bind(this));
    	}
    	
    },
    
    _updatePageTreeInfos: function( pDomain, pDomainRsn ){
    	
    	
    	logger(this.currentAcls);
    	pDomain.pane.getElements('.pagesTree-pageItem').each(function(element){
    		
    		
    		if( element.getChildren('img.users-acl-info') )
				element.getChildren('img.users-acl-info').destroy();
    		
    		var childContainer = element.getNext('.pagesTree-newLvL');
    		if( !childContainer )
    			childContainer = element.getPrevious('.pagesTree-newLvL');
    		
    		if( childContainer )
    			childContainer.setStyle('border-left', '0px');

			
			var found = false;
			var item = element.retrieve('item');
			
			var rsn = 'p'+item.rsn;
			if( item.rsn == 0 )
				rsn = 'd'+item.domain_rsn;
			
			var acl = false;
			if( this.currentAcls )
				acl = this.currentAcls[ rsn ];
			
			if( !acl ) return;
			
			var withSub = acl.code.test('%');
			
			var img = (acl.access==1)?'accept.png':'stop.png';
			new Element('img', {
				src: _path+'inc/template/admin/images/icons/'+img,
				'class': 'users-acl-info',
				style: 'position: absolute; left: -7px; top: 3px',
				width: 10,
				height: 10
			}).inject( element );
			
			var color = 'green';
			if( acl.access != 1 )
				color = 'red';
			
			var childContainer = element.getNext('.pagesTree-newLvL');
			if( item.rsn == 0 )
				childContainer = element.getPrevious('.pagesTree-newLvL');
			
			if( withSub && childContainer  ){
				childContainer.setStyle('border-left', '1px solid '+color);
			}
    		

		}.bind(this));
    },
    
    updateTreeInfos: function(){
    	
		this.aclTrees['general'].main.getElements('a').each(function(element){
			
			if( element.getChildren('img') )
				element.getChildren('img').destroy();
			element.getNext('.users-acl-tree-childcontainer').setStyle('border-left', '0px');

			
			var found = false;
			var code = element.retrieve('code');
			
			var acl = false;
			if( this.currentAcls )
				acl = this.currentAcls[ code.replace('%','') ];
			
			if( !acl ) return;
			
			var withSub = acl.code.test('%');
			
				
			var img = (acl.access==1)?'accept.png':'stop.png';
			new Element('img', {
				src: _path+'inc/template/admin/images/icons/'+img,
				style: 'position: absolute; left: -10px; top: 3px',
				width: 10,
				height: 10
			}).inject( element );
			
			var color = 'green';
			if( acl.access != 1 )
				color = 'red';
			
			var childContainer = element.getNext('.users-acl-tree-childcontainer');
			
			if( withSub && childContainer ){
				childContainer.setStyle('border-left', '1px solid '+color);
			}
				
		}.bind(this));
    },
    
    
    renderAcl: function( pCode, pType, pObj ){
    	
    	if( pType == 1 && pObj ){
    		if( this.lastSelectedObj )
    			this.lastSelectedObj.removeClass('selected');
    		pObj.addClass('selected');
    		this.lastSelectedObj = pObj;
    	}
    	
    	
    	if( this.lastActiveAclObj ){
    		this.currentAcls[ this.lastActiveAclCode ] = this.lastActiveAclObj.getValue();
    		this.lastActiveAclObj.main.destroy();
    		this.lastActiveAclObj = null;
    		this.lastActiveAclCode = null;
    	}
    	
    	if( this.lastTableNoAclInfo )
    		this.lastTableNoAclInfo.destroy();
    	
    	var acl = false;
    	
    	
    	if( this.currentAcls[pCode] )
    		acl = this.currentAcls[pCode];
    	
    	var reload = false;
    	if( !acl ){
    		var code = pCode;
			if( pType == 2 ){
				code = code+'%[]';
			} else {
				code += '%';
			}
    		acl = {
				type: pType,
				code: code,
				access: 1,
				target_type: this.acl_target_type,
				target_rsn: this.acl_target_rsn
			}

    		this.currentAcls[pCode] = acl;
    		
    		reload = true;
    	}

		var target = (pType == 1)?'general':'pages';
		
    	if( acl ){
	    	if( pType == 2 ){
	    		
	    		this.lastActiveAclObj = new users_users_acl_pages( acl, this.aclContainer[target] );
	        	this.lastActiveAclObj.addEvent('change', function( pDomainRsn ){
	    			this.readCurrentAcl();
	    			this.updatePageTreeInfos( pDomainRsn );
	    		}.bind(this));
	        	
	        	this.win.removeEvents('resize');
	        	this.win.addEvent('resize', function(){
	        		if( this.lastActiveAclObj )
	        			this.lastActiveAclObj.updateHeight();
	        	}.bind(this));
	    		
	    	} else {
	    		
	    		this.lastActiveAclObj = new users_users_acl_admin( acl );
	    		this.lastActiveAclObj.addEvent('change', function(){
	    			this.readCurrentAcl();
	    			this.updateTreeInfos();
	    		}.bind(this));
				this.lastActiveAclObj.inject(this.aclContainer[target]);
	
	    	}
			this.lastActiveAclCode = pCode;
			
			this.lastActiveAclObj.parentObject = this;
			
			this.lastActiveAclObj.addEvent('remove', function(){
				this.removeAcl();
			}.bind(this));
			
			if( reload ){
				this.updateTreeInfos();
				this.updatePageTreeInfos();
			}
			
    	} else {
    		
    		/*var code = pCode;
			if( pType == 2 ){
				code = code+'%[]';
			} else {
				code += '%';
			}
			
    		this.renderAcl(pCode, pType, {
				type: pType,
				code: code,
				access: 1,
				target_type: this.acl_target_type,
				target_rsn: this.acl_target_rsn
			});
    		
			this.updateTreeInfos();
			this.updatePageTreeInfos();
			*/
    		
    		/*
    		this.lastTableNoAclInfo = new Element('div',{
    			'class': 'users-acl-item-main'
    		})
    		
    		var table = new Element('table', {style: 'height: 100%; width: 100%;'}).inject( this.lastTableNoAclInfo );
    		var tbody = new Element('tbody').inject( table );
    		var tr = new Element('tr').inject( tbody );
    		var td = new Element('td', {style: 'vertical-align: middle; text-align: center;'}).inject( tr );
    		
    		new ka.Button(_('Create a rule'))
    		.addEvent('click', function(){
    			
    			

    		}.bind(this))
    		.inject( td );
    		
			this.lastTableNoAclInfo.inject(this.aclContainer[target]);
			*/
    	}
    	
    },
    
    removeAcl: function(){
    	delete this.currentAcls[this.lastActiveAclCode];
    	
		if( this.lastSelectedObj )
			this.lastSelectedObj.removeClass('selected');
		
		$H(this.pageTrees).each(function(_domain){
            _domain.unselect();
        });
    	
		delete this.lastSelectedObj;
    	this.lastActiveAclCode = null;
    	this.lastActiveAclObj = null;
    	
		this.updateTreeInfos();
		this.updatePageTreeInfos();
    },
    
    readCurrentAcl: function(){
    	if( this.lastActiveAclCode )
    		this.currentAcls[ this.lastActiveAclCode ] = this.lastActiveAclObj.getValue();
    },

    loadAcl: function( pTargetType ){

        this.currentAcls = {};
        this.lastActiveAclObj = null;
        
        if( this.lastLoad )
            this.lastLoad.cancel();


        this.tabGroup.show();
        this.saveGroup.show();
        //this.aclType = pTargetType;

        var list = (pTargetType == 'group') ? this.listGroup : this.listUser;

        this.aclContainer['general'].empty();
        this.aclContainer['pages'].empty();
        
        var list2Deselect = (pTargetType == 'group') ? this.listUser : this.listGroup;
        list2Deselect.getElements('option').set('selected', false);

        /*this.currentAcl = { //for information display
            rsn: list.value,
            title: list.getSelected().get('text')
        };*/

        if( !this.type )
        	this.type = 'general';
        
        this.setType(this.type);
        
        /*this._acls.each(function(obj){
            if( obj.get('tag') == 'a' )
                obj.set('class', 'users-acl-item');
            else
                obj.set('class', 'users-acl-group');
        });

        this.allAccessCb.setValue( false );
        this.loginAccessCb.setValue( false );
        */
        
        var type = (this.type == 'general') ? 1 : 2;
        this.aclType = type;
        
        this.acl_target_type = (pTargetType == 'group' ) ? 1 : 2;
        this.acl_type = type;
        this.acl_target_rsn = list.value;
        
        this.lastLoad = new Request.JSON({url: _path+'admin/users/users/acl/load/', noCache: 1, onComplete: function(res){
        
            this.lastRsn = list.value;
            this.currentAcls = {};
        	
        	if( $type(res) == 'array' ){
	        	res.each(function(item){
	        		
	        		if( item.type == 2 ){
	        			
	        			var rsn = item.code.replace('%', '').split('[')[0];
	            		this.currentAcls[ rsn ] = item;
	        			
	        		} else {
	            		this.currentAcls[ item.code.replace('%','') ] = item;
	        		}
	        		
	        	}.bind(this));
        	}
            //this.renderAcls( res );
            
            this.updatePageTreeInfos();
            this.updateTreeInfos();
            
            //this.viewAcls(res);
            
        }.bind(this)}).post({
        	acl_target_type: this.acl_target_type,
        	acl_target_rsn: this.acl_target_rsn
        });
    },
    
    doSearch: function( e, pType ){

        lastSearch = (pType == 'group') ? this.lastGroupSearch : this.lastUserSearch;
        
        if( lastSearch )
            lastSearch.cancel();

        
        var list = (pType == 'group') ? this.listGroup : this.listUser;
        var entry = (pType == 'group') ? this.searchGroup : this.searchUser;
        
        var q = entry.value;
        if( q == _('Search ...') )
        	q = '';
        
        lastSearch = new Request.JSON({url: _path+'admin/users/users/acl/search/', noCache: 1, onComplete: function(res){
            list.empty();
            res.each(function(item){
                var label = ( pType == 'user')?'username':'name';
                new Element('option', {
                    text: item[label],
                    value: item.rsn
                }).inject( list );
            });
        }.bind(this)}).post({ q: q, type: pType });

        if( pType == 'group' )
            this.lastGroupSearch = lastSearch;
        else
            this.lastUserSearch = lastSearch;

    }
    
});
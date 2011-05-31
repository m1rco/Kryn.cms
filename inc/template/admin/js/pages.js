var admin_pages = new Class({

	versionsSetLiveBtns: [],
	versionsLoadBtns: [],
	trys: 0,
	
    initialize: function( pWin ){
        
        Date.defineFormat('version', '%d.%m.%Y, %H:%M:%S');

        this.win = pWin;
        this.win.kwin = this;
        this.win.forceOverlay =  true;

        $H(ka.settings.get('langs')).each(function(lang,key){
            if( this.language ) return;
            this.language = key;
        }.bind(this));
        
        if( this.win.params && this.win.params.lang ){
            this.language = this.win.params.lang;
        }

        this.lastLoadedLayoutCssFiles = [];

        this.aclCanLivePublish = true; //todo read from acl

        this.viewButtons = new Hash();
        this.panes = new Hash();
        this._createLayout();

        this.domainTrees = new Hash();
        this.alreadyOnLoadPageLoaded = false;
        this.loadTree();
    },

    overlayStart: function(){
        this.overlayEnd();
        this.overlay = new Element('div', {
            styles: {
                left: 0, right: 0, top: 0, bottom: 0,
                position: 'absolute',
                'background-color': 'silver', opacity: 0.1
            }
        }).inject( this.win.content );
    },

    overlayEnd: function(){
        if( this.overlay ) this.overlay.destroy();
    },

    /*
    * LOAD PAGE
    */

    loadPage: function( pRsn, pSelect, pVersion ){

    	

        this.inDomainModus = false;
        
        this._hideElementPropertyToolbar();
        this.hidePluginChooserPane();
        this.alreadyOnLoadPageLoaded = true;
        
        if( this.iframe ) this.iframe.destroy();
        this.iframe = null;

        this.layoutBoxes = new Hash();
        this.layoutBoxesInitialized = false;

        if( this.oldLoadPageRequest )
            this.oldLoadPageRequest.cancel();

        this.rsn = pRsn;
        this.oldPage = this.page;
        this.versionType = (pVersion)?'version':'live';
        this.loader.setStyle('display', 'block');

        this.oldLoadPageRequest = new Request.JSON({url: _path+'admin/pages/getPage', noCache: 1, onComplete: function(res){

            this.saveDomainGrp.hide();
            this.savePageGrp.show();

            this.viewTypeGrpDomain.hide();
            this.viewTypeGrp.show();
            this.deleteDomainGrp.hide();
            this.deletePageGrp.show();
            

            this.page = res;

            if( pSelect && this.page.rsn ){
            	var pTree =  this.domainTrees.get( this.page.domain_rsn );
            	if( pTree.isReady() ){
            		pTree.select( this.page.rsn );
            	} else {
	            	pTree.addEvent('ready', function(){
	            		pTree.select( this.page.rsn );
	            		pTree.removeEvents('ready');
	            	}.bind(this));
            	}
            }

            this._loadPage();
            this.loader.setStyle('display', 'none');

        }.bind(this)}).post({ rsn: pRsn, versionType: this.versionType });
    },

    _loadPage: function(){
        this.savedPage = this.page;

        if( (this.page.type != 0 && this.page.type != 3) || (this.currentViewType == 'content' || this.currentViewType == 'versioning' || (this.currentViewType == 'searchIndex' && this.page.type != 0)) )
            this.viewType( 'general' );
        else if(!this.currentViewType || this.currentViewType == 'empty' || this.currentViewType == 'domain' || this.currentViewType == 'domainSettings' || this.currentViewType == 'domainTheme' )
            this.viewType( 'general' );
        

        var myurl = '';
        if( this.page.realUrl ){
            myurl = this.page.realUrl.substring(0, this.page.realUrl.length-this.page.url.length );
        }
        this.generalFieldsUrlPath.set('html', '<b>http://'+ka.getDomain(this.page.domain_rsn).domain+'/'+myurl+'</b>' );
            
        this.win.setTitle ( this.page.title + ' - '+_('Page edit') );
        this.generalFields['type'].setValue( this.page.type  );
        this.generalFields['title'].setValue( this.page.title  );
        this.generalFields['page_title'].setValue( this.page.page_title  );
        this.generalFields['url'].setValue( this.page.url );
//xxx        this.generalFields['template'].setValue( this.page.template );

        var d = ka.getDomain( this.page.domain_rsn );

        this.win.params = {rsn: this.page.rsn, lang: d.lang};

        limitLayouts = false;
        if( $type(d.layouts) == 'string' ){
            limitLayouts = $A(JSON.decode(d.layouts));
        }

        this.layout.empty();

        new Element('option', {
            html: _(' -- No layout --'),
            value: ''
        }).inject( this.layout );

        $H(ka.settings.layouts).each(function(la, key){
            var group = new Element('optgroup', {
                label: key
            }).inject( this.layout );
            var count = 0;
            $H(la).each(function(layoutFile,layoutTitle){
                if( limitLayouts && limitLayouts.length > 0 && !limitLayouts.contains( layoutFile ) ) return;
                new Element('option', {
                    html: (layoutTitle),
                    value: layoutFile
                }).inject( group );
                count++;
            })
            if( count == 0 )
                group.destroy();
        }.bind(this));

        
        //set page propertie to default
    	$H(this._pagePropertiesFields).each(function(fields, extKey){
    		$H(fields).each(function(field){
    			field.setValue();
    		})
    	});
    	this.page.properties = JSON.decode(this.page.properties);
        if( this.page.properties ){
        	
        	//set page values
        	$H(this.page.properties).each(function(properties, extKey){
        		
        		$H(properties).each(function(property, propertyKey){
        			
        			if( this._pagePropertiesFields[extKey] && this._pagePropertiesFields[extKey][propertyKey] ){
        				this._pagePropertiesFields[extKey][propertyKey].setValue(property);
        			}
        			
        		}.bind(this))
        		
        		
        	}.bind(this))
        	
        }

        this.generalFields['layout'].setValue( this.page.layout );
        this.generalFields['target'].setValue( this.page.target );
        this.generalFields['link'].setValue( this.page.link );
        this.generalFields['link'].field.domain = this.page.domain_rsn;

        this.generalFields['visible'].setValue( this.page.visible );
        this.generalFields['access_denied'].setValue( this.page.access_denied );
        this.generalFields['force_https'].setValue( this.page.force_https );
        this.generalFields['access_from'].setValue( this.page.access_from );
        this.generalFields['access_to'].setValue( this.page.access_to );

        var temp = '';
        if( this.page.access_from_groups ) {
            temp = this.page.access_from_groups.split(',');
        }
        this.generalFields['access_from_groups'].setValue( temp );
        this.generalFields['access_nohidenavi'].setValue( this.page.access_nohidenavi );
        this.generalFields['access_need_via'].setValue( this.page.access_need_via );
        
        this.generalFields['access_redirectto'].setValue( this.page.access_redirectto );
        this.generalFields['unsearchable'].setValue( this.page.unsearchable );
        
        search_words = (this.page.search_words)?this.page.search_words:'';
        this.generalFields['search_words'].setValue( search_words );


        this.generalFields['resourcesCss'].setValue( this.page.resourcesCss );
        this.generalFields['resourcesJs'].setValue( this.page.resourcesJs );

        var metas = JSON.decode(this.page.meta);
        this.clearMeta();
        this._metas = [];
        var keywords = '';
        var description= '';
        if( metas ){
            var nmetas = new Hash();
            metas.each(function(pMeta){
                if( pMeta )
                    nmetas.include( pMeta.name, pMeta.value );
            });
            metas = nmetas;
            metas.each(function(value,key){
                if( key != 'keywords' && key != 'description' )
                this.addMeta({key:key,value:value});
            }.bind(this));
            keywords = (metas.keywords)?metas.keywords:'';
            description = (metas.description)?metas.description:'';
        }
        this.generalFields['metaKeywords'].setValue(keywords);
        this.generalFields['metaDesc'].setValue(description);
        
        
        this.versions.empty();
        this.loadVersions();
        

    	this.urlAliase.empty();
    	
        if( this.page.alias ){
        	
        	this.renderAlias();
        	
        }
        
        if(this.page.type == 0)
        	this.loadSearchIndexOverview();
        
        this.changeType();
        
    },
    
    renderAlias: function(){
    	this.urlAliase.empty();
    	if( $type(this.page.alias) != 'array' ) return;
    	if( this.page.alias.length == 0 ) return;
    	
    	new Element('div', {
    		text: _('For this page exists some URL aliases.'),
    		style: 'margin: 3px 0px; color: gray;'
    	}).inject(this.urlAliase);
    	
    	var table = new Element('table', {
    		cellpadding: 4,
    		cellspacing: 0,
			style: 'width: 300px; border-top: 1px solid #ddd;'
    	}).inject( this.urlAliase );
    	var tbody = new Element('tbody').inject( table );
    	
    	this.page.alias.each(function(item){
    		var tr = new Element('tr').inject( tbody );
    		
    		new Element('td', {
    			html: '&raquo; '+item.url,
    			style: 'border-bottom: 1px solid #ddd;'
    		}).inject(tr);
    		
    		var td = new Element('td', {
    			width: 20,
    			align: 'center',
    			valign: 'top',
    			style: 'border-bottom: 1px solid #ddd;'
    		}).inject(tr);
    		
    		new Element('img', {
    			src: _path+'inc/template/admin/images/icons/delete.png',
    			style: 'cursor: pointer;',
    			title: _('Delete this alias')
    		})
    		.addEvent('click', function(){
    			this.deleteAlias( item.rsn );
    		}.bind(this))
    		.inject( td );
    	}.bind(this));
    },

    deleteAlias: function( pRsn ){
    	
    	this.win._confirm(_('Really delete this alias?'), function(p){
    		if( !p ) return;

        	new Request.JSON({url: _path+'admin/pages/deleteAlias', noCache: 1, onComplete: function(){
        		this.loadAliases();
        	}.bind(this)}).post({rsn: pRsn});
        	
    	}.bind(this));
    	
    	
    },
    
    loadAliases: function(){
    	
    	new Request.JSON({url: _path+'admin/pages/getAliases', noCache: 1, onComplete: function( pAliases ){
    		
    		this.page.alias = pAliases;
    		this.renderAlias();
    		
    	}.bind(this)}).post({page_rsn: this.page.rsn});
    	
    },

    loadVersions: function( pSetToNewestVersion ){
        if( this.oldLoadVersionsRequest )
            this.oldLoadVersionsRequest.cancel();

        this._versionsLive = {};
        this.oldLoadVersionsRequest = new Request.JSON({url: _path+'admin/pages/getVersions', noCache: 1, onComplete: function(res){

            this.versionBox.empty();

            if( !res ){
                this.versionBox.set( 'text', _('No versions') );
            } else {
            	
                this.versions = new Element('select', {
                })
                .addEvent('change', function(){
                    this.loadVersion( this.versions.value );
                }.bind(this)).inject( this.versionBox );

                res.each(function(version){
                    var text = (new Date(version.modified*1000)).format('version');
                    text = '#'+version.rsn+' by '+version.username+' ('+text+')';
                    if( version.active == 1 )
                        text = '[LIVE] '+text;
                    new Element('option', {
                        value: version.rsn,
                        text: text
                    }).inject( this.versions );
                    
                	this._versionsLive[ version.rsn ] = version.active;
                }.bind(this));
                
                if( !pSetToNewestVersion ){
                    this.versions.value = this.page._activeVersion;
                }
            }
/*
            if( this.page.versions ){
                this.page.versions.each(function(version){
                    new Element('option', {
                        value: version.version_rsn,
                        text: (new Date(version.mdate*1000)).format('version')
                    }).inject( this.versions );
                }.bind(this));
            }
*/

        }.bind(this)}).post({rsn: this.page.rsn, versionType: this.versionType });
    },

    /*
    * CREATE LAYOUT 
    */


    hideBarHover: function(){
        this.hideBarHoverOutActive = false;
        this.treeContainer.set('tween', {onComplete: function(){
        }.bind(this)});
        /*this.treeContainer.setStyles({
            'display': 'none',
            'opacity': 0
        });*/
        this.tree.setStyle('height', '100%');
        this.treeContainer.tween('opacity', 0.95);
        this.treeSizer.tween('opacity', 1);
    },

    hideBarHoverOut: function(){
        this.hideBarHoverOutActive = true;
        (function(){
            if( this.hideBarHoverOutActive ){
                this.treeContainer.set('tween', {onComplete: function(){
                    this.tree.setStyle('height', '25px');
                }.bind(this)});
                this.treeContainer.tween('opacity', 0);
                this.treeSizer.tween('opacity', 0);
            }
        }.bind(this)).delay(200);
    },

    toggleHiderMode: function(){
        if( this.inHideMode != true ){
            this.inHideMode = true;
            this.oldMainPosition = this.main.getStyle('left').toInt();
            this.main.setStyle('left', 0);
            this.treeBar.setStyle( 'opacity', 0.7 );
            this.treeContainer.setStyle('opacity', 0);
            this.tree.setStyle('height', '25px');
            this.treeSizer.setStyle('opacity', 0);
            this.treeHider.set('src', _path+'inc/template/admin/images/pages-tree-bar-arrow-down.jpg');
            this.treeBar.addEvent('mouseover', this.hideBarHover.bind(this));
            this.treeBar.addEvent('mouseout', this.hideBarHoverOut.bind(this));
            this.treeSizer.addEvent('mouseover', this.hideBarHover.bind(this));
            this.treeSizer.addEvent('mouseout', this.hideBarHoverOut.bind(this));
            this.treeContainer.addEvent('mouseover', this.hideBarHover.bind(this));
            this.treeContainer.addEvent('mouseout', this.hideBarHoverOut.bind(this));

            //to win.content
            this.elementPropertyToolbar.inject( this.tree, 'before' );
            this.treeContainer.setStyle('bottom', 3);
        } else {
            this.inHideMode = false;

            this.treeSizer.removeEvents('mouseover');
            this.treeSizer.removeEvents('mouseout');
            this.treeBar.removeEvents('mouseover');
            this.treeBar.removeEvents('mouseout');
            this.treeContainer.removeEvents('mouseout');
            this.treeContainer.removeEvents('mouseover');

            this.treeBar.setStyle( 'opacity', 1 );
            this.main.setStyle('left', this.oldMainPosition);
            this.treeContainer.setStyle('opacity', 1);
            this.tree.setStyle('height', '100%');
            this.treeSizer.setStyle('opacity', 1);
            this.treeHider.set('src', _path+'inc/template/admin/images/pages-tree-bar-arrow.jpg');

            if( this.elementPropertyToolbar.getSize().y > 1 )
                this.treeContainer.tween('bottom', 221);

            this.elementPropertyToolbar.inject( this.tree );
        }
    },

    _createLayout: function(){
        var p = _path+'inc/template/admin/images/';
        
        var btnGrp = this.win.addButtonGroup();
        btnGrp.addButton( _('New domain'), _path+'inc/template/admin/images/icons/world_add.png', this.addDomain.bind(this));


        this.main = new Element('div', {
            styles: {
                position: 'absolute',
                left: 211, right: 0, 'top': 0, bottom: 0,
                'background-color': '#eee',
                'border-left': '1px solid silver',
                overflow: 'auto'
            }
        }).inject( this.win.content );

        
        this.tree = new Element('div', {
            'class': 'ka-pages-tree',
            styles: {
                position: 'absolute',
                left: 0, 'top': 0, 'overflow': 'visible', width: 200, height: '100%'
            }
        }).inject( this.win.content );

        this.treeContainer = new Element('div', {
        	'class': 'treeContainer',
            styles: {
                position: 'absolute',
                'background-color': '#f3f3f3',
                left: 0, right: 0, 'top': 17, bottom: 3,
                overflow: 'auto'
            }
        }).inject( this.tree );
        this.treeContainer.set('tween', {duration: 300});

        this.treeContainerTable = new Element('table', {
        	style: 'width: 100%',
        	cellpadding: 0,
        	cellspacing: 0
        }).inject(this.treeContainer);
        
        this.treeContainerTbody = new Element('tbody').inject(this.treeContainerTable);
        this.treeContainerTr = new Element('tr').inject(this.treeContainerTbody);
        this.treeContainerTd = new Element('td').inject(this.treeContainerTr);

        this.treeSizer = new Element('div', {
            style: 'position: absolute; right: -7px; top: 0px; width: 5px; height: 100%; cursor: e-resize; border-left: 1px solid silver; border-right: 1px solid silver;'
        }).inject( this.tree );

        //init toolbar
        this._createElementSettingsToolbar();
        
        
        
        
        this.pluginChooserPane = new Element('div', {
            'class': 'ka-pages-pluginchooserpane',
            style: 'position: absolute; left: 0px; bottom: 0px; height: 0px; width: 0px; background-color: #eee; overflow: auto;'
        }).inject( this.tree );
        this.pluginChooserPane.set('tween', {transition: Fx.Transitions.Cubic.easeOut});


//        this.treeContainer.setStyle('bottom', 0);



        /*
            * searchbar and hider
        */

        this.treeBar = new Element('div', {
            styles: {
                position: 'absolute',
                left: 0, right: 0, 'top': 0, height: 16,
                cursor: 'pointer',
                'background-image': 'url('+_path+'inc/template/admin/images/pages-tree-bar-bg.jpg)'
            }
        })
        .addEvent('click', this.toggleHiderMode.bind(this))
        .inject( this.tree, 'top' );

        this.treeHider = new Element('img', {
            style: 'margin-left: 5px;',
            src: _path+'inc/template/admin/images/pages-tree-bar-arrow.jpg',
        })
        .inject( this.treeBar );


        var left = 220;//todo maybe set into a cookie
        if( left > 0 ){
            this.tree.setStyle('width', left );
            this.main.setStyle('left', left+6 );
            this.win.titleGroups.setStyle('padding-left', left-56);
        }

        var _this = this;
        this.tree.makeResizable({
            grid: 1,
            snap: 0,
            handle: this.treeSizer,
            onDrag: function( el, ev ){
                el.setStyle('height', '100%');
                //_this.main.setStyle('left', _this.treeSizer.getPosition(_this.tree).x+9);
                var left = _this.tree.getSize().x;
                if( _this.inHideMode ){
                    _this.oldMainPosition = left+6;
                } else {
                    _this.main.setStyle('left', left+6);
                }
                if( left-56 >= 160 )
                    _this.win.titleGroups.setStyle('padding-left', left-56);
                else
                    _this.win.titleGroups.setStyle('padding-left', 160);
            },
            onStart: function(){
                _this.overlayStart();
            },
            onComplete: function(el){
                _this.overlayEnd();
            },
            onCancel: function(){
                _this.overlayEnd();
            }
        });


        //this.viewTypeGrpDomain = this.win.addButtonGroup();
        this.viewTypeGrpDomain = this.win.addTabGroup();
        this.viewButtons['domain'] = this.viewTypeGrpDomain.addButton( _('Domain'), p+'icons/world.png', this.viewType.bind(this,'domain'));
        this.viewButtons['domainTheme'] = this.viewTypeGrpDomain.addButton( _('Theme'), p+'icons/layout.png', this.viewType.bind(this,'domainTheme'));
        this.viewButtons['domainProperties'] = this.viewTypeGrpDomain.addButton( _('Properties'), p+'icons/layout.png', this.viewType.bind(this,'domainProperties'));
        this.viewButtons['domainSettings'] = this.viewTypeGrpDomain.addButton( _('Settings'), p+'admin-pages-viewType-general.png', this.viewType.bind(this,'domainSettings') );
        this.viewButtons['domain'].setPressed(true);
        this.viewTypeGrpDomain.hide();


        /*pages edit */
        //var viewTypeGrp = this.win.addButtonGroup();
        var viewTypeGrp = this.win.addTabGroup();
        this.viewTypeGrp = viewTypeGrp;
        this.viewTypeGrp.hide();

        this.viewButtons['general'] = viewTypeGrp.addButton( _('General'), p+'admin-pages-viewType-general.png', this.viewType.bind(this,'general'));
        this.viewButtons['rights'] = viewTypeGrp.addButton( _('Access'), p+'admin-pages-viewType-rights.png', this.viewType.bind(this,'rights'));
        
        this.viewButtons['contents'] = viewTypeGrp.addButton( _('Contents'), p+'admin-pages-viewType-content.png', this.viewType.bind(this,'contents'));
        
        this.viewButtons['resources'] = viewTypeGrp.addButton( _('Resources'), p+'admin-pages-viewType-resources.png', this.viewType.bind(this,'resources'));
        this.viewButtons['properties'] = viewTypeGrp.addButton( _('Properties'), p+'icons/plugin_disabled.png', this.viewType.bind(this,'properties'));

        this.viewButtons['searchIndex'] = viewTypeGrp.addButton( _('Search'), p+'admin-pages-viewType-search.png', this.viewType.bind(this,'searchIndex'));

        this.viewButtons['versioning'] = viewTypeGrp.addButton( _('Versions'), p+'admin-pages-viewType-versioning.png', this.viewType.bind(this,'versioning'));


        // save group for page
        var saveGrp = this.win.addButtonGroup();
        this.savePageGrp = saveGrp;
        this.saveButton = saveGrp.addButton( _('Save')+' (SHIFT+ALT+S)', p+'button-save.png', this.save.bind(this));
        //this.saveButtonAndClose = saveGrp.addButton( _('Save and close'), p+'button-save-and-close.png', this.saveAndClose.bind(this));

        if( this.aclCanLivePublish ){
            this.saveButtonPublish = saveGrp.addButton( _('Save and publish'), p+'button-save-and-publish.png', this.saveAndClose.bind(this, true));
        }

//        this.prevBtn = saveGrp.addButton( 'Vorschau', p+'icons/layout_header.png', this.saveAs.bind(this));
        this.liveEditBtn = saveGrp.addButton( 'Zur Seite (SHIFT+ALT+V)', p+'icons/eye.png', function(){
            this.toPage();
        }.bind(this));
        
        
       

        this.savePageGrp.hide();

        this.win.addHotkey( 's', true, true, this.save.bind(this));
        this.win.addHotkey( 'v', true, true, this.toPage.bind(this));

        this.deletePageGrp = this.win.addButtonGroup();
        this.deletePageBtn = this.deletePageGrp.addButton( _('Delete'), p+'remove.png', this.deletePage.bind(this));
        this.searchIndexButton =  this.deletePageGrp.addButton( _('Create search index for this page'), p+'button-index-page.png', function(){
            this.createSearchIndexForPage();
        }.bind(this));
        
        this.deletePageGrp.hide();

        //save group for domain
        var saveGrp = this.win.addButtonGroup();
        this.saveDomainBtn = saveGrp.addButton( _('Save'), p+'button-save.png', this.saveDomain.bind(this));
        this.saveDomainGrp = saveGrp;
        this.saveDomainGrp.hide();

        this.deleteDomainGrp = this.win.addButtonGroup();
        this.deleteDomainGrp.addButton( _('Delete'), p+'remove.png', this.deleteDomain.bind(this));
        this.deleteDomainGrp.hide();

        //right place
        /*
        this.workspaceSelect = new Element('select', {
            style: 'position: absolute; right: 28px; top: 25px; width: 180px; height: 22px'
        }).inject( this.win.border );

        ka.settings.workspaces.each(function(work){
            new Element('option', {
                text: work.name,
                value: work.rsn
            }).inject( this.workspaceSelect );
        }.bind(this));

        this.workspaceAddBtn = new Element('img', {
            src: p+'icons/add.png',
            style: 'position: absolute; right: 7px; top: 28px;'
        }).inject( this.win.border );
        */

        this.languageSelect = new Element('select', {
            style: 'position: absolute; left: 5px; top: 27px; width: 160px; height: 21px'
        }).inject( this.win.border );

        this.languageSelect.addEvent('change', this.changeLanguage.bind(this));

        $H(ka.settings.langs).each(function(lang,id){
            new Element('option', {
                text: lang.langtitle+' ('+lang.title+', '+id+')',
                value: id
            }).inject( this.languageSelect );
        }.bind(this));

        this.languageSelect.value = this.language;
        
        this._createDomain();

        this._createDomainProperties();
        
        this._createGeneral();
        this._createRights();
        this._createContents();
        this._createResources();
        this._createVersioning();
        this._createSearchIndexPane();
        this._createProperties();


        this.loader = new Element('div', {
            styles: {
                position: 'absolute',
                'background-color': '#eee',
                'background-image': 'url('+_path+'inc/template/admin/images/loading.gif)',
                'background-repeat': 'no-repeat',
                'background-position': 'center center',
                left: 0, width: '100%', 'top': 0, bottom: 0
            }
        })
        .setStyle('display', 'none')
        .inject( this.main );


    },

    toPage: function( pPage ){
        if(! pPage || !(pPage.rsn > 0) ) pPage = this.page;
        
        var url = this.getBaseUrl( pPage );

        var url = url + pPage.realUrl + '/';
        
        if(    !this.lastSaveWasPublished &&
                !this.versions.getSelected()[0].get('text').contains('[LIVE]') &&
                this.versions.value != "" ){
            url = url + '/kVersionId:'+this.versions.value+'/';
        }
        window.open( url, "_blank" );
    },
    
    
    createSearchIndexForPage : function (pPage) {
    	 if(! pPage || !(pPage.rsn > 0) ) 
    		 	pPage = this.page;
    	
    	
    	//try getting search index key for force
    	pageDomainRsn = pPage.domain_rsn;
    	dISKey = false;
    	try {
    		dISKey = ka.getDomain(pageDomainRsn).search_index_key;
    	}catch(e) {}
    	
    	 
    	//var indexUrl = this.getBaseUrl( pPage );
    	 var indexUrl = _path;
    	 
    	 if(ka.getDomain(pageDomainRsn).master != 1)
 			indexUrl +=  ka.getDomain(pageDomainRsn).lang+'/';
    	 
    	 
    	 indexUrl += pPage.realUrl;
    	 iReq = {
    			 jsonOut : true,
    			 enableSearchIndexMode : true,
    			 forceSearchIndex: dISKey,
    			 kryn_domain : ka.getDomain(pageDomainRsn).domain
    	 		};
    	 
    	 
         
         this.searchIndexButton.startTip( _('Indexing ...') );
         this.overlayStart();       
        
         new Request.JSON({url: indexUrl, noCache: 1,
        	 onFailure: function(){
	             this.overlay.destroy();     
	             this.searchIndexButton.stopTip(); 
        	 }.bind(this),
        	 onComplete: function(res){
	             this.overlay.destroy();
	             if( !res ){
	            	 res = {msg: _('Failed')};
	             }
	             this.searchIndexButton.stopTip(res.msg);
	             this.loadSearchIndexOverview();
         	 }.bind(this)
         }).post(iReq);    	 	 
    		 
    },
    
    
    toggleSearchIndexButton: function(pType) {
    	if(pType == 0 && this.page.unsearchable != 1)
        	this.searchIndexButton.show();
    	else
    		this.searchIndexButton.hide();
    },
    

    getBaseUrl: function( pPage ){
        if(! pPage || !(pPage.rsn > 0) ) pPage = this.page;
        var d = ka.getDomain( pPage.domain_rsn );

        var prefix = ( typeof(d.path)=='undefined' || d.path == '' || d.path == null ) ? '/' : d.path;

        if( prefix.substr( prefix.length-1, 1 ) != '/' )
            prefix = prefix + '/';

        if( window.location.port != 80 )
            prefix = ":"+window.location.port+prefix;

        if( d.master != 1 )
            prefix = prefix+d.lang+'/';

        var url = 'http://'+d.domain +prefix;
        return url;
    },

    changeLanguage: function(){
        this.language = this.languageSelect.value;
        this.treeContainerTd.empty();
        this.loadTree();
        this.viewType( 'empty' );
        this.savePageGrp.hide();
        this.viewTypeGrp.hide();
        this.saveDomainGrp.hide();
        this.viewTypeGrpDomain.hide();
        this.deleteDomainGrp.hide();
        this.deletePageGrp.hide();
    },

    deleteDomain: function(){
    	

    	this.win._confirm(_('Really delete this domain?'), function(p){
    		if( !p ) return;
    	
	        new Request.JSON({url: _path+'admin/pages/domain/delete', async: false, noCache: 1, onComplete: function(){
	            this.changeLanguage();
	            ka.loadSettings();
	            this.loadTree();
	        }.bind(this)}).post({ rsn: this.currentDomain.rsn });
    	}.bind(this));
    },

    deletePage: function( pPage ){
        if( !pPage || !(pPage.rsn>0) ) pPage = this.page;
        var _this = this;
        this.win._confirm( _('Really remove?'), function(res){
            if(!res) return;
            new Request.JSON({url: _path+'admin/pages/deletePage', async: false, noCache: 1, onComplete: function(){
                _this.domainTrees.get( pPage.domain_rsn ).reload();
            }}).post({ rsn: pPage.rsn });
        });
    },

    changeType: function(){
    	
    	if( this.inDomainModus ){
            this.saveDomainGrp.show();
            this.savePageGrp.hide();

            this.viewTypeGrpDomain.show();
            this.viewTypeGrp.hide();
            
            this.deleteDomainGrp.show();
            this.deletePageGrp.hide();
            
    	} else {
            this.saveDomainGrp.hide();
            this.savePageGrp.show();

            this.viewTypeGrpDomain.hide();
            this.viewTypeGrp.show();
            
            this.deleteDomainGrp.hide();
            this.deletePageGrp.show();
    	}

    	
        var type = this.generalFields['type'].getValue();

        this.generalFields.each(function(field){
        	field.show();
        })
        
        this.viewButtons.each(function(field){
        	field.show();
        })
        
    	if( this.inDomainModus )
            return;
        

        
        this.generalFields['target'].hide();
        this.generalFields['visible'].hide();
        this.aliase.setStyle('display', 'none');
        this.metas.setStyle('display', 'none');

        //this.saveButtonAndClose.hide();
        this.saveButtonPublish.hide();
        this.toggleSearchIndexButton(type);
        
        this.viewButtons['searchIndex'].hide();
        
        this.generalFields['link'].hide();

        if( type == 1 || type == 2 ){//link oder ordner
            this.viewButtons['contents'].hide();
            this.viewButtons['versioning'].hide();                        
            this.viewButtons['resources'].hide();
            this.generalFields['page_title'].hide();
//xxx       this.generalFields['template'].hide();
            //this.prevBtn.hide();
        } else { //page and ablage
            this.viewButtons['contents'].show();
            this.viewButtons['versioning'].show();
            this.viewButtons['properties'].show();
            this.generalFields['page_title'].show();
//xxx       this.generalFields['template'].show();
            //this.prevBtn.show();
        }

        if( type == 3 ){ //ablage
//xxx            this.generalFields['template'].hide();
            this.generalFields['url'].hide();
            this.ablageModus = true;
            //this.prevBtn.hide();
            this.liveEditBtn.hide();
            this.layoutTxt.setStyle('opacity', 0);
            this.layoutTd.setStyle('opacity', 0);
        }

        if( type == 2 ){ //folder
            this.generalFields['url'].hide();
        }

        if( type == 1 ){ //link
            this.generalFields['url'].field.empty = true;
            this.generalFields['target'].show();
            this.generalFields['link'].show();
            this.generalFields['visible'].show();
        }

        if( type == 0 ){
            this.generalFields['url'].field.check = 'kurl';
            this.aliase.setStyle('display', 'block');
            this.metas.setStyle('display', 'block');
            this.ablageModus = false;
            //this.prevBtn.show();         
            
            this.liveEditBtn.show();
            this.layoutTxt.setStyle('opacity', 1);
            this.layoutTd.setStyle('opacity', 1);
            this.viewButtons['searchIndex'].show('inline'); 
            

        	this.layoutTd.setStyle('visibility', 'visible');
            if( !ka.checkPageAccess( this.page.rsn, 'canChangeLayout' ) ){
            	this.layoutTd.setStyle('visibility', 'hidden');
            }
        }

        if( type == 0 || type == 3){ //page or ablage
            this.viewButtons['resources'].show();
            this.generalFields['visible'].show();
           
            if( this.currentViewType == 'contents' )
                this._loadContent();
//            this.saveButtonAndClose.show();
            
            if( ka.checkPageAccess( this.page.rsn, 'canPublish' ) )
            	this.saveButtonPublish.show();
        }
        
        
        //permission
        if( !ka.checkPageAccess( this.page.rsn, 'general' ) ){
        	this.viewButtons['general'].hide();
        	if( this.currentViewType == 'general' ){
        		this.toAlternativPane();
        	}
        }
        
        if( !ka.checkPageAccess( this.page.rsn, 'access' ) ){
        	this.viewButtons['rights'].hide();
        	if( this.currentViewType == 'rights' )
        		this.toAlternativPane();
        }

        if( !ka.checkPageAccess( this.page.rsn, 'contents' ) ){
        	this.viewButtons['contents'].hide();
        	if( this.currentViewType == 'access' )
        		this.toAlternativPane();
        }

        if( !ka.checkPageAccess( this.page.rsn, 'resources' ) ){
        	this.viewButtons['resources'].hide();
        	if( this.currentViewType == 'resources' )
        		this.toAlternativPane();
        }
        
        if( !ka.checkPageAccess( this.page.rsn, 'properties' ) ){
        	this.viewButtons['properties'].hide();
        	if( this.currentViewType == 'properties' )
        		this.toAlternativPane();
        }
        
        if( !ka.checkPageAccess( this.page.rsn, 'search' ) ){
        	this.viewButtons['searchIndex'].hide();
        	if( this.currentViewType == 'searchIndex' )
        		this.toAlternativPane();
        }
        
        if( !ka.checkPageAccess( this.page.rsn, 'versions' ) ){
        	this.viewButtons['versioning'].hide();
        	if( this.currentViewType == 'versioning' )
        		this.toAlternativPane();
        }
        
    	this.deletePageBtn.show();
        if(!ka.checkPageAccess( this.page.rsn, 'deletePages' ) ){
        	this.deletePageBtn.hide();
        }
        
        this.deletePageBtn.show();
        if(!ka.checkPageAccess( this.page.rsn, 'deletePages' ) ){
        	this.deletePageBtn.hide();
        }
        

        ['type', 'title', 'page_title', 'url', 'visible', 'access_denied', 'force_https'].each(function(acl){
            if(!ka.checkPageAccess( this.page.rsn, acl ) ){
                this.generalFields[acl].hide();
            }
        }.bind(this));
        

        if(!ka.checkPageAccess( this.page.rsn, 'releaseDates' ) ){
            this.generalFields['access_from'].hide();
            this.generalFields['access_from'].hide();
        }
        
        if(!ka.checkPageAccess( this.page.rsn, 'limitation' ) ){
            this.generalFields['access_from_groups'].hide();
            this.generalFields['access_nohidenavi'].hide();
            this.generalFields['access_redirectto'].hide();
            this.generalFields['access_need_via'].hide();
        }

        if(!ka.checkPageAccess( this.page.rsn, 'meta' ) ){
        	this.metas.setStyle('display', 'none');
        }
        
        //search
        /*this.setToBlListBtn.setStyle('display', 'block');
        if(!ka.checkPageAccess( this.page.rsn, 'setBlacklist' ) )
        	this.setToBlListBtn.setStyle('display', 'none');
        */

        this.generalFields['unsearchable'].show();
        if(!ka.checkPageAccess( this.page.rsn, 'exludeSearch' ) )
        	this.generalFields['unsearchable'].hide();

        this.generalFields['search_words'].show();
        if(!ka.checkPageAccess( this.page.rsn, 'searchKeys' ) )
        	this.generalFields['search_words'].hide();
        
        //resources
        this.generalFields['resourcesCss'].show();
        if(!ka.checkPageAccess( this.page.rsn, 'css' ) )
            this.generalFields['resourcesCss'].hide();

        this.generalFields['resourcesJs'].show();
        if(!ka.checkPageAccess( this.page.rsn, 'js' ) )
            this.generalFields['resourcesJs'].hide();
        
        
        //versions
        this.versionBox.setStyle('display', 'block');
        this.versionsLoadBtns.each(function(btn){
        	btn.show();
        });
        if(!ka.checkPageAccess( this.page.rsn, 'loadVersion' ) ){
            this.versionBox.setStyle('display', 'none');
            this.versionsLoadBtns.each(function(btn){
            	btn.hide();
            });
        }
        
        
        this.versionsSetLiveBtns.each(function(btn){
        	btn.show();
        });
        if(!ka.checkPageAccess( this.page.rsn, 'setLive' ) ){
            this.versionsSetLiveBtns.each(function(btn){
            	btn.hide();
            });
        }
        
        //contents
    	var options = [];
    	
    	var _langs = $H({
             text: _('Text'),
             layoutelement: _('Layout Element'),
             picture: _('Picture'),
             plugin: _('Plugin'),
             pointer: _('Pointer'),
             template: _('Template'),
             navigation: _('Navigation'),
             html: _('HTML'),
             php: _('PHP')
        });

    	_langs.each(function(label,type){
        	if( !ka.checkPageAccess( this.page.rsn, 'content-'+type ) )
             	return;
        	options.include({i: type, label: label})
        }.bind(this));
    	
        var newF = new ka.field({
            label: _('Type'),
            type: 'select',
            help: 'admin/element-type',
            small: 1,
            tableItems: options,
            table_key: 'i',
            table_label: 'label'
        }).inject( this.elementPropertyFields.eTypeSelect.main, 'after' );
        
    	var old = this.elementPropertyFields.eTypeSelect.destroy();
        this.elementPropertyFields.eTypeSelect = newF;
    },
    
    toAlternativPane: function(){
    	var found = false;
    	if( this.inDomainModus ){
            ['domain', 'domainTheme', 'domainProperties', 'domainSettings'].each(function(item){
        		if( this.viewButtons[item].retrieve('visible') ){
        			found = true;
        			this.changeType(item);
        		}
            }.bind(this))
    	} else {
    		['general', 'rights', 'contents', 'resources', 'properties', 'searchIndex', 'versioning'].each(function(item){
        		if( this.viewButtons[item].retrieve('visible') ){
        			found = true;
        			this.changeType(item);
        		}
            }.bind(this))
    	}
    	
    	if(! found ){
    		this.viewButtons.each(function(button,key){
    			this.panes[key].setStyle('display', 'none');
    		}.bind(this));

            this.saveDomainGrp.hide();
            this.savePageGrp.hide();

            this.viewTypeGrpDomain.hide();
            this.viewTypeGrp.hide();
    	}
    },

    showDomain: function( pDomain ){
        if( this.oldLoadDomainRequest ) this.oldLoadDomainRequest.cancel();

        this.inDomainModus = true;
        this.viewType( 'domain' );
        this.changeType();
        
        this.oldLoadDomainRequest = new Request.JSON({url: _path+'admin/pages/domain/get', noCache: 1, onComplete: function( pResult ){
            
            this.domainFields.each(function(item, key){
            	item.show();
            });
            
            this.viewButtons.each(function(field){
            	field.show();
            })
            
            
            this.win.setTitle ( pDomain.domain + ' - '+_('Domain edit') );
            
            this.deleteDomainGrp.show();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'deleteDomain', 'd' ) )
            	this.deleteDomainGrp.hide();

            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domain', 'd' ) ){
            	this.viewButtons['domain'].hide();
            }
            
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'theme', 'd' ) )
            	this.viewButtons['domainTheme'].hide();

            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainProperties', 'd' ) )
            	this.viewButtons['domainProperties'].hide();
            
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'settings', 'd' ) )
            	this.viewButtons['domainSettings'].hide();
            
            
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainName', 'd' ) )
            	this.domainFields['domain'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainTitle', 'd' ) )
            	this.domainFields['title_format'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainStartpage', 'd' ) )
            	this.domainFields['startpage_rsn'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainPath', 'd' ) )
            	this.domainFields['path'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainFavicon', 'd' ) )
            	this.domainFields['favicon'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainLanguage', 'd' ) )
            	this.domainFields['lang'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainLanguageMaster', 'd' ) )
            	this.domainFields['master'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainEmail', 'd' ) )
            	this.domainFields['email'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'limitLayouts', 'd' ) )
            	this.domainFields['layouts'].hide();
            
            
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'aliasRedirect', 'd' ) ){
            	this.domainFields['alias'].hide();
            	this.domainFields['redirect'].hide();
            }
            
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'phpLocale', 'd' ) )
            	this.domainFields['phplocale'].hide();
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'robotRules', 'd' ) )
            	this.domainFields['robots'].hide();
            
            if( !ka.checkPageAccess( pDomain.domain_rsn, '404', 'd' ) ){
            	this.domainFields['page404_rsn'].hide();
            	this.domainFields['page404interface'].hide();
            }
            	
            
            if( !ka.checkPageAccess( pDomain.domain_rsn, 'domainOther', 'd' ) )
            	this.domainFields['resourcecompression'].hide();
            

        	var res = pResult.domain;
            this.currentDomain = res;
            this.showDomainMaster( pDomain.domain_rsn );
            
            //set domain propertie to default
        	$H(this._domainPropertiesFields).each(function(fields, extKey){
        		$H(fields).each(function(field){
        			field.setValue();
        		})
        	});
        	this.currentDomain.extproperties = JSON.decode(this.currentDomain.extproperties);
            if( this.currentDomain.extproperties ){
            	//set page values
            	$H(this.currentDomain.extproperties).each(function(properties, extKey){
            		$H(properties).each(function(property, propertyKey){
            			if( this._domainPropertiesFields[extKey] && this._domainPropertiesFields[extKey][propertyKey] ){
            				this._domainPropertiesFields[extKey][propertyKey].setValue(property);
            			}
            		}.bind(this))
            	}.bind(this))
            }
            
            this.domainFields['domain'].setValue( res.domain );
            this.domainFields['title_format'].setValue( res.title_format );
            this.domainFields['startpage_rsn'].setValue( res.startpage_rsn );
            this.domainFields['startpage_rsn'].field.domain = res.rsn;
            this.domainFields['lang'].setValue( res.lang );
            this.domainFields['master'].setValue( res.master );
            this.domainFields['phplocale'].setValue( res.phplocale );
            this.domainFields['robots'].setValue( res.phplocale );
            this.domainFields['favicon'].setValue( res.favicon );
            this.domainFields['path'].setValue( res.path );
            this.domainFields['email'].setValue( res.email );

            this.domainFields['page404_rsn'].setValue( res.page404_rsn );
            this.domainFields['page404interface'].setValue( res.page404interface );
            this.domainFields['alias'].setValue( res.alias );
            this.domainFields['redirect'].setValue( res.redirect );

            this.domainFields['resourcecompression'].setValue( res.resourcecompression );
            this.domainFields['layouts'].setValue( JSON.decode(res.layouts) );

			this.domainExtensionsCreate( );

            this.domainFieldsPublicProperties.setValue( JSON.decode(res.publicproperties) );
            
            this.toAlternativPane();

        }.bind(this)}).post({rsn: pDomain.domain_rsn});

    },
    
    domainExtensionsCreate: function(){

    	pModules = ka.settings.config;
    	$H(pModules).each(function(item, key){
    		if( !item ) return;
    		if( !item.properties ) return;
    		var titleTxt = (item.title[window._session.lang])?item.title[window._session.lang]:item.title['en'];
    		var title = new Element('h3', {
    			html: titleTxt	
    		}).inject( this.domainExtensionsPane );
    		
    		$H(item.properties).each(function(item,key){
    		
    			item.small = 1;
    			item.label = _(item.label);
    			item.desc = _(item.desc);
    			
    			new ka.field(item).inject( this.domainExtensionsPane );
    		
    		}.bind(this));
    	
    	
    	}.bind(this));
    },

    showDomainMaster: function( pRsn ){
        if( this.oldLoadDomainMasterRequest ) this.oldLoadDomainMasterRequest.cancel();
        this.domainMasterPane.set('html', 'lade ...');
        this.oldLoadDomainMasterRequest = new Request.JSON({url: _path+'admin/pages/domain/getMaster', noCache: 1, onComplete: function(res){
        	
            this.domainMasterPane.set('html', '');
            if( res && this.currentDomain.rsn != res.rsn ){
            	var langTitle = res.lang;
            	if( ka.settings.langs[res.lang] )
            		langTitle = ka.settings.langs[res.lang].langtitle
            	
                this.domainMasterPane.set('html', _('Current language master is: ')+langTitle+' ('+
                        ka.settings.langs[res.lang].title+', '+res.lang+')');
            }
            
        }.bind(this)}).post({rsn: pRsn});
    },

    addDomain: function(){
        var domain = this.win._prompt(_('Domain:'),'', function(p){
            if(!p) return;   
            this.lastSaveRequest = new Request.JSON({url: _path+'admin/pages/domain/add', noCache: 1, onComplete: function(res){
            	ka.loadSettings();
                this.changeLanguage();
            }.bind(this)}).post({ domain: p, lang: this.language });
        }.bind(this));
    },

    saveDomain: function(){
        this.saveDomainBtn.startTip( _('Save ...') );
        if( this.lastSaveRequest ) this.lastSaveRequest.cancel();

        this.overlayStart();

        var req = {};
        req.rsn = this.currentDomain.rsn;
        req.domain = this.domainFields['domain'].getValue();
        req.title_format = this.domainFields['title_format'].getValue();
        req.startpage_rsn = this.domainFields['startpage_rsn'].getValue();
        req.lang = this.domainFields['lang'].getValue();
        req.master = this.domainFields['master'].getValue();
        req.phplocale = this.domainFields['phplocale'].getValue();
        req.robots = this.domainFields['robots'].getValue();
        req.favicon = this.domainFields['favicon'].getValue();
        req.path = this.domainFields['path'].getValue();
        req.email = this.domainFields['email'].getValue();
        req.page404_rsn = this.domainFields['page404_rsn'].getValue();
        req.page404interface = this.domainFields['page404interface'].getValue();
        req.alias = this.domainFields['alias'].getValue();
        req.redirect = this.domainFields['redirect'].getValue();

        req.resourcecompression = this.domainFields['resourcecompression'].getValue();
        req.layouts = JSON.encode( this.domainFields['layouts'].getValue() );
        req.publicproperties = JSON.encode( this.domainFieldsPublicProperties.getValue() );


        //properties
        var properties = {};
        $H(this._domainPropertiesFields).each(function(fields, extKey){
        	properties[extKey] = {};
    		$H(fields).each(function(field, fieldKey){
    			properties[extKey][fieldKey] = field.getValue();
    		})
    	});
        req.extproperties = JSON.encode(properties);

        this.lastSaveRequest = new Request.JSON({url: _path+'admin/pages/domain/save', noCache: 1, onComplete: function(res){
            this.overlay.destroy();
            this.saveDomainBtn.stopTip( _('Saved') );
            if( this.currentDomain.lang != req.lang ){
                this.changeLanguage();
            } else {
                this.domainTrees.get(this.currentDomain.rsn ).reload();
            }
            this.currentDomain = req;
            ka.settings.domains.each(function(d, index) {
                if(d.rsn == req.rsn)
                    ka.settings.domains[index] = req;
            });
        }.bind(this)}).post(req);
    },


    _createDomain: function(){
        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );

        this.domainFields = new Hash();

        this.domainFields['domain'] = new ka.field(
            {label: _('Domain'), desc: _('Please make sure, that this domains points to this Kryn.cms installation. Otherwise you are not able to manage the content under the content tab.'), type: 'text', empty: false}
        ).inject( p );

        this.domainFields['startpage_rsn'] = new ka.field(
            {label: _('Startpage'), type: 'pageChooser', empty: false, onlyIntern: true, cookie: 'startpage'}
        ).inject( p );

        this.domainFields['title_format'] = new ka.field(
            {label: _('Title'), type: 'text', desc: _('Use %title as placeholder for the pagetitle'), empty: false}
        ).inject( p );

        this.domainFields['path'] = new ka.field(
            {label: _('Path'), type: 'text', desc: _("Installation path of kryn. Default '/'")}
        ).inject( p );
        

        this.domainFields['favicon'] = new ka.field(
            {label: _('Favicon'), type: 'file', desc: _('Choose a favicon. Filetype .ico')}
        ).inject( p );

        

        var tableItems = [];
        $H(ka.settings.langs).each(function(lang,id){
            tableItems.include({ id: id, label: lang.langtitle+' ('+lang.title+', '+id+')' });
        });
        this.domainFields['lang'] = new ka.field(
        {label: _('Language'), type: 'select',
            table_label: 'label', table_key: 'id',
            tableItems: tableItems
        }).inject( p );


        this.domainFields['master'] = new ka.field(
            {label: _('Language master'), type: 'checkbox'}
        ).inject( p );

        this.domainMasterPane = new Element('div', {
            style: 'padding-left: 30px; color: gray;'
        }).inject( p );
        

        this.domainFields['email'] = new ka.field(
            {label: _('Email sender'), desc: _('Extensions can use this email in outgoing emails as sender.')}
        ).inject( p );

        this.panes['domain'] = p;
        

        /* Domain-Theme */

        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );


        this.domainFieldsPublicProperties = this.createPublicPropertiesBoard( _('Theme properties') );
        this.domainFieldsPublicProperties.inject( p );

        this.domainFields['layouts'] = new ka.field(
            {label: _('Limit selectable layouts'), desc: _('If you want to limit layouts to choose'),
            type: 'select', multiple: true, size: 6}
        ).inject( p );

        $H(ka.settings.layouts).each(function(la, key){
            var group = new Element('optgroup', {
                label: key
            }).inject( this.domainFields['layouts'].input );
            $H(la).each(function(layoutFile,layoutTitle){
                new Element('option', {
                    html: _(layoutTitle),
                    value: layoutFile
                }).inject( group );
            })
        }.bind(this));


        var tableItems = [];
        $H(ka.settings.langs).each(function(lang,id){
            if( id != this.language )
                tableItems.include({ id: id, label: lang.langtitle+' ('+lang.title+', '+id+')' });
        }.bind(this));

        this.panes['domainTheme'] = p;
  
        /* Domain-Settings */

        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );

        

        this.domainFields['alias'] = new ka.field(
            {label: _('Alias'), type: 'text', desc: _("Define one or more alias for the domain above. Comma seperated alias domain list to this domain.")}
        ).inject( p );

        this.domainFields['redirect'] = new ka.field(
            {label: _('Redirect'), type: 'text', desc: _("This domains redirect to the domain defined above. Comma seperated redirect domain list to this domain")}
        ).inject( p );
        

        this.domainFields['phplocale'] = new ka.field(
            {label: 'PHP-Locale', type: 'text', desc: _('Locale LC_ALL in PHP')}
        ).inject( p );
        

        this.domainFields['robots'] = new ka.field(
            {label: 'Robot rules', type: 'textarea', desc: _('Define here the rules for searchengines. (robots.txt)')}
        ).inject( p );

        this.domainFields['resourcecompression'] = new ka.field(
            {label: _('Css and JS compression'), desc: _('Merge all css files in one, same with javascript files. This improve the page render time'), type: 'checkbox'}
        ).inject( p );
        
        this.domainFields['langSync'] = new ka.field(
        {label: _('Synchronize with'), type: 'select', desc: _(''),
            table_label: 'label', table_key: 'id', multiple: true,
            tableItems: tableItems
        }).inject( p );

        this.domainFields['page404_rsn'] = new ka.field(
            {label: _('404-Page'), type: 'pageChooser', empty: false, onlyIntern: true, cookie: 'startpage'}
        ).inject( p );

        this.domainFields['page404interface'] = new ka.field(
            {label: _('404-Interface'), desc: _('PHP file'), type: 'fileChooser', empty: false, cookie: 'file'}
        ).inject( p );
        
        
        this.panes['domainSettings'] = p;
    },

    createPublicPropertiesBoard: function( pTitle ){
        var field = new Element('div', {
            'class': 'ka-field-main'
        });

        new Element('div', {
            'class': 'ka-field-title',
            html: '<div class="title">'+pTitle+'</div>'
        }).inject( field );

        var fieldContent = new Element('div', {
            'class': 'ka-field-field'
        }).inject( field );

        field.domainFieldsPublicProperties = {};

        $H(ka.settings.publicProperties).each(function(publicProperties, extKey){
            field.domainFieldsPublicProperties[ extKey ] = {};
            $H(publicProperties).each(function(la, tKey){

                field.domainFieldsPublicProperties[ extKey ][ tKey ] = {};
                
                var laDiv = new Element('div', {
                    'style': 'padding: 2px 0px;'
                }).inject( fieldContent );

                new Element('h3', {
                    html: _(tKey)
                }).inject( laDiv );

                var laDivFields = new Element('div', {
                    'style': 'padding: 3px; background-color: #e7e7e7;'
                }).inject( laDiv );

                $H(la).each(function(opts,fKey){
                    var fieldOpts = {
                        label: _(opts[0]), type: opts[1], small: 1
                    };

                    if( opts[1] == 'page' ){
                        fieldOpts.onlyIntern = 1;
                    }
                    field.domainFieldsPublicProperties[ extKey ][ tKey ][ fKey ] = new ka.field(fieldOpts).inject( laDivFields );
                }.bind(this))

                new Element('div', {
                    'style': 'clear: left'
                }).inject( laDivFields );
                
            }.bind(this));
        }.bind(this));

        field.setValue = function( pValues ){
            $H( pValues ).each(function( properties, extKey ){
                $H(properties).each(function(la, tKey){
                    $H(la).each(function(value,fKey){
                    	if( field.domainFieldsPublicProperties[ extKey ] &&
                    		field.domainFieldsPublicProperties[ extKey ][ tKey ] &&
                    		field.domainFieldsPublicProperties[ extKey ][ tKey ][ fKey ] ){
                    			field.domainFieldsPublicProperties[ extKey ][ tKey ][ fKey ].setValue( value );
                    	}
                    }.bind(this))
                }.bind(this));
            }.bind(this));
        }

        field.getValue = function(){
            var res = {};
            $H(this.domainFieldsPublicProperties).each(function(properties,extKey){
                res[ extKey ] = {};
                $H(properties).each(function(la, tKey){
                    res[ extKey ][ tKey ] = {};
                    $H(la).each(function(opts,fKey){
                        res[ extKey ][ tKey ][ fKey ] = field.domainFieldsPublicProperties[ extKey ][ tKey ][ fKey ].getValue();
                    }.bind(this))
                }.bind(this));
            }.bind(this));
            return res;
        }

        return field;

    },

    _createGeneral: function(){
        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );
        this.generalFields = new Hash();

        this.generalFields['type'] = new ka.field(
        {label: _('Type'), type: 'imagegroup',
            table_label: 'label', table_key: 'id',
            items: {
                0: {label: _('Default'), src: _path+'inc/template/admin/images/icons/page_green.png'},
                1: {label: _('Link'), src: _path+'inc/template/admin/images/icons/link.png'},
                2: {label: _('Folder'), src: _path+'inc/template/admin/images/icons/folder.png'},
                3: {label: _('Deposit'), src: _path+'inc/template/admin/images/icons/page_white_text.png'}
            }
        }).inject( p );
    
        this.generalFields['type'].addEvent('change', this.changeType.bind(this) );

        this.generalFields['title'] = new ka.field(
            {label: _('Title (navigation)'), type: 'text', empty: false}
        ).inject( p );

        this.generalFields['page_title'] = new ka.field(
            {label: _('Alternative page title'), type: 'text'}
        ).inject( p );



        this.generalFields['link'] = new ka.field(
            {label: _('Target'), desc: _('Extern links with "http://"'), type: 'chooser', empty: false, cookie: 'pageLink'}
        ).inject( p );

        //targets
        this.generalFields['target'] = new ka.field(
        {label: _('Open in'), type: 'select',
            table_label: 'label', table_key: 'id',
            tableItems: [
                {label: _('Same window'), id: '_self'},
                {label: _('New window'), id: '_blank'},
            ]
        }).inject( p );



        //URL
        this.generalFields['url'] = new ka.field(
            {label: _('URL'), type: 'text', empty: false, check: 'kurl', help: 'admin/url'}
        ).inject( p );
        
        this.urlAliase = new Element('div', {
        	style: 'padding: 5px; padding-left: 26px;'
        }).inject(p);

        this.generalFieldsUrlPath = new Element('span', {
            html: 'Domain'
        })
        .inject( this.generalFields['url'].input, 'before' );
        this.generalFields['url'].input.setStyle('width', 140);

        this.aliase = new Element('div').inject( p );
        new Element('div', {
//            style: 'color: #999; padding-left: 25px;',
//            html: 'Es leiten <b>5</b> Aliase auf diese Seite. [Bearbeiten]'
        }).inject( this.aliase );


    /*xxx
        //TEMPLATE
        var tableItems = [];
        ka.settings.templates.each(function(template){
            tableItems.include({ id: template, label: template });
        });
        this.generalFields['template'] = new ka.field(
        {label: 'Template', type: 'select',
            table_label: 'label', table_key: 'id',
            tableItems: tableItems
        }).inject( p );
        this.generalFields['template'].input.addEvent('change', this._loadContent.bind(this));
        */

        //METAS
        this.metas = new Element('div').inject( p );
        this.metaTitle = new Element('div',{
            style: 'margin-top: 5px; border-top: 1px solid #ccc;height: 21px; padding-left: 20px; font-weight: bold;',
            html: 'Metas<br />'
        }).inject(this.metas);

        this.metaPane = new Element('ol', {
            style: 'margin-left: 20px; padding: 0px; padding-bottom: 4px; padding-left: 20px;'
        }).inject( this.metas );

        var addMeta =
        new Element('img', {
            src: _path+'inc/template/admin/images/icons/add.png',
            title: _('Add'),
            style: 'cursor: pointer'
        })
        .addEvent('click', function(){
            this.addMeta();
        }.bind(this))
        .setStyle('left', 1)
        .setStyle('top', 3)
        .setStyle('position', 'relative')
        .inject( this.metaTitle );

        this.generalFields['metaKeywords'] = new ka.field(
            {label: _('Keywords'), type: 'text'}
        ).inject( this.metas );

        this.generalFields['metaDesc'] = new ka.field(
            {label: _('Description'), type: 'textarea'}
        ).inject( this.metas );


        this.panes['general'] = p;
    },

    _createRights: function(){
        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );

        this.generalFields['visible'] = new ka.field(
            {label: _('Visible (navigation)'), type: 'checkbox'}
        ).inject( p );

        this.generalFields['access_denied'] = new ka.field(
            {label: _('Access denied'), type: 'checkbox'}
        ).inject( p );
        
        this.generalFields['force_https'] = new ka.field(
            {label: _('Force HTTPS'), type: 'checkbox'}
        ).inject( p );

        this.generalFields['access_from'] = new ka.field(
            {label: _('Release at'), type: 'datetime'}
        ).inject( p );

        this.generalFields['access_to'] = new ka.field(
            {label: _('Hide at'), type: 'datetime'}
        ).inject( p );
        
        this.generalFields['access_from_groups'] = new ka.field(
            {label: _('Limit access to groups'), desc: ('For no restrictions let it empty'),
            type: 'select', size: 5, multiple: true,
            tableItems: ka.settings.groups, table_label: 'name', table_key: 'rsn'
            }
        ).inject( p );
        
        
        this.generalFields['access_nohidenavi'] = new ka.field(
            {label: _('Show in navigation by no access'), desc: _('Shows this page in the navigations also with no access'), type: 'checkbox'}
        ).inject( p );
        
        this.generalFields['access_redirectto'] = new ka.field(
            {label: _('Redirect to page by no access'), desc: _('Choose a page, if you want to redirect the user to a page by no access.'), type: 'page'}
        ).inject( p );

        this.generalFields['access_need_via'] = new ka.field(
            {label: _('Verify access with this service'), desc: _('Only if group limition is active'), type: 'select',
            tableItems: [
                {rsn: 0, name: 'Kryn-Session'},
                {rsn: 1, name: 'Htaccess'}
            ], table_label: 'name', table_key: 'rsn'
            }
        ).inject( p );

        this.panes['rights'] = p;
    },


    /*
    *
    *  CONTENTS 
    *
    */

    _createContents: function(){
        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );

        var t = new Element('div',{
            style: 'position: absolute; left: 0px; right: 0px; top: 0px; height: 26px; text-align: right; border-bottom: 2px solid silver;'
        }).inject( p );

        var table = new Element('table', {style: 'float: right'}).inject( t );
        var tbody = new Element('tbody').inject( table );
        var tr = new Element('tr').inject( tbody );

        /* test new drag'n'drop */
        this.contentItems = new Element('div', {
            'class': 'pages-possibleContentItems',
            style: 'position: absolute; left: 8px; top: 5px; height: 15px; width: 200px;',
        }).inject( t );

        /* test end */


        var td = new Element('td').inject( tr );
        
        
        var cmmcid = new Date().getTime()+'_contentManagemModeCheckBox';
        this.contentManageModeCheckbox = new Element('input', {
        	type: 'checkbox',
        	id: cmmcid,
        	checked: true
        })
        .addEvent('click', function(){
        	if( this.contentManageModeCheckbox.checked ){
                this.contentManageMode = 'layout';
        	} else {
                this.contentManageMode = 'list';
        	}
            this._loadContentLayout();
        }.bind(this))
        .inject( td, 'top');
        
        

        var td = new Element('td').inject( tr );
        new Element('label', {
        	text: _('Show layout'),
        	'for':  cmmcid
        }).inject( td );
        
        
        new Element('td', {style: 'padding: 0px 2px;color: gray;', html: ' | '}).inject( tr );
        
        //layouts
        this.layoutTxt = new Element('td', {html: _('Layout')}).inject( tr );

        var td = new Element('td').inject( tr );
        this.layoutTd = td;
        this.layout = new Element('select', {
            'class': 'admin-pages-pane-contents-actions-layoutx'
        })
        .addListener('change', function(){
            this._loadContentLayout();
        }.bind(this))
        .inject( td );
        
        this.layout.getValue = function(){
            return this.value;
        }
        this.layout.setValue = function(p){
            this.value = p;
            if( p == '' || !p ){
            	
            }
        }
        this.generalFields['layout'] = this.layout;

        if( ka.settings.layouts.length == 0 ){
            this.win._alert(_('No layouts found. Install layout extensions or create one.'), function(){
                this.win.close();
            }.bind(this));
            return;
        }
        

        new Element('td', {style: 'padding: 0px 2px;color: gray;', html: ' | '}).inject( tr );
        

        new Element('td', {html: _('Versions')}).inject( tr );

        var td = new Element('td').inject( tr );
        this.versionBox = new Element('div').inject( td );


        this.versions = new Element('select', {
        })
        .addEvent('change', function(){
            this.loadVersion( this.versions.value );
        }.bind(this)); //.inject( td );

        this.iframePanel = new Element('div', {
            style: 'position: absolute; left: 0px; right: 0px; top: 28px; bottom: 0px; background-color: white; border-top: 1px solid white;'
        }).inject( p );
        this.__newIframe();

        this.panes['contents'] = p;
    },


    __newIframe: function(){
       if( this.iframe ) this.iframe.destroy();
       //this.iframe = new Element('iframe', {
       this.iframe = new IFrame('iframe_pages', {
            'frameborder': 0,
            styles: {
                position: 'absolute',
                left: 0, top: 0, width: '100%', height: '100%',
                border: 0
            }
        }).inject( this.iframePanel ); 
    },


    _loadContent: function(){

        var layout = this.layout.getValue();
        if( !this.iframe || !this.iframe.contentWindow || !this.iframe.contentWindow.Asset ||
                !this.oldPage || (this.page.layout != layout) || (this.page.domain_rsn != this.oldPage.domain_rsn) ){
            this.__newIframe();

            var w = this.iframe.contentWindow;
            var d = this.iframe.contentWindow.document;
            var _this = this;
            
            this.iframe.addEvent('load', function(){
                _this._loadContentLayout();
            }.bind(this));
            this.win.iframe = this.iframe;
            
            if( this.oldLoadTemplateRequest )
                this.oldLoadTemplateRequest.cancel();

            //cut last slash
            var path = location.pathname;
            if( path.substr( path.length-1, 1 ) == '/' )
                path = path.substr( 0, path.length-1 );

            //cut length of 'admin'
            path = path.substr( 0, path.length-5 );

            this.iframe.set('src',_path+'admin/pages/getTemplate/rsn:'+this.page.rsn+'/json:0/domain:'+location.host+'/?path='+path );

        } else {
            this._loadContentLayout();
        }

    },

    _loadContentLayout: function(){
    
        var w = this.iframe.contentWindow;
        if( !w.Asset ){ 
            logger('window(mootools) is not ready in _loadContentLayout()');
            /*this.trys++;
            if( this.trys < 15 ){
            	this._loadContentLayout.delay(150, this);
            	return;
        	} else {
            	alert('Problem with mootools.');
            }*/
        }
        this.trys = 0;
        
        w.ka = ka;
        w.win = this.win;
        w.currentPage = this.page;
        w.kpage = this;


        w.removeEvents('click');
        w.addEvent('click', function(){
        	if( this.ignoreNextDeselectAll ){
        		this.ignoreNextDeselectAll = false;
        		return;
        	}
            this._deselectAllElements();
        }.bind(this));

        if( this.oldLoadContentRequest )
            this.oldLoadContentRequest.cancel();

        if( this.lastLoadedLayoutCssFiles )
            this.lastLoadedLayoutCssFiles.each(function(cssAsset){
                try {
                    if( cssAsset.destroy ) 
                        cssAsset.destroy();
                } catch(e){
                    cssAsset.href = '';
                }
            });

        var layout = this.layout.getValue();
        
        if( this.noLayoutOverlay )
        	this.noLayoutOverlay.destroy();
        
        if( layout == '' && this.generalFields['type'].getValue() == 0 ){
        	//view overlay
        	this.noLayoutOverlay = new Element('div', {
        		'class': 'ka-pages-nolayoutoverlay'
        	}).inject(this.iframePanel);
 
        	//todo, when we have versions, then use following as bg
        	//ka-pages-nolayout-withversions-bg.png
        	
        	
        	this.noLayoutOverlayText = new Element('div', {
        		'class': 'ka-pages-nolayoutoverlay-text',
        		html: _('Please choose a layout for this page.')
        	}).inject(this.noLayoutOverlay);
        }
        
        if( this.ablageModus == true ){
            layout = 'kryn/blankLayout.tpl';
        }

        this.oldLoadContentRequest = new Request.JSON({url: _path+'admin/pages/getLayout', noCache: 1,
        	onComplete: this._renderContentLayout.bind(this) })
        .post({ name: layout, rsn: this.page.rsn });

    },

    _updateDraggerBarPosition: function(){
        if( Browser.Engine.webkit ){
            var mytop = this.iframe.contentWindow.document.body.scrollTop;
            var myleft = this.iframe.contentWindow.document.body.scrollLeft;
        } else {
            var mytop = this.iframe.contentWindow.document.html.scrollTop;
            var myleft = this.iframe.contentWindow.document.html.scrollLeft;
        }
        if( this.contentItemsHidden != true ){
            this.contentItems.morph({
                'top': mytop,
                'right': (myleft*-1)
            });
        } else {
            this.contentItems.morph({
                'top': mytop-323,
                'right': (myleft*-1)
            });
        }
    },

    _createDraggerBar: function(){

        this.win.onResizeComplete = this._updateDraggerBarPosition.bind(this);
        this.contentItems = new Element('div', {
            'class': 'ka-admin-pages-possibleContentItems',
        })
        .set('tween', {duration: 400, transition: Fx.Transitions.Cubic.easeOut})
        .inject( this.iframe.contentWindow.document.body );

        this.contentItemsToggler = new Element('div', {
            'class': 'ka-admin-pages-possibleContentItemsToggler',
            title: _('Hide element bar')
        })
        .inject( this.contentItems );

        this.contentItems.set('morph', {duration: 400, transition: Fx.Transitions.Cubic.easeOut});

        /*this.tinyMceToolbar = new Element('div', {
            'id': 'tinyMceToolbar',
            'class': 'mceEditor o2k7Skin o2k7SkinSilver',
            'style': 'position: absolute; left: 0px; top: 30px; right: 0px; height: 60px;'
        }).inject( this.panes['contents'] );
        */

        this.iframe.contentWindow.document.html.style.marginTop = '45px';
        this.iframe.contentWindow.document.html.style.marginRight = '35px';

        this.iframe.contentWindow.document.addEvent('scroll', function(){
            this._updateDraggerBarPosition();
        }.bind(this));
        this._updateDraggerBarPosition();

        this.__draggerItems = {};

        this._langs = $H({
            text: _('Text'),
            layoutelement: _('Layout Element'),
            picture: _('Picture'),
            plugin: _('Plugin'),
            pointer: _('Pointer'),
            template: _('Template'),
            navigation: _('Navigation'),
            html: _('HTML'),
            php: _('PHP')
        });

        this._langs.each(function(label,type){

            if( !ka.checkPageAccess( this.page.rsn, 'content-'+type ) )
            	return;
        	
        	var element = {lang:type};
            
            this.__draggerItems[type.toLowerCase()] = this.__buildDragItem( element );

        }.bind(this));
        
        var height = $H(this.__draggerItems).getLength()*41;
        
        

        this.contentItemsToggler.addEvent('click', function(){
            if( this.contentItemsHidden != true ){
                this.contentItemsHidden = true;
                this.contentItemsToggler.set('class', 'ka-admin-pages-possibleContentItemsToggler ka-admin-pages-possibleContentItemsTogglerTop');
                this.contentItems.tween('top', height*-1);
            } else {
                this.contentItemsHidden = false;
                this.contentItemsToggler.set('class', 'ka-admin-pages-possibleContentItemsToggler');
                this.contentItems.tween('top', 0);
            }
        }.bind(this))
        
        this.contentItems.setStyle('height', height);
    },

    __buildDragItem: function( element ){
            var type= element.lang;
            var div = new Element('div', {
                title: this._langs[type],
                style: '',
                'class': 'ka-layoutContent-main',
                lang: type
            })
            .store('fromBar', true)
            .inject( this.contentItems );

            new Element('img', {
                src: _path+'inc/template/admin/images/ka-keditor-elementtypes-item-'+type+'-bg.png'
            }).inject( div );

            return div;
    },

    checkSortedItems: function( element, clone ){
    },




    /* plugin chooser pane */
    
    showPluginChooserPane: function(){
        
        var toolbarSize = this.elementPropertyToolbar.getSize();
        
        this.pluginChooserPane.setStyle('left', toolbarSize.x);
        var width = 600;
        
        
        if( toolbarSize.y < 10 ){
            this.pluginChooserPane.tween('height', this.elementPropertyHeight);
            this.pluginChooserPane.setStyle('width', width);
        } else {
            this.pluginChooserPane.setStyle('height', this.elementPropertyHeight);
            this.pluginChooserPane.tween('width', width);
        }
    
    },
    
    hidePluginChooserPane: function( pToolbarStillOpen ){
        if( pToolbarStillOpen )
            this.pluginChooserPane.tween('width', 1);
        else
            this.pluginChooserPane.tween('height', 1);
    },




    createNewDraggItem: function( element ){
        var type = element.lang;
        this.__draggerItems[type] = this.__buildDragItem( element, element ).inject( element, 'after' );

        /*
         *  new Element('div', {
            title: _(type),
            'class': 'ka-layoutContent-main',
            style: '',
            lang: type
        })
        .store('fromBar', true)

        new Element('img', {
            src: _path+'inc/template/admin/images/ka-keditor-elementtypes-item-'+type+'-bg.png'
        }).inject( this.__draggerItems[type] );
        */

        this.initContentLayoutSort();
    },

    _renderContentLayout: function( pLayout ){
        var w = this.iframe.contentWindow;
        
//        this.layoutAsset = new w.Asset.css( _path+'inc/template/css/layout_'+this.layout.getValue()+'.css' );
        //xxx w.$('krynContentManager_layoutContent').set('html', pLayout.tpl );
        

        if( this.contentManageMode == 'list' ){
            this.iframe.contentWindow.document.body.setStyle('display', 'none');
        }

        $(this.iframe.contentWindow.document.body).set('html', pLayout.tpl);

        if( this.contentItems )
            this.contentItems.destroy();

        this._createDraggerBar();

        this.win.contentCss = '';
        if( pLayout.css ){
            pLayout.css.each(function(css){
            	var css = new Element('link', {
            		rel: "stylesheet",
            		type: "text/css",
            		href: _baseUrl+'inc/template/'+css
            	}).inject(w.document.head);
                this.lastLoadedLayoutCssFiles.include( css ); //w.Asset.css( _path+'inc/template/'+css) );
            }.bind(this));
        }

        w.$$('a').set('href', 'javascript: ;');
        w.$$('a').onclick = null;

        this.layoutBoxes = new Hash();

        
        this.layoutBoxes = ka.renderLayoutElements( $(this.iframe.contentWindow.document.body), this );
        //this._renderContentLayoutSearchAndFindBoxes( $(this.iframe.contentWindow.document.body) );

        if( this.contentManageMode == 'list' ){
            var div = new Element('div', {'class': 'ka-admin-pages-manageModeList'})
            this.layoutBoxes.each(function(layoutBox){
                layoutBox.inject( div );
            }.bind(this));
            this.iframe.contentWindow.document.body.empty();
            div.inject( this.iframe.contentWindow.document.body );
            this.iframe.contentWindow.document.body.setStyle('display', 'block');
            this.iframe.contentWindow.document.body.setStyle('text-align', 'left');
            this.iframe.contentWindow.document.html.setStyle('margin-right', 0);
        } else {
            if( this.iframe.contentWindow.document.html && this.iframe.contentWindow.document.html.setStyle )
                this.iframe.contentWindow.document.html.setStyle('margin-right', 35);
            if( this.iframe.contentWindow.html )
                this.iframe.contentWindow.html.setStyle('margin-right', 35);
        }
    
        var contents = this.page.contents;
        if( $type( this.page.contents ) == 'string' )
            contents = new Hash(JSON.decode(this.page.contents));

        this.layoutBoxes.each(function(editLayout,boxId){
            editLayout.setContents( contents[boxId] );
        });

        this.initContentLayoutSort();

        this.layoutBoxesInitialized = true;

    },

    initContentLayoutSort: function(){
        /*var list = [];
        this.layoutBoxes.each(function(layoutBox){
            list.include( layoutBox.main );
            
            if( layoutBox.contents.each ){
                layoutBox.contents.each(function(layoutContent){
                    list.include( layoutContent.main );
                });
            }
        });*/

        if( this.sortables )
            this.sortables.detach();

        var _this = this;
        this.sortables = new Sortables( [$(this.iframe.contentWindow).$$('.ka-layoutBox-container'), this.contentItems], {
            clone: true,
            handle: '.ka-layoutContent-mover',
            revert: true,
            precalculate: true,
            stopPropagation: true,
            opacity: 0.3,
            onStart: function(element,clone){
                if( element.getElement('span.mceEditor') ){
                    //tinymce.EditorManager.remove( element.retrieve('tinyMceId') );
                    element.getElement('span.mceEditor').setStyle('display', 'none');
                    element.retrieve('layoutContent').toData();
                }
                if( element.retrieve('fromBar') == true ){
                    element.set('class', 'ka-layoutContent-main inDragMode');
                    _this.createNewDraggItem( element );
                    element.store('newElementCreated', true);
                }
            },
            onComplete: function(element){
                if( element.getElement('span.mceEditor') ){
                    element.retrieve('layoutContent').type2Text(true);
                    //element.getElement('span.mceEditor').setStyle('display', 'block');
                    //parent.initTinyWithoutResize( element.retrieve('tinyMceId') );
                }
                if( element.retrieve('fromBar') == true && element.retrieve('newElementCreated') == true ){
                    if( element.getParent().get('class') != 'ka-admin-pages-possibleContentItems' ){
                        var layoutBox = element.getParent().retrieve('layoutBox');
                        layoutBox.drop( element.lang, element );
                    }   
                    element.destroy();
                }
            },
            onSort: function(element,clone){
//                _this.checkSortedItems(element,clone);
            }
        });

        var _this = this;
        this.layoutBoxes.each(function(layoutBox){
            _this.sortables.removeItems( layoutBox.title );
            if( layoutBox.contents.each ){
                layoutBox.contents.each(function(layoutContent){
                    _this.sortables.addItems( layoutContent.main );
                });
            }
        });
    },

    loadVersion: function( pVersion, pCallback ){

        if( this.oldVersionRequest )
            this.oldVersionRequest.cancel();

        this.versions.value = pVersion;

        this.oldVersionRequest = new Request.JSON({url: _path+'admin/pages/getVersion', noCache: 1, async: false, onComplete: function(res){

            //MARC
            this.page.contents = res;
            if( !this.iframe ) {
                this._loadContent();
            } else {
                this.layoutBoxes.each(function(editLayout,boxId){
                    var contents = [];
                    editLayout.clear();
                    if( res && res[boxId] )
                        contents = res[boxId];
                        editLayout.setContents( contents );
                });
                this.initContentLayoutSort(); 
            }
            
            if( pCallback )
                pCallback( res );

        }.bind(this)}).post({rsn: this.page.rsn, version: pVersion, versionType: this.versionType });
    },

    /*
    _renderContentLayoutSearchAndFindBoxes: function( pElement, pCode ){
        
        if( !pElement.getFirst() && pElement.get('text').search(/{slot.+}/) >= 0 ){
        	
	        var value = pElement.get('text');
	        value = value.substr( 6, value.length-7 );
	        
	        var options = {};
	        
	        var exp = /([a-zA-Z0-9-_]+)=([^"']([^\s]*)|["]{1}([^"]*)["]{1}|[']{1}([^']*)[']{1})/g;
	        while( res = exp.exec( value ) ){
	            options[ res[1] ] = res[4];
	        }
	        exp = null;
	        
	        if( options.id+0 > 0 ){
	            //var idRegex = /{slot.+id="(\d+)".*}/;
	            //var res = idRegex.exec( pElement.get('text') );
	            this.layoutBoxes[ options.id ] = new ka.layoutBox( pElement, options.name, this.win, options.css, options['default'], this, options );
	        }
	        
        }
        
        if( pElement.getFirst() ){
            pElement.getChildren().each(function(child){
                this._renderContentLayoutSearchAndFindBoxes( child );
            }.bind(this));
        }
    },*/

    setElementPropertyToolbar: function( pElement ){
        this._showElementPropertyToolbar();
    },

    _hideElementPropertyToolbar: function(){
    	
    	
        //this.elementPropertyToolbarContent.empty();
    	//this.elementPropertyToolbarAccordion.display(-1);

    	this.elementPropertyToolbar.tween('height', 1);      
        this.treeContainer.tween('bottom', 3);
        this.hidePluginChooserPane();
    },

    _showElementPropertyToolbar: function(){
    	height = this._calcElementPropertyToolbarHeight();
        if( this.inHideMode != true ) 
            this.treeContainer.tween('bottom', height+2);
        this.elementPropertyToolbar.tween('height', height);
        
        
       
       
        
        accHeight = this._calcAccordionHeight();
        //check if accordion height has changed if so -> reinit
        if(!this.lastAccordionHeight || this.lastAccordionHeight != accHeight) 
        	this._initElementSettingsToolbarAccordion(accHeight);
        
        //display first element
        this.elementPropertyToolbarAccordion.display(0);
        
        
    },
    
    _calcElementPropertyToolbarHeight : function () {
    	  var height = 221;
          tY = this.tree.getSize().y;
          if( tY*0.4 > height ){
              height = tY*0.4;
          }
          this.elementPropertyHeight = height;
          return height;
    },
    

    _deselectAllElements: function( pContent ){
        
    	this.hidePluginChooserPane();
        var selected = 0;
    	
    	this.layoutBoxes.each(function(box,id){
            selected = selected + box.deselectAll( pContent );
        });
    	
    	if( !pContent ){
    		this._hideElementPropertyToolbar();
    	}
    },

    /*
    *
    *  RESOURCES
    */

    _createResources: function(){
        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );

        this.generalFields['resourcesCss'] = new ka.field(
            {label: 'CSS', type: 'textarea'}
        ).inject( p );
        this.generalFields['resourcesCss'].input.setStyles({
            height: 200, width: 600
        });
        
        this.generalFields['resourcesJs'] = new ka.field(
                {label: 'Javascript', type: 'textarea'}
            ).inject( p );
        this.generalFields['resourcesJs'].input.setStyles({
            height: 200, width: 600
        });

        /*this.resourcesCssPanel = new Element('div', {
            style: 'padding-left: 25px; padding-bottom: 7px;'
        }).inject( p );

        new Element('img', {
            src: _path+'inc/template/admin/images/icons/add.png',
            title: _('Add'),
            style: 'cursor: pointer'
        })
        .inject( this.resourcesCssPanel );

        this.resourcesCssFiles = new Element('div', {
        }).inject( this.resourcesCssPanel );

        

        this.resourcesJsPanel = new Element('div', {
            style: 'padding-left: 25px;'
        }).inject( p );

        var _this = this;
        new Element('img', {
            src: _path+'inc/template/admin/images/icons/add.png',
            title: _('Add'),
            style: 'cursor: pointer'
        })
        .addEvent('click', function(){
            ka.wm.openWindow( 'admin', 'pages/chooser', null, -1, {onChoose: function( pValue ){
                _this.addJsRessource( pValue );
                this.win.close();
            },
            opts: {files: 1, upload: 1}});
        })
        .inject( this.resourcesJsPanel );

        this.resourcesJsFiles = new Element('div', {
            style: 'width: 307px; padding-top: 3px;'
        }).inject( this.resourcesJsPanel );

		*/

        this.panes['resources'] = p;
    },

    addJsRessource: function( pFile ){
        var div = new Element('div', {
            style: 'padding: 2px;'
        }).inject( this.resourcesJsFiles );
        new Element('span', {
            text: pFile
        }).inject( div );

        new Element('img', {
            src: _path+'inc/template/admin/images/icons/delete.png',
            title: 'Entfernen',
            style: 'cursor: pointer; float: right;'
        }).inject( div );
    },

    _createVersioning: function(){
        var p = new Element('div', {
            'class': 'admin-pages-pane',
            style: 'padding: 4px;'
        }).inject( this.main );

        this.panes['versioning'] = p;
    },
    
    _createProperties: function(){
        var p = new Element('div', {
            'class': 'admin-pages-pane',
            style: 'padding: 4px;'
        }).inject( this.main );
        
        this._pagePropertiesFields = {};
        
        ka.settings.modules.each(function(ext){

    		var config = ka.settings.configs[ext];
    		
        	if( config && config.pageProperties ){
        		
        		var extFields = {};
        		
        		
        		var title = config.title['en'];
        		if( config.title[window._session.lang] )
        			title = config.title[window._session.lang];
        		
        		new Element('h3', {text: title}).inject(p);
        		var pe = new Element('div', {style: 'padding: 5px;'}).inject(p);
        		$H(config.pageProperties).each(function(property, key){
        			property.small = 1;
        			extFields[key] = new ka.field(property).inject(pe);
        			
        		}.bind(this));
        		new Element('div', {style: 'clear: both'}).inject(pe);
        		
        		this._pagePropertiesFields[ext] = extFields;
        	}
        }.bind(this));

        this.panes['properties'] = p;
    },
    
    _createDomainProperties: function(){
    	
  		/* domain extension properties */
  
        var p = new Element('div', {
            'class': 'admin-pages-pane'
        }).inject( this.main );
        this.domainExtensionsPane = p;
        this.panes['domainProperties'] = p;
    	
        
        this._domainPropertiesFields = {};
        
        ka.settings.modules.each(function(ext){

    		var config = ka.settings.configs[ext];
    		
        	if( config && config.domainProperties ){
        		
        		var extFields = {};
        		
        		
        		var title = config.title['en'];
        		if( config.title[window._session.lang] )
        			title = config.title[window._session.lang];
        		
        		new Element('h3', {text: title}).inject(p);
        		var pe = new Element('div', {style: 'padding: 5px;'}).inject(p);
        		$H(config.domainProperties).each(function(property, key){
        			property.small = 1;
        			extFields[key] = new ka.field(property).inject(pe);
        			
        		}.bind(this));
        		new Element('div', {style: 'clear: both'}).inject(pe);
        		
        		this._domainPropertiesFields[ext] = extFields;
        	}
        }.bind(this));

    },

    loadVersionOverview: function(){
        if( this.lastVersionOverviewRequest )
            this.lastVersionOverviewRequest.cancel();

        this.lastVersionOverviewRequest = new Request.JSON({url: _path+'admin/pages/getPageVersions/', noCache: 1, onComplete:function( pRes ){
            this._loadVersionOverview( pRes );
        }.bind(this)}).post({rsn: this.page.rsn, versionType: this.versionType});
        //pageVersion: 'live' : 'version';
         
    }, 

    _loadVersionOverview: function( pValues ){
        var p = this.panes['versioning'];
        p.empty();

        var liveTable = new Element('table', {
            width: '100%',
            'class': 'ka-admin-pages-versioning-table',
            cellpadding: 0,
            cellspacing: 0
        }).inject( p );
        
        var liveTableHead = new Element('thead').inject( liveTable );
        var liveTableBody = new Element('tbody').inject( liveTable );
        var liveTableHeadTr = new Element('tr').inject( liveTableHead );

        new Element('th', {text: ' '}).inject( liveTableHeadTr );
        new Element('th', {html: _('Live')}).inject( liveTableHeadTr );
        new Element('th', {html: _('Owner')}).inject( liveTableHeadTr );
        new Element('th', {html: _('Created')}).inject( liveTableHeadTr );
        new Element('th', {html: _('Actions')}).inject( liveTableHeadTr );

        this.versionsSetLiveBtns = [];
        this.versionsLoadBtns = [];
        
        if( pValues.versions.count == 0 ){
            new Element('div', {
                'text': _('No version exists.')
            }).inject( p );
            liveTable.destroy();
        } else {
            pValues.versions.each(function(item){
                this.createVersionLine( item ).inject( liveTableBody );
            }.bind(this));
        }
    },

    createVersionLine: function( pValues ){

        trClass = '';
        if( pValues.rsn == this.versions.value )
            trClass = 'activeVersion';

        var tr = new Element('tr', {'class': trClass}); 

        new Element('td', {
            text: '#'+pValues.rsn,
            width: 50
        }).inject( tr );

        var icon = (pValues.active==1)?'accept':'delete';

        new Element('td', {
            html: '<img src="'+_path+'inc/template/admin/images/icons/'+icon+'.png" />',
            width: 50
        }).inject( tr );

        new Element('td', {
            text: pValues.username
        }).inject( tr );

        new Element('td', {
            text: new Date(pValues.created*1000).format('%d.%m.%Y %H:%M')
        }).inject( tr );


        var actions = new Element('td', {
        }).inject( tr );

        var ld = new ka.Button(_('Load'))
        .addEvent('click', function(){
        
            this.viewType( 'contents', true );
            this.loadVersion( pValues.rsn );
        
        }.bind(this)).inject( actions );
        
        this.versionsLoadBtns.include(ld);
        if(!ka.checkPageAccess( this.page.rsn, 'loadVersion' ) ){
        	ld.hide();
        }
        
        var sl = new ka.Button(_('Set Live'))
        .addEvent('click', function(){
        
            this.win._confirm(_('Publish this version ?'), function(e){
                if(!e) return;
                new Request.JSON({url: _path+'admin/pages/setLive/', noCache: 1, onComplete: function(){
                    this.loadVersionOverview();
                    this.loadVersions();
                    var d = this.domainTrees.get(this.page.domain_rsn);
                    if( d )
                        d.reload()
                }.bind(this)}).post({version: pValues.rsn});
            }.bind(this)); 
        
        }.bind(this))
        .inject( actions );
        
        this.versionsSetLiveBtns.include( sl );
        

        if(!ka.checkPageAccess( this.page.rsn, 'setLive' ) ){
        	sl.hide();
        }


        return tr;
    },
    
   _createSearchIndexPane : function () {    	
    	 var p = new Element('div', {
             'class': 'admin-pages-pane',
             'style' : 'padding: 10px;'
         }).inject( this.main );
    	 
    	
    	 /*
    	 fieldAddToBl = new Element('div', { 'class' : 'ka-field-main'}).inject(p);
    	 this.setToBlListBtn = fieldAddToBl;
    	 fieldAddToBlTitle = new Element('div', { 'class' : 'ka-field-title'}).inject(fieldAddToBl);
    	 new Element('div', { 'class' : 'title', 'text' : _('Add this page to the search index blacklist')}).inject(fieldAddToBlTitle);
    	 
    	 
    	 fieldAddToBlBtn = new Element('div', { 'class' : 'ka-field-field', 'style' : 'cursor: pointer'}).inject(fieldAddToBl);    	 
    	 new Element('img', { 'src' : _path+'inc/template/admin/images/icons/lightning_delete.png'}).inject(fieldAddToBlBtn);
    	 fieldAddToBlBtn.addEvent('click', function() { this.addPageToBlacklist(this.page.url) }.bind(this));
    	 */
    	 
    	 this.generalFields['unsearchable'] = new ka.field(
                 {label: _('Exclude this page from search index'), type: 'checkbox'}
             ).inject( p );
    	    	    	
    	 
    	 this.generalFields['search_words'] = new ka.field(
    	            {label: _('Search words'), type: 'textarea'}
    	 ).inject( p );
    	 
    	 new Element('div', { 'class' : 'title', 'text' : _('Search indexes for this site')} ).inject(
	    	 new Element('div', { 'class' : 'ka-field-title' }).inject(
	    			 new Element('div', { 'class' : 'ka-field-main', 'style' : 'margin-top:10px;' }).inject(p)
	    	 )
    	 );
    	
    	 this.sioTableDiv = new Element('div', {
             style: 'position: absolute; left: 0px; top: 208px; right: 0px; bottom: 0px; overflow: auto;'
         }).inject( p );
    	 
    	 
         
	     this.sioTable = new ka.Table().inject(this.sioTableDiv);
	     this.sioTable.setColumns([
	         [_('Url'), 300],
	         [_('Title'), 150],
	         [_('Date of index'), 120],
	         [_('Content hash'), 250],
	         [_('Action'), 50]
	     ]);
    	 
    	 this.panes['searchIndex'] = p;
    },
    
    addPageToBlacklist : function (pUrl) {
	    this.loader.show();
	    
		new Request.JSON( { url : _path+'admin/backend/window/loadClass/saveItem', noCache : 1, 
			onComplete : function(pSRes) {	    						
				if(pSRes) {
					nMsg = _('The URL ')+'&quot;<b>'+pUrl+'</b>&quot;'+_(' has been added successfully to your search index blacklist.')
					ka._helpsystem.newBubble( _('URL successfully added!'), nMsg, 10000 );
					this.loadSearchIndexOverview();
				}
				this.loader.hide();
			}.bind(this)
		
		
		}).post( {'url' : pUrl, 'domain_rsn' : this.page.domain_rsn, 'code' : 'system/searchBlacklist/edit', 'module' : 'admin', 'editFaked' : 1} );
    },
    
    
    loadSearchIndexOverview : function() {
    	if( this.seachIndexOverviewRequest )
            this.seachIndexOverviewRequest.cancel();
    	
    	this.sioTable.loading(true);
    	 this.seachIndexOverviewRequest = new Request.JSON({url: _path+'admin/backend/searchIndexer/getSearchIndexOverview', noCache: 1, 
        	 onComplete:function( res ){        	
    		 this.sioTable.loading(false);
    		 res.each(function(pVal, pKey) {
    			var vUrl = this.getBaseUrl(this.page)+pVal[0].substr(1)+'/';    
    			if(pVal[0] != '/'+this.page.url)
    				res[pKey][4] = '<a href="'+pVal[0]+'" class="addToBlacklistBtn"><img src="'+_path+'inc/template/admin/images/icons/lightning_delete" title="'+_('Add this page to the blacklist')+'" /></a>'; 
    			else
    				res[pKey][4] = '';
    			
    			res[pKey][4] += '&nbsp;<a href="'+vUrl+'" target="_blank"><img src="'+_path+'inc/template/admin/images/icons/eye.png" title="'+_('View this page')+'" /></a>'; 
    		 }.bind(this));
    		 this.sioTable.setValues(res);
    		 
    		 var addToBlacklistBtns = this.sioTableDiv.getElements('a.addToBlacklistBtn');    		
    		 if(addToBlacklistBtns) {
    			 addToBlacklistBtns.each(function(pItem) {
    				 var itemUrl = pItem.get('href');
    				 pItem.set('href', 'javascript:;');
    				 pItem.addEvent('click', function() { this.addPageToBlacklist(itemUrl); }.bind(this)); 
    			 }.bind(this));
    		 }

         }.bind(this)}).post({page_rsn: this.page.rsn});
    },
       
    clearMeta: function(){
        this.metaPane.empty();
    },

    addMeta: function( pVals ){
        if( !pVals ) pVals = {key:'',value:''};
        
        var main = new Element('li', {
            style: 'padding-top: 2px; margin-left: 0px;',
            'class': 'ka-field-field'
        }).inject( this.metaPane );

        new Element('span', {html: 'Name: '}).inject( main );

        var key = new Element('input', {
            value: pVals.key,
            'class': 'text', style: 'width: 70px; margin-right: 5px;'
        })
        .inject( main );
        
        new Element('span', {html: 'Wert: '}).inject( main );
        var valueInput = new Element('input', {
            value: pVals.value,
            'class': 'text', style: 'width: 120px;'
        })
        .inject( main );

        new Element('img', {
            src: _path+'inc/template/admin/images/icons/delete.png',
            align: 'top',
            title: 'Löschen',
            style: 'cursor: pointer;'
        })
        .addEvent('click', function(){
            key.value = '';
            main.destroy();
        }.bind(this))
        .inject( main );

        this._metas.include({ key: key, value: valueInput });

    },

    retrieveData: function( pAndClose ){
        var res = new Hash();
        res.domain_rsn = this.page.domain_rsn;
        res.versionType = this.versionType;
        res.include( 'rsn', this.rsn );

        
        //general data
        this.generalFields.each(function(field, fieldId){
            res.include( fieldId, field.getValue() );
        });
        
        //properties
        var properties = {};
        $H(this._pagePropertiesFields).each(function(fields, extKey){
        	properties[extKey] = {};
    		$H(fields).each(function(field, fieldKey){
    			properties[extKey][fieldKey] = field.getValue();
    		})
    	});
        res.properties = JSON.encode(properties);

        //meta-extra todo

        var meta = [];
        meta.include({name: 'keywords', value: this.generalFields['metaKeywords'].getValue()});
        meta.include({name: 'description', value: this.generalFields['metaDesc'].getValue()});
        this._metas.each(function(mymeta){
            if( mymeta.key && mymeta.key.value != '' )
                meta.include({name: mymeta.key.value, value:mymeta.value.value});
        });

        res.meta = JSON.encode( meta );
        

        //content 

        if( this.layoutBoxesInitialized == false ){
            res.include('dontSaveContents', 1);
        } else {
            try {
                res.include( 'contents', JSON.encode( this.retrieveContents(pAndClose) ) );
            } catch(e){
                logger('Error in retrieveData();');
                logger(e);
                res.include('dontSaveContents', 1);
            }
        }
        //res.include( 'contents', contents );
        return res;
    },

    retrieveContents: function( pAndClose ){
        var contents = new Hash();
        this.layoutBoxes.each(function( pBox, pBoxId ){
            contents.include( pBoxId, pBox.getValue( pAndClose ) );
        });
        return contents;
    },

    saveAs: function(){

    },

    saveAndClose: function( pAndPublish ){
        this.save(true, pAndPublish);
    },

    save: function( pAndClose, pAndPublish ){
        if( pAndPublish )
            this.saveButtonPublish.startTip( _('Save ...') );
        else
            this.saveButton.startTip( _('Save ...') );

        if( this.lastSaveRequest ) this.lastSaveRequest.cancel();

        this.overlayStart();

        this.lastSaveWasPublished = pAndPublish;

        var req = this.retrieveData( pAndClose );
        if( pAndPublish == true ){
            req.andPublish = 1;
        }

        this.lastSaveRequest = new Request.JSON({url: _path+'admin/pages/save', noCache: 1, onComplete: function(res){

            this.overlay.destroy();

            if( pAndPublish )
                this.saveButtonPublish.stopTip( _('Saved') );
            else
                this.saveButton.stopTip( _('Saved') );

            var d = this.domainTrees.get(this.page.domain_rsn);
            if( d && (this.page.title != res.title || this.page.type != res.type || this.page.visible != res.visible 
                    || this.page.access_denied != res.access_denied) || ( this.page.draft_exist == 1 && pAndPublish)
                    || this.page.access_from_groups != res.access_from_groups
                    || ( this.page.draft_exist == 0 && !pAndPublish))
                d.reload()
            if( res ){
                this.page = res;
                this.toggleSearchIndexButton( this.page.type);
            }
            this.loadVersions( true );
            this.loadAliases();
            
            //if( pAndPublish )
            //	this.createSearchIndexForPage();
            
        }.bind(this)}).post(req);
    },

    viewType: function( pType, pOnlyTabs ){
        this.currentViewType = pType;
        this.viewButtons.each(function(button){        	
            button.setPressed( false );
        });
        
        this._hideElementPropertyToolbar();
        if( pType != 'empty' ){
            this.viewButtons[pType].setPressed(true);
            this.showPane( pType );
        } else {
            this.hidePanes();
        }
        if( !pOnlyTabs ){
            if( pType == 'contents' ){
                this._loadContent();
            }
            if( pType == 'versioning' ){
                this.loadVersionOverview();
            }
        }
    },

    hidePanes: function(){
        this.panes.each(function(panes){
            panes.setStyle('display', 'none');
        });
    },

    showPane: function( pPane ){
        this.hidePanes();
        var p = this.panes[pPane];
        if( p.setStyle ) 
            p.setStyle('display', 'block');
    },

    pageAdd: function( pDomain ){
    	var domaintitle = '';
    	ka.settings.domains.each(function(domain){
    		if( domain.rsn == pDomain )
    			domaintitle = domain.domain;
    	});
    	
        ka.wm.openWindow( 'admin', 'pages/addDialog', null, this.win.id, {
            onChoose: function( pTitles, pTarget, pPos ){
                alert( pPage.title );
            },
            domain_rsn: pDomain,
            domain_title: domaintitle,
            onComplete: function( pDomain ){
                this.domainTrees.get(pDomain).reload();
            }.bind(this)
        });
    },

    loadTree: function(){
        var _this = this;
        this.domainTrees = new Hash();
        
        this.treeContainerTd.empty();
            
        var openDomain = false;
        if( ka.settings.domains.length == 1 ){
        	openDomain = true;
        }
        
        ka.settings.domains.each(function(domain){
        	
        	if( domain.lang != this.language ) return;
        	
            _this.domainTrees.include(domain.rsn, new ka.pagesTree( _this.treeContainerTd, domain.rsn, {
                onClick: function( pPage ){
                    _this.domainTrees.each(function(_domain){
                        _domain.unselect();
                    });
                    _this.loadPage( pPage.rsn );
                },
                onDomainClick: function( pDomain ){
                    _this.domainTrees.each(function(_domain){
                        _domain.unselect();
                    });
                    _this.showDomain( pDomain );
                },
                onMoveComplete: function(){
                    if(this.page && this.page.domain_rsn == domain.rsn ){
                    	this.loadAliases();
                    }
                }.bind(this),
                withPageAdd: _this.pageAdd.bind(_this),
                withContext: true,
                pageObj: _this,
                openDomain: openDomain,
                win: this.win
            }));
            
            
        }.bind(this));
        

        if( this.win.params && this.win.params.rsn > 0 && !this.alreadyOnLoadPageLoaded ){
            this.alreadyOnLoadPageLoaded = true;
            this.loadPage( this.win.params.rsn, true );
        }
        
    },
    
    
    /* new element toolbar */
    
    _createElementSettingsToolbar : function() {

    	//create titlebars and content container
        this.elementPropertyToolbar = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbar',
            style: 'height: 1px'
        }).inject( this.tree );
        
        
        this.elementPropertyToolbarInner = new Element('div').inject(this.elementPropertyToolbar);
        
        this.elementPropertyToolbar.set('tween', {transition: Fx.Transitions.Cubic.easeOut});

        this.elementPropertyToolbarTitle = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarTitle',
            html: '<img src="'+_path+'inc/template/admin/images/icons/tree_minus.png" /> '+_('Element properties')
        }).inject( this.elementPropertyToolbarInner );

        this.elementPropertyToolbarContent = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarContent'
        }).inject( this.elementPropertyToolbarInner );

        
        this.elementAccessToolbarTitle = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarTitle',
            html: '<img src="'+_path+'inc/template/admin/images/icons/tree_plus.png" /> '+_('Element access')
        }).inject( this.elementPropertyToolbarInner );
        
        this.elementAccessToolbarContent = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarContent'
        }).inject( this.elementPropertyToolbarInner );
        
        
        
        
        //general propertie fields##########################################################
        this.elementPropertyFields = {};    	

        //this.width = this.main.getSize().x;

        //var p = new Element('div');

        this.elementPropertyFields.eTitle = new ka.field({
            label: _('Title'), small: 1
        }).inject( this.elementPropertyToolbarContent );
        
        
        this.elementPropertyFields.eTypeSelect = new ka.field({
            label: _('Type'),
            type: 'select',
            help: 'admin/element-type',
            small: 1,
            tableItems: [
                {i: 'text', label: _('Text')},
                {i: 'layoutelement', label: _('Layout Element')},
                {i: 'picture', label: _('Picture')},
                {i: 'plugin', label: _('Plugin')},
                {i: 'pointer', label: _('Pointer')},
                {i: 'navigation', label: _('Navigation')},
                {i: 'template', label: _('Template')},
                {i: 'html', label: _('HTML')},
                {i: 'php', label: _('PHP')}
            ],
            table_key: 'i',
            table_label: 'label'
        }).inject( this.elementPropertyToolbarContent );
        
        

        //template select
       // this.optionsTemplate.empty();
        var templateP = new Element('div', {
            'class': 'ka-field-main ka-field-main-small'
        }).inject( this.elementPropertyToolbarContent );

        new Element('div', {
            'class': 'ka-field-title',
            html: '<div class="title">'+_('Template')+'</div>'
        }).inject( templateP );

        var newP = new Element('div', {
            'class': 'ka-field-field'
        }).inject( templateP );


        
        
        this.elementPropertyFields.eTemplate = new Element('select', {
        //}).inject( w2 );
        }).inject( newP );

        var limitLayouts = [];


        this.elementPropertyFields.eTemplateNoLayout = new Element('option', {
            html: _('-- no layout --'),
            value: ''
        }).inject(this.elementPropertyFields.eTemplate);

        $H(ka.settings.contents).each(function(la, key){
            var group = new Element('optgroup', {
                label: key
            });
            var count = 0;
            $H(la).each(function(layoutFile,layoutTitle){
                if( limitLayouts && limitLayouts.length > 0 && !limitLayouts.contains( layoutFile ) ) return;
                new Element('option', {
                    html: layoutTitle,
                    value: layoutFile
                }).inject( group );
                count++;
            })
            if( count != 0 )
                group.inject( this.elementPropertyFields.eTemplate );
        }.bind(this));



        
        this.elementPropertyFields.eLayoutSelect = new ka.field({
            label: _('Layout'),
            type: 'select',
            small: 1,
            tableItems: []
        }).inject( this.elementPropertyToolbarContent );
        
        $H(ka.settings.configs).each(function(config, key){
			
			if( config['themes'] ){
				$H(config['themes']).each(function(options, themeTitle){
					
					if( options['layoutElement'] ){
						
			    		var group = new Element('optgroup', {
			                label: _(themeTitle)
			            }).inject( this.elementPropertyFields.eLayoutSelect.input );
			    		
						$H(options['layoutElement']).each(function(templatefile, label){
							new Element('option', {
			                    html: _(label),
			                    value: templatefile
			                }).inject( group );
						}.bind(this));
				
					}

				}.bind(this));
			}
		}.bind(this));
        this.elementPropertyFields.eLayoutSelect.hide();
        
       
        this.elementPropertyFields.ePanel = new Element('div', {'class': 'ka-pages-layoutContent-ePanel'}).inject( this.elementPropertyToolbarContent );

      
        
        //accessfields
        this.elementAccessFields = {};
        
        this.elementAccessFields['unsearchable'] = new ka.field(
                {label: _('Unsearchable'), type: 'checkbox', small: 1}
            ).inject( this.elementAccessToolbarContent );
        
        
        this.elementAccessFields['access_from'] = new ka.field(
                {label: _('Release at'), type: 'datetime', small: 1}
            ).inject( this.elementAccessToolbarContent );

        this.elementAccessFields['access_to'] = new ka.field(
                {label: _('Hide at'), type: 'datetime', small: 1}
            ).inject( this.elementAccessToolbarContent );

        this.elementAccessFields['access_from_groups'] = new ka.field(
                {label: _('Limit access to groups'), desc: ('For no restrictions leave it empty'), small: 1,
                type: 'select', size: 5, multiple: true, tinyselect: true,
                tableItems: ka.settings.groups, table_label: 'name', table_key: 'rsn', help: 'admin/element-access-grouplimitation'
                }
            ).inject( this.elementAccessToolbarContent );
      
      this._initElementSettingsToolbarAccordion(this._calcAccordionHeight());
    },
    
    //init the accordion 
    _initElementSettingsToolbarAccordion : function(pAccordionContentHeight) {
    	
    	//kill last acc object if it exists
    	if(this.elementPropertyToolbarAccordion)
    		delete this.elementPropertyToolbarAccordion;
    	
    	var _this = this;
    	
        this.elementPropertyToolbarAccordion = new Accordion(
        	this.win.border.getElements('.ka-pages-tree-elementPropertyToolbarTitle'),
        	this.win.border.getElements('.ka-pages-tree-elementPropertyToolbarContent'), {
            duration: 400,
            display: 0,
            fixedHeight: pAccordionContentHeight,
            transition: Fx.Transitions.Cubic.easeOut,
            onActive: function(toggler, element){                          
                toggler.addClass('accordion-current');
                _this.win.border.getElements('.ka-pages-tree-elementPropertyToolbarTitle img').each(function(img){
                	img.set('src', _path+'inc/template/admin/images/icons/tree_plus.png');
                });
                toggler.getElement('img').set('src', _path+'inc/template/admin/images/icons/tree_minus.png');
                
                element.setStyles({ overflowX: 'hidden', overflowY: 'auto' });
            },
            onBackground: function(toggler, element){
                toggler.removeClass('accordion-current');            
            }
        }, this.elementPropertyToolbar );
        
        this.lastAccordionHeight = pAccordionContentHeight;
        
        this.elementPropertyToolbarAccordion.display(0);
    	
    },
    
    _calcAccordionHeight : function() {
    	//if(!this.elementPropertyHeight)
      		totalBoxHeight = this._calcElementPropertyToolbarHeight();
      	//else
      	//	totalBoxHeight = this.elementPropertyHeight;
    	
    	return Math.round(totalBoxHeight - 2 - ( this.elementPropertyToolbarTitle.getSize().y*2));
    }
    

});

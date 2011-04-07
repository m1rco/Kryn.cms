var admin_system_module = new Class({

    initialize: function( pWin ){
        this.win = pWin;    


        this.tabGroup = this.win.addTabGroup();
        this.tabButtons = $H();
        this.tabButtons['install'] = this.tabGroup.addButton(_('New extension'), _path+'inc/template/admin/images/icons/plugin_add.png', this.changeType.bind(this,'install'));
        this.tabButtons['installed'] = this.tabGroup.addButton(_('Installed'), _path+'inc/template/admin/images/icons/plugin.png', this.changeType.bind(this,'installed'));
        this.tabButtons['local'] = this.tabGroup.addButton(_('Development'), _path+'inc/template/admin/images/icons/plugin_go.png', this.changeType.bind(this,'local'));

        this.panes = {};
        this.panes['installed'] = new Element('div', {
            'class': 'admin-system-module-pane'
        }).inject( this.win.content );
        this.panes['install'] = new Element('div', {
            'class': 'admin-system-module-pane'
        }).inject( this.win.content );
        
        this.panes['local'] = new Element('div', {
            'class': 'admin-system-module-pane'
        }).inject( this.win.content );

        this.loader = new ka.loader().inject( this.win.content );


        /* installed */
        this.tableInstalled = new ka.Table().inject( this.panes['installed'] );
        this.tableInstalled.setColumns([
            [_('Title')],
            [_('Activated'), 70],
            [_('Version'), 70],
            [_('Server v.'), 70],
            [_('Status'), 100],
            [_('Action'), 170]
        ]);

        this.categories = $H({});
        [
            {v: _('Information/Editorial office'), i: 1},
            {v: _('Multimedia'), i: 2},
            {v: _('SEO'), i: 3},
            {v: _('Widget'), i: 4},
            {v: _('Statistic'), i: 5},
            {v: _('Community'), i: 6},
            {v: _('Interface'), i: 7},
            {v: _('System'), i: 8},
            {v: _('Advertisement'), i: 9},
            {v: _('Security'), i: 10},
            {v: _('ECommerce'), i: 11},
            {v: _('Download & Documents'), i: 12},
            {v: _('Themes / Layouts'), i: 13},
            {v: _('Language package'), i: 14},
            {v: _('Data acquisition'), i: 19},
            {v: _('Collaboration'), i: 18},
            {v: _('Other'), i: 16}
        ].each(function(item){
            this.categories[ item.i ] = item.v;
        }.bind(this));
        
        this.win = pWin;
        this._createInstallLayout();

        if( this.win.params && this.win.params.updates == 1 )
        	this.changeType('installed');
        else
        	this.changeType('install');
    },

    changeType: function( pType ){
        this.lastType = pType;
        this.tabButtons.each(function(button, id){ 
            button.setPressed( false );
            this.panes[id].setStyle('display', 'none');
        }.bind(this));
        this.tabButtons[ pType ].setPressed(true);
        this.panes[ pType ].setStyle('display', 'block');

        if( pType == 'installed' ) {
            this.loadInstalled();
            //this.renderInstall();
        }
        if( pType == 'local' ) {
            this.loadLocal();
        }
        if( pType == 'install' ) {
            this._createInstallLayout();
        }
    },




    loadInstalled: function(){
        this.loader.show();
        if( this.llir )
            this.llir.cancel();

        var p = this.panes['installed'];
        
        var lang = ka.settings.get('user').get('adminLanguage');

        this.llir = new Request.JSON({url: _path+'admin/system/module/loadInstalled', noCache: 1, onComplete: function(res){

            var values = [];
            $H(res).each(function(item, key){
                var title = "config parse error: "+key;
                if( item.noConfig ){
                    title = "config not found: "+key;
                }
                if( item.title )
                    title = item['title'][lang] ? item['title'][lang] : item['title']['en'];

                var icon = (item.activated==1)?'accept':'delete';
                

                var _title = '';
                var actions = new Element('div');
                var actionsStatus = new Element('div');

                new ka.Button(_('Info') )
                .addEvent('click', function(){
                    ka.wm.open('admin/system/module/view', {name: key, type: 0});
                }.bind(this))
                .inject(actions);

                if( !['kryn','admin','users'].contains( key ) ){
                    if( item.installed ){
                        _title = _('Activated');
                        new ka.Button(_('Deactivate') )
                        .addEvent('click', function(){
                            new Request.JSON({url: _path+'admin/system/module/deactivate/', noCache: 1, onComplete: function(){
                                this.loadInstalled();
                                ka.loadSettings();
                                ka.loadMenu();
                            }.bind(this)}).post({name: key});
                        }.bind(this))
                        .inject(actionsStatus)
                     } else { 
                        _title = _('Deactivated');
                        new ka.Button(_('Activate') )
                        .addEvent('click', function(){
                            new Request.JSON({url: _path+'admin/system/module/activate/', noCache: 1, onComplete: function(){
                                this.loadInstalled();
                                ka.loadSettings();
                                ka.loadMenu();
                            }.bind(this)}).post({name: key});
                        }.bind(this))
                        .inject(actionsStatus);
                    }
                    new ka.Button(_('Deinstall') )
                    .addEvent('click', function(){
                        ka.wm.open('admin/system/module/view', {name: key, type: 0, removeNow: 1});
                    }.bind(this))
                    .inject(actions);
                }

                if( item.version != item.serverVersion && item.serverVersion != ''){
                    icon = 'cog_go';
                    _title = _('New version available');
                    new ka.Button(_('Update'))
                    .addEvent('click', function(){
                        ka.wm.open('admin/system/module/view/', {name: key, type: 0, updateNow: 1});
                    }.bind(this))
                    .inject( actions );
                }

                var value = [title,
                    '<img title="'+_title+'" src="'+_path+'inc/template/admin/images/icons/'+icon+'.png" />',
                    item.version,
                    (item.serverVersion)?item.serverVersion:_('Local'),
                    actionsStatus,
                    actions];
                values.include( value );
            }.bind(this));

            this.tableInstalled.setValues( values );
            this.loader.hide();
        }.bind(this)}).post();
    },

























    loadLocal: function(){
        if( this.lc )
            this.lc.cancel();
        this.loader.show();

        this.lc = new Request.JSON({url: _path+'admin/system/module/loadLocal', noCache: 1, onComplete: function(res){
            this.loader.hide();
            this.renderLocal(res);
        }.bind(this)}).post();
    },

    renderLocal: function( pMods ){


        this.panes['local'].empty();

        this.localePane = new Element('div', {
            'class': 'ka-kwindow-content-withBottomBar'
        }).inject( this.panes['local'] );
        var p = this.localePane;
        
        if( !ka.settings.system.communityEmail || ka.settings.system.communityEmail == '' ){
            new Element('h3', {
                html: _('Local extensions')
            }).inject( p );
        } else {
            new Element('h3', {
                html: _('My extensions')+' ('+ka.settings.system.communityEmail+')'
            }).inject( p );
        }

        var buttonBar = new ka.buttonBar( this.panes['local'] );
        buttonBar.addButton(_('Create extension'), function(){
            this.win._prompt(_('Extension code: '), '', function(res){
                if(!res)return;
                ka.wm.open('admin/system/module/add', {name: res});
            })
        }.bind(this));

        if( !ka.settings.system.communityEmail || ka.settings.system.communityEmail == '' ){
            new Element('div', {
                style: 'color: gray; text-align: center; padding: 15px;',
                html: _("You aren't connected to kryn community. Please enter your kryn.org account via the settings window to share your created extensions.")
            }).inject( p );
        }

        table = new Element('table', { width: "100%"}).inject( p );

        if( $type(pMods) == 'array' ){
            new Element('div', {
                style: 'color: gray; text-align: center; padding: 5px;',
                html: _("No extensions found. Create or install a extension.")
            }).inject( p );
        }

        var values = {my: [], local: []};
        var tables = {};

        if( ka.settings.system.communityEmail != '' ){
            //if connected
            tableMyDiv = new Element('div', {style: 'position: relative'}).inject( p );
            tables['my'] = new ka.Table([
                [_('Title')],
                [_('Activated'), 50],
                [_('Version'), 50],
                [_('Server v.'), 50],
                [_('Status'), 100],
                [_('Action'), 250]
            ], {absolute: false}).inject( tableMyDiv );
            
            new Element('h3', {
                html: _('Local extensions')
            }).inject( p );
        }


        tableLocalDiv = new Element('div', {style: 'position: relative'}).inject( p );
        tables['local'] = new ka.Table([
            [_('Title')],
            [_('Activated'), 50],
            [_('Version'), 50],
            [_('Server v.'), 50],
            [_('Status'), 100],
            [_('Action'), 250]
        ], {absolute: false}).inject( tableLocalDiv );


        var lang = ka.settings.get('user').get('adminLanguage');
        $H(pMods).each(function(mod,key){

                var item = mod;
                var table = 'my';
                if( mod.owner == '' || !mod.owner )
                    table = 'local';

                var title = "config parse error: "+key;
                if( item.noConfig ){
                    title = "config not found: "+key;
                }
                if( item.title )
                    title = item['title'][lang] ? item['title'][lang] : item['title']['en'];

                var icon = (item.activated==1)?'accept':'delete';
                var _title = '';

                var actions = new Element('div');
                var bActions = new Element('div');
                if( !['kryn','admin','users'].contains( key ) ){
                     if( item.installed ){
                        new ka.Button(_('Deactivate') )
                        .addEvent('click', function(){
                            new Request.JSON({url: _path+'admin/system/module/deactivate/', noCache: 1, onComplete: function(){
                                this.loadLocal();
                                ka.loadSettings();
                                ka.loadMenu();
                            }.bind(this)}).post({name: key});
                        }.bind(this))
                        .inject(bActions)
                    } else { 
                        new ka.Button(_('Activate') )
                        .addEvent('click', function(){
                            new Request.JSON({url: _path+'admin/system/module/activate/', noCache: 1, onComplete: function(){
                                this.loadLocal();
                                ka.loadSettings();
                                ka.loadMenu();
                            }.bind(this)}).post({name: key});
                        }.bind(this))
                        .inject(bActions);
                    }
                }

                new ka.Button(_('Info') )
                .addEvent('click', function(){
                    ka.wm.open('admin/system/module/view', {name: key, type: 0});
                }.bind(this))
                .inject(actions);

                new ka.Button(_('Edit') )
                .addEvent('click', function(){
                    ka.wm.open('admin/system/module/edit', {name: key});
                }.bind(this))
                .inject(actions)

                new ka.Button(_('DB-Update') )
                .addEvent('click', function(){
                    ka.wm.open('admin/system/module/dbInit', {name: key});
                })
                .inject(actions)

                new ka.Button(_('Share'))
                .addEvent('click', function(){
                    ka.wm.open('admin/system/module/publish', {name: key});
                })
                .inject(actions)

                var value = [title+' <span style="color: gray;">('+key+')</span>',
                    '<img title="'+_title+'" src="'+_path+'inc/template/admin/images/icons/'+icon+'.png" />',
                    item.version,
                    (!item.owner || item.owner == "") ? _('Local') : item.serverVersion,
                    bActions,
                    actions];

                values[table].include( value );
        }.bind(this));

        if( ka.settings.system.communityEmail != '' ){
            if( values['my'].length > 0 ){
                tables['my'].setValues( values['my'] );
            } else {
                tables['my'].hide();
            }
        }
    
        if( values['local'].length > 0 ){
            tables['local'].setValues( values['local'] );
        } else {
            tables['local'].hide();
        }
    },























    _createInstallLayout: function(){
        this.panes['install'].empty();



        this.searchPane = new Element('div',{
            'style': 'position: absolute; left: 0px; top: 0px; right: 0px; height: 30px; text-align: right; padding-top: 5px; border-bottom: 1px solid #bbb; padding-right: 3px;'
        }).inject( this.panes['install'] );


        this.searchLeftPane = new Element('div', {
            style: 'float: left;'
        }).inject( this.searchPane );

        this.searchInput = new Element('input',{
            'class': 'text',
            style: 'padding: 4px; width: 250px; margin: 0px 3px;'
        })
        .addEvent('keyup', function(e){
            if( e.key == 'enter' ){
                if( this.searchInput.value  == '' ){
                    return this.searchInput.highlight();
                }
                this.doSearch();
            }
        }.bind(this))
        .inject( this.searchLeftPane );

        this.searchBtn = new ka.Button(_('Search')).setStyles({
            position: 'relative',
            top: -1
        })
        .addEvent('click', function(){
            if( this.searchInput.value  == '' ){
                return this.searchInput.highlight();
            }
            this.doSearch();
        }.bind(this))
        .inject( this.searchLeftPane );



        new Element('span', {
            html: _('Extension code or file:')+' #'
        }).inject( this.searchPane );

        this.directInput = new Element('input',{
            'class': 'text',
            style: 'padding: 4px; width: 100px; margin: 0px 3px;'
        }).inject( this.searchPane );
        
        var _this = this;
        new ka.Button(_('Choose')).setStyles({
            position: 'relative',
            top: -1
        }).addEvent('click', function(){
        	 ka.wm.openWindow( 'admin', 'pages/chooser', null, -1, {onChoose: function( pValue ){
                 //addFile( pValue );
        		 _this.directInput.value = pValue;
                 this.win.close();//close paes/chooser windows -> onChoose.bind(this) in chooser-event handler
             },
             opts: {files: 1, upload: 1}
             });
        }).inject(this.searchPane);

        this.directBtn = new ka.Button(_('Install')).setStyles({
            position: 'relative',
            top: -1
        })
        .addEvent('click', function(){
            if( this.directInput.value  == '' ){
                return this.directInput.highlight();
            }
            var type = 1; //internet
            if( this.directInput.value.test('zip') ){
            	type = this.directInput.value;
            }
            
            ka.wm.open('admin/system/module/view', {name: this.directInput.value, type: type});
        }.bind(this))
        .inject( this.searchPane );



        this.mainPane = new Element('div', {
            'style': 'position: absolute; top: 36px; left: 0px; right: 221px; bottom: 0px; background-color: #f4f4f4; padding: 5px; overflow: auto;'
        }).inject( this.panes['install'] );

        this.boxPane = new Element('div', {
            'style': 'position: absolute; top: 36px; width: 220px; right: 0px; bottom: 0px; background-color: #f4f4f4; border-left: 1px solid #ddd; overflow: auto'
        }).inject( this.panes['install'] );

        this.viewPath();

    },
    
    viewPath: function( pPath ){
        this.mainPane.empty();
        if( $type(pPath) == false )
            pPath = '';

        this.currentPath = pPath;

        if( pPath == '' ){
            this.openCategories();
        } else {
            var paths = [pPath];
            if( pPath.indexOf( '/' ) >0 ){
                paths = pPath.split('/');
            }
            this.paths = paths;

            switch( paths[0] ){
                case 'category':
                    this.openCategoryList( paths[1] );

            }   
        }
    },

    doSearch: function(){
        
        var q = this.searchInput.value;
        this.mainPane.set('html', '<center><img src="'+_path+'inc/template/admin/images/loading.gif" /></center>');

        new Request.JSON({url: _path+'admin/system/module/managerSearch', noCache: 1, onComplete: function( res ){
            this.mainPane.set('html', '');


            if( res && res['status'] == 'ok' ){
                this.mainPane.set('html', '<h2>'+_('Search result: ')+' '+q+' ('+res.items.length+')</h2>');

                new ka.Button('< '+_('Go to overview'))
                .addEvent('click', function(){
                    this.viewPath();
                }.bind(this))
                .inject( this.mainPane );

                res.items.each(function(item){
                    this._createListItem( item ).inject( this.mainPane );
                }.bind(this));
            } else {
                this.mainPane.set('html', '<div style="padding: 5px; font-weight: bold; text-align: center;">'+_('No search results. :-(')+'</div>');

                new ka.Button('< '+_('Go to overview'))
                .addEvent('click', function(){
                    this.viewPath();
                }.bind(this))
                .inject( this.mainPane );
            }
        }.bind(this)}).post({q: q});

    },

    openCategoryList: function( pId ){

        new Element('h2', {
            html: _('Extensions in %s').replace('%s', this.categories[ pId ]),
            style: 'margin: 2px;'
        }).inject( this.mainPane );

        new ka.Button('< '+_('Go to overview'))
        .addEvent('click', function(){
            this.viewPath();
        }.bind(this))
        .inject( this.mainPane );

        var content = new Element('div', {
            html: '<center><img src="'+_path+'inc/template/admin/images/loading.gif" /></center>'
        }).inject( this.mainPane );

        new Request.JSON({url: _path+'admin/system/module/managerGetCategoryItems', noCache: 1, onComplete: function( res ){
            content.set('html', '');

            if( res ){
                res.each(function(item){
                    this._createListItem( item ).inject( content );
                }.bind(this));
            }

        }.bind(this)}).post({category: pId, lang: window._session.lang});

    },

    _createListItem: function( pItem ){
        var box = new Element('div', {
            style: 'border-bottom: 1px solid #ddd; padding: 8px 4px; margin: 4px 0px'
        });
        var h3 = new Element('h3' ,{
            html: pItem.title,
            style: 'font-weight: bold;'
        }).inject( box ); 

        new Element('span', {
            style: 'font-size: 10px; color: gray; font-weight: normal; padding-left: 5px;',
            html: _('by %s').replace('%s', pItem.owner)
        }).inject( h3 );
        
        var desc = new Element('div' ,{
            style: 'color: gray; padding: 4px 0px; '
        }).inject( box ); 

            if( pItem.preview ){
                new Element('img', {
                    style: 'float: right; border: 1px solid silver',
                    width: 150,
                    src: pItem.preview
                }).inject( desc );
            }

            new Element('div', {
                html: pItem.desc+'<br /><br/>Extensioncode: #'+pItem.name+'<br />'+
                'Version: '+pItem.version+'<br />'+
                'Downloads: '+pItem.downloads
            }).inject( desc );


            new Element('div', {
                style: 'clear: both;'
            }).inject( box );

            var line = new Element('div', {
            }).inject( box );

            new ka.Button(_('Details'))
            .addEvent('click', function(){
                ka.wm.open('admin/system/module/view', {name: pItem.code, type: 1});
            })
            .inject( line );

            

            new ka.Button(_('To website'))
            .set('href', 'http://www.kryn.org/extensions/'+pItem.name)
            .set('target', '_blank')
            .inject( line );


            return box;
        },

        openSidebar: function( pBoxes ){
            this.boxPane.empty();

            pBoxes.each(function(opts){
                var box = new Element('div',{
                    'style': 'background-color: #eee;'
                }).inject( this.boxPane );

                var title = new Element('h3', {
                    html: opts.title
                }).inject( box );

                var content = new Element('div', {
                    style: 'padding: 4px;',
                    html: '<center><img src="'+_path+'inc/template/admin/images/loading.gif" /></center>'
            }).inject( box );
                
            if( this.oldGetbox )
                this.oldGetbox.cancel();

            this.oldGetbox = new Request.JSON({url: _path+'admin/system/module/managerGetBox/', noCache: 1, onComplete: function(res){
                if( res ){
                    if( opts.render )
                        opts.render( res, content, title );
                    else
                        content.set('html', res.html);
                }
            }.bind(this)}).post({code: opts.code});

        }.bind(this));

    },

    openCategories: function(){

        new Element('h2', {
            html: _('Categories'),
            style: 'margin: 2px;'
        }).inject( this.mainPane );

        this.categoryPane = new Element('div').inject( this.mainPane );
        this.categoryLines = 0;

        this.categoryPaneLeft = new Element('div', {style: 'float: left; width: 49%; padding: 5px 0px;'}).inject( this.mainPane );
        this.categoryPaneRight = new Element('div', {style: 'float: right; width: 49%; padding: 5px 0px;'}).inject( this.mainPane );

        this.addCategoryLine( _('Theme / Layouts'), 13 );

        this.categories.each(function(cat,id){
            if( id != 13 ){
                this.addCategoryLine( cat, id );
            }
        }.bind(this));

        this.openSidebar([
            {title: _('Best themes'), code: 'best-themes', more: this.viewPath.bind(this, 'best-themes'), render: this.renderBestThemes.bind(this)}
        ]);

    },

    renderBestThemes: function( pRes, pContent, pTitle ){
        pContent.set('text', '');
        pRes.each(function(item){
                
            var div = new Element('div', {
                style: "border-bottom: 1px solid #ddd; margin-bottom: 4px; padding-bottom: 6px;",
                'class': 'extensionmanager-box-item'
            }).inject( pContent );

            new Element('div', {
                html: item.title,
                style: 'font-weight: bold;'
            }).inject( div );

            new Element('div', {
                text: '#'+item.code,
                style: 'color :gray; font-size: 10px;'
            }).inject( div );

            var imgDiv = new Element('div', {
                style: 'text-align: center; padding: 2px;'
            }).inject( div );

            new Element('img', {
                width: 150,
                style: 'border: 1px solid silver',
                src: item.preview
            }).inject( imgDiv );

            new ka.Button(_('Install'))
            .addEvent('click', function(){
                ka.wm.open('admin/system/module/view', {name: item.code, type: 1});
            })
            .inject( div );

        }.bind(this));
    },

    addCategoryLine: function( pTitle, pId ){
        this.categoryLines++;
        var a = new Element('a', {
            html: '» '+pTitle,
            href: 'javascript: ;',
            'class': 'extensionmanager-category-line'
        })
        .addEvent('click', function(){
            this.viewPath( 'category/'+pId );
        }.bind(this));

        /*
        if( pId == 13 ){
            a.setStyles({
                'font-size': 14,
                paddingBottom: 5
            });
        }*/
        
        if( this.categoryLines <= 9 )
            a.inject( this.categoryPaneLeft );
        else
            a.inject( this.categoryPaneRight );
    }

});

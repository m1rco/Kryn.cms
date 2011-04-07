var admin_system_module_edit = new Class({

    initialize: function( pWin ){
        this.win = pWin;
        this.mod = this.win.params.name;
        this.win.setTitle( this.mod+' - '+this.win.getTitle() );
        this._createLayout();
    },

    _createLayout: function(){

        this.topNavi = this.win.addTabGroup();
        this.buttons = $H({});
        this.buttons['general'] = this.topNavi.addButton(_('General'),'', this.viewType.bind(this, 'general'));
        this.buttons['links'] = this.topNavi.addButton(_('Links'), '', this.viewType.bind(this, 'links'));
        this.buttons['db'] = this.topNavi.addButton(_('Database'), '', this.viewType.bind(this, 'db'));
        this.buttons['forms'] = this.topNavi.addButton(_('Forms'), '', this.viewType.bind(this, 'forms'));
        this.buttons['plugins'] = this.topNavi.addButton(_('Plugins'), '', this.viewType.bind(this, 'plugins'));
        this.buttons['docu'] = this.topNavi.addButton(_('Docu'), '', this.viewType.bind(this, 'docu'));
        this.buttons['help'] = this.topNavi.addButton(_('Help'), '', this.viewType.bind(this, 'help'));
        this.buttons['layouts'] = this.topNavi.addButton(_('Themes'), '', this.viewType.bind(this, 'layouts'));
        this.buttons['language'] = this.topNavi.addButton(_('Language'), '', this.viewType.bind(this, 'language'));

        this.panes = $H();
        this.buttons.each(function(button,id){
            this.panes[id] = new Element('div', {
                'class': 'admin-system-modules-edit-pane'
            }).inject( this.win.content );
        }.bind(this));

        this.languageSelect = new Element('select', {
            'style': 'margin-left: 7px;'
        })
        .addEvent('mousedown', function(e){
            e.stopPropagation();
        })
        .addEvent('change', function(){
            var _this = this;
            this.win._confirm(_('Really change language? Unsaved information will be lost.'), function(go){
                if( go ){
                    _this.lastLanguage = _this.languageSelect.value;
                    _this.viewType(_this.lastType);
                } else {
                    _this.languageSelect.value = _this.lastLanguage;
                }
            });
        }.bind(this))
        .inject( this.win.titleGroups );
        
        $H(ka.settings.langs).each(function(lang,id){
            new Element('option', {
                text: lang.langtitle+' ('+lang.title+', '+id+')',
                value: id
            }).inject( this.languageSelect );
        }.bind(this));

        this.lastLanguage = this.languageSelect.value;

        this.loader = new ka.loader().inject( this.win.content );
        this.loader.hide();

        this.renderLanguage();

        this.viewType( 'general' );
    },

    _renderForms: function( pForms ){
        this.panes['forms'].empty();
        var p = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['forms'] );
        this.formsPaneItems = p;

        this.formsAddImg = new Element('img',{
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add form'),
            style: 'cursor: pointer; margin: 3px;'
        })
        .addEvent('click', function(){
            this.addForm('newFormClass', {});
        }.bind(this))
        .inject( p );

        pForms.each(function(form){
            this.addForm( form );
        }.bind(this));


        var buttonBar = new ka.buttonBar(this.panes['forms']);
        buttonBar.addButton(_('Save'), this.saveForms.bind(this));
    },

    addForm: function( pForm ){
        var m = new Element('div', {
            'class': 'admin-system-modules-forms-class',
            style: 'padding-left: 4px;'
        }).inject( this.formsPaneItems );

        new Element('input', {
            value: pForm,
            'class': 'text'
        }).inject( m );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete form'),
            style: 'cursor: pointer; position: relative; top: 3px;'
        })
        .addEvent('click', function(){
        }.bind(this))
        .inject( m );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/arrow_right.png',
            title: _('Edit class'),
            style: 'cursor: pointer; position: relative; top: 3px;'
        })
        .addEvent('click', function(){
        }.bind(this))
        .inject( m );

    },
    
    
    
    /*
     *  Plugins
     * 
     *
    */
    
    loadPlugins: function(){
        
        
        this.panes['plugins'].empty();
        
        this.pluginsPane = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['plugins'] );

        var buttonBar = new ka.buttonBar(this.panes['plugins']);
        buttonBar.addButton(_('Save'), this.savePlugins.bind(this));
        buttonBar.addButton(_('Add plugin'), this.addPlugin.bind(this));
        
        this.pluginsTable = new Element('table', {'class': 'ka-Table-head'}).inject( this.pluginsPane );
        this.pluginsTableBody = new Element('tbody', {'class': 'ka-Table-body'}).inject( this.pluginsTable );
        
        var tr = new Element('tr').inject( this.pluginsTableBody );
        new Element('th', {width: 15}).inject( tr );
        new Element('th', {width: 120, text: _('Method name')}).inject( tr );
        new Element('th', {width: 140, text: _('Title (english)')}).inject( tr );
        new Element('th', {text: _('Properties')}).inject( tr );

        this.lr = new Request.JSON({url: _path+'admin/system/module/getPlugins', noCache: 1, onComplete: function(res){
            this.loader.hide();
            
            if( res ){
                $H(res).each(function(item, key){
                    this.addPlugin( item, key )
                }.bind(this));
            }
            
        }.bind(this)}).post({name: this.mod});

        this.loader.hide();
    },
    
    savePlugins: function(){
    
    
    },
    
    addPlugin: function( pPlugin, pKey ){
    
        if( !this.pluginsTrClass || (this.pluginsTrClass  && this.pluginsTrClass == 'two')  )
            this.pluginsTrClass = 'one';
        else
            this.pluginsTrClass = 'two';
        
        var tr = new Element('tr', {'class': this.pluginsTrClass}).inject( this.pluginsTableBody );

        var td = new Element('td').inject( tr );
        
        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete plugin'),
            style: 'cursor: pointer;'
        })
        .addEvent('click', function(){
            this.win._confirm(_('Really delete?'), function(res){
                if( !res ) return;
                tr.destroy();
            });
        }.bind(this))
        .inject( td );
        
        var td = new Element('td').inject( tr );
        
        new Element('input', {
            'class': 'text',
            style: 'width: 115px',
            value: (pKey) ? pKey : ''
        }).inject( td );
        
        
        var td = new Element('td').inject( tr );
         new Element('input', {
            'class': 'text',
            style: 'width: 135px',
            value: (pPlugin && pPlugin[0]) ? pPlugin[0] : ''
        }).inject( td );
        
        
        var td = new Element('td').inject( tr );
            
        var properties = new Element('ol', {style: 'padding: 5px; padding-left: 20px;'}).inject( td );
        
        if( pPlugin && pPlugin[1] ){
            $H(pPlugin[1]).each(function(pProperty, pKey){
                var li = new Element('li').inject( properties );
                new ka.fieldProperty( pKey, pProperty, {small: true} ).inject( li );
            }.bind(this));
        }
            
    },
    
    
    
    /*
     * 
     * Documentation
     *
    */


    saveDocu: function(){
        if( this.lr ) this.lr.cancel();
        this.loader.show();
        this.lr = new Request.JSON({url: _path+'admin/system/module/saveDocu', noCache: 1, onComplete: function(res){
            this.loader.hide();
        }.bind(this)}).post({text: this.text.getValue(), lang: this.languageSelect.value, name: this.mod});
    },

    loadDocu: function(){

        this.panes['docu'].empty();
        var p = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['docu'] );

        var buttonBar = new ka.buttonBar(this.panes['docu']);
        buttonBar.addButton(_('Save'), this.saveDocu.bind(this));

        this.text = new ka.field(
            {label: _('Documentation')+' ('+this.languageSelect.value+')', type: 'wysiwyg', win:this.win}
        ).inject( p );
        this.text.setValue( _('Loading ...') );

        this.text.input.setStyle('height', '100%');
        this.text.input.setStyle('width', '100%');

        this.lr = new Request.JSON({url: _path+'admin/system/module/getDocu', noCache: 1, onComplete: function(res){
            this.loader.hide();
            this.text.input.value = res;
            this.text.initTiny();
        }.bind(this)}).post({lang: this.languageSelect.value, name: this.mod});

        this.loader.hide();

        //initTiny( text.lastId );
    },

    saveForms: function(){
        
    },

    loadForms: function(){
        this.lr = new Request.JSON({url: _path+'admin/system/module/getForms', noCache: 1, onComplete: function(res){
            this.loader.hide();
            this._renderForms(res);
        }.bind(this)}).post({name: this.mod});
    },

    loadDb: function(){
        this.lr = new Request.JSON({url: _path+'admin/system/module/getConfig', noCache: 1, onComplete: function(res){
            this.loader.hide();
            this._renderDb(res);
        }.bind(this)}).post({name: this.mod});
    },

    saveDb: function(){

        var req = {};
        req.name = this.mod;
        req.tables = {};
        this.panes['db'].getElements('div.dbTable').each(function(table){

            var columns = {};
            var tableKey = table.getElement('input.dbTableKey').value;

            table.getElements('div.dbTableColumn').each(function(column){
                var hcolumn = [];
                if( !column.getElements('input')[0] ) return;
                var columnKey = column.getElements('input')[0].value;

                hcolumn.include( column.getElements('select')[0].value );
                hcolumn.include( column.getElements('input')[1].value );
                hcolumn.include( column.getElements('select')[1].value );

                hcolumn.include( column.getElements('input')[2].checked );

                columns[ columnKey ] = hcolumn;
            });

            req.tables[ tableKey ] = columns;

        });

        req.tables = JSON.encode(req.tables);
        this.loader.show();
        this.lr = new Request.JSON({url: _path+'admin/system/module/saveDb', noCache: 1, onComplete: function(){
            this.loader.hide();
        }.bind(this)}).post(req);
    },

    _renderDb: function( pConfig ){
        this.panes['db'].empty();
        var p = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['db'] );
        this.dbPaneItems = p;

        this.dbAddColumnImg = new Element('img',{
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add table'),
            style: 'cursor: pointer; margin: 3px;'
        })
        .addEvent('click', function(){
            this._dbAddTable('newTable', {});
        }.bind(this))
        .inject( p );
    
        if( pConfig.db ){
            $H(pConfig.db).each(function(table,key){
                this._dbAddTable( key, table );
            }.bind(this));
        }

        var buttonBar = new ka.buttonBar(this.panes['db']);
        buttonBar.addButton(_('DB-Update'), function(){
            ka.wm.open('admin/system/module/dbInit', {name: this.mod});
        }.bind(this));
        buttonBar.addButton(_('Save'), this.saveDb.bind(this));
    },

    _dbAddTable: function( pKey, pTable ){

        var m = new Element('div', {
            'class': 'dbTable',
            style: 'padding: 4px;'
        }).inject( this.dbAddColumnImg, 'before' );

        var i = new Element('input', {
            'class': 'text dbTableKey',
            value: pKey
        }).inject( m );

        var columns = new Element('div', {
            'class': 'dbTableColumns',
            style: 'padding-left: 20px; padding-top: 5px;'
        }).inject( m );


        var headline = new Element('div', {
            'class': 'dbTableColumn'
        }).inject( columns );
        
        new Element('span', {
        	text: _('Name')
        }).inject( headline );
        
        new Element('span', {
        	text: _('Type'),
        	style: 'padding-left: 128px'
        }).inject( headline );
        
        new Element('span', {
        	text: _('Length'),
        	style: 'padding-left: 43px'
        }).inject( headline );

        new Element('span', {
        	text: 'Options',
        	style: 'padding-left: 22px'
        }).inject( headline );
        
        new Element('span', {
        	text: 'AI',
        	title: 'Auto increment/Sequence',
        	style: 'padding-left: 32px; text-decoration: underline'
        }).inject( headline );
        
        if( pTable )
            $H(pTable).each(function(opts,key){
                this._dbAddColumn( key, opts, columns );
            }.bind(this));

        this.dbAddColumn = new Element('img',{
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add column'),
            style: 'cursor: pointer; position: relative; top: 3px;'
        })
        .addEvent('click', function(){
            this._dbAddColumn('newColumn', {}, columns);
        }.bind(this))
        .inject( i, 'after' );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete table'),
            style: 'cursor: pointer; position: relative; top: 3px;'
        })
        .addEvent('click', function(){
            this.win._confirm(_('Really delete?'), function(res){
                if( !res ) return;
                m.destroy();
            });
        }.bind(this))
        .inject( this.dbAddColumn, 'after' );

    },

    _dbAddColumn: function( pKey, pOpts, pContainer ){
    
        var m = new Element('div', {
            'class': 'dbTableColumn'
        }).inject( pContainer );

        new Element('input', {
            'class': 'text',
            value: pKey
        }).inject( m );

        var s = new Element('select').inject( m );
        ['varchar', 'int', 'text', 'enum'].each(function(item){
            new Element('option', {
                text: item,
                value: item
            }).inject( s );
        });
        s.value = pOpts[0];

        new Element('input', {
            'class': 'text',
            style: 'width: 50px;',
            value: pOpts[1]
        }).inject( m );

        var s = new Element('select').inject( m );
        $H({'-': ' -- ',  'DB_PRIMARY': 'Primary', 'DB_INDEX': 'Index', 'DB_FULLTEXT': 'Fulltext'}).each(function(item,key){
            new Element('option', {
                text: item,
                value: key
            }).inject( s );
        });
        s.value = pOpts[2];

        var ai = new Element('input', {
            type: 'checkbox',
            value: 1
        }).inject( m );

        if( pOpts[3] == true )
            ai.checked = true;


        /* actions */
        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete column'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px;'
        })
        .addEvent('click', function(){
            m.destroy();
        }.bind(this))
        .inject( m );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/arrow_up.png',
            title: _('Move up'),
            style: 'cursor: pointer; position: relative; top: 3px; left: 2px;'
        })
        .addEvent('click', function(){
            if( m.getPrevious() )
                m.inject( m.getPrevious(), 'before' );
        }.bind(this))
        .inject( m );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/arrow_down.png',
            title: _('Column down'),
            style: 'cursor: pointer; position: relative; top: 3px; left: 2px;'
        })
        .addEvent('click', function(){
            if( m.getNext() )
                m.inject( m.getNext(), 'after' );
        }.bind(this))
        .inject( m );

    },






    /*
     *  Help
     */

    loadHelp: function(){
        this.lr = new Request.JSON({url: _path+'admin/system/module/getHelp', noCache: 1, onComplete: function(res){
            this.loader.hide();
            this._renderHelp(res);
        }.bind(this)}).post({name: this.mod, lang: this.languageSelect.value});
    },

    _renderHelp: function( pHelp ){
        this.panes['help'].empty();

        this.helpPane = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['help'] );

        if( !pHelp || !pHelp.each ) pHelp = $H(pHelp);
        pHelp.each(function(item,index){
            this.addHelpItem( item );
        }.bind(this));

        var buttonBar = new ka.buttonBar(this.panes['help']);
        buttonBar.addButton(_('Add help'), this.addHelpItem.bind(this));
        buttonBar.addButton(_('Save'), this.saveHelp.bind(this));

    },

    saveHelp: function(){
        var req = {};
        var items = [];
        this.helpPane.getElements('div.ka-admin-system-module-help').each(function(div){
            
            var item = {};
            item.title = div.getElements('input')[0].value;
            item.tags = div.getElements('input')[1].value;
            item.id = div.getElements('input')[2].value;
            item.faq = (div.getElements('input')[3].checked)?1:0;
            item.help = div.getElement('textarea').value;
            items.include( item );
            
        }.bind(this));

        req.lang = this.languageSelect.value;
        req.name = this.mod;
        req.help = JSON.encode( items );
        this.loader.show();

        this.lr = new Request.JSON({url: _path+'admin/system/module/saveHelp', noCache: 1, onComplete: function(){
            this.loader.hide();
        }.bind(this)}).post(req);
    },

    addHelpItem: function( pItem ){
        if( !pItem ) pItem = {};
        var main = new Element('div', {
            'class': 'ka-admin-system-module-help',
            style: 'padding: 5px; border-bottom: 1px solid #ddd; margin: 5px;'
        }).inject( this.helpPane );

        new Element('span', {html: _('Title'), style: 'padding-right: 3px;'}).inject( main );
        new Element('input', {
            'class': 'text',
            style: 'width: 200px;',
            value: pItem.title
        }).inject( main );

        new Element('span', {html: _('Tags'), style: 'padding: 0px 3px;'}).inject( main );
        new Element('input', {
            'class': 'text',
            value: pItem.tags
        }).inject( main );

        new Element('span', {html: _('ID'), style: 'padding: 0px 3px;'}).inject( main );
        new Element('input', {
            'class': 'text',
            value: pItem.id
        }).inject( main );

        new Element('span', {html: _('FAQ?'), style: 'padding: 0px 3px;'}).inject( main );
        new Element('input', {
            type: 'checkbox',
            value: 1,
            checked: (pItem.faq==1)?true:false
        }).inject( main );

        new Element('img', {
            src: _path+'inc/template/admin/images/icons/delete.png',
            style: 'position: relative; left: 3px; top: 3px; cursor: pointer'
        })
        .addEvent('click', function(){
            main.destroy();
        }.bind(this))
        .inject( main );

        new Element('textarea', {
            value: pItem.help,
            style: 'width: 100%; height: 100px;'
        }).inject( main );

    },






    loadLinks: function(){
        this.lr = new Request.JSON({url: _path+'admin/system/module/getConfig', noCache: 1, onComplete: function(res){
            this.loader.hide();
            this._renderLinks(res);
        }.bind(this)}).post({name: this.mod});
    },

    _renderLinks: function( pConfig ){
        this.panes['links'].empty();
        var p = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['links'] );
        this.layoutPaneItems = p;
    

        this.linksAddLevelOneBtn = new Element('img',{
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add Link'),
            style: 'cursor: pointer; margin: 3px;'
        })
        .addEvent('click', function(){
            this._linksAddNewLevel('first-lvl-id', {}, p);
        }.bind(this))
        .inject( p );

        if( pConfig.admin ){
            $H(pConfig.admin).each(function(link,key){
                this._linksAddNewLevel( key, link, p );
            }.bind(this));
        }

        var buttonBar = new ka.buttonBar(this.panes['links']);
        buttonBar.addButton(_('Save'), this.saveLinks.bind(this));

    },

    saveLinks: function(){

        var admin = {};
        this.layoutPaneItems.getChildren('div.layoutItem]').each(function(layoutItem){
            admin[ layoutItem.getFirst('input').value ] = this._getLayoutSetting( layoutItem );
        }.bind(this));

        var req = {};
        req.name = this.mod;
        req.admin = JSON.encode(admin);
        this.loader.show();
        this.lr = new Request.JSON({url: _path+'admin/system/module/saveLinks', noCache: 1, onComplete: function(){
            this.loader.hide();
        }.bind(this)}).post(req);

    },

    _getLayoutSetting: function( pLayoutItem ){
        var res = {};

        var settingPane = pLayoutItem.getFirst('div.layoutSettings');
        logger(settingPane);
        res['title'] = settingPane.getElement('input.layoutSettingsTitle').value;
        res['type'] = settingPane.getElement('select.layoutSettingsType').value;
        res['class'] = settingPane.getElement('input.layoutSettingsClass').value;
        res['isLink'] = settingPane.getElement('input.layoutSettingsIsLink').checked;
        res['multi'] = settingPane.getElement('input.layoutSettingsCanMulti').checked;

        var childs = {};
        pLayoutItem.getElement('div.layoutChilds').getChildren('div.layoutItem').each(function(layoutItem){
            childs[ layoutItem.getElement('input').value ] = this._getLayoutSetting( layoutItem );
        }.bind(this));
        res['childs'] = childs;
        return res;
    },

    _createLayoutLinkSettings: function( pSub, pLink ){
        var div = new Element('div').inject( pSub );
        new Element('span', {html: _('Title: ')}).inject(div);
        new Element('input', {'class': 'text layoutSettingsTitle', value: pLink.title}).inject(div);

        new Element('span', {html: _(' Type: ')}).inject(div);
        var select = new Element('select', {'class': 'text layoutSettingsType'}).inject(div);
        var types = $H({'': 'No Window', 'custom': 'Custom Window', 'iframe': 'IFrame loader', 'edit': 'Framework: Edit form',
            'add': 'Framework: Add form', 'list': 'Framework: List form'});
        types.each(function(title,type){
            new Element('option', {
                value: type,
                html: _(title)
            }).inject(select); 
        });
        select.value = pLink.type;

        var div = new Element('div').inject( pSub );
        new Element('span', {html: _(' Class: ')}).inject(div);
        new Element('input', {'class': 'text layoutSettingsClass', value: pLink['class']}).inject(div);

        new Element('span', {html: _(' Is Link in extension bar: ')}).inject(div);
        new Element('input', {'type': 'checkbox', 'class': 'layoutSettingsIsLink', value: 1, checked: (pLink.isLink==0)?false:true}).inject(div);

        new Element('span', {html: _(' Multiple instances: ')}).inject(div);
        new Element('input', {'type': 'checkbox', 'class': 'layoutSettingsCanMulti', value: 1, checked: (pLink.multi===0)?false:true}).inject(div);

        var div = new Element('div').inject( pSub );
        new Element('span', {html: _('Childs: ')}).inject(pSub);
    },

    _linksAddNewLevel: function( pKey, pLink, pParent){
        var lvl1 = new Element('div', {
            style: 'border-left: 1px solid #ddd; padding: 4px; padding-left: 0px; background-color: #ddd;',
            'class': 'layoutItem'
        }).inject( pParent );

        new Element('input', {
            value: pKey,
            'class': 'text',
            style: 'margin-left: 4px;'
        }).inject( lvl1 );

        var subDelBtn = new Element('img',{
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete Link'),
            style: 'cursor: pointer; position: relative; top: 3px; left: 2px;'
        })
        .addEvent('click', function(){
            this.win._confirm(_('Delete?'), function(res){
                if(!res)return;
                lvl1.destroy();
            });
        }.bind(this))
        .inject( lvl1 );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/arrow_up.png',
            title: _('Link up'),
            style: 'cursor: pointer; position: relative; top: 3px; left: 2px;'
        })
        .addEvent('click', function(){
            if( lvl1.getPrevious() )
                lvl1.inject( lvl1.getPrevious(), 'before' );
        }.bind(this))
        .inject( lvl1 );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/arrow_down.png',
            title: _('Link down'),
            style: 'cursor: pointer; position: relative; top: 3px; left: 2px;'
        })
        .addEvent('click', function(){
            if( lvl1.getNext() )
                lvl1.inject( lvl1.getNext(), 'after' );
        }.bind(this))
        .inject( lvl1 );


        var sub = new Element('div', {
            style: 'padding: 2px; padding-left: 25px',
            'class': 'layoutSettings'
        }).inject( lvl1 );

        var childs = new Element('div', {
            style: 'padding: 2px; padding-left: 25px; background-color: #eee;',
            'class': 'layoutChilds'
        }).inject( lvl1 );

        this._createLayoutLinkSettings(sub, pLink); 

        var subAddBtn = new Element('img',{
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add Link'),
            style: 'cursor: pointer; position: relative; top: 3px; left: 2px;'
        })
        .addEvent('click', function(){
            this._linksAddNewLevel( 'mykey', {}, childs );
        }.bind(this))
        .inject( sub );

        if( pLink.childs ){
            $H(pLink.childs).each(function(item,key){
                this._linksAddNewLevel( key, item, childs );
            }.bind(this));
        }

    },

    _loadGeneral: function( pConfig ){
        this.panes['general'].empty();
        var p = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['general'] );

        this.generellFields = {};

        var title = ( pConfig.title ) ? pConfig.title[this.languageSelect.value] : '';
        this.generellFields['title'] = new ka.field({
            label: _('Title')+' ('+this.languageSelect.value+')', value: title
        }).inject( p );

        var desc = ( pConfig.desc ) ? pConfig.desc[this.languageSelect.value] : '';
        this.generellFields['desc'] = new ka.field({
            label: _('Description')+' ('+this.languageSelect.value+')', value: desc, type: 'textarea'
        }).inject( p );

        var tags = ( pConfig.tags ) ? pConfig.tags[this.languageSelect.value] : '';
        this.generellFields['tags'] = new ka.field({
            label: _('Tags')+' ('+this.languageSelect.value+')', value: tags, desc: _('Comma seperated values')
        }).inject( p );

        var screenshotsCount = 'No Screenshots found';
        if( pConfig.screenshots ){
            screenshotsCount = pConfig.screenshots.length;
        }

        new ka.field({
            label: _('Screenshots'), value: screenshotsCount, desc: _('Screenshots in %s').replace('%s', this.mod+'/_screenshots/'),
            disabled: true
        }).inject( p );

        var owner = ka.settings.system.communityEmail;
        if( pConfig.owner == "" || !pConfig.owner )
            owner = _('No owner - local version');

        var owner = new ka.field({
            label: _('Owner'), value: owner,  disabled: true
        }).inject( p );

        var _this = this;
        logger( pConfig );
        if( ka.settings.system.communityId > 0 && ! pConfig.owner > 0 ){
            new ka.Button(_('Set to my extension: '+ka.settings.system.communityEmail))
            .setStyle('position', 'relative')
            .setStyle('left', '25px')
            .addEvent('click', function(){
                _this.setToMyExtension = ka.settings.system.communityId;
                owner.setValue( ka.settings.system.communityEmail );
            })
            .inject(p);
        }

        this.generellFields['version'] = new ka.field({
            label: _('Version'), value: pConfig.version
        }).inject( p );
        
        this.generellFields['depends'] = new ka.field({
            label: _('Dependency'), desc: _('Comma seperated list of extension. Example kryn=>0.5.073,admin>0.4.'), help: 'extensions-dependency', value: pConfig.depends
        }).inject( p );

        this.generellFields['community'] = new ka.field({
            label: _('Visible in community'), desc: _('Is this extension searchable and accessible for others?'), value: pConfig.community, type: 'checkbox'
        }).inject( p );

        this.generellFields['category'] = new ka.field({
            label: _('Category'), desc: _('What kind of extension is this?'), value: pConfig.category, type: 'select',
            tableItems: [
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
                {v: _('Theme / Layouts'), i: 13},
                {v: _('Language package'), i: 14},
                {v: _('Data acquisition'), i: 19},
                {v: _('Collaboration'), i: 18},
                {v: _('Other'), i: 16}
            ], table_key: 'i', table_label: 'v'
        }).inject( p );

        this.generellFields['writableFiles'] = new ka.field({
            label: _('Writable files'), desc: _('Specify these files which are not automaticly overwritten during an update (if a modification exist). One file per line. Use * as wildcard. Read docs for more information'), value: pConfig.writableFiles, type: 'textarea'
        }).inject( p );


        var buttonBar = new ka.buttonBar(this.panes['general']);
        buttonBar.addButton(_('Save'), this.saveGeneral.bind(this));

    },

    saveGeneral: function(){
        var req = {};
        
        if( this.setToMyExtension > 0 )
            req['owner'] = this.setToMyExtension;

        $H(this.generellFields).each(function(field, id){
            req[id] = field.getValue();
        });

        req.lang = this.languageSelect.value;
        req.name = this.mod;

        this.loader.show();
        this.lr = new Request.JSON({url: _path+'admin/system/module/saveGeneral', noCache: 1, onComplete: function(){
            this.loader.hide();
        }.bind(this)}).post(req);
    },

    loadGeneral: function(){
        this.loader.show();
        this.lr = new Request.JSON({url: _path+'admin/system/module/getConfig', noCache: 1, onComplete: function(pConfig){
            this._loadGeneral( pConfig );
            this.loader.hide();
        }.bind(this)}).post({name: this.mod});
    },

    loadLayouts: function(){
        this.loader.show();
        if( this.lr ) this.lr.cancel();
        this.lr = new Request.JSON({url: _path+'admin/system/module/getConfig', noCache: 1, onComplete: function(pConfig){
            this._loadLayouts( pConfig );
            this.loader.hide();
        }.bind(this)}).post({name: this.mod});
    },

    _loadLayouts: function( pConfig ){
        this.panes['layouts'].empty();
        var p = new Element('div', {
            'class': 'admin-system-modules-edit-pane',
            style: 'bottom: 31px;'
        }).inject( this.panes['layouts'] );

        this.layoutsAddThemeButton = new Element('div').inject( p );
        /*
        this.layoutsAddThemeButton = new Element('a', {
            title: _('Add theme'),
            'class': 'button',
            html: '<img src="'+_path+'inc/template/admin/images/icons/add.png'+'" style="position: relative; top: 4px;" /> '+_('Add theme'),
            style: 'cursor: pointer; margin: 3px;'
        })
        .addEvent('click', function(){
            this._layoutsAddTheme('Theme title', {});
        }.bind(this))
        .inject( p );
        */
        
        if( pConfig.themes ){
            $H(pConfig.themes).each(function(templates,themeTitle){
                this._layoutsAddTheme( themeTitle, templates );
            }.bind(this));
        }
        
        var buttonBar = new ka.buttonBar(this.panes['layouts']);

        buttonBar.addButton(_('Add theme'), function(){
            this._layoutsAddTheme('Theme title', {});
        }.bind(this));
        buttonBar.addButton(_('Save'), this.saveLayouts.bind(this));
    },

    saveLayouts: function(){
        this.loader.show();

        var themes = {};
        this.panes['layouts'].getElements('div[class=themeContainer]').each(function(container){
            var themeTitle = container.getElement('input.themeTitle').value;
            var themeTemplates = {layouts: {}, navigations: {}, contents: {}, properties: {}, publicProperties: {}};
            
            container.getElements('ol.layoutContainerLayout li').each(function(template){
                themeTemplates.layouts[template.getElements('input')[0].value] = template.getElements('input')[1].value;
            });

            container.getElements('ol.layoutContainerContent li').each(function(template){
                themeTemplates.contents[template.getElements('input')[0].value] = template.getElements('input')[1].value;
            });

            container.getElements('ol.layoutContainerNavigation li').each(function(template){
                themeTemplates.navigations[template.getElements('input')[0].value] = template.getElements('input')[1].value;
            });

            container.getElements('div.themeProperties li').each(function(template){
                themeTemplates.properties[template.getElements('input')[0].value] = template.getElements('input')[1].value;
            });

            container.getElements('div.publicProperties li').each(function(template){
                themeTemplates.publicProperties[template.getElements('input')[0].value] = [template.getElements('input')[1].value,template.getElements('select')[0].value];
            });

            themes[themeTitle] = themeTemplates;
        });
        logger( themes );

        this.lr = new Request.JSON({url: _path+'admin/system/module/saveLayouts', noCache: 1, onComplete: function(){
            this.loader.hide();
        }.bind(this)}).post({name: this.mod, themes: JSON.encode(themes) });
    },

    _addPublicProperty: function( pContainer, pKey, pTitle, pType ){
        var li = new Element('li').inject( pContainer );

        new Element('input', {
            'class': 'text',
            style: 'width: 110px',
            value: (pKey)?pKey:_('propertie_key')
        }).inject( li ).focus();

        new Element('span', {
            text: ' : '
        }).inject( li );

        new Element('input', {
            'class': 'text',
            style: 'width: 140px;',
            value: (pTitle)?pTitle:_('Propertie title')
        }).inject( li );

        new Element('span', {
            text: ' : '
        }).inject( li );


        var select = new Element('select', {

        }).inject( li );

        $H({
            text: 'Text',
            'number': 'Number',
            'checkbox': 'Checkbox',
            page: 'Page/Deposit',
            file: 'File'
        }).each(function(title,key){
            new Element('option', {
                html: _(title),
                value: key
            }).inject( select );
        });

        select.value = pType;

        
        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete theme property'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px;'
        })
        .addEvent('click', function(){
            li.destroy();
        }.bind(this))
        .inject( li );
    },

    _addThemeProperty: function( pContainer, pKey, pValue ){
        var li = new Element('li').inject( pContainer );

        new Element('input', {
            'class': 'text',
            value: (pKey)?pKey:_('propertie_key')
        }).inject( li ).focus();

        new Element('span', {
            text: ' : '
        }).inject( li );

        new Element('input', {
            'class': 'text',
            style: 'width: 200px;',
            value: (pValue)?pValue:_('Propertie value')
        }).inject( li );

        new Element('img',{
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete theme property'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px;'
        })
        .addEvent('click', function(){
            li.destroy();
        }.bind(this))
        .inject( li );
    },

    _layoutsAddTheme: function(pTitle, pTemplates){
        var myp = new Element('div', {'class': 'themeContainer'}).inject( this.layoutsAddThemeButton, 'before' );

        new Element('input', {
            value: pTitle,
            'class': 'text themeTitle',
            style: 'margin: 4px; width: 250px;'
        }).inject( myp );

        new Element('img', {
            'src': _path+'inc/template/admin/images/icons/delete.png',
            style: 'position: relative; top: 3px; cursor: pointer;',
            title: _('Delete Theme')
        })
        .addEvent('click', function(){
            this.win._confirm(_('Really delete this theme ?'), function(res){
                if(!res) return;
                myp.destroy();
            }.bind(this))
        }.bind(this))
        .inject( myp );

        var p = new Element('div', {
            style: 'padding-left: 20px; border-bottom: 1px solid silver; padding-bottom: 2px; margin-bottom: 2px;',
            'class': 'layoutContainer'
        }).inject( myp );
 
        var addTemplate = function( pLayoutTitle, pLayoutFile, pTo ){
            var li = new Element('li').inject( pTo );
            new Element('input', {
                'class': 'text', value: pLayoutTitle
            }).inject( li );
            new Element('span', {text: ' : '}).inject( li );
            var file = new Element('input', {
                'class': 'text', value: pLayoutFile, style: 'width: 200px;'
            }).inject( li );
            new Element('img', {
                'src': _path+'inc/template/admin/images/icons/layout_edit.png',
                style: 'position: relative; top: 3px; margin-left: 2px; cursor: pointer;',
                title: _('Open template')
            })
            .addEvent('click', function(){
                ka.wm.open('admin/files/edit', {file: {path: '/'+file.value}});
            })
            .inject( li );
            new Element('img', {
                'src': _path+'inc/template/admin/images/icons/delete.png',
                style: 'position: relative; top: 3px; margin-left: 2px; cursor: pointer;',
                title: _('Delete template')
            })
            .addEvent('click', function(){
                this.win._confirm(_('Really delete this template ?'), function(res){
                    if(!res) return;
                    li.destroy();
                }.bind(this))
            }.bind(this))
            .inject( li );
        }.bind(this);


        //public properties
        var title = new Element('h3', {
            html: 'Public properties'
        }).inject( p );

        var publicproperties = new Element('div', {
            'class': 'publicProperties'
        }).inject( p );

        var olpp = new Element('ol').inject( publicproperties );

        new Element('img', {
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add public property'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px;'
        })
        .addEvent('click', function(){
            this._addPublicProperty( olpp );
        }.bind(this))
        .inject( title );

        if( pTemplates.publicProperties ){
            $H(pTemplates.publicProperties).each(function(val,key){
                this._addPublicProperty( olpp, key, val[0], val[1] );
            }.bind(this));
        }


        //properties
        var title = new Element('h3', {
            html: 'Theme properties'
        }).inject( p );

        var properties = new Element('div', {
            'class': 'themeProperties'
        }).inject( p );

        var ol = new Element('ol').inject( properties );

        new Element('img', {
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add property'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px;'
        })
        .addEvent('click', function(){
            this._addThemeProperty( ol );
        }.bind(this))
        .inject( title );

        if( pTemplates.properties ){
            $H(pTemplates.properties).each(function(val,key){
                this._addThemeProperty( ol, key, val );
            }.bind(this));
        }

       

        /// layouts 
        var title = new Element('h3', {
            html: _('Layout templates')
        }).inject( p );

        this.layoutsLayoutContainer = new Element('ol', {
            'class': 'layoutContainerLayout'
        }).inject( p );
        new Element('img', {
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add layout template'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px'
        })
        .addEvent('click', function(){
                addTemplate('My title', this.mod+'/layout_mytitle.tpl', this.layoutsLayoutContainer);
        }.bind(this))
        .inject( title );

        if( pTemplates.layouts ){
            $H(pTemplates.layouts).each(function(file,title){
                addTemplate( title, file, this.layoutsLayoutContainer );
            }.bind(this));
        }


        /// contents

        var title = new Element('h3', {
            html: _('Element templates')
        }).inject( p );

        this.layoutsContentContainer = new Element('ol', {
            'class': 'layoutContainerContent'
        }).inject( p );
        new Element('img', {
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add element template'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px'
        })
        .addEvent('click', function(){
                addTemplate('My title', this.mod+'/content_mytitle.tpl', this.layoutsContentContainer);
        }.bind(this))
        .inject( title );

        if( pTemplates.contents ){
            $H(pTemplates.contents).each(function(file,title){
                addTemplate( title, file, this.layoutsContentContainer );
            }.bind(this));
        }

        /// navigations
        title = new Element('h3', {
            html: _('Navigation templates')
        }).inject( p );

        this.layoutsNavigationContainer = new Element('ol', {
            'class': 'layoutContainerNavigation'
        }).inject( p );
        new Element('img', {
            'src': _path+'inc/template/admin/images/icons/add.png',
            title: _('Add navigation template'),
            style: 'cursor: pointer; position: relative; top: 3px; margin-left: 3px'
        })
        .addEvent('click', function(){
                addTemplate('My title', this.mod+'/navigation_mytitle.tpl', this.layoutsNavigationContainer);
        }.bind(this))
        .inject( title );

        if( pTemplates.navigations ){
            $H(pTemplates.navigations).each(function(file,title){
                addTemplate( title, file, this.layoutsNavigationContainer );
            }.bind(this));
        }

    },

    renderLanguage: function(){
        
        this.bottomBar = new ka.buttonBar( this.panes['language'] );
        this.bottomBar.addButton('Save Languages', this.saveLangs.bind(this));

        this.languageTablePane = new Element('div', {
            style: 'position: absolute; left: 0px; right: 0px; top: 0px; bottom: 30px;'
        }).inject( this.panes['language'] );

    },

    saveLangs: function(){
        this.loader.show();
        var mylangs = "";
        var langs = new Hash();
        this.langTable.tableBody.getElements('input').each(function(input){
            langs.set(input.retrieve('key'), input.value);
        }.bind(this));
        mylangs = JSON.encode(langs);
        this.lr = new Request.JSON({url: _path+'admin/system/module/saveLanguage', noCache: 1, onComplete: function(){
            this.loader.hide();
        }.bind(this)}).post({name: this.mod, lang: this.languageSelect.value, langs: mylangs});
    },

    extractLangs: function(){
        this.loader.show();
        this.lr = new Request.JSON({url: _path+'admin/system/module/extractLanguage', noCache: 1, onComplete: function(res){
            this.extractedLanguages = res;
            this.loadLanguage();
        }.bind(this)}).post({name: this.mod});
    },

    loadLanguage: function(){
        this.lr = new Request.JSON({url: _path+'admin/system/module/getLanguage', noCache: 1, onComplete: function(res){
            this.loader.hide();
            this._renderLangs( res );
        }.bind(this)}).post({name: this.mod, lang: this.languageSelect.value});
    },

    _renderLangs: function( pLangs ){
        pLangs = $H(pLangs);
        var p = this.languageTablePane;
        p.empty();

        this.langTable = new ka.Table([
            [_('Key'), 350],
            [_('Translation')]
        ]).inject( p );
        rows = [];
        $H(this.extractedLanguages).each(function(lang,key){
            var input = new Element('input', {
                'class': 'text',
                'style': 'width: 98%',
                value: pLangs[key]
            }).store('key', key);
            rows.include([
                key,
                input
            ]);
        });
        this.langTable.setValues(rows);
    },

    viewType: function( pType ){
        this.buttons.each(function(button,id){
            button.setPressed(false);
        this.panes[id].setStyle('display', 'none');
        }.bind(this));
        this.buttons[pType].setPressed(true);
        this.panes[pType].setStyle('display', 'block');

        this.loader.show();
        if( this.lr ) this.lr.cancel();

        this.lastType= pType;
        switch( pType ){
            case 'language': return this.extractLangs();
            case 'layouts': return this.loadLayouts();
            case 'general': return this.loadGeneral();
            case 'links': return this.loadLinks();
            case 'db': return this.loadDb();
            case 'forms': return this.loadForms();
            case 'docu': return this.loadDocu();
            case 'help': return this.loadHelp();
            case 'plugins': return this.loadPlugins();
        }
    }


});

var admin_system_layout = new Class({

    initialize: function( pWin ){
        
        this.win = pWin;
        this._createLayout();

    },

    _createLayout: function(){
        
        this.topNavi = this.win.addTabGroup();
        
        this.buttons = $H({});

        this.buttons['layouts'] = this.topNavi.addButton(_('Layouts'), '', this.changeType.bind(this,'layouts'));
        this.buttons['contents'] = this.topNavi.addButton(_('Container'), '', this.changeType.bind(this,'contents'));
        this.buttons['navigations'] = this.topNavi.addButton(_('Navigations'), '', this.changeType.bind(this,'navigations'));

        this.addNavi = this.win.addButtonGroup();
        this.addNavi.addButton(_('Install a theme'), _path+'admin/images/icons/package_add.png', this.installTheme.bind(this));
        this.addNavi.addButton(_('Develop a theme'), _path+'admin/images/icons/layout_add.png', this.addTheme.bind(this));

        this.panes = $H();
        this.buttons.each(function(button,id){
            this.panes.set(id, new Element('div', {
                'class': 'admin-layout-pane'
            }).inject( this.win.content ));
        }.bind(this));

        /* page contents */
        this.page =  new Element('div', {
            'class': 'admin-layout-pane'
        }).inject( this.win.content );

        this.left = new Element('div', {
            'class': 'admin-layout-left'
        }).inject( this.page );

        this.right = new Element('div', {
            style: 'position: absolute; right: 0px; left: 250px; top: 0px; bottom: 0px;'
        }).inject( this.page );

        /* page contents end */

        this.loader = new ka.loader().inject(this.win.content);

        this.changeType('layouts');

    },

    installTheme: function(){
        ka.wm.open('admin/system/module', {themes: 1});
    },

    addTheme: function(){
        this.win._prompt(_('Please enter the extension code for your theme extension: '), '', function(res){
            if(!res)return;
            ka.wm.open('admin/system/module/add', {name: res});
        })
    },

    changeType: function( pType ){
        this.buttons.each(function(button,id){
            button.setPressed(false);
            this.panes[id].setStyle('display', 'none');
        }.bind(this));
        this.buttons[pType].setPressed(true);
        this.panes[pType].setStyle('display', 'block');

        this.right.empty();

        this.load(pType);
        return;
        switch(pType){
        case 'layouts': this.loadLayouts(); break;
        case 'contents': this.loadContents(); break;
        case 'navigations': this.loadNavigations(); break;
        }
    },

    loadFile: function( pFile ){
        var file = pFile;
        this.right.empty();
        if( file == '' ) return;
        var loader = new ka.loader().inject(this.right);
        loader.show();

        this._layoutFiles.each(function(item){
            item.set('class', '');
        });
        this._layoutFiles.get(pFile).set('class', 'active');

        new Request.JSON({url: _path+'admin/system/layout/loadFile', noCache: 1, onComplete: function(res){
            loader.hide();
        loader.hide();
            this._renderFile(res);
        }.bind(this)}).post({file: file});
    },

    _renderFile: function( pFile ){
        this.loadedFile = pFile;

        var p = new Element('div', {
            style: 'position: absolute; left: 0px; top: 0px; bottom: 30px; right: 0px;'
        }).inject( this.right );

        this.cssPage = new Element('div', {
            style: 'position: absolute; left: 0px; top: 63px; height: 50px; right: 11px; overflow: auto;'
        }).inject( p );

        this.cssPageOl = new Element('ol', {style: 'margin: 0px;'}).inject( this.cssPage );

        var infos = new Element('div', {
            style: 'position: absolute; left: 0px; top: 0px; height: 55px; right: 0px; padding: 10px; padding-bottom: 0px;'
        }).inject( p );

        new ka.field({
            label: _('File'), small: true, value: pFile.path, disabled: true
        }).inject(infos);

        new ka.field({
            label: _('Title'), small: true, value: pFile.title, disabled: true
        }).inject(infos);

        var bottom = new Element('div', {
            style: 'position: absolute; top: 120px; left: 6px; right: 14px; bottom: 11px; padding: 0px;'
        }).inject( p );

        this.textarea = new Element('textarea', {
            text: pFile.content,
            wrap: 'off',
            style: 'width: 100%; height: 100%;'
        })
        .addEvent('change', this.extractCssFiles.bind(this))
        .addEvent('keyup', this.extractCssFiles.bind(this))
        .inject( bottom );

        this.editor = CodeMirror.fromTextArea(this.textarea, {
          parserfile: "parsexml.js",
          path: _path+"inc/codemirror/js/",
          onChange: this.extractCssFiles.bind(this),
          stylesheet: _path+"inc/codemirror/css/xmlcolors.css"
        });

        bottomBar = new Element('div', {
            'class': 'ka-windowEdit-actions',
            style: 'bottom: 0px; background-color: none; border: 0px;'
        }).inject( this.right );

        this.saveBtn = new ka.Button(_('Save'));
        this.saveBtn.addEvent('click', this.save.bind(this)).inject( bottomBar )
        this.extractCssFiles();
    },

    extractCssFiles: function(){
        this.cssPageOl.empty();
        /*//var regex = /\{addCss\s+file='?(.*)'?\s*\}/gi;
        //var regex = /(addCss\s+file='[\w|\/]*)/gi;
        //var regex = /(addCss file='[\w|\/|\.]*)/gi;
        //var regex = /(\w*\.css)/i;
        //var regex = /(class=".*")/gi;
        var regex = /\{addCss\s+file=["|']?[^\}"']*["|']\}/gi;
        var sub = this.textarea.value.replace('','');
        var sub = '{addCss file="th_blueSkybasecss"}{addCss file="th_blueSky/two_columns.css"}';
        */
        
        var value = (this.editor.editor)?this.editor.getCode():this.textarea.value;
        var matches = value.match(/\{addCss\s+file=["|']?[^\}"']*["|']\}/gi);
        /*logger("test");
        var matches = regex.exec(sub);
        logger(matches);
        logger("test");*/
        if( matches ){
            matches.each(function(match){
                var path = match.match(/file=["|']([^"']*)["|']/)[1];
                if( !path || path == '' ) return;
                var li = new Element('li', {
                    text: path
                }).inject(this.cssPageOl);
                new Element('span', {
                    html: _('[edit]'),
                    style: 'cursor: pointer;'
                })
                .addEvent('click', function(){
                    ka.wm.open('admin/files/edit', {file: {path: '/'+path}});
                })
                .inject(li);
            }.bind(this));
        }
    },

    save: function(){
        this.saveBtn.startTip( _('Save ...') );
        var req = {};
        req.content = this.editor.getCode();
        req.file = this.loadedFile.path;

        new Request.JSON({url: _path+'admin/system/layout/save', noCache: 1, onComplete: function(res){
            this.saveBtn.stopTip( _('Saved') );
        }.bind(this)}).post(req);
    },

    toSelect: function( pRes ){
        this.files = pRes;
        this.left.empty();

        this._layoutFiles = new Hash({});
        $H(pRes).each(function(theme, themeTitle){
            
            new Element('a', {
                html: _(themeTitle),
                style: 'font-weight: bold;'
            })
            .inject( this.left );

            var div = new Element('div', {
                'class': 'admin-layout-theme-items'
            }).inject( this.left );


            $H(theme).each(function(layoutFile, layoutTitle){
                this._layoutFiles.include( layoutFile, new Element('a', {
                    html: _(layoutTitle)
                })
                .addEvent('click', this.loadFile.bind(this,layoutFile))
                .inject( div )
                );
            }.bind(this));

            /*new Element('optgroup', {
                label: themeTitle
            }).inject( this.select );
            $H(theme).each(function(layoutFile, layoutTitle){
                new Element('option', {
                    text: layoutTitle,
                    value: layoutFile
                }).inject( this.select );
            }.bind(this));
            */
        }.bind(this));
    },

    load: function( pType ){
        this.loader.show();
        new Request.JSON({url: _path+'admin/system/layout/load', noCache: 1, onComplete: function(res){
            this.toSelect(res);
            this.loader.hide();
        }.bind(this)}).get({type: pType });
    },

    loadLayouts: function(){
        this.loader.show();
        new Request.JSON({url: _path+'admin/system/layout/loadLayouts', noCache: 1, onComplete: function(res){
            this.toSelect(res);
            this.loader.hide();
        }.bind(this)}).get();
    }
});

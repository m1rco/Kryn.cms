ka.fbUtils

ka.fb = new Class({
    initialize: function( pTypes ){
        new Asset.css( _path+'inc/template/admin/filebrowser.css' );

        this.main = new Element( 'div', { 'class': 'filebrowser' });
        this.tabBar = new Element( 'div', { 'class': 'tabBar' }).inject( this.main );
        this.tabPane = new Element( 'div', { 'class': 'tabPane' }).inject( this.main );

        this.panes = {};
        this.buttons = {};
        this.tabPaneObjs = {};
        this.tabPaneObj = null;
        var _this = this;

        if( pTypes.pages ){
            //this.pages = new ka.fb_pages( this, pTypes.pages.domain_rsn, pTypes.pages.selected_rsn, pTypes.pages );
            var pagesPane = this._newTabBar( 'pages', 'Seiten' );
            this.pages = new ka.pagesTree( pagesPane, pTypes.pages.domain_rsn, {
                onSelection: pTypes.pages.onSelection,
                onClick: pTypes.pages.onClick,
                select_rsn: pTypes.pages.selected_rsn
            });

            this.tabPaneObjs['pages'] = this.pages;
            this.selectTab( 'pages' );
        }

        if( pTypes.upload ){

        }

        if( pTypes.pictures ){
            this.pictures = new ka.fb_pictures( this, pTypes.pictures );
            this.tabPaneObjs['pictures'] = this.pictures;
            this.selectTab( 'pictures' );
        }

        if( pTypes.upload ){
            this.upload = new ka.fb_upload( this, pTypes.upload );
            this.tabPaneObjs['upload'] = this.upload;
        }
    },

    inject: function( pEl, pWhere ){
        this.main.inject( pEl, pWhere );
    },

    _newTabBar: function( pId, pLabel ){
        var _this = this;
        this.buttons[ pId ] = new Element( 'div', { 'class': 'button', 'lang': pId, 'html': pLabel })
            .addEvent( 'click', function(){ _this.selectTab( this.lang ); } )
            .inject( this.tabBar );
        this.panes[ pId ] = new Element( 'div', { 'class': 'pane '+pId })
            .inject( this.tabPane );
        return this.panes[ pId ];
    },

    selectTab: function( pId ){
        this.currentTab = pId;
        this.tabBar.getElements( 'div' ).each(function(button){
            button.setProperty( 'class', 'button' );
        });
        this.tabPane.getElements( 'div' ).each(function(pane){
            if( pane.className.indexOf( 'pane' ) != -1 )
                pane.setStyle( 'display', 'none' );
        });
        this.buttons[ pId ].setProperty( 'class', 'button activeButton' );
        this.panes[ pId ].setStyle( 'display', 'block' );
    },

    getValue: function(){
        this.tabPaneObj = this.tabPaneObjs[this.currentTab];
        if( this.tabPaneObj && this.tabPaneObj.getValue )
            return this.tabPaneObj.getValue();
        return false;
    }
});


/* filebrowser/upload */
ka.fb_upload = new Class({
    initialize: function( pFileBrowser, pOptions ){
        new Asset.css( _path+'inc/template/admin/filebrowser.pictures.css' );
        this.pane = pFileBrowser._newTabBar( 'upload', 'Upload' );
        this.options = pOptions;
        this.createControls();
        this.uploadFile = false;
    },
    
    createControls: function(){
        var _this = this; 

        new Element( 'div', {
            html: 'Wähle eine Datei und drücke "Upload".<br /> <br />'
        }).inject( this.pane );

        this.frame = new Element('iframe', {
            name: 'filebrowser-upload',
            styles: {
                visibility: 'hidden',
                height: '1px'
            }
        })
        .inject( this.pane );
        this.frame.addEvent('load', function(){
            if( _this.uploadInput.value != '' ){
                //_this.uploadFile = top.frames['filebrowser-upload'].document.body.innerHTML;
                _this.uploadFile = _this.frame.contentDocument.body.innerHTML;
                _this._status.set('html', 'Gespeichert: '+_this.uploadFile );
            }
        })

        this.form = new Element( 'form', {
           styles: {
            padding: 5
           },
           target: 'filebrowser-upload',
           action: _path+'admin/files/upload/?output=html',
           method: 'post',
           enctype: "multipart/form-data"
        }).inject( this.pane );

        this.uploadInput = new Element('input', {
            type: 'file',
            name: 'file'
        }).inject( this.form );

        new Element( 'input', {
            type: 'hidden',
            name: 'path',
            value: '/_uploads/'
        }).inject( this.form );

        this._status = new Element('div', {
            styles: {
                color: 'green',
                padding: 5
            }
        }).inject( this.pane );

        this.uploadSubmit = new Element( 'a', {
            'class': 'button',
            text: 'Upload'
        })
        .addEvent( 'click', function(){
            if( _this.uploadInput.value == '' ){
                _this.form.highlight();
                return false;
            } else {
                _this._status.set('html', 'Upload - bitte warten ... ' );
                _this.form.submit();
            }
        })
        .inject( this.pane );
        
    },

    getValue: function(){
        if( this.uploadFile == false ){
            this.form.highlight();
            return false;
        }
        return this.uploadFile;
    }

});

/* filebrowser/pictures */
ka.fb_pictures = new Class({
    initialize: function( pFileBrowser, pOptions ){
        new Asset.css( _path+'inc/template/admin/filebrowser.pictures.css' );
        this.pane = pFileBrowser._newTabBar( 'pictures', 'Bilder' );
        this.options = pOptions;
        this.actionPane = this.createActionPane().inject( this.pane );
        this.itemPane = new Element( 'div', {
            'class': 'hallo'
        }).inject( this.pane );
        this.itemPane.setStyle( 'display', 'block' );
        this._loadPath( '/' );
        this.value = '';
    },

    createActionPane: function(){
        var _this = this;
        actionPane = new Element( 'div', {
            styles: { display: 'block' }
        });
        new Element( 'img', {
            src: _path + 'inc/template/admin/images/icons/up.png',
            title: 'Aufwärts',
            styles: {
                cursor: 'pointer'
            }
        })
        .addEvent( 'click', function(){ _this.pathUp() } )
        .inject( actionPane );
        this.lblPath = new Element( 'div' ).inject( actionPane );
        return actionPane;
    },

    pathUp: function(){
        if( this.currenPath == '/' ) return;
        var pos = this.currentPath.substr( 0, this.currentPath.length-1).lastIndexOf( '/' );
        var nP = this.currentPath.substr( 0, pos+1 );
        if( nP == '' ) return false;
        this._loadPath( this.currentPath.substr( 0, pos+1 ) );
    },

    _loadPath: function( pPath ){
        this.currentPath = pPath;
        this.lblPath.set( 'text', pPath );
        var _this = this;
        new Request.JSON({url: _path+'admin/files/loadFolder/?noCache='+(new Date().getTime()), onComplete: function(res){
            if( res ){
                _this._addItems( new Hash(res) );
            } else {
                alert( 'Error: permission denied in ' + pPath );
            }
        }}).post({ path: pPath });
    },

    _addItems: function( pItems ){
        var _this = this;
        this.itemPane.set( 'html', '' );
        if(! pItems.items ){
            this.itemPane.set( 'html', 'Keine Dateien' );
            return;
        }
        if(! pItems.items.each ) pItems.items = new Hash(pItems.items);
        pItems.items.each(function(item){
            var el = _this.createItem( item );
            el.inject( _this.itemPane );
        });
        new Element( 'div', {
            styles: {
                clear: 'both'
            }
        }).inject( _this.itemPane );
    },

    getValue: function(){
        if( this.value == '' ){
            this.itemPane.highlight();
            return false;
        }
        return this.value;
    },

    createItem: function( pItem ){
        var _this = this;
        var src = _path + 'inc/template/admin/images/ext/dir.png';
        var validPic = false;
        var validPics = ['jpg', 'png', 'bmp', 'gif'];

        if( (pItem.ext ) && validPics.indexOf( pItem.ext.toLowerCase() ) != -1){
            src = _path + this.currentPath.substr(1) + pItem.name;
            validPic = true;
        }

        var el = new Element( 'div', {
            'class': 'fbPicsItem'
        }).addEvent( 'click', function(e){
            e.stop();
            $$( '.fbPicsItem' ).setProperty( 'class', 'fbPicsItem' );
            this.setProperty( 'class', 'fbPicsItem fbPicsItemSelected' );
            if( validPic )
                _this.value = _this.currentPath + pItem.name;
        }).addEvent( 'dblclick', function(e){
            if( validPic) 
                _this.options.handle( src );
        });

        if( pItem.isDir ){
            el.addEvent( 'dblclick', function(e){
                e.stop();
                _this._loadPath( _this.currentPath + pItem.name + '/' );
            });
        }

        var table = new Element('table', {
            'class': 'img'
        }).inject( el );
        var tr = new Element('tr').inject( table );
        var img = new Element('td',{
            valign: 'middle',
            align: 'center'
        }).inject( tr );


        new Element( 'img', {
            align: 'center',
            src: src 
        }).inject( img );

        var name = new Element( 'div', {
            styles: {
                align: 'center'
            }
        }).inject( el );

        var sname = new Element( 'span', {
            'class': 'name',
            text: pItem.name
        }).inject( name );
        return el;
    }
});

/* navigations/Pages */

ka.fb_pages = new Class({
    initialize: function( pFileBrowser, pDomainRsn, pSelectedRsn, pOptions ){
        this.pane = pFileBrowser._newTabBar( 'pages', 'Seiten' );
        this.pane.set( 'html', 'Lade ...' );
        this._withArrows = pOptions.arrows;
        this._nodes = {};
        this._navigation = pOptions.navigation;
        this._pointer = pOptions.pointer;
        _this = this;

        new Request.JSON({url: _path+'admin/filebrowser/getPages/', onComplete: function( res ){
            _this.pane.set( 'html', '' );

            if( _this._withArrows ){
                _this._addArrow().inject( _this.pane );
            }

            if( res ){
                res.each(function( page ){
                    _this._addNode( page, ( (pSelectedRsn == page.rsn) ? true : false ), _this.pane );
                });
            }
            if( pOptions.navigation ){
                $$( '.fbSelectItem' ).addEvent( 'click', function(e){
                    e.stop();
                    $$( '.fbSelectItem' ).setProperty( 'class', '_node fbSelectItem' );
                    this.setProperty( 'class', '_node fbSelectItem _selected' );
                });
            }
        }}).get({ domain_rsn: pDomainRsn } );
    },

    _addArrow: function( pRsn, pType ){
        _this = this;
        return new Element( 'div', {
            'html': '&lt;-',
            //'class': '_arrow '+( (pType=='into') ? '_arrow_into' : '' )
            'class': '_arrow',
            'title': pType
        }).addEvent( 'mouseover', function(){
            this.set( 'html', '&lt;- hier' );
            this.setStyle( 'color', 'blue' );
        }).addEvent( 'mouseout', function(){
            this.set( 'html', '&lt;-' );
            this.setStyle( 'color', 'gray' );
        }).addEvent( 'click', function(){
            _this._withArrows( pRsn, pType );
        });
    },

    getSelected: function(){
        return this._selected;
    },

    _addNode: function( pPage, pSelected, pParent ){
        var _this = this;

        var line = new Element( 'div', {
            'html': pPage.title,
            'class': '_node' + ((this._withArrows) ? '':' fbSelectItem')
        });

        //navigation
        if( this._navigation ){
            if( pSelected ){
                line.className += ' _selected';
                this._selected = pPage;
            }
        }

        //pointer - choose-page
        if( this._pointer ){
            line.set( 'html', '' );
            var sel = new Element( 'span', {
                text: pPage.title,
                'class': '_node' + ((pSelected == true) ? ' _selected' :'')
            }).inject( line );
            sel.addEvent( 'click', function(){
                $$( 'span._node' ).setProperty( 'class', '_node' );
                this.setProperty( 'class', '_node _selected' );
            });
            if( pSelected ){
                this._selected = pPage;
            }
        } 

        line.addEvent( 'click', function(e){
            e.stop();
            _this._selected = pPage;
        });

        this._nodes[ pPage.rsn ] = line;
        var _parent = pParent;

        if( pPage.prsn > 0 ){
            _parent = this._nodes[ pPage.prsn ];
        }
        
        //var next = parent.getNext();
        //if( next == 4 ){
        //    line.inject( next, 'after' );
        //} else {
            line.inject( _parent, 'bottom' );
        //}

        // add arrow after line
        if( this._withArrows ){
            this._addArrow( pPage.rsn, 'after' ).inject( line, 'after' );
            this._addArrow( pPage.rsn, 'into' ).inject( line, 'bottom' );
        }
    }
});

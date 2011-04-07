var admin_files = new Class({
    historyIndex: 0,
    history: $H({}),
    _modules: [],
    current: '',
    items: $H({}),
    _selectedItems: new Hash({}),
    _modules: [],
    __images: ['jpg','jpeg','gif','png','bmp'],
    __ext: ['css', 'tpl', 'js', 'html'],
    _krynFolders: ['kryn/', 'css/', 'images/', 'js/', 'admin/'],
    firstLoaded: 0,
    selectedFiles: [],
    
    initialize: function( pWindow ){
        var _this = this;
        this.win = pWindow;

        this.options = {};
        this.options.onlyUserDefined = (Cookie.read('adminFiles_OnlyUserFiles')==0)?false:true;

        this._createLayout();
        this.loadModules();
        this.win.border.addEvent('click', function(){
            if( _this.context )
                _this.context.destroy(); 
        });
        this.title = this.win.getTitle();
        this.initHotkeys();
    },

    initHotkeys: function(){

        this.win.addHotkey('x', true, false, this.cut.bind(this));
        this.win.addHotkey('c', true, false, this.copy.bind(this));
        this.win.addHotkey('v', true, false, this.paste.bind(this));
        this.win.addHotkey('delete', false, false, this.remove.bind(this));

    },

    setTitle: function(){
        this.win.setTitle( this.current+' - '+this.title );
    },
    
    recoverSWFUpload: function(){
        this.buttonId = this.win.id+'_'+Math.ceil(Math.random()*100);
        this.uploadBtn.set('html', '<span id="'+this.buttonId+'"></span>');
        this.initSWFUpload();
    },

    _uploadStart: function( pFile ){
        ka.uploads[this.win.id].removeFileParam( pFile.id, 'path' );
        ka.uploads[this.win.id].addFileParam( pFile.id, 'path', this.current );
        ka.uploads[this.win.id].startUpload( pFile.id );
        ka.fupload.addToUploadMonitor( pFile, ka.uploads[this.win.id] );
    },
    
    initSWFUpload: function(){
        ka.uploads[this.win.id] = new SWFUpload({
            upload_url: _path+"admin/files/upload/krynsessionid:"+window._sid+"/",
            file_post_name: "file",
            post_params: { "_sessionid": _sid },
            flash_url : _path+"inc/template/admin/swfupload.swf",
            file_upload_limit : "500",
            file_queue_limit : "0",

            file_queued_handler: this._uploadStart.bind(this),

            upload_progress_handler: ka.fupload._progress,
            upload_error_handler: ka.fupload.error,
            upload_success_handler: function( pFile ){
                ka.fupload.success( pFile );
                if( this && this.reload )
                    this.reload();
            }.bind(this),

            button_placeholder_id : this.buttonId,
            button_width: 26,
            button_height: 20,
            button_text : '<span class="button"></span>',
            button_text_style : '.button { position: absolute; }',
            button_text_top_padding: 0,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND
        });
    },
    
    loadModules: function(){
        $H(ka.settings.configs).each(function(config, ext){
        	this._modules.include(ext+'/');
        }.bind(this));
        this.loadPath('/');
        /*new Request.JSON({url: _path+'admin/files/loadModules/', noCache: 1, onComplete: function(res){
            _this._modules = res;
            _this.loadPath('/');
        }}).get();*/
    },

    newUploadBtn: function(){
        this.uploadBtn = this.boxAction.addButton( _('Upload file'), _path+'inc/template/admin/images/admin-files-uploadFile.png');
        this.uploadBtn.addEvent('mousedown', function(e){
            e.stopPropagation();
        });
        this.buttonId = this.win.id+'_'+Math.ceil(Math.random()*100);
        this.uploadBtn.set('html', '<span id="'+this.buttonId+'"></span>');
        this.initSWFUpload();
    },
    
    _createLayout: function(){
        var _this = this;
        var boxNavi = this.win.addButtonGroup();
        var toLeft = new Element('img', {
            src: _path+'inc/template/admin/images/admin-files-toLeft.png'
        });
        boxNavi.addButton( _('Back'), _path+'inc/template/admin/images/admin-files-toLeft.png', function(){
            _this.goHistory('left');
        });
        boxNavi.addButton( _('Forward'), _path+'inc/template/admin/images/admin-files-toRight.png', function(){
            _this.goHistory('right');
        });
        boxNavi.addButton( _('Up'), _path+'inc/template/admin/images/admin-files-toUp.png', this.up.bind(this) );
        boxNavi.addButton( _('Refresh'), _path+'inc/template/admin/images/admin-files-refresh.png', this.reload.bind(this) );
        
        var boxAction = this.win.addButtonGroup();
        this.boxAction = boxAction;
        boxAction.addButton( _('New file'), _path+'inc/template/admin/images/admin-files-newFile.png', this.newFile.bind(this) );
        boxAction.addButton( _('New directory'), _path+'inc/template/admin/images/admin-files-newDir.png', this.newFolder.bind(this) );
        //var uploadBtn = boxAction.addButton( 'Datei hochladen', _path+'inc/template/admin/images/admin-files-uploadFile.png', this.startUpload.bind(this) );
        //
        this.newUploadBtn();
        
        //view types
        var boxTypes = this.win.addButtonGroup();
        this.typeButtons = new Hash();
        this.typeButtons['icon'] = boxTypes.addButton( _('Icon view'), _path+'inc/template/admin/images/admin-files-list-icons.png', this.setListType.bind(this, 'icon'));
        this.typeButtons['miniatur'] = boxTypes.addButton( _('Image view'), _path+'inc/template/admin/images/admin-files-list-miniatur.png', this.setListType.bind(this, 'miniatur'));
//        this.typeButtons['image']  = boxTypes.addButton( 'Bilderansicht', _path+'inc/template/admin/images/admin-files-list-images.png', this.setListType.bind(this, 'image'));
        this.typeButtons['detail'] = boxTypes.addButton( _('Detail view'), _path+'inc/template/admin/images/admin-files-list-detail.png', this.setListType.bind(this, 'detail'));

        this.typeButtons.each(function(btn){
            btn.store('oriClass', btn.get('class'));
        });

        var userGrp = this.win.addButtonGroup();
        this.userFilesBtn = userGrp.addButton(_('Hide system files'), _path+'inc/template/admin/images/icons/folder_brick.png', this.toggleUserMode.bind(this));
        this.userFilesBtn.setPressed( this.options.onlyUserDefined );
        this.userFilesBtn.addEvent('click', function(){
        	this.renderInfos();
        }.bind(this));

        //address
        var addressPos = new Element('div', {
            'class': 'admin-files-actionBar-addressPos'
        }).inject( this.win.titleGroups );
        this.address = new Element('input', {
            'class': 'admin-files-actionBar-address',
            value: '/'
        })
        .addEvent('mousedown', function(e){
            e.stopPropagation();
        })
        .addEvent('keyup', function(e){
            if(e.key == 'enter' )
                _this.loadPath(this.value);
        }).inject( addressPos );
        
        var searchPos = new Element('div', {
            'class': 'admin-files-actionBar-searchPos'
        }).inject( this.win.titleGroups );
        this.searchInput = new Element('input', {
            'class': 'admin-files-actionBar-search'
        })
        .addEvent('keyup', function(e){
            this.startSearch();
        }.bind(this))
        .addEvent('mousedown', function(e){
            e.stopPropagation();
        })
        .inject( searchPos );
        
        this.fileContainer = new Element('div', {
            'class': 'admin-files-fileContainer'
        })
        .addEvent('mousedown', function(e){
            _this.onContext( e, _this, _this.currentFolderFile );
        })
        .addEvent('click', function(e){
            _this.deselectAll();
            _this.closeSearch();
        })
        .inject( this.win.content );

        this.loader = new ka.loader().inject( this.win.content );
        this.loader.setStyle('left', 141);
        
        this.infos = new Element('div', {
            'class': 'admin-files-infos'
        }).inject( this.win.content );

        this.setListType('icon', true); //TODO retrieve cookie
    },

    toggleUserMode: function(){
        if( this.options.onlyUserDefined )
            this.options.onlyUserDefined = false;
        else 
            this.options.onlyUserDefined = true;
        this.userFilesBtn.setPressed( this.options.onlyUserDefined );
        Cookie.write( 'adminFiles_OnlyUserFiles', (this.options.onlyUserDefined)?1:0 );
        this.reRender();
        //this.renderFiles();
        //this.saveCookie();
    },


    setListType: function( pType, noReload ){
        this.typeButtons.each(function(btn){
            btn.set('class', btn.retrieve('oriClass'));
        });
        var b = this.typeButtons[pType];
        b.set('class', b.get('class') + ' buttonHover');
        this.listType = pType;
        if( !noReload ){
            this.reRender();
        }
    },
    
    startUpload: function(){
        if( this.uploadPane ) return;
        
        this.uploadPane = new Element('div', {
            'class': 'admin-files-uploadPane'
        }).inject( this.win.border );
        this.win.content.setStyle('opacity', 0.4);
        
        //this.uploadPane.set('html', '<applet codebase="'+_path+'inc/template/admin/kupload/" archive="kupload.jar" code="kupload.class" name="uploader" width="200" height="25"></applet>');
        this.uploadButton = new Element('a', {
            html: _('Go')
        })
        .addEvent('click', function(){
            document.applets.uploader.quickUpload();
        })
        .inject( this.uploadPane );
    },
    
    newFile: function(){
        this.win._prompt(_('File name'), '', function(name){
            if( !name) return;
            new Request.JSON({url: _path+'admin/files/newFile/', onComplete: function(res){
                this.reload();
            }.bind(this)}).post({path: this.current, name: name});
        }.bind(this));
    },
    
    newFolder: function(){
        this.win._prompt(_('Folder name'), '', function(name){
            if( !name) return;
            new Request.JSON({url: _path+'admin/files/newFolder/', onComplete: function(res){
                this.reload();
            }.bind(this)}).post({path: this.current, name: name});
        }.bind(this));
    },
    
    rename: function( pFile ){
        var name = this.win._prompt(_('Rename')+': ', pFile.name, function(name){
            if( !name) return;
            new Request.JSON({url: _path+'admin/files/renameFile/', onComplete: function(res){
                this.reload();
            }.bind(this)}).post({path: this.current, name: pFile.name, newname: name});
        }.bind(this));
    },
    
    remove: function(){
        if(! this.selectedFiles.length > 0 ) return;
        this.win._confirm(_('Really remove selected file/s?'), function(res){
            if(!res) return;
            this.selectedFiles.each(function(item){
                

                if( item.path.substr(0, 6) == 'trash/' ) {
                    item.name = item.path.replace( /.*\//, '' );
                }
            
                new Request.JSON({url: _path+'admin/files/deleteFile/', onComplete: function(res){
                    this.reload();
                }.bind(this)}).post({path: this.current, name: item.name});
            }.bind(this));

        }.bind(this));
    },
    
    paste: function( pOverwrite ){
    	
        if(! ka.getClipboard().type == 'filemanager' && !ka.getClipboard().type == 'filemanagerCut') return;
        
        var files = [];
        
        var clipboard = ka.getClipboard('filemanager');
        var move = 0;
        
        if( ka.getClipboard().type == 'filemanagerCut' ){
        	clipboard = ka.getClipboard('filemanagerCut');
        	move = 1;
        }
        
        if( clipboard ){
            clipboard.value.each(function(file){
                files.include(file.path);
            });
        }
        
        new Request.JSON({url: _path+'admin/files/paste', noCache: 1, onComplete: function(res){
            if(res.exist){
                this.win._confirm(_('One or more files already exist. Overwrite ?'), function(p){
                    if(!p)return;
                    this.paste(true);
                }.bind(this));
            } else {
                this.reload();
            }
        }.bind(this)}).post({from: files, to: this.current, overwrite: pOverwrite, move: move});
    },
    
    loadPath: function( pPath ){
        
        if( pPath.substr(0,6) == 'trash/' && pPath.length >= 7 ){
            this.win._alert(_('You cannot open a file in the trash folder. To view this file, press right click and choose recover.'));
            return;
        }
    
    
        if( this.history[ this.historyIndex ] != pPath ){
            this.historyIndex++;
            this.history[ this.historyIndex ] = pPath;
            this.load( pPath );
        }
    },
    
    up: function(){
        if( this.current.substr( this.current.length-1, 1) == '/' && this.current.length > 1 ){ //current ist ein ordner /
            var pos = this.current.substr( 0, this.current.length-1).lastIndexOf( '/' );
            this.loadPath( this.current.substr( 0, pos+1 ) );
        }/* else {
            var pos = this.current.lastIndexOf( '/' );
            this.loadPath( this.current.substr( 0, pos+1 ) );
        }*/
    },
    
    goHistory: function( pWay ){
        if( pWay == 'left' ){
            this.historyIndex--;
            if(! this.history[ this.historyIndex ] )
                this.historyIndex++;
        } else {
            this.historyIndex++;
            if(! this.history[ this.historyIndex ] )
                this.historyIndex--;
        }

        var path = this.history[ this.historyIndex ];
        this.load( path );
    },
    
    reload: function(){
        this.load( this.current );
    },
    
    renderInfos: function( pFiles ){
        var _this = this;
        
        if( !this.renderFiles )
        	this.renderFiles = pFiles;
        else
        	pFiles = this.renderFiles;
        
        this.infos.empty();
        
        if( !this.options.onlyUserDefined ){
        
	        new Element('div', {
	        	text: _('Kryn')
	        }).inject( this.infos );
	        pFiles.each(function(file){
	            if( _this._krynFolders.indexOf(file.path) >= 0){
	                _this.newInfoItem(file);
	            }
	        });
	        
	        new Element('div', {
	        	text: _('Extensions')
	        }).inject( this.infos );
	        pFiles.each(function(file){
	            if( _this._modules.indexOf(file.path) >= 0){
	                _this.newInfoItem(file);
	            }
        });
        
        }
        
        new Element('div', {
        	text: _('User defined')
        }).inject( this.infos );
        pFiles.each(function(file){
            if( _this._modules.indexOf(file.path) == -1 && _this._krynFolders.indexOf(file.path) == -1){
                _this.newInfoItem(file);
            }
        });
    },
    
    newInfoItem: function( pFile ){
        if( pFile.type != 'dir' ) return;
        var item = new Element('a', {
            text: pFile.name
        })
        .addEvent('mousedown', function(e){ e.stop() })
        .addEvent('click', this.loadPath.bind(this, pFile.path ))
        .inject( this.infos );  
    },
    
    load: function( pPath ){
        /*show( '_loading' );
        ka.fm._hideContext(); */
        var _this = this;
        
        if( this.curRequest )
            this.curRequest.cancel();

        this.loader.show();
            
        this.curRequest = new Request.JSON({url: _path+'admin/files/loadFolder/', noCache: 1, onComplete: function(res){
            if(! res ){
                _this.loader.hide();
                alert( _('%s: file not found').replace('%s', pPath ) );
                return;
            }
            if( res.type == 'file' ){
                _this.history[ _this.historyIndex ] = null;
                _this.historyIndex--;
                //_this._loadFile( pPath );
                ka.wm.openWindow( _this.win.module, _this.win.code+'/edit', null, null, {file: res});
                _this.loader.hide();
                return;
            }
            
            if( res.type == 'dir' && res.folderFile.path == 'trash/' ){
                _this.boxAction.hide();
            } else {
                _this.boxAction.show();
            }
            _this.current = pPath;
            if( res.type == 'dir' ){
                _this.setTitle();
                _this.currentFolderFile = res.folderFile;
                
                if( _this.currentFolderFile.writeaccess == true ){
                	_this.boxAction.show();
                } else {
                	//_this.boxAction.hide();
                }
                
                /*hide( '_files' );
                hide( '_editFile' );
                hide( '_showImage' );
                show( '_files' );*/
                
                if( _this.current.substr( _this.current.length-1, 1) != '/' )
                    _this.current += '/';
                if( _this.current.substr( 0, 1) != '/' )
                    _this.current = '/'+_this.current;
                
                _this.address.value = _this.current;
                if(! res.items.each )
                    res.items = new Hash(res.items);

                _this.render( res.items );
//                _this._insertItems( res.items );

                if( _this.firstLoaded == 0 ){
                    _this.renderInfos( res.items );
                    _this.firstLoaded = 1;
                }
            }
            //_this._updateStatusbar();
            //hide( 'fileActions.edit' );
            _this.loader.hide();
        }}).post({ path: pPath });
    },

    reRender: function(){
        this.render( this.files );
    },

    render: function( pItems ){
        this.files = pItems;
        this.fileContainer.empty();
        
        var nfiles = [];
        //first folders, then files
        this.files.each(function(f){
            if( f.type == 'dir' ){
                if( this.options.onlyUserDefined == true && (this._krynFolders.indexOf( f.path ) >= 0 ||  this._modules.indexOf(f.path) >= 0 ) ) {
                    return;
                }
                nfiles.include( f );
            }
        }.bind(this));
        this.files.each(function(f){
            if( f.type != 'dir' ){
                nfiles.include( f );
            }
        });
        this.files2View = nfiles;

        if( this.listType == 'icon' ){
            return this.renderIcons( this.files2View );
        }

        if( this.listType == 'miniatur' ){
            this.renderMiniatur();
        }

        if( this.listType == 'image' ){
            this.renderImage();
        }

        if( this.listType == 'detail' ){
            this.renderDetail();
        }

    },

    renderImage: function(){

    },

    renderDetail: function(){
        
        var pAdmin = _path+'inc/template/admin/';

        this.detailTable = new ka.Table([
            ['', 20],
            [_('Name')],
            [_('Size'), 100],
            [_('Last modified'), 155]
        ]).inject( this.fileContainer );

        var rows = [];
        this.files2View.each(function(file){
            

            var bg = '';
            if( file.type != 'dir' && this.__images.contains(file.ext.toLowerCase()) ){ //is image
                bg = 'image'
            } else if( file.type == 'dir' ) {
                bg = 'dir'
            } else if( this.__ext.contains(file.ext) ){
                bg = file.ext;
            } else {
                bg = 'tpl';
            }
            
            if( file.path == 'trash/' ){
                bg = 'dir_bin';
            }
              
            var image = new Element('img', {
                src: _path+'inc/template/admin/images/ext/'+bg+'-mini.png'
            });

            var size = file.size;
            /*
            if( size > 1024*100 )
                size = (size/(1024*100)).toFixed(2)+' MB';
            else if( size > 1024 )
                size = (size/1024).toFixed(2)+' KB';
            else
                size = (size+0)+' B';
            */
            
            if( file.type == 'dir' )
                size = _('Directory');

            rows.include([
                image,
                file.name,
                size,
                new Date(file.mtime*1000).format('db')
            ]);

        }.bind(this));

        this.detailTable.setValues( rows );

        this.detailTable.tableBody.getElements('tr').each(function(tr){
            tr.store('viewType','detail');
            tr.getElements('td').each(function(td){
                var file = this.files2View[td.retrieve('rowIndex')-1];
                if( file ){
	                td.addEvent('dblclick', this.loadPath.bind(this, file.path ) );
	                td.addEvent('click', this.onClick.bindWithEvent(tr, [this, file]));
	                td.addEvent('mousedown', this.onContext.bindWithEvent(this, [tr, file]));
                }
            }.bind(this));
        }.bind(this));
    },

    renderMiniatur: function(){

        var pAdmin = _path+'inc/template/admin/';
        this.files2View.each(function(file){
            
            var bg = pAdmin+'images/ext/dir.png';
            if( this.__images.contains( file.ext.toLowerCase() ) ){
                bg = _path + 'admin/backend/imageThump/?file='+escape(file.path.replace(/\//g, "\\"))+'&mtime='+file.mtime;
            } else if( file.type == 'file' ){
                if( this.__ext.contains( file.ext ) )
                    bg = pAdmin+'images/ext/'+file.ext+'.png';
                else 
                    bg = pAdmin+'images/ext/tpl.png';
            }
            
            if( file.path == 'trash/' ){
                bg = pAdmin+'images/ext/dir_bin.png';
            }

            var base = new Element('div', {
                'class': 'admin-files-render-miniatur',
                styles: {
                    'background-image': 'url('+bg+')'
                }
            }).inject( this.fileContainer );
            base.store('viewType', 'admin-files-render-miniatur');

            new Element('div', {
                'class': 'admin-files-render-miniatur-name',
                text: this.escTitle(file.name)
            }).inject( base );

            base.addEvent('click', this.onClick.bindWithEvent(base, [this, file]));
            base.addEvent('dblclick', this.loadPath.bind(this, file.path ) );
            base.addEvent('mousedown', this.onContext.bindWithEvent(this, [base, file]));

        }.bind(this));
    },
    
    renderIcons: function( pItems ){
        var html = "";
        var _this = this;
        var knownExts = ["tpl", "html", "jpg"];
        var krynFiles = [];
        var moduleFiles = [];
        var files = [];
        
        if( pItems ){
            pItems.each(function(item){
                var titem = null;
                if( item.type == 'dir' ){
                    titem = _this.__buildItem( item );
                }
                if( _this.current == '/' && titem ){
                    if( _this._krynFolders.indexOf( item.path ) >= 0 ){
                        krynFiles.include( titem );
                    } else if( _this._modules.indexOf(item.path) >= 0  ) {
                        moduleFiles.include( titem );
                    } else {
                        files.include( titem );
                    }
                } else {
                    files.include( titem );
                }
            });
            pItems.each(function(item){
                if( item.type != 'dir' ){
                    if( _this.current == '/' )
                        files.include( _this.__buildItem( item ) );
                    else
                        files.include( _this.__buildItem( item ) );
                }
            });
        }

        if( this.current == '/' ){
            
            if( krynFiles.length > 0 ){
                new Element('div', {
                    'class': 'admin-files-seperator',
                    text: 'Kryn'
                }).inject( this.fileContainer );
                krynFiles.each(function(item){ item.inject( _this.fileContainer ); });
            }
            
            if( moduleFiles.length > 0 ){
                new Element('div', {
                    'class': 'admin-files-seperator',
                    html: _('Extensions')
                }).inject( this.fileContainer );
                moduleFiles.each(function(item){ item.inject( _this.fileContainer ); });
            }
            
            new Element('div', {
                'class': 'admin-files-seperator',
                html: _('User defined')
            }).inject( this.fileContainer );
            files.each(function(item){ if(item) item.inject( _this.fileContainer ); });

        } else {
            files.each(function(item){ if(item) item.inject( _this.fileContainer ); });
        }
        //this.updateItemEvents();
    },
    
    __buildItem: function( item ){
        
        var viewType = 'item';
        
        var bg = '';
        if( item.type != 'dir' && item.ext && this.__images.contains(item.ext.toLowerCase()) ){ //is image
            bg = 'image'
        } else if( item.type == 'dir' ) {
            bg = 'dir'
        } else {
            bg = item.ext;
        }
        
        if( item.path == 'trash/' ){
            bg = 'dir_bin';
        }
        
        var base = new Element('div', {
            'class': viewType+' '+bg,
            'html': '<span>'+this.escTitle(item.name)+'</span>',
            title: item.name
        });
        base.store('viewType', viewType);
        
        base.addEvent('click', this.onClick.bindWithEvent(base, [this, item]));
        base.addEvent('dblclick', this.loadPath.bind(this, item.path ) );
        base.addEvent('mousedown', this.onContext.bindWithEvent(this, [base, item]));
        
        return base;
    },
    
    escTitle: function( pTitle ){
        var maxLine = 13;
        var maxAll = 24;
        if( this.listType == 'miniatur' ) {
            maxLine = 21;
            maxAll = 39;
        }
        pTitle = pTitle.substr(0,maxLine)+"\n"+pTitle.substr(maxLine, maxAll);
        if( pTitle.length > maxAll )
            pTitle =  pTitle.substr(0,maxAll)+'..';
        return pTitle;
    },
    
    recover: function( pFile ){
    
        this.win._confirm(_('This file will moved to: %s')
        		.replace('%s', '<br/><br/>'+pFile['original_path'].replace('inc/template','')+'<br/><br/>')+_('Are you really sure?'), function(res){
            if( res ){
            
                new Request.JSON({url: _path+'admin/files/recover', noCache: 1, onComplete: function(){
                    this.reload();
                }.bind(this)}).post({rsn: pFile.original_rsn});
            
            }
        }.bind(this));
    
    },
    
    onContext: function(e, pItem, pFile){
        var _this = this;

        if( this.context )
            this.context.destroy();
            
        if(! e.rightClick ) return;
        

        if( this.currentFolderFile.path != pFile.path ){
	        var pDisableDeactivation = false
	        if( pItem.retrieve && pItem.retrieve('active') == true ){
	            e.control = true;
	            pDisableDeactivation = true;
	        }
	        var wuff = this.onClick.bind(pItem, [e, this, pFile, pDisableDeactivation]);
	        wuff();
        }

        logger(pFile.path);
        if( pFile.path == 'trash/' ){
            return;
        }
        
        this.context = new Element('div', {
            'class': 'admin-files-context'
        }).inject( this.win.border );
        
        
        
        if( pFile.path.substr(0, 6) == 'trash/' ){
        	//pressed on a item in the trash folder

            var recover = new Element('a', {
                html: _('Recover')
            })
            .addEvent('click', function(){
                _this.recover( pFile );
            })
            .inject( this.context )
            
            var remove = new Element('a', {
                'class': 'delimiter',
                html: _('Remove')
            }).inject( this.context );
            
        } else {
        	

	        if( this.currentFolderFile.path != pFile.path ){
	            var open = new Element('a', {
	                html: _('Open')
	            })
	            .addEvent('click', function(){
	                _this.loadPath( pFile.path );
	            })
	            .inject( this.context )
	        }
            
            var externalPath = _path+pFile.path;
            if( pFile.path.substr(0,1) == '/' )
            	externalPath = _path+pFile.path.substr(1,pFile.path.length);
            
            var openExternal = new Element('a', {
                html: _('Open external'),
                target: '_blank',
                href: externalPath
            })
            .inject( this.context )
            

        
	        if( this.currentFolderFile.path == pFile.path ){
	        	//clicked on the background
	
	            var paste = new Element('a', {
	                html: _('Paste (strg+v)')
	            })
	            .addEvent('click', this.paste.bind(this) )
	            .inject( this.context );
	            
	        } else {
	        	
	        	var cut = new Element('a', {
	                'class': 'delimiter',
	                html: _('Cut (strg+x)')
	            })
	        	.addEvent('click', this.cut.bind(this) )
	        	.inject( this.context );
	            
	            var copy = new Element('a', {
	                html: _('Copy (strg+c)')
	            })
	            .addEvent('click', this.copy.bind(this) )
	            .inject( this.context );
	
	            var duplicate = new Element('a', {
	                html: _('Duplicate')
	            })
	            .addEvent('click', this.duplicate.bind(this, pFile))
	            .inject( this.context );
	            
	            var newversion = new Element('a', {
	                html: _('New version')
	            })
	            .addEvent('click', this.newversion.bind(this, pFile))
	            .inject( this.context );
	            
	            var remove = new Element('a', {
	                'class': 'delimiter',
	                html: _('Remove')
	            })
	            .addEvent('click', this.remove.bind(this, pFile) )
	            .inject( this.context );
	            
	            var rename = new Element('a', {
	                html: _('Rename')
	            })
	            .addEvent('click', this.rename.bind(this, pFile) )
	            .inject( this.context );
	        }
        	
	        var settings = new Element('a', {
	            'class': 'delimiter',
	            html: _('Properties')
	        })
	        .addEvent('click', function(){
	        	ka.wm.open('admin/files/properties', pFile);
	        })
	        .inject( this.context );
	        
        }

        /*if( '/'+pFile.path != this.current ){
            var pDisableDeactivation = false
            if( pItem.retrieve && pItem.retrieve('active') == true ){
                e.control = true;
                pDisableDeactivation = true;
            }
            var wuff = this.onClick.bind(pItem, [e, this, pFile, pDisableDeactivation]);
            wuff();
        } else {
            this.deselectAll();
            cut.destroy();
            remove.destroy();
            rename.destroy();
            copy.destroy();
            duplicate.destroy();
            newversion.destroy();
            if( open )
                open.destroy();
            this.selectedFiles.include( pFile);
        }*/
        
        var deactivate = function ( item ){
        	if( !item ) return;
        	item.addClass('notactive')
        	item.removeEvents('click');
        }
        
        if( this.selectedFiles.length > 1 || pFile.type == 'dir' ){
        	if( duplicate ) duplicate.destroy();
        	if( newversion ) newversion.destroy();
        }
        
        if( this.selectedFiles.length > 1 ){
        	deactivate(open);
        	deactivate(openExternal);
        	deactivate(settings);
        	deactivate(rename);
        }

        if( ka.getClipboard().type != 'filemanager' &&  ka.getClipboard().type != 'filemanagerCut' ){
    		deactivate(paste);
        }

        this.selectedFiles.each(function(myfile){
        	
        	if( myfile.writeaccess != true || this._krynFolders.indexOf( myfile.path ) >= 0 || this._modules.indexOf(myfile.path) >= 0){
        		//no writeaccess
        		deactivate(cut);
        		deactivate(remove);
        		deactivate(rename);
        		deactivate(newversion);
        	}
        	
        	if( myfile.path.substr( 0, 6 ) == 'trash/' ){
        		deactivate(cut);
        		deactivate(remove);
        		deactivate(rename);
        		deactivate(copy);
        	}
        		
        	
        }.bind(this));
        
        if( this.currentFolderFile.writeaccess != true ){
        	deactivate(paste);
        }
        
        /*if( pFile.type == 'dir' )
            newversion.destroy();
        
        var allowEdit = true;
        var allowRename = true;
        var isTrashSelected = false;
        
        logger(this.selectedFiles);
        this.selectedFiles.each(function(myfile){
            //if some file is a krynfile or a modulefile
        	if( !myfile.path ) return;
            //if(myfile && myfile.get && myfile.get('tag') == 'div' ) {
                if( _this._krynFolders.indexOf( myfile.path ) >= 0 || _this._modules.indexOf(myfile.path) >= 0 ){
                    allowEdit = false;
                }
                if( myfile.path.substr(0,6) == 'trash/' )
                    allowRename = false;
            //}
            if( myfile.path ){
                if( myfile.path == 'trash/' ){
                    isTrashSelected = true;
                }
                if( myfile.path.substr(0,6) == 'trash/' )
                    allowRename = false;
            }
        });
        
        
        if( !allowRename ){
        	duplicate.destroy();
        	newversion.destroy();
        }
        
        if( pFile.path == 'trash' )
            isTrashSelected = true;
    
        if( copy ){
            copy.addEvent('click', this.copy.bind(this) );
        }
        if( cut ){
            cut.addEvent('click', this.cut.bind(this) );
        }
    
        if( allowEdit ){
            remove.addEvent('click', this.remove.bind(this, pFile) );
        } else {            
            cut.set('class', cut.get('class')+' notactive');
            cut.removeEvents('click');
            remove.set('class', remove.get('class')+' notactive');
            remove.removeEvents('click');
            rename.set('class', rename.get('class')+' notactive');
            rename.removeEvents('click');
        }
        if( allowRename )
            rename.addEvent('click', this.rename.bind(this, pFile) );
        else {
            rename.set('class', rename.get('class')+' notactive');
            rename.removeEvents('click');
        }
        

        if( duplicate  )
        	duplicate.addEvent('click', this.duplicate.bind(this, pFile));
        
        if( newversion )
        	newversion.addEvent('click', this.newversion.bind(this, pFile));
        
        if( '/'+pFile.path != this.current || pFile.writeaccess != true ) {
            //paste.setStyle('opacity', 0.5);
            paste.set('class', paste.get('class')+' notactive');
            paste.removeEvents('click');
        } else {
            if( ka.getClipboard().type != 'filemanager' &&  ka.getClipboard().type != 'filemanagerCut' ){
                paste.set('class', paste.get('class')+' notactive');
                paste.removeEvents('click');
            } else {
                paste.addEvent('click', this.paste.bind(this) );
                //paste.addEvent('click', this.paste.bind(this, pFile) );
            }
        }
        
        if( pFile.writeaccess != true ){
        	if( newversion )
        		newversion.destroy();

            cut.addClass('notactive');
            cut.removeEvents('click');
            remove.addClass('notactive')
            remove.removeEvents('click');
            rename.addClass('notactive')
            rename.removeEvents('click');
        }
        
        
        if( pFile.path.substr(0, 6) == 'trash/' ){
            copy.destroy();
            cut.destroy();
        }
        
        if( pFile.path == 'trash/' ){
            this.context.destroy();
            return;
        }
        
        if( isTrashSelected ){
            copy.destroy();
            paste.destroy();
            cut.destroy();
            openExternal.destroy();
            rename.destroy();
            remove.destroy();
            settings.destroy();
        }
        
        */
        
        var pos = this.win.border.getPosition( document.body );
        this.context.setStyles({
            left: (parseInt(e.client.x)+4-pos.x)+'px',
            top: (parseInt(e.client.y)+4-pos.y)+'px'
        });
        e.stop();
    },
    
    duplicate: function( pFile ){

    	var newName = pFile.name;
    	var t = newName.split('.');
    	if( t[1] ){
    		newName = t[0]+'-'+_('duplication')+'.'+t[1];
    	}
    	
        this.win._prompt(_('New name')+': ', newName, function(name){
            if( !name) return;
            new Request.JSON({url: _path+'admin/files/duplicateFile/', onComplete: function(res){
                this.reload();
            }.bind(this)}).post({path: pFile.path, newname: name});
        }.bind(this));
    	
    },
    
    newversion: function( pFile ){
    	
        new Request.JSON({url: _path+'admin/files/addVersion/', onComplete: function(res){
        	ka._helpsystem.newBubble(_('New version created'), pFile.path, 3000 );  
        }.bind(this)}).post({path: pFile.path});

    },
    
    copy: function(){
        var title = '';
        if( this.selectedFiles.length > 1 ){
            title = _('%d files copied').replace('%d', this.selectedFiles.length);
        } else {
            this.selectedFiles.each(function(item){
                title = _('%s files copied').replace('%s', item.name );
            });
        }
        ka.setClipboard( title, 'filemanager', this.selectedFiles );
    },

    cut: function(){
        if( this.selectedFiles.length > 1 ){
            title = _('%d files cut').replace('%d', this.selectedFiles.length);
        } else {
            this.selectedFiles.each(function(item){
                title = _('%s files cut').replace('%s', item.name );
            });
        }
        ka.setClipboard( title, 'filemanagerCut', this.selectedFiles );
    },
    
    deselectAll: function(){
        if( this.selectedFiles ){
            this.selectedFiles.each(function(file){
                var item = file.item;
                if(! item ) return;
                item.set('class', item.get('class').replace(item.retrieve('viewType')+'Active', '') );
                item.store('active',false);
            });
        }
        this.selectedFiles = [];
        /*
        this.fileContainer.getElements('div').each(function(item){
            item.set('class', item.get('class').replace(item.retrieve('viewType')+'Active', '') );
            item.store('active',false);
        });  */
    },
    
    onClick: function(e, pClass, pFile, pDisableDeactivation){

        if(! e.control ){
            pClass.deselectAll();
        }
        
        if( this.retrieve && this.retrieve('active') != true ){
            this.store('oriClass', this.get('class') );
            this.set('class', this.get('class') + ' '+this.retrieve('viewType')+'Active' );
            this.store('active', true);
            pFile.item = this;
            pClass.selectedFiles.include( pFile );
        } else if(! pDisableDeactivation && this.retrieve ){
            this.set('class', this.retrieve('oriClass') );
            pClass.selectedFiles.erase( pFile );
            this.store('active', false);
        }

        if( pClass.selectedFiles.length > 1 ){
            pClass.win.setStatusText( pClass.selectedFiles.length+_(' selected files') );
        } else if( pClass.selectedFiles.length == 1 ){
            pClass.win.setStatusText( pClass.selectedFiles[0].path.substr(1,1000) );
        }

        e.stop();
    },
    
    startSearch: function(){
        if( this._searchTimer )
            $clear( this._searchTimer );
    
        if( this.searchInput.value == "" ){
            this.closeSearch();
        } else {
            this._searchTimer = this._search.delay(300, this, this.searchInput.value);
        }
    
    },
    
    _search: function( pQ ){
        
        if( !this.searchPane ){
            this.searchPane = new Element('div', {
                style: 'position: absolute; padding: 5px; top: 0px; right: 0px; bottom: 0px; width: 250px; border-left: 2px solid silver; background-color: #ddd;',
                styles: {
                    opacity: 0.95
                }
            }).inject( this.win.content );
            
            this.searchPaneTitle = new Element('div', {
            	style: 'position: absolute; top: 0px; left: 0px; right: 0px; height: 25px; line-height: 25px; font-weight: bold; padding-left: 5px; color: gray;border-bottom: 1px solid silver; background-color: #e4e4e4;'
            }).inject( this.searchPane );
            
            searchPaneCloser = new Element('div', {
            	style: 'position: absolute; top: 3px; right: 3px; font-weight: bold;',
            	'class': 'kwindow-win-titleBarIcon kwindow-win-titleBarIcon-close'
            })
            .addEvent('click', function(){
            	this.closeSearch();
            }.bind(this))
            .inject( this.searchPane );
            
            this.searchPaneContent = new Element('div',{
            	style: 'position: absolute; overflow: auto; top: 0px; left: 0px; right: 0px; top: 26px; bottom: 0px;'
            }).inject( this.searchPane );
        }
        	
        this.searchPaneContent.set('html', '<div style="text-align: center; padding-top: 25px;">'+
        '<img src="'+_path+'inc/template/admin/images/ka-tooltip-loading.gif" /><br />'+
        _('Searching ...')+
        '</div>');

        if( this.lastqrq )
        	this.lastqrq.cancel();
        
        this.searchPaneTitle.set('html', _('Searching ...'));
        this.lastqrq = new Request.JSON({url: _path+'admin/files/search', noCache: 1, onComplete: function(res){
            
            this.showSearchEntries( res );
            
        }.bind(this)}).post({q: pQ, path: this.current}); 
        
    },
    
    showSearchEntries: function( pResult ){
    
        this.searchPaneContent.empty();
        this.searchPaneTitle.set('html', _('Results'));
        
        if( $type( pResult ) == 'array' && pResult.length > 0 ){
            pResult.each(function(item){
            
                var a = new Element('a', {
                    text: item.name,
                    href: 'javascript: ;',
                    style: 'display: block; text-decoration: none; font-weight: bold; padding: 2px; cursor: pointer;'
                }).inject( this.searchPaneContent );
                
                a.addEvent('click', function(){
                    this.loadPath( item.path );
                }.bind(this));
                
                
                new Element('div', {
                    text: item.path.replace(/inc\/template\//g, ''),
                    style: 'padding-left: 5px; color: #aaa; font-weight: normal;'
                }).inject( a );
            
            
            }.bind( this ));
        } else {
            this.searchPaneContent.set('html', _('No files found.'));
        }
    
    },

    
    closeSearch: function(){
        if( this.lastqrq )
        	this.lastqrq.cancel();
        
        if( this.searchPane ){
            this.searchPane.destroy();
            this.searchPane = null;
        }
    },
    
    _updateStatusbar: function(){
        var items = this._selectedItems.getLength();
        var _this = this;
        var t = "";
        if( items > 0 ){
           t = items+" markierte Datei"+((items>1)?'en':'');
            //Größe etc
        }
        $( '_statusbar.marked' ).set( 'html', t );
        // update also context and actionsboxes
        this.enableContextItem( 'ka.fm.cm.open' );
        this.enableContextItem( 'ka.fm.cm.cut' );
        this.enableContextItem( 'ka.fm.cm.rename' );
        this.enableContextItem( 'ka.fm.cm.del' );
        //show( 'fileActions.edit' );

        if( items != 1 ){
            this.disableContextItem( 'ka.fm.cm.open' );
        }
        this._selectedItems.each(function(item){
            var path = ka.fm.current + item.id;
            if( _this.notEditable.indexOf( path ) != -1 ){
                _this.disableContextItem( 'ka.fm.cm.cut' );
                _this.disableContextItem( 'ka.fm.cm.rename' );
                _this.disableContextItem( 'ka.fm.cm.del' );
            }
        });
    }
});

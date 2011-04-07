ka.filesPane = new Class({
    __images: ['jpg','jpeg','gif','png','bmp'],
    __ext: ['css', 'tpl', 'js', 'html'],
    initialize: function( pContainer, pOptions, pWin ){
        this.container = pContainer;
        this.options = pOptions;
        this.win = pWin;

        this.cookie = 'kaFilesPane';

        this.viewButtons = new Hash();
        
        this.choosenFiles = []; 
        this.options.path = (this.options.path)? this.options.path : '/';
        this.options.bar = (this.options.bar==true)? true : false;
        this.options.navigation = (this.options.navigation==false)? false : true;


        if( Cookie.read( this.cookie+'OnlyUserFiles' ) == "false" )
            this.options.onlyUserDefined = false;
        else
            this.options.onlyUserDefined = (!this.options.onlyUserDefined)? true : this.options.onlyUserDefined;
        
        this.options.multi = (this.options.multi)? true: false;
        this.options.onChoose = (this.options.onChoose)? this.options.onChoose : $empty;
        this.value = (this.options.value)? this.options.value: false;

        this.options.path = (Cookie.read(this.cookie+'_path'))?Cookie.read(this.cookie+'_path'):'/';
        this.currentPath = this.options.path;

        if( ['icons','miniatur', 'detail'].contains( Cookie.read( this.cookie )) ){
            this.options.display = Cookie.read( this.cookie );
        } else {
            this.options.display = (['icons','miniatur', 'detail'].contains(this.options.display)) ? this.options.display : 'icons';
        }

        this.createLayout();

        this.toViewMode( this.options.display, true );
        this.userFilesBtn.setPressed( this.options.onlyUserDefined );

        if( this.value && this.value != "" && $type(this.value) == "string" ){
            this.toFile( this.value );
        } else {
            this.loadFiles( this.options.path );
        }
    },

    saveCookie: function(){
        Cookie.write( this.cookie, this.options.display );
        Cookie.write( this.cookie+'OnlyUserFiles', this.options.onlyUserDefined );
    },

    createLayout: function(){
        this.main = new Element('div', {
            'class': 'ka-filepane-main'
        }).inject( this.container );

        this.fileContainer = new Element('div', {
            'class': 'ka-filepane-filecontainer ka-files-fileContainer'
        }).inject( this.main );

        this.loader = new ka.loader();
        this.loader.inject( this.main );

        if( this.options.navigation ){
            this.createNavigation();
        }
         
    },

    createNavigation: function(){
        this.navigationBar = new Element('div', {
            'class': 'ka-filepane-navigation',
            style: 'bottom: auto; height: 28px; padding-top:5px;'
        }).inject( this.main );


        this.fileContainer.set('style', 'top: 34px;overflow:auto;');

        var buttonGrp = new ka.buttonGroup( this.navigationBar );
        buttonGrp.addButton('Hoch', _path+'inc/template/admin/images/admin-files-toLeft.png', this.toUp.bind(this));

        var viewGrp = new ka.buttonGroup( this.navigationBar );
        this.viewButtons['icons'] = viewGrp.addButton('Icons', _path+'inc/template/admin/images/admin-files-list-icons.png', this.toViewMode.bind(this, 'icons'));
        this.viewButtons['miniatur'] = viewGrp.addButton('Miniatur', _path+'inc/template/admin/images/admin-files-list-miniatur.png', this.toViewMode.bind(this, 'miniatur'));
        this.viewButtons['detail'] = viewGrp.addButton('Detail', _path+'inc/template/admin/images/admin-files-list-detail.png', this.toViewMode.bind(this, 'detail'));

        
        var boxAction = new ka.buttonGroup( this.navigationBar );
        boxAction.addButton( _('New file'), _path+'inc/template/admin/images/admin-files-newFile.png', this.newFile.bind(this) );
        boxAction.addButton( _('New directory'), _path+'inc/template/admin/images/admin-files-newDir.png', this.newFolder.bind(this) );
        //var uploadBtn = boxAction.addButton( 'Datei hochladen', _path+'inc/template/admin/images/admin-files-uploadFile.png', this.startUpload.bind(this) );
        var uploadBtn = boxAction.addButton( _('Upload file'), _path+'inc/template/admin/images/admin-files-uploadFile.png', function(){
        });
        this.uploadBtn = uploadBtn;
        this.buttonId = 'uploadBtn_'+Math.ceil(Math.random()*100)+'_'+Math.ceil(Math.random()*100);
        this.uploadBtn.set('html', '<span id="'+this.buttonId+'"></span>');
        


        this.initSWFUpload();



        var userGrp = new ka.buttonGroup( this.navigationBar );
        this.userFilesBtn = userGrp.addButton('Systemordner ausblenden', _path+'inc/template/admin/images/icons/folder_brick.png', this.toggleUserMode.bind(this));

        this.pathInput = new Element('input', {
            value: this.path,
            'class': 'text',
            style: 'margin-left: 15px; width: 225px;'
        })
        .addEvent('keyup', function(e){
            if(e.key == 'enter')
                this.loadFiles( this.pathInput.value );
        }.bind(this))
        .inject( this.navigationBar );
    },




    /* file operations */

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
            logger('Current Newfolder: '+this.current);
            new Request.JSON({url: _path+'admin/files/newFolder/', onComplete: function(res){
                this.reload();
            }.bind(this)}).post({path: this.current, name: name});
        }.bind(this));
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
            upload_success_handler: this._uploadSuccess.bind(this),

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

    _uploadSuccess: function( pFile ){
        ka.fupload.success( pFile );
        this.reload();
    },
    




    toggleUserMode: function(){
        if( this.options.onlyUserDefined )
            this.options.onlyUserDefined = false;
        else 
            this.options.onlyUserDefined = true;
        this.userFilesBtn.setPressed( this.options.onlyUserDefined );
        this.loader.show();
        this.renderFiles();
        this.loader.hide();
        this.saveCookie();
    },

    toViewMode: function( pType, pWithoutReload ){
        this.viewButtons.each(function(button){
            button.setPressed(false);
        });
        this.viewButtons[pType].setPressed(true);
        this.options.display = pType;
        this.saveCookie();
        if(! pWithoutReload )
            this.renderFiles();
    },

    toUp: function(){
        var p = this.currentPath;
        var end = p.substr(p.length-1, 1);
        if( end == '/' ){
            p = p.substring(0, p.length-1);
        }
        var slashPos = p.lastIndexOf( '/' );
        var newPath = p.substring(0, slashPos);
        newPath = (newPath=='')?'/':newPath;
        this.loadFiles( newPath );
    },

    toFile: function( pPath ){
        var p = pPath;
        var end = p.substr(p.length-1, 1);
        if( end == '/' ){
            p = p.substring(0, p.length-1);
        }

        var lastPos = p.lastIndexOf( '/' )+1;
        var path = p.substring( 0, lastPos );
        this.selectedFile = p.substring( lastPos, p.length );
        this.loadFiles( path );
    },

    reload: function(){
        this.loadFiles( this.currentPath );
    },

    loadFiles: function( pPath ){
        if( this.lastRequest )
            this.lastRequest.cancel();

        if( pPath.substr( 0, 1 ) != "/" )
            pPath = "/"+pPath;

        this.current = pPath;
        
        logger(this.current);
        this.loader.show();
        
        this.lastRequest = new Request.JSON({url: _path+'admin/files/loadFolder/', noCache: 1, onComplete: function( pFiles ){
            this.currentPath = pPath;
            this.loader.hide();
            this.current = pPath;
            Cookie.write(this.cookie+'_path', pPath);
            this._files = pFiles.items;
            this.renderFiles();
            if( this.pathInput )
                this.pathInput.value = this.currentPath;
            
        }.bind(this)}).post({path: pPath});
    },

    renderFiles: function(){
        this.fileContainer.empty();
        var files = $H(this._files);
        
        this.files2View = files;
        
        if( this.options.display == 'detail' )
        	this.prepare4detailView();
        	

        //folders first
        files.each(function(file){
            if( file.type == 'dir' )
                this.addFile( file );
        }.bind(this));

        //then regular files
        files.each(function(file){
            if( file.type != 'dir' )
                this.addFile( file );
        }.bind(this));
        

        if( this.options.display == 'detail' )
        	this.goDetailView();
    },

    unselect: function(){
        this.choosenFiles.each(function(p){
            p.item.set('class', p.item.retrieve('realClass'));
        });
        this.choosenFiles = []; 
    },

    click: function( pEvent, pFile, pItem ){
        if( pEvent && !pEvent.control ){
            this.unselect();
        }

        if(! pItem.get('class').test('-active') ){
            pItem.store('realClass', pItem.get('class'));
            pItem.set('class', pItem.get('class')+' '+pItem.retrieve('oriClass')+'-active');
            this.choosenFiles.include( {file: pFile, item: pItem} );
        }

        this.choose( pFile );
    },

    choose: function( pFile ){
        if( this.options.multi ){
            this.options.onChoose( this.choosenFiles );
        } else {
            this.options.onChoose( pFile );
        }
    },

    dblclick: function( pEvent, pFile, pItem ){

        if( pFile.type == 'dir' ){
            this.loadFiles( pFile.path );
        } else if( this.options.dblClick ){
            this.options.dblClick( pFile );
        }

    },
    
    prepare4detailView: function(){
    	
    	if( this.detailTable && this.detailTable.destroy )
    		this.detailTable.destroy();
    	
    	this.detailItems = [];
    	this.detailItems4Handler = [];
    	
    	this.detailTable = new ka.Table([
    	  ["", 20],
    	  ["Name"],
    	  ["Size", 120],
    	  ["Last modified", 105]
    	],
    	{'sort': true}).inject(this.fileContainer);
    	
    	
    },
    
    goDetailView: function(){
    	/*
    	this.detailTable.setValues( this.detailItems );

        this.detailTable.tableBody.getElements('tr').each(function(tr){
            tr.store('viewType','detail');
            tr.getElements('td').each(function(td){
            	
                var file = this.detailItems4Handler[ td.retrieve('rowIndex').toInt() ];
                
                td.addEvent('dblclick', this.dblclick.bindWithEvent(this, [file, tr] ) );
                td.addEvent('click', this.choose.bind(this, file));
                //td.addEvent('mousedown', this.onContext.bindWithEvent(this, [tr, file]));

            }.bind(this));
        }.bind(this));
    	*/
    	
    },
    
    addFileDetail: function( pFile ){
    	var file = pFile;
    	
    	
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
        if( size > 1024*100 )
            size = (size/(1024*100)).toFixed(2)+' MB';
        else if( size > 1024 )
            size = (size/1024).toFixed(2)+' KB';
        else
            size = (size+0)+' B';
        
        
        if( file.type == 'dir' )
            size = _('Directory');

        this.detailItems4Handler.include(file);
        
        var tr = this.detailTable.addRow([
            image,
            file.name,
            size,
            new Date(file.mtime*1000).format('db')
        ]);
        

        tr.store( 'oriClass','ka-filepane-file-detail' );
        tr.getElements('td').addEvent('click', this.click.bindWithEvent(this,[pFile,tr]));
        tr.getElements('td').addEvent('dblclick', this.dblclick.bindWithEvent(this,[pFile,tr]));

        
        return tr;
    },

    addFileMiniatur: function( pFile ){

        var bg = '';
        var bgPic = '';
        if( pFile.type != 'dir' && ka.settings.images.contains(pFile.ext.toLowerCase()) ){ //is image
            bgPic = _path + 'admin/backend/imageThump/?file='+escape(pFile.path.replace(/\//g, "\\\\"))+'&mtime='+pFile.mtime;
        } else if( pFile.type == 'dir' ) {
            bg = 'dir'
        } else {
            bg = pFile.ext;
        }

        var item = new Element('div', {
            'class': 'ka-filepane-file-miniatur '
        })
        .inject( this.fileContainer );

        var pic = new Element('div', {
            'class': 'ka-filepane-file-miniatur-image '+bg
        }).inject( item );

        if( bgPic != '' )
            pic.setStyle('background-image', 'url('+bgPic+')');

        item.store( 'oriClass','ka-filepane-file-icon' );
        item.addEvent('click', this.click.bindWithEvent(this,[pFile,item]))
        item.addEvent('dblclick', this.dblclick.bindWithEvent(this,[pFile,item]))

        new Element('span', {
            text: pFile.name
        }).inject( item );
        return item;
    },

    addFileIcon: function( pFile ){

        var bg = '';
        if( pFile.type != 'dir' && ka.settings.images.contains(pFile.ext.toLowerCase()) ){ //is image
            bg = 'image'
        } else if( pFile.type == 'dir' ) {
            bg = 'dir'
        } else {
            bg = pFile.ext;
        }

        var item = new Element('div', {
            'class': 'ka-filepane-file-icon '+bg
        })
        .inject( this.fileContainer );

        item.store( 'oriClass','ka-filepane-file-icon' );
        item.addEvent('click', this.click.bindWithEvent(this,[pFile,item]))
        item.addEvent('dblclick', this.dblclick.bindWithEvent(this,[pFile,item]))

        new Element('span', {
            text: pFile.name
        }).inject( item );
        return item;
    },

    addFile: function( pFile ){
        var item = null;
        
        var krynFiles = ['admin/', 'css/', 'js/', 'images/', 'kryn/s'];


        var mymodulespaths = [];
        ka.settings.modules.each(function(key){
            mymodulespaths.include( key+'/' );
        });

        if( pFile.path.substr( 0, 1 ) == "/" ){
            pFile.path = pFile.path.substr( 1, pFile.path.length );
        }

        if( this.options.onlyUserDefined ){
            if( krynFiles.contains(pFile.path) || mymodulespaths.contains(pFile.path) )
                return;
        }
        
        if( pFile.path == 'trash/' ) return;

        switch( this.options.display ){
        case 'miniatur':
            item = this.addFileMiniatur( pFile );
            break
        case 'detail':
            item = this.addFileDetail( pFile );
            break;
        case 'icon':
        default:
            item = this.addFileIcon( pFile );
        }
        if( pFile.name == this.selectedFile ){
        	if( this.options.display == 'detail' )
        		item.getElements('td')[0].fireEvent('click');
        	else
        		item.fireEvent('click');
        } 
    }
});

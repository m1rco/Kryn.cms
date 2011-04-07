var admin_files_edit = new Class({

    __images: ['jpg', 'bmp', 'png', 'gif'],

    initialize: function( pWindow ){
        this.win = pWindow;
        this.win.content.setStyle('overflow', 'hidden');
        if( !this.win.params.file.ext ){
            this.win.params.file.ext = '';
        }
        
        if( this.win.params.file.name )
            this.win.setTitle( this.win.params.file.name + ' '+_('edit') );
        else
            this.win.setTitle( this.win.params.file.path + ' '+_('edit') );
        this._createLayout();
    },
    
    loadFile: function(){
        new Request.JSON({url: _path+'admin/files/getFile', noCache: 1, onComplete: function(res){
            this.textarea.value = res;
            this.renderCodePress();
        }.bind(this)}).get({ path: this.win.params.file.path });
    },

    renderCodePress: function(){
        var exts = {
            php: 'php',
            php3: 'php',
            tpl: 'html',
            html: 'html',
            htm: 'html',
            js: 'javascript',
            css: 'css',
            txt: 'text'
        };
        if( this.win.params.file.ext ){
            var type = this.win.params.file.ext.replace(/\./,'');
            if( exts[type] ){
                var css = 'js';              
                var js = ["tokenizejavascript.js", "parsejavascript.js"];
                if( ['html', 'htm', 'tpl'].contains(type) ){
                  css = 'xml';
                  js = "parsexml.js";
                } 
                if( type == 'css' ){
                  css = 'css';
                  js = "parsecss.js";
                } 
                this.editor = CodeMirror.fromTextArea(this.textarea, {
                  parserfile: js,
                  path: _path+"inc/codemirror/js/",
                  stylesheet: _path+"inc/codemirror/css/"+css+"colors.css"
                });
            }
        }
    },
    
    save: function(){
        var _this = this;
        this.saveBtn.startTip( _('Save ...') );
        var value = (this.editor)?this.editor.getCode():this.textarea.value;
        new Request.JSON({url: _path+'admin/files/saveFile', noCache: 1, onComplete: function(res){
            this.saveBtn.stopTip( _('Saved') );
        }.bind(this)}).post({ path: this.win.params.file.path, content: value });
    },
    
    _createLayout: function(){
        if( !this.__images.contains( this.win.params.file.ext.toLowerCase() ) ){
            var boxNavi = this.win.addButtonGroup();
            this.fileSaveGrp = boxNavi;
            this.saveBtn = boxNavi.addButton( _('Save'), _path+'inc/template/admin/images/button-save.png', this.save.bind(this) );
            this.textarea = new Element('textarea', {
                value: _('Loading ...'),
                styles: {
                    width: '100%', height: '100%', 'border': '0px', 'font-size': '12px', 'padding': 0
                },
                id: 'filesEdit_'+this.win.id
            }).inject( this.win.content );
            this.loadFile();
        } else {
        	
            this.win.setTitle( _('Image %s').replace('%s', this.win.params.file.name) );
            //var boxNavi = this.win.addButtonGroup();
            //boxNavi.hide();
        
            this.loader = new ka.loader(true).inject( this.win.content );
            this.loader.show();
            this.win.content.setStyle('overflow','hidden');
//          boxNavi.addButton( scroller );


            this.imageDiv = new Element('div', {
            	style: 'position: absolute; bottom: 50px; top: 0px; left: 0px; right: 150px; overflow: auto; background-color: white'
            }).inject( this.win.content );

            this.bottom = new Element('div', {
                style: 'position: absolute; bottom: 0px; left: 0px; right: 150px; height: 48px; border-top: 1px solid silver; background-color: #f4f4f4;'
            }).inject( this.win.content );

            this.sidebar = new Element('div', {
            	style: 'position: absolute; bottom: 0px; top: 0px; right: 0px; width: 148px; border-left: 1px solid silver; background-color: #eee; overflow: hidden; overflow-y: scroll; text-align: center;'
            }).inject( this.win.content );

            this.sidebarActions = new Element('div', {
                style: 'text-align: center; padding-top: 5px;'
            }).inject( this.bottom );




            var scroller = new Element('div', {
                'class': 'kwindow-win-buttonGroup',
                style: 'width: 150px; height: 20px; position: absolute; right: 10px; top: 23px;'
            })
            .addEvent('mousedown', function(e){
                e.stop();
                e.stopPropagation();
            })
            .inject( this.sidebarActions );

            this.scrollerInfo = new Element('div', {
                text: '100%',
                style: 'position: absolute; height: 20px; top: 3px; width: 100%; text-align: center; color: #333;'
            }).inject( scroller );

            var scrollerItem = new Element('div', {
                'class': 'kwindow-win-buttonGroup-scrollerItem',
                style: 'position: absolute; height: 20px; width: 15px;background-color: gray; top: 0px;',
                styles: {
                    opacity: 0.7
                }
            }).inject( scroller );

            this.slider = new Slider(scroller, scrollerItem, {
                steps: 150,
                onChange: this.onSlide.bind(this)
            }).set(100);

            this.step = 100;

            this.imgInfo = new Element('div', {
                'html': _('Loading image'),
                style: 'text-align: right; height: 20px; position: absolute; right: 10px; top: 4px;'
            }).inject( this.sidebarActions );


            new Element('img', {
                src: _path+'admin/images/icons/arrow_turn_left.png',
                title: _('Rotate 90° left'),
                style: 'cursor: pointer;'
            })
            .addEvent('click', this.rotate.bind(this, 'left'))
            .inject( this.sidebarActions );

            /*this.saveBtn = new Element('img', {
                src: _path+'admin/images/button-save.png',
                style: 'margin-left: 12px; cursor: pointer;',
                title: _('Save')
            }).inject( this.sidebarActions );
            this.saveBtn.setStyle('opacity', 0.4);*/

            new Element('img', {
                src: _path+'admin/images/icons/arrow_turn_right.png',
                style: 'margin-left: 12px; cursor: pointer;',
                title: _('Rotate 90° right')
            })
            .addEvent('click', this.rotate.bind(this, 'right'))
            .inject( this.sidebarActions );
            
            
            var resizeDiv = new Element('div', {
                style: 'position: absolute; left: 0px; border-right: 1px solid #ddd; top: 1px; bottom: 1px; width:200px;'
            }).inject( this.sidebarActions );

            this.resizeWidth = new Element('input', {'class': 'text', style: 'width: 50px;'}).inject( resizeDiv );
            new Element('span', {text: ' x '}).inject( resizeDiv );
            this.resizeHeight = new Element('input', {'class': 'text', style: 'width: 50px;'}).inject( resizeDiv );
            new Element('span', {html: '<br />'}).inject( resizeDiv );
            new ka.Button(_('Resize to this dimension'))
            .addEvent('click', function(){
            
                this.resize( this.resizeWidth.value, this.resizeHeight.value );
                
            }.bind(this))
            .inject(resizeDiv);

            this.imageScroller = new Fx.Scroll( this.sidebar , {
                 transition: Fx.Transitions.Expo.easeInOut,
                 offset: {'x': -7, 'y': -7}
            });

            var table = new Element('table', {style: 'width: 100%; height: 100%;'}).inject( this.imageDiv );
            var body = new Element('tbody').inject( table );
            var tr = new Element('tr').inject( body );
            var td = new Element('td', {
                style: 'width: 100%; height: 100%;',
                align: 'center', valign: 'center'
            }).inject( tr );
            this.td = td;
            
            var fId = 'adminFilesImgOnLoad'+new Date().getTime()+((Math.random()+"").replace(/\./g, ''));
            window[fId] = function(){
                this.imgLoaded();
            }.bind(this);

            this.oriImagePath = this.win.params.file.path;
            
            var path = this.win.params.file.path;
            if( path.substr(0,1) == '/' )
                path = path.substr(1, path.length);

            this.img = new Element('img', {
                src: _path+path+'?nc='+(new Date().getTime()),
                onLoad: fId+"();"
            })
            .inject( td );

            this.win.content.setStyle('overflow', 'auto');

            this._loadImageSidebar();
        }
        this.win.content.setStyle('background-color', 'white');
    },
    
    rotate: function( pPos ){

        var loader = new ka.loader(true, true).inject( this.img.getParent() );
        loader.show();
        
        if( this.lastRotateRq )
            this.lastRotateRq.cancel();
        
        this.lastRotateRq = new Request.JSON({url: _path+'admin/files/rotate', noCache: 1, onComplete: function( pMtime ){
            this.loadImage( this.oriImagePath+'?mtime='+pMtime );
            
            if( this._images[ '/'+this.oriImagePath ] )
                this._images[ '/'+this.oriImagePath ].src = _path+'admin/backend/imageThump/?file='+escape(this.oriImagePath.replace(/\//g, "\\"))+'&noC='+pMtime;
            
            loader.hide();
        }.bind(this)}).post({position: pPos, file: this.oriImagePath });    
    },
    
    resize: function( pWidth, pHeight ){
    
        var loader = new ka.loader(true, true).inject( this.img.getParent() );
        loader.show();
        
        if( this.lastRotateRq )
            this.lastRotateRq.cancel();
        
        this.lastRotateRq = new Request.JSON({url: _path+'admin/files/resize', noCache: 1, onComplete: function( pMtime ){
            this.loadImage( this.oriImagePath+'?mtime='+pMtime );
            
            if( this._images[ '/'+this.oriImagePath ] )
                this._images[ '/'+this.oriImagePath ].src = _path+'admin/backend/imageThump/?file='+escape(this.oriImagePath.replace(/\//g, "\\"))+'&noC='+pMtime;
            
            loader.hide();
        }.bind(this)}).post({width: pWidth, height: pHeight, file: this.oriImagePath }); 
    
    
    },

    _loadImageSidebar: function(){
        
        new Element('img', {
            src: _path+'admin/images/loading.gif',
        }).inject( this.sidebar );

        var dir = this.win.params.file.path;
        if( dir.indexOf('/') == -1 ){
        	dir = '';
        } else {
        	dir = this.win.params.file.path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
        }
        
        new Request.JSON({url: _path+'admin/files/getImages', noCache: 1, onComplete: function( res ){
            this.sidebar.empty();
            this._images = $H({});
            if( res ){
                res.each(function(item){
                    this._images[item] = new Element('img', {
                        'class': 'admin-files-sidebar-image',
                        src: _path+'admin/backend/imageThump/?file='+escape(item.replace(/\//g, "\\"))+'&noC='+(new Date().getTime())
                    })
                    .addEvent('click', function(){
                        this._goToImage( item, true );
                    }.bind(this))
                    .inject( this.sidebar );

                }.bind(this));
            }
            this._goToImage( this.win.params.file.path );

        }.bind(this)}).post({dir: dir});

    },

    _goToImage: function( pItem, pWithView ){
        var image = this._images[ pItem ];
        if( !image ) return;
        this._images.each(function(item){
            item.set('class', 'admin-files-sidebar-image');
        });

        image.set('class', 'admin-files-sidebar-image admin-files-sidebar-image-active');
        //this.imageScroller.toElement( image );
        var pos = image.getPosition( this.sidebar );
        this.imageScroller.start( 0, pos.y+this.sidebar.getScroll().y );
        
        if( pWithView ){
            if( this.img ){
                this.img.destroy();
                this.td.empty();
                new Element('img', {
                    src: _path+'admin/images/loading.gif',
                }).inject( this.td );
            }
            
            this.loadImage( pItem );
        }

    },
    
    loadImage: function( pImage ){

        var fId = 'adminFilesImgOnLoad'+new Date().getTime()+((Math.random()+"").replace(/\./g, ''));
        window[fId] = function(){
            this.td.empty();
            this.img.inject( this.td );
            this.imgLoaded();
        }.bind(this);
        
        if( pImage.substr(0,1) == '/' )
            pImage = pImage.substr(1, pImage.length);
        
        this.img = new Asset.image(_path+pImage+'?nc='+(new Date().getTime()), {
            onLoad: fId+'()'
        });
        
        var qPos = pImage.indexOf('?');
        if( qPos > 0 )
            pImage = pImage.substr(0, qPos);
        
        this.oriImagePath = pImage;
    
    },

    onSlide: function(step){
        this.step = step;
        this.scrollerInfo.set('text', step+'%');

        var faktor = step / 100;

        if( !this.imgSize ) return;

        if( this.imgSize.x > this.imgSize.y ){
            var newX = this.imgSize.x * faktor;
            this.img.width = newX;
        } else {
            var newY = this.imgSize.y * faktor;
            this.img.height = newY;
        }

        this.resizeHeight.value = this.img.height;
        this.resizeWidth.value = this.img.width;
    },

    calcMax: function(){

        var size = this.imageDiv.getSize();

        var faktor = 1;
        if( size.x < size.y ){
            if( this.imgSize.x > this.imgSize.y ){
                faktor = this.imgSize.x / size.x;
            } else {
                faktor = this.imgSize.y / size.y;
            }
        } else {
            if( this.imgSize.x < this.imgSize.y ){
                faktor = this.imgSize.x / size.x;
            } else {
                faktor = this.imgSize.y / size.y;
            }

        }
        
        if( faktor < 1 ){
            proz = 100;
        } else {
            //faktor = faktor - 1;
            proz = (100 / faktor) -1; 
        }
        
        if( proz > 150 )
            proz = 150;
    
        
        /*if( this.imgSize.x > this.imgSize.y ){
            var newX = this.imgSize.x * (proz/100);
            this.img.width = newX;
        } else {
            var newY = this.imgSize.y * (proz/100);
            this.img.height = newY;
        } */
        var pos = Math.floor(proz-1);
        this.slider.set( pos );
        this.onSlide(pos);
    },

    imgLoaded: function(){
        this.imgSize = {x: this.img.width, y: this.img.height };


        this.imgInfo.set('text', _('Resolution: %s').replace('%s', this.img.width+'x'+this.img.height));
        this.loader.hide();

        this.calcMax();
        this.win.content.setStyle('overflow','auto');
    }
});

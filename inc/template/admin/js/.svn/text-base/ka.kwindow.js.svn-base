ka.kwindowZIndex = 1000;
ka.kwindow = new Class({
    Implements: Events,

    initialize: function( pModule, pWindowCode, pLink, pInstanceId, pParams, pInline ){
        this.params = pParams;
        this.id = pInstanceId;
        this.module = pModule;
        this.code = pWindowCode;
        this.inline = pInline;
        this.link = pLink;
        if(! pLink ){
            this.link = {module: pModule, code: pWindowCode };
        }
        
        this.active = true;
        this.isOpen = true;
        this.createWin();
        //this.checkAccess();
        this.loadContent();

        this.addHotkey('esc', false, false, function(){
            this.close( true );
        }.bind(this));
    },

    //drops a icon-link to desktop which links to this window
    dropLink: function(){
        var icon = {
            title: this.getTitle(),
            params: this.params,
            module: this.module,
            code: this.code
        }
        ka._desktop.addIcon( icon );
        ka._desktop.save();
    },

    onResizeComplete: function(){
    	this.fireEvent('resize');
    },

    softReload: function(){
    },

    iframeOnLoad: function(){
        if( this.inline ){
            var opener = ka.wm.getOpener(this.id);
            //opener.inlineContainer.empty();
            //this.content.inject( opener.inlineContainer );
            
            this.content.setStyles({'top': 5, 'bottom': 5, left: 5, right: 5});
            var borderSize = opener.border.getSize();

            opener.inlineContainer.setStyle('width', 530);

//            this.iframe.contentWindow.document.body.style.height = '1px';
//            this.iframe.contentWindow.document.body.style.width = '1px';

            var inlineSize = {x: this.iframe.contentWindow.document.html.scrollWidth+50,
                y: this.iframe.contentWindow.document.html.scrollHeight+50};

//            this.iframe.contentWindow.document.body.style.height = inlineSize.y+'px';
//            this.iframe.contentWindow.document.body.style.width = inlineSize.x+'px';
            
            if( inlineSize.x > borderSize.x )
                opener.border.setStyle('width', inlineSize.x);

            if( inlineSize.y+35 > borderSize.y )
                opener.border.setStyle('height', inlineSize.y+35);

            if( inlineSize.y < 450 )
                inlineSize.y = 450;

            
            opener.inlineContainer.setStyles({
                height: inlineSize.y-25,
                width: inlineSize.x
            });
            
            opener.checkDimensions();
//            opener.inlineContainer.setStyle('height', inlineSize.y-25);
//            opener.inlineContainer.setStyle('width', inlineSize.x);
        }
    },

    toDependMode: function( pInline ){
        this.createOverlay( true );
        
        this.inDependMode = true;
        
        if(! this.inline )
        	this.overlay.inject( this.win );
        
        if( pInline ){

            //this.overlayForced = this.overlay.clone().inject( this.win );
            
            var inlineModeParent = this.win;
            if( this.inline ){
                inlineModeParent = this.content.getParent();
            }
        
            this.overlay.setStyle('opacity', 0.8);
            
            this.inlineModeWrapper = this.overlay.clone().setStyle('opacity', 1)
                .setStyle('overflow', 'hidden')
                .setStyle('background-color', 'transparent').inject( inlineModeParent );
            
            var table = new Element('table', {
                cellpadding: 0, cellspacing: 0,
                style: 'height: 100%; width: 100%'
            }).inject( this.inlineModeWrapper );
            var tr = new Element('tr').inject(table);
            var td = new Element('td', { align: 'center', valign: 'center'}).inject(tr);

            this.inlineContainer = new Element('div', {
                style: 'width: 150px; height: 50px; padding: 5px; border: 1px solid gray;'+
                'background-color: #eee; overflow: auto; position: relative; -moz-border-radius: 5px; -webkit-border-radius: 5px;',
                html: '<img src="'+_path+'inc/template/admin/images/loading.gif" />'
            }).inject( td );
        }
    },

    removeDependMode: function(){

    	this.inDependMode = false;
        if( this.overlayForced )
            this.overlayForced.destroy();
        if( this.inlineModeWrapper )
            this.inlineModeWrapper.destroy();
        this.deleteOverlay();
    },

    getOpener: function(){
        return ka.wm.getOpener( this.id );
    },

    toBlockMode: function( pOpts, pCallback ){
        if(! pOpts.rsn > 0 ) return;

        this.blockModeOverlay = new Element('div', {
            style: ''
        }).inject( this.blockModeContainer );
    },

    _alert: function( pText, pCallback ){
        return this._prompt( pText, null, pCallback, {
            'alert': 1
        });
    },

    _confirm: function( pText, pCallback ){
        return this._prompt( pText, null, pCallback, {
            'confirm': 1
        });
    },
  
    _passwordPrompt: function( pDesc, pDefaultValue, pCallback, pOpts ){
        if( !pOpts ) pOpts = {};
        pOpts.pw = 1;
        return this._prompt( pDesc, pDefaultValue, pCallback, pOpts );
    },

    _prompt: function( pDesc, pDefaultValue, pCallback, pOpts ){

        var res = false;
        if( !pOpts ) pOpts = {};
        if( pOpts['confirm'] == 1 )
            res = true;

        this.toDependMode();
        var main = new Element('div', {
            'class': 'ka-kwindow-prompt',
            styles: {
                opacity: 0.95
            }
        }).inject( this.border );

        new Element('div', {
            html: pDesc,
            'class': 'ka-kwindow-prompt-text'
        }).inject( main );

        if( pOpts['alert'] != 1 && pOpts['confirm'] != 1 ){
            var input = new Element('input', {
                'class': 'text',
                'type': (pOpts.pw==1)?'password':'text',
                value: pDefaultValue
            }).inject( main );

            input.focus();
        }

        var bottom = new Element('div', {
            'class': 'ka-kwindow-prompt-bottom'
        }).inject( main );

        var ok = false;

        if( pOpts['alert'] != 1 ){
            new ka.Button(_('Cancel'))
            .addEvent('click', function(){
                this.removeDependMode();
                main.destroy();
                if( pCallback )
                    pCallback( false );
            }.bind(this))
            .inject( bottom );
            ok = new ka.Button('OK')
            .addEvent('keyup', function(e){
                e.stopPropagation();
                e.stop();
            })
            .addEvent('click', function(e){
                if( e )
                    e.stop();
                this.removeDependMode();
                if( input && input.value != '' )
                    res = input.value;
                main.destroy();
                if( pCallback )
                    pCallback.delay(50, null, res );
            }.bind(this))
            .inject( bottom );
        }

        if( pOpts && pOpts['alert'] == 1 ){
            ok = new ka.Button('OK')
            .addEvent('keyup', function(e){
                e.stopPropagation();
                e.stop();
            })
            .addEvent('click', function(e){
                if( e )
                    e.stop();
                this.removeDependMode();
                main.destroy();
                if( pCallback )
                    pCallback.delay(50);
            }.bind(this))
            .inject( bottom );
        }

        if( pOpts['alert'] != 1 && pOpts['confirm'] != 1 ){
            input.addEvent('keyup', function(e){
                if(e.key == 'enter'){
                    e.stopPropagation();
                    e.stop();
                    ok.fireEvent('click');
                }
            });
        }

        if( ok && !input )
            ok.focus();

        main.center = function(){
            var size = this.border.getSize();
            var dsize = main.getSize();
            var left = (size.x.toInt()/2 - dsize.x.toInt()/2);
            var mtop = (size.y.toInt()/2 - dsize.y.toInt()/2);
            main.setStyle('left', left);
            main.setStyle('top', mtop);
        }.bind(this);
        main.center();
        
        return main;
    },


    checkAccess: function(){
        var _this = this;
        var req = {
            code: this.code,
            module: this.module
        };
        new Request.JSON({url: _path+'admin/backend/window/checkAccess', noCache: 1, onComplete: function(res){
            if( res == true ){
            } else {
                _this._alert( 'Zugriff verweigert', function(){
                    _this.close( true );
                });
            }
        }}).post( req );
    },

    getTitle: function(){
        if( this.title )
            return this.title.get('html');
        return '';
    },

    setTitle: function( pTitle ){
        this.title.set('html', pTitle);
        ka.wm.updateWindowBar();
    },

    toBack: function(){
        //this.title.set('class', 'kwindow-win-title-inaktive'):
        this.title.setStyle('opacity', 0.7 );
        this.inFront = false;
        //this.createOverlay();
    },

    toFront: function(){
        if( this.active ){
            if( ka.wm.toFront( this.id ) == false ){//abhängigkeit zu anderem fenster vorhanden
                var win = ka.wm.getDependOn( this.id );
                if( win )
                    win.highlight();
                return false;
            }
            if( this.inDependMode ) return;
            
            this.title.setStyle('opacity', 1);
            if( this.border.getStyle('display') != 'block' ){
                this.border.setStyles({
                    'display': 'block',
                    'opacity': 0
                });
                this.border.set('tween', {duration: 300});
                this.border.tween('opacity', 1);
            }
            this.isOpen = true;
            this.inFront = true;
            ka.kwindowZIndex++;
            this.border.setStyle('z-index', ka.kwindowZIndex);
            this.deleteOverlay();
            ka.wm.updateWindowBar();
            return true;
        }
    },

    addHotkey: function( pKey, pControl, pAlt, pCallback ){
        document.addEvent('keydown', function(e){
            if( this.inFront && !this.inOverlayMode ){
                if( pControl && !e.control ) return;
                if( pAlt && !e.alt ) return;
                if( e.key == pKey )
                    try{ pCallback(); }catch(e){ logger(e) };
                
            }
        }.bind(this));
    },


    _highlight: function(_this){
        [_this.title, _this.bottom].each(function(item){
            item.set('tween', {duration: 50, onComplete:function(){
                item.tween( 'opacity', 1);
            }});
            item.tween('opacity', 0.3);
        });
    },

    highlight: function(){
        var _this = this;
        (function(){_this._highlight(_this)}).delay(1);
        (function(){_this._highlight(_this)}).delay(150);
        (function(){_this._highlight(_this)}).delay(300);
    },

    isActive: function(){
        var _this = this;
        if( this.active ){
            if( ka.wm.dependExist( this.id ) == true ){//abhängigkeit zu anderem fenster vorhanden
                this.highlight();
                return false;
            }
            return true;
        }
        return false;
    },

    setBarButton: function( pButton ){
        this.barButton = pButton;
    },

    minimize: function(){
        
        this.isOpen = false;
        
        
        ka.wm.updateWindowBar();
        
        var cor = this.border.getCoordinates();
        var quad = new Element('div', {
           styles: {
               position: 'absolute',
               left: cor.left,
               top: cor.top,
               width: cor.width,
               height: cor.height,
               border: '3px solid gray'
           }
        }).inject( this.border.getParent() );
        
        quad.set('morph', {duration: 300, transition: Fx.Transitions.Quart.easeOut, onComplete: function(){
           quad.destroy();
        }});
        
        var cor2 = this.barButton.getCoordinates( this.border.getParent() );
        quad.morph({
            width: cor2.width,
            top: cor2.top,
            left: cor2.left,
            height: cor2.height
        });
        this.border.setStyle( 'display', 'none' );
        this.onResizeComplete();
    },

    maximize: function( pDontRenew ){
        var _this = this;
        
        if( this.isActive() == false ) return;

        if( this.maximized ){
            this.borderDragger.attach();
            
            this.border.setStyles(this.oldDimension);
            this.maximizer.set('src', _path+'inc/template/admin/images/win-top-bar-maximize.png');
            this.maximized = false;
            this.resizeBottomRight.setStyle('display', 'block');
            this.bottom.set('class', 'kwindow-win-bottom');
        } else {
        	this.borderDragger.detach();
            
            //if( !pDontRenew )
                this.oldDimension = this.border.getCoordinates(this.border.getParent());
            this.border.setStyles({
                width: '100%',
                height: '100%',
                left: 0,
                top: 0
            });
            this.maximizer.set('src', _path+'inc/template/admin/images/win-top-bar-maximize-1.png');
            this.maximized = true;
            this.resizeBottomRight.setStyle('display', 'none');
            this.bottom.set('class', 'kwindow-win-bottom-maximized');
        }
        this.onResizeComplete();
    },

    saveDimension: function(){
        var pos = this.border.getCoordinates(this.border.getParent());
        var windows = (ka.settings.get('user')) ? ka.settings.get('user').get('windows'): {};
        if(! windows.set )
            windows = new Hash();

        if( this.maximized && this.oldDimension ){
            pos = this.oldDimension;
            pos.maximized = true;
        }
        pos.width = pos.width-2;
        pos.height = pos.height-2;
        windows.set( this.module+'::'+this.code, pos );
        ka.settings.get('user').set('windows', windows);
        ka.saveUserSettings();
    },

    loadDimensions: function(){
        this.border.setStyle('top', 20 );
        this.border.setStyle('left', 40 );
        this.border.setStyle('width', 500 );
        this.border.setStyle('height', 320 );

        var windows = ka.settings.get('user').get('windows');
        if(! windows.set )
            windows = new Hash();
        var pos = windows.get(this.module+'::'+this.code);
        
        if( pos && pos.width > 50){
            this.border.setStyles( pos );
            if( pos.maximized ){
                this.maximize( true );
            } 
        } else if( this.values ) {
            if( this.values.defaultWidth > 0 ){
                this.border.setStyle('width', this.values.defaultWidth );
            }
            if( this.values.defaultHeight > 0 ){
                this.border.setStyle('height', this.values.defaultHeight );
            }
        }

        if( this.values.fixedWidth > 0 || this.values.fixedHeight > 0 ){
            if( this.values.fixedWidth > 0 )
                this.border.setStyle('width', this.values.fixedWidth );
            if( this.values.fixedHeight > 0 )
                this.border.setStyle('height', this.values.fixedHeight );
            this.resizeBottomRight.destroy();
            this.bottom.setStyle('background-image', 'none');
        }
        
        //check dimensions if to big
        this.checkDimensions();
    },
    
    checkDimensions: function(){
    	
    	if( this.maximized ) return;
    	
    	var desktopSize = $('desktop').getSize();
        var borderSize = this.border.getSize();
        var borderPosition = {y: this.border.getStyle('top').toInt(), x: this.border.getStyle('left').toInt()};
        
        var newY = false;
        var newHeight = false;
        

        var newX = false;
        var newWidth = false;
        
        if( borderSize.y+borderPosition.y > desktopSize.y ){
        	var diff = (borderSize.y+borderPosition.y) - desktopSize.y ;
        	if( diff < borderPosition.y ){
        		newY = borderPosition.y-diff-1;
        	} else {
        		newY = 5;
        		newHeight = desktopSize.y-10;
        	}
        }
        
        if( borderSize.x+borderPosition.x > desktopSize.x ){
        	var diff = (borderSize.x+borderPosition.x) - desktopSize.x;
        	if( diff < borderPosition.x ){
        		newX = borderPosition.x-diff-1;
        	} else {
        		newX = 5;
        		newWidth = desktopSize.x-10;
        	}
        }

        if( newY ) this.border.setStyle('top', newY);
        if( newX ) this.border.setStyle('left', newX);

        if( newHeight ) this.border.setStyle('height', newHeight);
        if( newWidth ) this.border.setStyle('width', newWidth);
    	
        if( this.inlineContainer ){
        	var inSize = this.inlineContainer.getSize();
            if( inSize.y > (this.border.getStyle('height').toInt()-70))
            	this.inlineContainer.setStyle('height', (this.border.getStyle('height').toInt()-70));
            if( inSize.x > (this.border.getStyle('width').toInt()-70))
            	this.inlineContainer.setStyle('width', (this.border.getStyle('width').toInt()-70));
        }
    },

    close: function( pIntern ){
        if( this.isActive() == false ) return;
        var _this = this;

        //save dimension
        if( this.border ){ //war schon richtig auf 

            if( this.module == 'users' && this.code == 'users/edit/' ){
                ka.loadSettings();
            } else {
                this.saveDimension();
            }

            //close fx
            this.border.set('tween', {onComplete: function(){
                _this.border.destroy();
            }}),
            //this.border.set('tween', {duration: 200});
            //this.border.tween('opacity', 0 );
            this.border.destroy();
        }

        this.inFront = false;
        if( this.onClose )
            this.onClose();
        
        if( pIntern )
            this.fireEvent('close');
    
        this.border.getElements('a.kwindow-win-buttonWrapper').each(function(button){
            if(button.toolTip)
                button.toolTip.main.destroy();
        });
        

        ka.wm.close( this );
    },

    loadContent: function( pVals ){

        if( pVals ){
            this._loadContent( pVals );
        } else {
            var _this = this;
            this._ = new Request.JSON({url: _path+'admin/backend/window/getInfo', onComplete: function(res){
                if(res.noAccess == 1 ){
                    alert( _('Access denied') );
                    _this.close( true );
                    return;
                }
                if( res.pathNotFound ){
                    alert( _('Admin-Path not found')+ ': '+_this.module+' => '+_this.code );
                    _this.close( true );
                    return;
                }
                this._loadContent( res.values );
            }.bind(this)}).post({ module: _this.module, code: _this.code });
        }
    },

    _loadContent: function(pVals){
        this.values = pVals;
        if( this.values.multi === false ){
            var win = ka.wm.checkOpen( this.module, this.code, this.id );
            if( win ){
                this.close( true );
                if( win.softOpen ) win.softOpen( this.params );
                win.toFront();
                return;
            }
        }

        this.createResizer();

        this.title.set('text', _(pVals.title) );
        var _this = this;
        if( pVals.type == 'iframe' ){
            this.iframe = new IFrame('iframe_kwindow_'+this.id, {
//            this.iframe = new Element('iframe', {
                'class': 'kwindow-iframe',
                frameborder: 0
            })
            .addEvent( 'load', function(){
                _this.iframe.contentWindow.win = _this;
                _this.iframe.contentWindow.ka = ka;
                _this.iframe.contentWindow.wm = ka.wm;
                this.contentWindow.fireEvent('kload');
            })
            .inject( this.content );
            this.iframe.set('src', _path+pVals.src);
        } else if( pVals.type == 'custom' ){
            this.renderCustom();
        } else if( pVals.type == 'list' ){
            this.renderList();
        } else if( pVals.type == 'add' ){
            this.renderAdd();
        } else if( pVals.type == 'edit' ){
            this.renderEdit();
        }

        if( this.inline ){
            this.getOpener().inlineContainer.empty();
            this.content.inject( this.getOpener().inlineContainer );
        } else {
            this.border.inject( $('desktop') );
        }
        ka.wm.updateWindowBar();
        
        if( this.values.noMaximize === true ){
            this.maximizer.destroy();
        }

        if( this.values.print === true ){
            this.printer = new Element( 'img', {
                'class': 'kwindow-win-printer',
                src: _path+'inc/template/admin/images/icons/printer.png'
            }).inject( this.border );
            this.printer.addEvent('click', this.print.bind(this) );
        }

        this.loadDimensions();
    },

    print: function(){
        var size = this.border.getSize();
        var popup = window.open(
            '', '', 'width='+size.x+',height='+size.y+',menubar=yes,resizeable=yes,status=yes,toolbar=yes'
        );
        var clone = this.content.clone();
        popup.document.open();
        popup.document.write('<head><title>Drucken</title></head><body></body>');
        clone.inject( popup.document.body );
        popup.document.close();
        
        $A(document.styleSheets).each(function(s, index){
            var w = new Element( 'link', {
                rel: 'stylesheet',
                type: 'text/css',
                href: s.href,
                media: 'screen'
            })
            .inject( popup.document.body );
        });
        popup.print();
    },

    renderEdit: function(){
        this.edit = new ka.windowEdit( this );
    },

    renderAdd: function(){
        this.add = new ka.windowAdd( this );
    },

    renderList: function(){
        this.list = new ka.list( this );
    },

    renderCustom: function(){
        var id = 'text';
        var _this = this;
        
        if( this.code.substr(this.code.length-1, 1) == '/' )
            this.code = this.code.substr(0, this.code.length-1);
        
        var javascript = this.code.replace(/\//g,'_');
        
        var mdate = this.values.cssmdate;
        
        if( this.module == 'admin' ){
            new Asset.css( _path+'inc/template/admin/css/'+javascript+'.css?mdate='+mdate );
        } else {
            new Asset.css( _path+'inc/template/'+this.module+'/admin/css/'+javascript+'.css?mdate='+mdate );
        }
        
        var id = parseInt(Math.random()*100)+parseInt(Math.random()*100);
        new Asset.javascript( _path+'admin/backend/window/custom/js/module:'+this.module+'/code:'+javascript+'/onLoad:'+id);
        window['contentCantLoaded_'+id] = function( pFile ){
            _this._alert('custom javascript file not found: '+pFile, function(){
                _this.close( true );
            });
        }
        window['contentLoaded_'+id] = function(){
//            _this.custom = eval( 'new '+_this.module+'_'+javascript+'(_this);' );
            _this.custom = new window[ _this.module+'_'+javascript ]( _this );
        }
        
        /*new Request({url: _path+'admin/window/custom/js', noCache: true, evalResponse: true, onComplete: function(){
            _this.custom = eval( 'new '+_this.module+'_'+_this.code+'(_this);' );
        }}).get({ module: this.module, code: this.code  });*/
    },
    
    createWin: function(){
        var _this = this;

        this.border = new Element( 'div', {
            'class': 'kwindow-border'
        })
        .addEvent('mousedown', function(e){
            if( _this.mouseOnShadow != true)
                if( ! _this.toFront() ){
                //    e.stop();
                }
        })
        .inject( document.hidden )
        .store('win', this);

        
        
        new Element('div', {
            'class': 'kwindow-shadow-bottom'
        }).inject( this.border );
        new Element('div', {
            'class': 'kwindow-shadow-bottom-left'
        }).inject( this.border );
        new Element('div', {
            'class': 'kwindow-shadow-bottom-right'
        }).inject( this.border );
        new Element('div', {
            'class': 'kwindow-shadow-left'
        }).inject( this.border );
        new Element('div', {
            'class': 'kwindow-shadow-right'
        }).inject( this.border );
        new Element('div', {
            'class': 'kwindow-shadow-top-right'
        }).inject( this.border );
        new Element('div', {
            'class': 'kwindow-shadow-top-left'
        }).inject( this.border );


        this.border.getElements('div').each(function(mydiv){
            if( mydiv.get('class').search('-shadow-') > 0 ){
                mydiv.addEvent('mouseover', function(){
                    this.mouseOnShadow = true;
                }.bind(this));
                mydiv.addEvent('mouseout', function(){
                    this.mouseOnShadow = false;
                }.bind(this));
            }
        }.bind(this));

        /*this.trans = new Element('div', {
            'class': 'kwindow-win-trans',
            styles: {
                opacity: 0.92
            }
        }).inject( this.border );*/

        /*this.win = new Element( 'div', {
            'class': 'kwindow-win'
        }).inject( this.border );*/
        this.win = this.border;

        this.title = new Element('div', {
            'class': 'kwindow-win-title'
        })
        .addEvent('dblclick', function(){
            if( _this.values.noMaximize !== true )
                _this.maximize();
        })
        .inject( this.win );
        
        this.titleGroups = new Element('div', {
            'class': 'kwindow-win-titleGroups'
        })
        .addEvent('mousedown', function(e){
            //e.stopPropagation();
        })
        .inject( this.win );
        
        this.createTitleBar();

        this.bottom = new Element('div', {
            'class': 'kwindow-win-bottom'
        }).inject( this.win );

        this.borderDragger = this.border.makeDraggable({
            handle: [this.title, this.titleGroups],
            //presentDefault: true,
            //stopPropagation: true,
            container: $('desktop'),
            snap: 3,
            onDrag: function(el, ev){
                var cor = el.getCoordinates();
                if( cor.top < 0 ){
                    el.setStyle('top', 0 );
                }
                if( cor.left < 0 ){
                    el.setStyle('left', 0 );
                }
            },
            onStart: function(){
                if( ka.performance ){
                    this.content.setStyle('display', 'none');
                    this.titleGroups.setStyle('display', 'none');
                }
                ka.wm.createOverlays()
            }.bind(this),
            onComplete: function(){
                ka.wm.removeOverlays();
                ka.wm.fireEvent('move');
                this.fireEvent('move');
                this.saveDimension();
            }.bind(this),
            onCancel: function(){ ka.wm.removeOverlays() }
        });

        this.title.addEvent('mousedown', this.border.fireEvent.bind(this.border, 'mousedown'));
        this.titleGroups.addEvent('mousedown', this.border.fireEvent.bind(this.border, 'mousedown'));


        this.content = new Element('div', {
            'class': 'kwindow-win-content'
        }).inject( this.win );


        this.inFront = true;

        (function(){ _this.toFront(); }).delay(40);

//        this.loadContent();

    },

    setStatusText: function( pVal ){
        this.bottom.set('html', pVal);
    },

    addTabGroup: function(){
        this.extendHead();
        return new ka.tabGroup( this.titleGroups );
    },

    extendHead: function(){
        this.title.setStyle('height', 39+14 );
        this.content.setStyle('top', 39+16 );
    },
    
    addSmallTabGroup: function(){
        this.extendHead();
        return new ka.smallTabGroup( this.titleGroups );
    },


    addBottomBar: function(){
        this.bottomBar = new Element('div', {
            'class': 'ka-windowEdit-actions',
            style: 'bottom: 18px'
        }).inject( this.border );

        this.bottomBar.addButton = function( pTitle, pOnClick ){
            return new ka.Button(pTitle)
            .addEvent('click', pOnClick)
            .inject( this.bottomBar );
        }.bind(this);

        this.content.setStyle('bottom', 49);
        return this.bottomBar;
    },
    
    addButtonGroup: function(){
    	this.extendHead();
        return new ka.buttonGroup( this.titleGroups );
        //this.trans.setStyle('top', 53 );
        /*var box = new Element('div', {
            'class': 'kwindow-win-buttonGroup'
        }).inject( this.titleGroups );*/
        /*var res = new Element('div', {
            'class': 'kwindow-win-buttonGroupContent'
        }).inject( box );*/
        return box;
    },
    
    /*
    addButton2Group: function( pGroup, pTitle, pButtonSrc, pOnClick ){
        var myclass = '';
        if( pGroup.getElements('a').length == 0 ){
            myclass = ' kwindow-win-buttonWrapperFirst'
        }
        
        var wrapper = new Element('a', {
            'class': 'kwindow-win-buttonWrapper '+myclass,
            title: pTitle,
            styles: {
                'background-image': 'url('+pButtonSrc+')'
            }
        })
        .inject( pGroup );
        if( pOnClick )
            wrapper.addEvent('click', pOnClick );
        
        pGroup.getElements('a').each(function(button){
            button.set('class', button.get('class').replace(/ kwindow-win-buttonWrapperLast/, ''));
        });
        wrapper.set('class', wrapper.get('class')+' kwindow-win-buttonWrapperLast');
        pGroup.setStyle('width', pGroup.getElements('a').length*29 );
    },*/

    createTitleBar: function(){
        var _this = this;
        this.titleBar = new Element('div', {
            'class': 'kwindow-win-titleBar'
        }).inject( this.win );

        this.linker = new Element('img', {
            style: 'position: absolute; left: 3px; top: 3px; cursor: pointer',
            title: _('Create a shortcut to the desktop'),
            src: _path+'inc/template/admin/images/win-top-bar-link.png'
        })
        .addEvent('click', this.dropLink.bind(this))
        .inject( this.win );

        this.minimizer = new Element('img', {
            'class': 'kwindow-win-titleBarIcon',
            src: _path+'inc/template/admin/images/win-top-bar-minimize.png'
        })
        .addEvent( 'click', function(){
            _this.minimize();
        })
        .inject( this.titleBar )

        this.maximizer = new Element('img', {
            'class': 'kwindow-win-titleBarIcon',
            src: _path+'inc/template/admin/images/win-top-bar-maximize.png'
        })
        .addEvent( 'click', function(){
            _this.maximize();
        })
        .inject( this.titleBar );

        this.closer = new Element('div', {
            'class': 'kwindow-win-titleBarIcon kwindow-win-titleBarIcon-close'
        })
        .addEvent('click',function(){
            _this.close( true );
        })
        .inject( this.titleBar );

        this.titleBar.getElements('img').addEvents({
            'mouseover': function(){
                this.setStyle('opacity', 0.5 );
            },
            'mouseout': function(){
                this.setStyle('opacity', 1 );
            }
        });


    },

    createOverlay: function( pForce ){
    	
    	if( this.inDependMode ) return; // we have already a overlay and dont want to detroy them
    	
        if( this.overlay ) this.overlay.destroy();
        
        this.inOverlayMode = true;
        this.overlay = new Element('div', {
            'class': 'ka-kwindow-overlay',
            styles: {
                opacity: 0.2,
                position: 'absolute',
                'background-color': '#aaa',
                left: 0, right: 0, 'top': 22, bottom: 1
            }
        });
        if( pForce || this.forceOverlay || (this.values && this.values.type == 'iframe') )
            this.overlay.inject( this.content );
    },

    deleteOverlay: function(){
    	
        if( ka.performance ){
            this.content.setStyle('display', 'block');
            this.titleGroups.setStyle('display', 'block');
        }
        if( this.inDependMode ) return;
        if( this.overlay ) this.overlay.destroy();
        this.inOverlayMode = false;
    },

    createResizer: function(){
        var _this = this;
        this.resizeBottomRight = new Element('div', {
            styles: {
                position: 'absolute',
                right: -1,
                bottom: -1,
                width: 9,
                height: 9,
                opacity: 0.7,
                'background-position': '0px 11px',
                'background-image': 'url('+_path+'inc/template/admin/images/win-bottom-resize.png)',
                cursor: 'se-resize'
            }
        }).inject( this.border );
        
        var minWidth = ( this.values.minWidth > 0 ) ? this.values.minWidth : 400;
        var minHeight = ( this.values.minHeight > 0 ) ? this.values.minHeight : 300;

        this.border.makeResizable({
            grid: 1,
            limit: {x:[minWidth,2000], y: [minHeight,2000]},
            handle: this.resizeBottomRight,
            onDrag: function( el, ev ){
            /*
                var cor = el.getCoordinates();
                var cor2 = $('desktop').getCoordinates();
                if( cor.width < 350 ){
                    el.setStyle('width', 350 );
                }
                if( cor.height < 300 ){
                    el.setStyle('height', 300 );
                }
                if( cor.left+cor.width > cor2.width ){
                    el.setStyle('width', cor2.width-cor.left );
                }
                if( cor.top+cor.height > cor2.height ){
                    el.setStyle('height', cor2.height-cor.top );
                }
            */
            },
            onStart: function(){
                if( ka.performance ){
                    this.content.setStyle('display', 'none');
                }
                ka.wm.createOverlays()
            }.bind(this),
            onComplete: function(){
                ka.wm.removeOverlays();
                this.saveDimension();
                this.onResizeComplete();
                this.fireEvent('resize');
            }.bind(this),
            onCancel: function(){ ka.wm.removeOverlays() }
        });
        
        return;
    }

});

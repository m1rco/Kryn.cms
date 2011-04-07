ka.pagesTree = new Class({
	
    Implements: Events,
	ready: false,
	
    initialize: function( pContainer, pDomain, pOptions ){
        this.options = pOptions;
        this.domainRsn = pDomain;
        this.container = pContainer;
        
        this._pages = new Hash();
        this._pagesParent = new Hash();

        
        this.table = new Element('table', {
        	style: 'width: 100%',
        	cellpadding: 0,
        	cellspacing: 0
        }).inject(this.container);
        this.tbody = new Element('tbody').inject( this.table );
        this.tr = new Element('tr').inject( this.tbody );
        this.td = new Element('td').inject( this.tr );
        
        this.pane = new Element('div', {
            styles: {
                'padding-left': '15px',
                'margin-bottom': '4px',
                'border-bottom': '1px solid silver',
                'position': 'relative'
            }
        }).inject( this.td );
        
        
        if( this.container.getParent('div.treeContainer') )
        
        this.treeContainer = this.container.getParent('div.treeContainer');
        
        if( !this.treeContainer && this.container.get('class').contains('treeContainer') )
        	 this.treeContainer = this.container;
        
        if( this.treeContainer ){
        	this.treeContainer.addEvent('scroll', this.updateDomainBar.bind(this));
        	if( this.options.win )
        		this.options.win.addEvent('resize', this.updateDomainBar.bind(this));
        }

        this.loadTree();
    },
    
    prepareForScrolling: function(){

    	this.domainDiv = this.pane.getElement('div');
    	if( !this.domainDiv ) return;
    	
    	this.domainDiv.setStyle('background-image', 'url('+_path+'inc/template/admin/images/ka-pageTree-domainDynamicBg.png)');
    	this.domainDiv.setStyle('background-repeat', 'repeat-x');

    	this.domainDiv.setStyle('position', 'relative');
    	
    	this.pane.setStyle('padding-top', 20);
    	var size = this.pane.getSize();
    	
    	var additionalTop = 20;
    	if( this.pane.getStyle('height').toInt() == 1 )
    		additionalTop = 0;
    	
    	this.domainDiv.setStyle('top', (size.y*-1)+additionalTop);
    	
    	if( this.domainDiv.getNext() )
    		this.domainDiv.inject( this.domainDiv.getNext(), 'after' );
    	
    	this.updateDomainBar();
    },
    
    updateDomainBar: function(){

    	if( !this.treeContainer ) return;
    	if( !this.domainDiv ) return;
    	
    	var stop = this.treeContainer.scrollTop;
    	var pos = this.table.getPosition( this.treeContainer );
    	
    	var size = this.pane.getSize();
    	
    	var possibleTop = (pos.y-stop)*-1;
    	
    	var additionalTop = 25;
    	if( this.pane.getStyle('height').toInt() == 1 )
    		additionalTop = 0;
    	
    	if( possibleTop < size.y-38 && possibleTop >= 0 ){
    		
    		var mtop = ((size.y-possibleTop)*-1)+additionalTop;
    		this.domainDiv.setStyle('top', mtop);
    		
    	} else if( possibleTop < 0){
    		this.domainDiv.setStyle('top', (size.y*-1)+additionalTop);
    		
    	} else if( additionalTop == 0 ){
    		this.domainDiv.setStyle('top', -22);
    	}
    },

    loadTree: function(){
        var _this = this;
        
        this._pages = new Hash();
        var viewAllPages = 0;
        if( this.options.viewAllPages )
        	viewAllPages = 1;
        
        this.ready = false;
        
        new Request.JSON({url: _path+'admin/pages/getTree/?noCache='+(new Date().getTime()), onComplete: function(res){
            this._currentDomain = res.domain;
            this.oriPages = res.pages;
            
            if( this.options.select_rsn ){
                this.select( this.options.select_rsn );
            } else {
                this.render();
            }
            
            this.ready = true;
            this.fireEvent('ready');
            
            
            
        }.bind(this)}).post({ domain: _this.domainRsn, viewAllPages: viewAllPages });
    },
    
    isReady: function(){
    	return this.ready;
    },

    reload: function(){
        this.loadTree();
    },

    render: function(){
        this._pagesParent = new Hash();
        this._pages = new Hash();

        var _this = this;
        _this.pane.empty();

        if( this.oriPages ){/*
            this.oriPages.sort(function( a , b ){
                return 21;
            });*/
            this.oriPages.each(function(page){
                _this._pages.include( page.rsn, page );

                if(! _this._pagesParent.get( page.prsn ) )
                    _this._pagesParent.include( page.prsn, []);

                _this._pagesParent.get( page.prsn ).include( page );
            });
        }

        _this.domain = _this.createItem( _this._currentDomain, _this.pane, true );
        

        
        if( this.options.onReady ){
        	this.options.onReady();
        }
        
        this.isFirst = false;
        
        if( this.treeContainer ){
        	this.prepareForScrolling();
        }
        
    },

    hasChilds: function( pPage ){
        if( this._pagesParent.get( pPage.rsn ) )
            return true;
        return false;
    },

    renderChilds: function( pPage, pInject ){
        var _this = this;
        var pages = this._pagesParent.get( pPage.rsn );
        pages.sort(function(a,b){
            return a.sort-b.sort;
        });
        pages.each(function(item){
            _this.createItem( item, pInject );
        });
    },

    setOpen: function( pPageRsn, pIsOpen ){
        var opens = $H(window.kaPagesTreeOpens);
        //var opens = new Hash(JSON.decode(Cookie.read( 'pagesTreeOpens' )));
        opens.set( pPageRsn, pIsOpen );
        //Cookie.write( 'pagesTreeOpens', JSON.encode(opens), {duration: 365} );
        window.kaPagesTreeOpens = opens;
        this.updateDomainBar();
    },

    isOpen: function( pPageRsn ){
    	//var opens = new Hash(JSON.decode(Cookie.read( 'pagesTreeOpens' )));
        var opens = $H(window.kaPagesTreeOpens);
        var result = opens.get( pPageRsn );
        
        //is first openening and this.options.select_rsn is set ?
        if( this.jump2Page && this.options.select_rsn > 0 ){
            //search all parents of pPageRsn and compare
            
        	var page = this._pages.get( this.options.select_rsn );
        	
        	if( !page ) return result;
        	
            var parents = this._getParents( page );
            
            var treeKey = (page.domain_rsn+0==0)?'d_'+page.domain_rsn:page.rsn;
            	
            var checkId = pPageRsn;
            if( $type(pPageRsn) == 'string' && pPageRsn.substr(0,1) == 'd' ){
                checkId = 0;
            }
            
            if( parents.contains( checkId ) ) result = 1;
            
            //if( $type(pPageRsn) == 'string' && pPageRsn.substr(0,1) == 'd' ) result = 1;
            
            this.setOpen( pPageRsn, result );
        }
        
        return result; 
    },

    _getParents: function( pPage ){
        var found = false;
        var res = [0];
        var foundedPage = false;
        this._pages.each(function(item, rsn){
            if( pPage && item.rsn == pPage.prsn && found == false ){
                res.include( item.rsn );
                foundedPage = item;
                found = true;
            }
        });
        if( foundedPage != false )
            res.extend( this._getParents( foundedPage ) );
        return res;
    },

    isLast: function( pPage ){
        var lastItemRsn = 0;
        this._pagesParent.get( pPage.prsn ).each(function(item){
            lastItemRsn = item.rsn;
        });
        if( pPage.rsn == lastItemRsn )
            return true;
        return false;
    },

    createDrag: function( pTitle, pEvent ){
        
        var _this = this;
        this.currentPageToDrag = pTitle;

        if( this.lastClone )
            this.lastClone.destroy();

        var clone = pTitle.clone()
        .setStyles(pTitle.getCoordinates( this.container )) // this returns an object with left/top/bottom/right, so its perfect
        .setStyles({'opacity': 0.7, 'position': 'absolute', 'background-color': '#ddd',
            'background-image': 'none', 'margin-left': '1px', 'cursor': 'default', 'visibility': 'hidden'})
        .inject( this.container, 'top' );
        
        
        var st = _this.container.scrollTop.toInt();
        if( st > 0 )
            clone.setStyle('top', clone.getStyle('top').toInt()-st );
        
        this.lastClone = clone;

        this.currentDrag = pTitle;

        var drag = clone.makeDraggable( {
            container: this.container,
            snap: 0,
            onDrop: function( element, droppable ){
                _this.destroyDrag();
                
                if( _this.currentDropper ){
                	_this.currentDropper.getParent().setStyle( 'background-color', 'transparent' );
                    var elPage = _this.currentDropper.retrieve('page');
                    var drPage = pTitle.retrieve('page');
                    if( elPage.rsn != drPage.rsn ){
                        _this.createMoveContextMenu( pTitle, _this.currentDropper );
                    }
                }
            },
            onStart: function( el, drop){
            },
            onDrag: function( el, drop){
                el.setStyle('visibility', 'visible');
                var st = _this.container.scrollTop.toInt();
                if( st > 0 ){
                    el.setStyle('top', el.getStyle('top').toInt()+st );
                }
            },
            onCancel: function(){
                _this.destroyDrag();
            }
        });
        clone.addEvent( 'mouseup', function(){
            _this.destroyDrag();
        });
        drag.start( pEvent );
    },

    movePage: function( pWhereRsn, pToRsn, pCode, pDomainRsn ){
        var _this = this;
        var req = {
            rsn: pWhereRsn,
            torsn: pToRsn,
            mode: pCode,
            domain_rsn: pDomainRsn
        };
        new Request.JSON({url: _path+'admin/pages/move', onComplete: function(res){
        	if( this.options.onMoveComplete )
        		this.options.onMoveComplete( req );
            this.reload();
        }.bind(this)}).post(req);
    },

    createMoveContextMenu: function( pWhere, pTo ){

        var pos = this.currentDropper.getPosition( this.container );
        var st = this.container.scrollTop.toInt();
        
        
        var _this = this;
        var t = pWhere.retrieve('page');
        pWhereRsn = t.rsn;

        var t = pTo.retrieve('page');
        var domain_rsn = 0;
        var actions = [
            {code: 'up', label: _('Above')},
            {code: 'into', label: _('Into')},
            {code: 'down', label:_('Below')}
        ];
        

        pToRsn = t.rsn;
        if( t.rsn == 0 ){
            //t.rsn = 'domain';
        	pToRsn = 'domain';
            domain_rsn = t.domain_rsn;
            var actions = [
                {code: 'into', label: _('Into')},
            ];
        }


        _this.createMoveContextMenuOver = true;
        
        var mtop = pos.y-15;
        if( mtop < 0 )
        	mtop = 1;
        
        var context = new Element( 'div', {
            'class': 'pagesTree-context-move'
        })
        .setStyles({
            left: pos.x+10,
            top: mtop,
            opacity: 0
        })
        .addEvent( 'mouseout', function(){
            _this.createMoveContextMenuOver = false;
            var __this = this;
            (function(){
                if(! _this.createMoveContextMenuOver )
                    __this.destroy();
            }).delay(500);
        })
        .inject( this.container );

        actions.each(function(item){
            new Element('a', {
                html: item.label,
                'class': item.code
            })
            .addEvent( 'click', function(){
                _this.movePage( pWhereRsn, pToRsn, item.code, domain_rsn );
                context.destroy();
            })
            .addEvent( 'mouseover', function(e){
                _this.createMoveContextMenuOver = true;
            })
            .inject( context );
        });

        context.set('tween', {duration: 200});
        context.tween( 'opacity', 1 );
        
    },

    destroyDrag: function(){
        if( this.lastClone )
            this.lastClone.destroy();
        this.currentDrag = false;
        this.currentPageToDrag = false;
    },

    unselect: function(){
        if( this.lastSelectedItem )
            this.lastSelectedItem.set('style',  'font-weight: normal; background-color: transparent;' );
        this.options.select_rsn = -1;
        this.lastSelectedItem = false;
        this.lastSelectedPage = false;
    },

    getSelected: function(){
        if( this.lastSelectedPage )
            return this.lastSelectedPage;
        return false;
    },

    select: function( pRsn ){
        this.options.select_rsn = pRsn;
        this.jump2Page = true;
        this.render();
        this.jump2Page = false;
    },

    openContext: function( pEvent, pSource, pPage, pDomain ){
        if( this.options.withContext != true ) return;
        if( this.oldContext ) this.oldContext.destroy();
        if(! pEvent.rightClick ) return;
        pEvent.stop();

        window.addEvent('click', function(){
            if( this.oldContext && pSource.getParent() ){
                pSource.getParent().getElement('span').getParent().set('class', 'title');
                this.oldContext.destroy();
            }
        }.bind(this));

        if( pDomain ){
            return;
        }

        pSource.getParent().getElement('span').getParent().set('class', 'title active');

        this.oldContext = new Element('div', {
            'class': 'ka-pagesTree-context'
        }).inject( document.body );

        var wsize = window.getSize();
        
        var left = pEvent.page.x - (this.container.getPosition(window).x);
        var mtop = pEvent.page.y - (this.container.getPosition(window).y);
        var left = pEvent.page.x;
        var mtop = pEvent.page.y;
        if( mtop < 0 )
        	mtop = 1;
        
        this.oldContext.setStyles({
            left: left,
            'top': mtop
        });

        if( pPage.type == 0 || pPage.type == 1 ){
            new Element('a', {
                html: _('Preview')
            })
            .addEvent('click', function(){
                if( this.options.pageObj )
                    this.options.pageObj.toPage( pPage );
            }.bind(this))
            .inject( this.oldContext );

        }

        var canDelete = true;
        
        if( !pDomain && !ka.checkPageAccess( pPage.rsn, 'deletePages' ) ){
        	canDelete = false;
        }
        
        if( canDelete ){
        	
            new Element('a', {
                'class': 'delimiter'
            }).inject( this.oldContext );
        	
	        new Element('a', {
	            html: _('Delete')
	        })
	        .addEvent('click', function(){
	            if( this.options.pageObj )
	                this.options.pageObj.deletePage( pPage );
	        }.bind(this))
	        .inject( this.oldContext );
    	}
    
        new Element('a', {
            'class': 'delimiter'
        }).inject( this.oldContext );

        new Element('a', {
            html: _('Copy')
        }).addEvent('click', function(){
            ka.setClipboard( ' \''+pPage.title+'\' '+_('page copied'), 'pageCopy', pPage );
        }.bind(this)).inject( this.oldContext );

        new Element('a', {
            html: _('Copy with subpages')
        }).addEvent('click', function(){
            ka.setClipboard( ' \''+pPage.title+'\' '+_('page with subpages copied'), 'pageCopyWithSubpages', pPage );
        }.bind(this)).inject( this.oldContext );

        
        var canPaste = true;
        if( !pPage.prsn ){
        	if( !ka.checkPageAccess( pPage.domain_rsn, 'addPages', 'd' ) ){
	        	canPaste = false;
	        }
        } else {
	        if( !ka.checkPageAccess( pPage.rsn, 'addPages' ) ){
	        	canPaste = false;
	        }
    	}
        
        if( canPaste ){
	        new Element('a', {
	            'class': 'delimiter'
	        }).inject( this.oldContext );
	
	        new Element('a', {
	            'class': 'noaction',
	            html: _('Paste')
	        }).inject( this.oldContext );
	
	        new Element('a', {
	            'class': 'indented',
	            html: _('up')
	        }).addEvent('click', function(){
	            this.paste('up', pPage);
	        }.bind(this)).inject( this.oldContext );
	
	        new Element('a', {
	            'class': 'indented',
	            html: _('into')
	        }).addEvent('click', function(){
	            this.paste('into', pPage);
	        }.bind(this)).inject( this.oldContext );
	
	        new Element('a', {
	            'class': 'indented',
	            html: _('below')
	        }).addEvent('click', function(){
	            this.paste('down', pPage);
	        }.bind(this)).inject( this.oldContext );
   		}
        
        var csize = this.oldContext.getSize();
        
        if( mtop+csize.y > wsize.y ){
        	mtop = mtop-csize.y;
        	this.oldContext.setStyle('top', mtop+1);
        }
        
        
    },

    paste: function( pPos, pPage ){
        var clipboard = ka.getClipboard();
        if( ! (clipboard.type == 'pageCopyWithSubpages' || clipboard.type == 'pageCopy') )
            return;

        var req = {};
        req.page = clipboard.value.rsn;

        req.to = pPage.rsn;
        req.pos = pPos;
        req.type = clipboard.type;

        new Request.JSON({url: _path+'admin/pages/paste', noCache: 1, async: false, onComplete: function(){
            this.reload();
        }.bind(this)}).post(req);
    
    },
    
    go2Page: function( pRsn ){
    
        
    
    },

    createItem: function( pPage, pInject, pDomain ){
        var _this = this;
        if( !pPage ) return;

        var item = new Element( 'div', {
            'class': 'pagesTree-pageItem'
        })
        .inject( pInject );
        
        if( pDomain ){
            pPage.type = '-1';
            pPage.title = pPage.domain;
            if( pPage.rsn != 0 )
            	pPage.domain_rsn = pPage.rsn;
            pPage.rsn = 0;
            item.setStyle('padding', '5px 0px');
            item.addClass('pagesTree-pageItemDomain');
        }

        
        
        item.store('item', pPage);
        
        var titlediv = new Element( 'div', {
            'class': 'title'
        }).inject( item );

        var title = new Element( 'span', {
            html: pPage.title,
            title: 'ID='+pPage.rsn
        }).inject( titlediv );

        if( pDomain && this.options.withPageAdd ){
        	
            if( ka.checkPageAccess( pPage.domain_rsn, 'addPages', 'd') ){
                new Element('img', {
		            src: _path+'inc/template/admin/images/icons/add.png',
		            title: _('Add new pages to this domain'),
		            style: 'cursor: pointer; top: 3px; left: -13px; position: absolute;'
		        })
		        .addEvent('click', function(){
		            _this.options.withPageAdd( pPage.domain_rsn );
		        })
	            .inject( item );
            }
        }


        if(! pDomain ){
            title
            .addEvent( 'click', function(){
                if( _this.options.onSelection )
                    _this.options.onSelection( pPage, title, pDomain );
                if( _this.options.onClick )
                    _this.options.onClick( pPage, title );
                _this.unselect();
                if( _this.options.noActive != true )
                    title.set('style',  'font-weight: bold; background-color: silver;' );
                _this.lastSelectedItem = title;
                _this.lastSelectedPage = pPage;
            })
            .addEvent( 'mouseup', function(){
                this.store( 'mousedown', false );
            });
            
            if( !this.options.noDrag ){

                title.addEvent( 'mousedown', function(e){
                	
                    if( !pDomain && !ka.checkPageAccess( pPage.rsn, 'movePages' ) ){
                    	return;
                    }
                	
                    title.store( 'mousedown', true );
                    if( _this.options.move != false ){
                        (function(){
                        if( title.retrieve('mousedown') ){
                            _this.createDrag( title, e );
                            title.focus();
                        }
                        }).delay(50)
                        e.stop();
                    }
                })
            }
            
        } else {
            title
            .set('title', 'ID='+pPage.domain_rsn)
            .addEvent('click', function(){
                if( _this.options.no_domain_select != true ){
                    if( _this.options.onDomainClick )
                        _this.options.onDomainClick( pPage, title );
                    if( _this.options.onSelection )
                        _this.options.onSelection( pPage, title, pDomain );
                    _this.unselect();
                    if( _this.options.noActive != true )
                        title.set('style',  'font-weight: bold; background-color: silver;' );
                    _this.lastSelectedItem = title;
                    _this.lastSelectedPage = pPage;
                }
            });
        }
        title
        .addEvent( 'mouseout', function(){
            this.store( 'mousedown', false );
            this.getParent().setStyle( 'background-color', 'transparent' );
            this.setStyle( 'cursor', 'pointer' );
            _this.currentDropper = false;
        })
        .addEvent( 'mousemove', function(){
            if( _this.currentDrag && _this.currentPageToDrag ){

            	var toPage = this.retrieve('page');
            	
                if( !toPage.prsn ){
	                if( !ka.checkPageAccess( toPage.domain_rsn, 'addPages', 'd' ) ){
	                	this.setStyle( 'cursor', 'url('+_path+'inc/template/admin/images/icons/stop.png)' );
	                	return;
	            	}
            	} else {
	                if( !ka.checkPageAccess( toPage.rsn, 'addPages' ) ){
	                	this.setStyle( 'cursor', 'url('+_path+'inc/template/admin/images/icons/stop.png)' );
	                	return;
	            	}
            	}

                var page = _this.currentPageToDrag.retrieve('page');
                if( page && page.rsn != pPage.rsn ){ 
                    this.getParent().setStyle( 'background-color', '#ddd' );
                    this.setStyle( 'cursor', 'crosshair' );
                    _this.currentDropper = title;
                }
            }
        });


        title.store( 'page', pPage );

        if( this.options.select_rsn && this.options.select_rsn == pPage.rsn ){
            title.set('style',  'font-weight: bold; background-color: silver;' );
            this.lastSelectedItem = title;
            this.lastSelectedPage = pPage;
        }

        var lastPage = (_this.options.select_rsn > -1) ? _this.options.select_rsn : (_this.lastSelectedPage)?_this.lastSelectedPage.rsn:-1;

        if( lastPage != -1 )
            if( lastPage == pPage.rsn ){
                _this.lastSelectedPage = pPage;
                _this.lastSelectedItem = title;
                if( _this.options.noActive != true  && !_this.options.no_domain_select)
                    title.set('style',  'font-weight: bold; background-color: silver;' );
                if( _this.options.onSelection )
                    _this.options.onSelection( pPage, title, pDomain );
            }


        //Type
        var types = new Hash({
            '0': 'page_green.png',
            '1': 'page_green.png',
            '2': 'folder.png',
            '3': 'page_white_text.png',
            '-1': 'world.png'
        });

        var type = new Element( 'img', {
            'class': 'type',
            src: _path+'inc/template/admin/images/icons/'+types[pPage.type]
        }).inject( item );


        var specialIcons = new Element( 'div', {
            'class': 'specialIcons'
        }).inject( item );
        specialIcons.addEvent('click', function(){
            title.fireEvent('click');
        });


        title.addEvent('mousedown', function(e){
            _this.openContext(e, this, pPage, pDomain );
        });
        
        specialIcons.addEvent('mousedown', function(e){
            _this.openContext(e, this, pPage, pDomain );
        });


        if( (pPage.type == 0 || pPage.type == 1) && pPage.visible == 0 ){
            new Element( 'img', {
                src: _path+'inc/template/admin/images/icons/pageMasks/invisible.png'
            }).inject( specialIcons );
        }

        if( pPage.type == 1 ){
            new Element( 'img', {
                src: _path+'inc/template/admin/images/icons/pageMasks/link.png'
            }).inject( specialIcons );
        }

        if( (pPage.type == 0 || pPage.type == 3) && pPage.draft_exist == 1){
            new Element( 'img', {
                src: _path+'inc/template/admin/images/icons/pageMasks/draft_exist.png'
            }).inject( specialIcons );
        }

        if( pPage.access_denied == 1 ){
            new Element( 'img', {
                src: _path+'inc/template/admin/images/icons/pageMasks/access_denied.png'
            }).inject( specialIcons );
        }
        
        if( pPage.type == 0 && pPage.access_from_groups != "" && $type(pPage.access_from_groups) == 'string' ){
            new Element( 'img', {
                src: _path+'inc/template/admin/images/icons/pageMasks/access_group_limited.png'
            }).inject( specialIcons );
        }

        var isLast = (pDomain) ? true : this.isLast( pPage );
        if( isLast ){
            item.addClass( 'pagesTree-pageItemLast' );
        }
        
        var treeKey = (pDomain)?'d_'+pPage.domain_rsn:pPage.rsn;
        
        if( pDomain && this.options.openDomain ){
        	this.setOpen( treeKey, true );
        }

        if( this.hasChilds( pPage ) ){

            var toggle = new Element( 'img', {
                'class': 'toggle',
                src: _path+'inc/template/admin/images/icons/tree_minus.png'
            }).inject( item );

            var mypane = new Element('div', {
                'class': 'pagesTree-newLvL'
            }).inject( item, 'after' );
            if( isLast ){
                mypane.set( 'class', 'pagesTree-newLvL pagesTree-newLvLLast' );
            }

            toggle.addEvent( 'click', function(){
                var open = this.isOpen(treeKey);
                if(! open ){//wenn zu
                    mypane.setStyle( 'display', 'block' );
                    if( pDomain ){
                		this.pane.setStyle('height', 'auto');
                	}
                    toggle.set( 'src', _path+'inc/template/admin/images/icons/tree_minus.png');
                    this.setOpen( treeKey, true );
                } else {
                    mypane.setStyle( 'display', 'none' );
                    if( pDomain ){
                		this.pane.setStyle('height', 1);
                	}
                    toggle.set( 'src', _path+'inc/template/admin/images/icons/tree_plus.png');
                    this.setOpen( treeKey, false );
                }
            }.bind(this));

            //check ob in cookie gespeichert, ob dieser tree aufgeklappt ist
            if( this.isOpen(treeKey) ){ //false: zugeklappt
                mypane.setStyle( 'display', 'block' );
                if( pDomain ){
            		this.pane.setStyle('height', 'auto');
            	}
                toggle.set( 'src', _path+'inc/template/admin/images/icons/tree_minus.png');
            } else {
            	if( pDomain ){
            		this.pane.setStyle('height', 1);
            	}
                mypane.setStyle( 'display', 'none' );
                toggle.set( 'src', _path+'inc/template/admin/images/icons/tree_plus.png');
            }
            
            this.renderChilds( pPage, mypane );
            
	        if( this.isOpen(treeKey) && pDomain ){
	            this.updateDomainBar.delay(200, this);
	        }
        } else if( pDomain ){
    		this.pane.setStyle('height', 1);
        }
    }
});

if( typeof ka == 'undefined' ) window.ka = {};

ka.clipboard = $H({});
ka.settings = $H({});

ka.performance = true;
ka.streamParams = {};

ka.uploads = {};
ka._links = {};

/*
 * Build the administration interface
*/
ka.init = function(){
    ka.buildClipboardMenu();
    ka.buildUploadMenu();

    ka._desktop = new ka.desktop($('desktop'));
    ka._helpsystem = new ka.helpsystem($('desktop'));
    
    if( ka._iconSessionCounterDiv )
    	ka._iconSessionCounterDiv.destroy();
    
    ka._iconSessionCounterDiv = new Element('div', {
		'class': 'iconbar-item',
		title: _('Visitors')
    }).inject( $('iconbar') );
    ka._iconSessionCounter = new Element('span').inject( ka._iconSessionCounterDiv );
    new Element('img', {
    	src: _path+'inc/template/admin/images/icons/user_gray.png',
		style: 'position: relative; top: 3px; margin-left: 3px;'
	}).inject( ka._iconSessionCounterDiv );
    
    
    window.fireEvent('init');
    
    if( ka._crawler ){
        ka._crawler.stop();
        ka._crawler = null;
        ka._crawler = new ka.crawler();
    } else {
        ka._crawler = new ka.crawler();
    }
    
    ka.loadStream();
    
    window.onbeforeunload = function(evt){
    	
        /*
         * deactivate 
        var message = _('Are you sure you want to leaving the administration? Unsaved content and uncomplete uploads will be discarded.');
        if (typeof evt == 'undefined') {
            evt = window.event;
        }
        if (evt) {
            evt.returnValue = message;
        }
        return message;
        */
    };

    $(document.body).addEvent('contextmenu', function(e) { 
        e=e||window.event;
        e.cancelBubble = true;
        e.returnValue = false;
        if(e.stopPropagation) e.stopPropagation();
        if(e.preventDefault) e.preventDefault();
        if( e.target )
            $(e.target).fireEvent('mousedown', e);
        return false;
    });
    $(document.body).addEvent('click', function(){
    	ka.destroyLinkContext();
    });
};


window.addEvent('stream', function(res){
    $('serverTime').set('html', res.time);
    ka._iconSessionCounter.set('text', res.sessions_count);
});


ka.toggleMainbar = function(){
    if( $('border').getStyle('top').toInt() != 0 ){
        $('border').tween('top', 0);
        $('arrowUp').setStyle('background-color', 'transparent');
        $('arrowUp').morph({
            'top': 0,
            left: 0
        }); 
    } else {
        $('border').tween('top', -76);
        $('arrowUp').setStyle('background-color', '#399BC7');
        $('arrowUp').morph({
            'top': 61,
            left: 32
        }); 
    }
}

ka.clearCache = function( ){
    
    if( !ka.cacheToolTip )
        ka.cacheToolTip = new ka.tooltip( $('ka-btn-clear-cache'), _('Clearing cache ...'), 'top' );
    ka.cacheToolTip.show();
    
    new Request.JSON({url: _path+'admin/backend/clearCache', noCache: 1, onComplete: function(res){
        ka.cacheToolTip.stop( _('Cache cleared') );
    }}).post();


}

ka.getDomain = function( pRsn ){
	var result = [];
	ka.settings.domains.each(function(domain){
		if( domain.rsn == pRsn )
			result = domain;
	})
	return result;
}


ka.loadSettings = function(){
    new Request.JSON({url: _path+'admin/backend/getSettings', noCache: 1, async: false, onComplete: function(res){
        ka.settings = $H(res);
        ka.settings.set('images', ['jpg', 'jpeg', 'bmp', 'png', 'gif', 'psd']);
        ka.settings.set('user', $H(ka.settings.user));
        ka.settings.get('user').set('windows', $H(ka.settings.get('user').get('windows')));
        
        $(document.body).setStyle('background-image', 'url('+_path+'inc/template'+ka.settings.user.userBg+')'); //admin/images/userBgs/'+pId.user_rsn+'.jpg)');
        if( ka.settings.system.systemtitle ){
            document.title = ka.settings.system.systemtitle + ' | kryn.cms administstration';
        }
    }.bind(this)}).post();
}

ka.loadLanguage = function( pLang ){
    if(!pLang) pLang = 'en';
    window._session.lang = pLang;
    new Request.JSON({url: _path+'admin/getLanguage:'+pLang+'/', async: false, noCache: 1, onComplete: function(res){
        ka.lang = res;
    }}).get();
}


ka.saveUserSettings = function(){
    if( ka.lastSaveUserSettings )
        ka.lastSaveUserSettings.cancel();

    ka.settings.user = new Hash(ka.settings.user);

    ka.lastSaveUserSettings = new Request.JSON({url: _path+'admin/backend/saveUserSettings', noCache: 1, onComplete: function(res){
    }}).post({ settings: JSON.encode(ka.settings.user) });
}

ka.resetWindows = function(){
    ka.settings.user['windows'] = new Hash();
    ka.saveUserSettings();
    ka.wm.resizeAll();
}

ka.check4Updates = function(){
    if( window._session.user_rsn == 0 ) return;
    new Request.JSON({url: _path+'admin/system/module/check4updates', noCache: 1, onComplete: function(res){
        if( res && res.found ){
            ka.displayNewUpdates( res.modules );
        }
        ka.check4Updates.delay( 10*(60*1000) );
    }}).post();
}

ka.checkPageAccessHasCode = function( pCodes, pAction ){
	var access = (pCodes.indexOf( pAction ) != -1 );
	
	if( !access ){
	
		var acl_all = false;
		var acl_tab = false;
		
		
		$H(ka.settings.pageAcls).each(function(subAll,keyAll){
		
			$H(subAll).each(function(tabSubs, tabKey){
				if( tabSubs.indexOf(pAction) != -1 && tabKey != 'tree' ){
					acl_tab = tabKey;
				}
			})
		
		});
		
		if( acl_tab ){
			access = (pCodes.indexOf( acl_tab ) != -1 );
		}
		
	}
	return access;
}

ka.checkPageAccess = function( pRsn, pAction, pType ){
	if(!pType) pType = 'p'; //p=page, d=domain
	
	if( !pRsn ) return false;
	
	if( ka.settings.acl_pages.length == 0 ) return true;
	
	var access = false;
	
	var current_rsn = pRsn;
	var current_type = pType;
	var not_found = true;
	var parent_acl = false;
	
	var codes = [];
	
	while( not_found ){
		
		var acl = ka._getPageAcl( current_rsn, current_type );
		if( acl && acl.code ){
			codes = acl.code.split('[')[1].replace(']', '').split(',');
			if( ka.checkPageAccessHasCode(codes, pAction) ){
				if ( 
						(parent_acl == false) ||
						(parent_acl == true && acl.code.indexOf('%') != -1)
				    ){
					access = (acl.access == 1) ? true : false;
					not_found = false;
				}
			}
		}
		
		if( not_found == true && current_type == 'd' ){
			//no parent acl on domain-level
			not_found = false;
		}
		
		if( not_found == true && current_type == 'p' ){
			//search and set parent
			var parent = ka.getPageParent( current_rsn );
			if( parent.domain ){
				//parent is domain
				current_rsn = parent.domain_rsn;
				current_type = 'd';
			} else {
				current_rsn = parent.rsn;
			}
			parent_acl = true;
		}
	}
	return access;
}

ka.getPageParent = function( pRsn ){
	
	var domain_rsn = ka.getDomainOfPage( pRsn );
	
	var page_tree = $H(ka.settings['menus_'+domain_rsn]).get( pRsn );
	var result = {prsn: 0, domain_rsn: domain_rsn, domain: true};
	
	if( !page_tree ) return result;
	
	var page = page_tree[ page_tree.length-1 ];
	
	if( page_tree.length >= 1 && page ){
		result = page;
		result.domain_rsn = domain_rsn;
	}
	
	return result;
}

ka.getDomainOfPage = function( pRsn ){
	var rsn = false;
	
	pRsn = ','+pRsn+',';
	$H(ka.settings.r2d).each(function(pages,domain_rsn){
		var pages = ','+pages+',';
		if( pages.indexOf(pRsn) != -1 ){
			rsn = domain_rsn;
		}
	});
	return rsn;
}

ka._getPageAcl = function( pRsn, pType ){
	var acl = false;
	ka.settings.acl_pages.each(function(item){
		
		var type = item.code.substr(0,1);
		if( pType != type ) return;
		var rsn = item.code.substr(1, item.code.length).split('[')[0].replace('%','');
		if( rsn == pRsn ){
			acl = item;
		}
	})
	return acl;
}



ka.checkAccess = function( pType, pCode, pAction, pRootHasAccess ){
	
	//self::normalizeCode( $pCode );
	
	if( !ka.settings.acls[pType] ||  ka.settings.acls[pType].length == 0 ) return true;
	
	
	var access = false;
	
	var current_code = $pCode;
	    
	var not_found = true;
	var parent_acl = false;
	
	var codes = [];
	
	
	while( not_found ){
	
		var acl = ka.getAcl( pType, current_code );
		
		if( acl && acl['code'] ){
			
			var code = acl.code.replace(']', ''); //str_replace(']', '', $acl['code']);
			var t = code.split('['); //explode('[', $code);
			var codes = false;
			if( t[1] )
				codes = t[1].split(',');
			
			if( codes == false || codes.contains( pAction) ){
				if ( 
						(parent_acl == false) || //i'am not a parent
						(parent_acl == true && acl.code.indexOf('%') > 0) //i'am a parent
				    ){
					access = (acl['access'] == 1) ? true : false;
					not_found = false; //done
				}
			}
		}
		
		if( current_code == '/' ){
		    //we are at the top. no parents left
			if( pRootHasAccess == true )
				access = true;
		    not_found = false; //go out
		}
		
		//go to parent
		if( not_found == true && current_code != '/' ){
			//search and set parent
		    pos = current_code.indexOf('/'); //strpos($current_code, '/');
		    current_code = current_code.substr(0, pos); //substr( $current_code, 0, $pos );
		    
			parent_acl = true;
		}
	}
	
	return access;
}

ka.getAcl = function( pType, current_code ){
	var acls = ka.settings.acls[pType];
	
	var acl = false;
	
	acls.each(function(item, key){
		
		var code = item.code.replace('%', '');
		var t = code.split('[');
		code = t[0];
		if( current_code == code )
			acl = item;
		
	});
	return acl;
}


ka.addStreamParam = function( pKey, pVal ){
	ka.streamParams[pKey] = pVal;
}

ka.removeStreamParam = function( pKey ){
	delete ka.streamParams[pKey];
}


ka.loadStream = function(){
	if( ka._lastStreamid ){
		clearTimeout( ka._lastStreamid );
	}
	

	if( ka._lastStreamCounter ){
		clearTimeout( ka._lastStreamCounter );
	}
	
	_lastStreamCounter = (function(){
	    if( window._session.user_rsn > 0 ){
	        new Request.JSON({url: _path+'admin/backend/stream', noCache: 1, onComplete: function(res){
	        	ka.streamParams.last = res.last;
	        	window.fireEvent('stream', res);
	            if( res ){
	                $('serverTime').set('html', res.time);
	            } else {
	                ka.ai.logout( true );
	            }
	            ka._lastStreamid = ka.loadStream.delay(5*1000);
	        }}).post(ka.streamParams);
	    }
	}).delay(50);
}

ka.startSearchCrawlerInfo = function( pHtml ){
	ka.stopSearchCrawlerInfo();
	
	this.startSearchCrawlerInfoMenu = new Element('div', {
        'class': 'ka-updates-menu',
        style: 'left: 170px; width: 177px;'
    }).inject( $('border') );
	
	this.startSearchCrawlerInfoMenuHtml = new Element('div', {
	    html: pHtml
	}).inject( this.startSearchCrawlerInfoMenu );
	
	this.startSearchCrawlerProgressLine = new Element('div', {
	    style: 'position: absolute; bottom: 1px; left: 4px; width: 0px; height: 1px; background-color: #444;'
	}).inject( this.startSearchCrawlerInfoMenu );
	
	this.startSearchCrawlerInfoMenu.tween('top', 50);
}

ka.setSearchCrawlerInfo = function( pHtml ){
	this.startSearchCrawlerInfoMenuHtml.set('html', pHtml);
}

ka.stopSearchCrawlerInfo = function( pOutroText ){
	if(! this.startSearchCrawlerInfoMenu) return;
	
	var doOut = function(){
		this.startSearchCrawlerInfoMenu.tween('top', 17);
	}.bind(this);
	
	if( pOutroText ){
		this.startSearchCrawlerInfoMenuHtml.set('html', pOutroText);
		doOut.delay(2000);
	} else {
		doOut.call();
	}
	
}

ka.setSearchCrawlerProgress = function( pPos ){
    var maxLength = 177-8;
    var pos = maxLength * pPos / 100;
    this.startSearchCrawlerProgressLine.set('tween', {duration: 100});
    this.startSearchCrawlerProgressLine.tween('width', pos);
}

ka.stopSearchCrawlerProgress = function(){
    this.startSearchCrawlerProgressLine.set('tween', {duration: 10});
    this.startSearchCrawlerProgressLine.tween('width', 0);
}

ka.openSearchContextClose = function(){
    if( ka.openSearchContextLast )
        ka.openSearchContextLast.destroy();
    
}

ka.openSearchContext = function(){
    
    var button = $('ka-btn-create-search-index');
    
    ka.openSearchContextClose();
    
    this.openSearchContextLast = new Element('div', {
        'class': 'ka-searchcontext'
    }).inject( $('border') );
    
    var pos = button.getPosition( $('border') );
    var size = $('border').getSize();
    var right = size.x - pos.x;
    
    this.openSearchContextLast.setStyle('right', right-30);
    
    new Element('img', {
        'class': 'ka-searchcontext-arrow',
        src: _path+'inc/template/admin/images/ka-tooltip-corner-top.png'
    }).inject( this.openSearchContextLast );
    
    this.openSearchContextContent = new Element('div', {
        'class': 'ka-searchcontext-content'
    }).inject( this.openSearchContextLast );
    
    this.openSearchContextBottom = new Element('div', {
        'class': 'ka-searchcontext-bottom'
    }).inject( this.openSearchContextLast );

    new ka.Button(_('Indexed pages'))
    .addEvent('click', function(){
        ka.wm.open('admin/system/searchIndexerList');
    })
    .inject( this.openSearchContextBottom );
    
    
    ka.openSearchContextClearIndex = new ka.Button(_('Clear index'))
    .addEvent('click', function(){
        ka.openSearchContextClearIndex.startTip(_('Clearing index ...'));
        
        new Request.JSON({url: _path+'admin/backend/searchIndexer/clearIndex', noCache: 1, onComplete: function( pRes ){
            ka.openSearchContextClearIndex.stopTip(_('Done'));
        }.bind(this)}).post();
    })
    .inject( this.openSearchContextBottom );
    
    new Element('a', {
        style: 'position: absolute; right: 5px; top: 3px; text-decoration: none; font-size: 13px;',
        text: 'x',
        title: _('Close'),
        href: 'javascript: ;'
    })
    .addEvent('click', ka.openSearchContextClose)
    .inject( this.openSearchContextLast );
    
    ka.openSearchContextLoad();
    
}


ka.openSearchContextLoad = function(){
    
    ka.openSearchContextContent.set('html', '<br /><br /><div style="text-align: center; color: gray;">'+_('Loading ...')+'</div>');
    
    
    ka.openSearchContextTable = new ka.Table([
        [_('Domain'), 190],
        [_('Indexed pages')]
    ]);
        
    new Request.JSON({url: _path+'admin/backend/searchIndexer/getIndexedPages4AllDomains',
        noCache:1,
        onComplete: function( pRes ){
            
            ka.openSearchContextContent.empty();
            
            ka.openSearchContextTable.inject( ka.openSearchContextContent );
            
            if( pRes ){
                pRes.each( function(domain){
                    ka.openSearchContextTable.addRow([domain.domain+'<span style="color:gray"> ('+domain.lang+')</span>', domain.indexedcount]);
                });
            }
            
        }
    }).post();
    
    
    
}





ka.displayNewUpdates = function( pModules ){
    if( this.newUpdatesMenu )
        this.newUpdatesMenu.destroy();
    
    var html = _('New updates !');
    /*
    pModules.each(function(item){
        html += item.name+' ('+item.newVersion+')<br />';
    });
    */
    this.newUpdatesMenu = new Element('div', {
        'class': 'ka-updates-menu',
        html: html
    })
    /*
    .addEvent('mouseover', function(){
        this.tween('height', this.scrollHeight );
    })
    .addEvent('mouseout', function(){
        this.tween('height', 24 );
    })
    */
    .addEvent('click', function(){
        ka.wm.open('admin/system/module', {updates: 1});
    })
    .inject( $('border') );
    this.newUpdatesMenu.tween('top', 50);
}

ka.buildClipboardMenu = function(){
    ka.clipboardMenu = new Element('div', {
        'class': 'ka-clipboard-menu'
    }).inject( $('border') );
}

ka.buildUploadMenu = function(){
    ka.uploadMenu = new Element('div', {
        'class': 'ka-upload-menu',
        styles: {
            height: 22
        }
    })
    .addEvent('mouseover', function(){
        this.tween('height', this.scrollHeight);
    })
    .addEvent('mouseout', function(){
        this.tween('height', 22);
    })
    .inject( $('border') );

    ka.uploadMenuInfo = new Element('div', {
        'class': 'ka-upload-menu-info'
    }).inject( ka.uploadMenu );
}

ka.getClipboard = function(){
    return ka.clipboard;
}

ka.setClipboard = function( pTitle, pType, pValue ){
    ka.clipboard = { type: pType, value: pValue };
    ka.clipboardMenu.set('html', pTitle );
    ka.clipboardMenu.tween('top', 50);
}

ka.clearClipboard = function(){
    ka.clipboard = {};
    ka.clipboardMenu.tween('top', 20);
}

ka.createModuleMenu = function(){
    if( ka._moduleMenu )
        ka._moduleMenu.destroy();
    
    ka._moduleMenu = new Element('div', {
        'class': 'ka-module-menu',
        style: 'left: -250px;'
    })
    .addEvent('mouseover', ka.toggleModuleMenuIn.bind(this, true))
    .addEvent('mouseout', ka.toggleModuleMenuOut)
    .inject( document.body );
    ka._moduleMenu.set('tween', {transition: Fx.Transitions.Quart.easeOut});
     
    ka.moduleToggler = new Element('div', {
        'class': 'ka-module-toggler'
    })
    .addEvent('click', function(){
    	ka.toggleModuleMenuIn();
    })
    .inject( ka._moduleMenu );
    
    new Element('img', {
    	src: _path+'inc/template/'+_('admin/images/extensions-text.png')
    })
    .addEvent('click', ka.toggleModuleMenuIn)
    .inject( ka.moduleToggler );

    /*
    var btnGrp = new ka.buttonGroup( ka._moduleMenu );
    btnGrp.addButton( 'Install extenson', _path+'inc/template/admin/images/icons/add.png', function(){
        ka.wm.open('admin/system/module/add');
    });
    */

    new Element('div', {
        html: _('Extensions'),
        style: 'padding-left: 15px; color: white; font-weight: bold; padding-top: 4px;'
    }).inject( ka._moduleMenu );

    ka.moduleItems = new Element('div', {
       'class': 'ka-module-items' 
    }).inject( ka._moduleMenu );
    

    ka.moduleItemsScrollerContainer = new Element('div', {
    	'class': 'ka-module-items-scroller-container'
    }).inject( ka._moduleMenu );
    
    ka.moduleItemsScroller = new Element('div', {
    	'class': 'ka-module-items-scroller'
    }).inject( ka.moduleItemsScrollerContainer );
    //}).inject( ka._moduleMenu );

    window.addEvent('resize', ka.updateModuleItemsScrollerSize);
    window.addEvent('resize', ka.renderAdminLink);
    
    
    ka.moduleItemsScroller.addEvent('mousedown', function(){
    	ka.moduleItemsScrollerDown = true;
    });
    
    ka.moduleItems.addEvent('mousewheel', function(e){
    	var e = new Event(e);
    	
    	var newPos = ka.moduleItemsScrollSlider.step;
    	
    	if ( e.wheel > 0 ){
    		//up
    		newPos--;
    	} else if( e.wheel < 0) {
    		//down
    		newPos++;
    	}
    	if( newPos > ka.moduleItemsScrollSlider.max )
    		newPos = ka.moduleItemsScrollSlider.max;
    	
    	if( newPos < ka.moduleItemsScrollSlider.min )
    		newPos = ka.moduleItemsScrollSlider.min;
    	
    	ka.moduleItemsScrollSlider.set(newPos);
    	
    });
    
    /*
    var menuBottom = new Element('div', {
        style: 'position: absolute; bottom: 12px; left: 8px; '
    }).inject( ka._moduleMenu );

    new Element('a', {
        'class': 'ka-Button ka-button',
        href: 'javascript:;',
        html: _('Add extension')
    }).inject( menuBottom );
    */
    /*
    var btnGrp =new ka.buttonGroup( ka._moduleMenu );
    btnGrp.addButton( ':w', _path+'inc/template/admin/images/add.png', function(){
        ka.wm.open( 'admin/system/module/' );
    });*/
    //btnGrp.addButton( 'Erweiterung deinstallieren', _path+'inc/template/admin/images/remove.png', function(){});
    ka.toggleModuleMenuOut( true );
}

ka.updateModuleItemsScrollerSize = function(){

	var completeSize = ka.moduleItems.getScrollSize();
	var size = ka.moduleItems.getSize();
	
	var diffHeight = completeSize.y - size.y;
	
	if( diffHeight > 12 ){
		ka.moduleItemsScroller.setStyle('display', 'block');
		
		var proz = Math.ceil(diffHeight / (completeSize.y / 100));
		
		var newDiffHeight = (proz/100) * size.y;
		
		var scrollBarHeight = size.y - newDiffHeight;
		
		ka.moduleItemsScroller.setStyle('height', scrollBarHeight);
		
		//if( ka.moduleItemsScrollSlider )
		//	ka.moduleItemsScrollSlider.deattach();
		
		ka.moduleItemsScrollSlider = new Slider( ka.moduleItemsScrollerContainer, ka.moduleItemsScroller, {
	    	wheel: true,
	    	mode: 'vertical',
	    	steps: 25,
	    	onChange: function( pPos ){
	    		var scrollTop = ((pPos*4) / 100) * diffHeight;
	    	    ka.moduleItems.scrollTo(0, scrollTop);
	    	},
	    	onComplete: function(){
	    		ka.moduleItemsScrollerDown = false;
	    	}
	    });
		ka.moduleItemsScrollSlider.set(0);
	} else {
		ka.moduleItemsScroller.setStyle('display', 'none');
	    ka.moduleItems.scrollTo(0, 0);
	}
	
}

ka.toggleModuleMenuIn = function( pOnlyStay ){
	

	if( ka.lastModuleMenuOutTimer )
		clearTimeout( ka.lastModuleMenuOutTimer );

	if( ka.ModuleMenuOutOpen == true )
		return;
	
	if( pOnlyStay == true )
		return;
	
	ka.ModuleMenuOutOpen = false;	
	ka._moduleMenu.set('tween', {transition: Fx.Transitions.Quart.easeOut, onComplete: function(){
		ka.ModuleMenuOutOpen = true;
	}});
    ka._moduleMenu.tween('left', 0 );
    ka.moduleToggler.store('active', true);
    ka.moduleItems.setStyle('right', 0);
    //ka.moduleItemsScroller.setStyle('left', 188);
    //ka.moduleItemsScrollerContainer.setStyle('right', 0);
}

ka.toggleModuleMenuOut = function( pForce ){
	
	//if( !ka.ModuleMenuOutOpen && pForce != true )
	//	return;
	
	if( ka.lastModuleMenuOutTimer )
		clearTimeout( ka.lastModuleMenuOutTimer );
	
	ka.ModuleMenuOutOpen = false;
	
	ka.lastModuleMenuOutTimer = (function(){
		ka._moduleMenu.set('tween', {transition: Fx.Transitions.Quart.easeOut, onComplete: function(){
			ka.ModuleMenuOutOpen = false;
		}});
	    ka._moduleMenu.tween('left', (ka._moduleMenu.getSize().x-33)*-1 );
	    ka.moduleToggler.store('active', false);
	    ka.moduleItems.setStyle('right', 40);
	    //ka.moduleItemsScrollerContainer.setStyle('right', 50);
	    ka.destroyLinkContext();
	}).delay(300);
	
}

ka.toggleModuleMenu = function(){
    if( ka.moduleToggler.retrieve('active') != true ){
        ka.toggleModuleMenuIn();
    } else {
        ka.toggleModuleMenuOut();
    }
}

ka.loadMenu = function(){
    new Request.JSON({url: _path+'admin/backend/getMenus/', noCache: true, onComplete: function(res){
        ka.createModuleMenu();
        $('mainLinks').empty();
        ka.moduleItems.empty();
        
        var mlinks = $H(res);
        

        $H(mlinks.get('admin')).each(function(item, pCode){
            ka.addAdminLink( item, pCode, 'admin' );
        });
        
        mlinks.erase('admin');
        
        if( mlinks.get('users') ){
        	extKey = 'users';
        	var links = mlinks.get(extKey);
        	var toInsert = {};

    		$H(links).each(function(item, pCode){
    			if( item.mainLink ){
    				ka.addAdminLink( item, pCode, extKey );
    			} else {
    				toInsert[ pCode ] = item;
    			}
            });
    		ka.addModuleLink( toInsert, extKey );
        }
        mlinks.erase('users');
        
        $H(ka.settings.configs).each(function(config, extKey){
        
        	var links = mlinks.get(extKey);
        	if( !links ) return;
        	
        	var toInsert = {};

    		$H(links).each(function(item, pCode){
    			if( item.mainLink ){
    				ka.addAdminLink( item, pCode, extKey );
    			} else {
    				toInsert[ pCode ] = item;
    			}
            });
    		ka.addModuleLink( toInsert, extKey );
        	
        });
        
        ka.needMainMenuWidth = false;
        
        ka.updateModuleItemsScrollerSize();
        ka.renderAdminLink.delay(200);
        
        /*
        links.each(function(config, extKey){
        	
        	
        	
        });
        
        
        mlinks.each(function(item, module){
            if( item != null )
                ka.addModuleLink( item, module );
        });
        */
        
    }}).get();
};


ka.removedMainMenuItems = [];

ka.renderAdminLink = function(){
	
	var windowSize = window.getSize().x;
	if( windowSize < 770 ){
		logger('show blocker');
		if( !ka.blocker ){
			ka.blocker = new Element('div', {
				'style': 'position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; z-index: 600000000; background-color: white;'
			}).inject( document.body );
			var t = new Element('table', {style: 'width: 100%; height: 100%'}).inject(ka.blocker);
			var tr = new Element('tr').inject( t );
			var td = new Element('td', {
				align: 'center', valign: 'center',
				text: _('Your browser window is too small.')
			}).inject(tr);
		}
	} else if( ka.blocker ){
		logger('destroy: '+ka.blocker);
		ka.blocker.destroy();
		ka.blocker = null;
	}
	
	var iconbar = $('iconbar');
	var menubar = $('mainLinks');
	var header = $('header');
	
	var menubarSize = menubar.getSize();
	var iconbarSize = iconbar.getSize();
	var headerSize = header.getSize();
	//var searchBoxWidth = 263; 
	var searchBoxWidth = 221;
	
	if( ka.additionalMainMenu )
		searchBoxWidth += ka.additionalMainMenu.getSize().x;
	
	var curWidth = menubarSize.x + iconbarSize.x + searchBoxWidth;
	
	
	if( !ka.needMainMenuWidth ){
		//first run, read all children widths

		if( !ka.mainMenuItems )
			ka.mainMenuItems = menubar.getChildren('a');
		
		ka.mainMenuItems.each(function(menuitem, index){
			if( index == 0 ) return;
			menuitem.store('width', menuitem.getSize().x);
		});
	}
	
	
	
	//if( curWidth > headerSize.x ){
		
		var childrens = menubar.getChildren('a');
		
		var fullsize = 0;
		var addMenuWidth = 50;
		
		//diff is the free space we have to display menuitems
		var diff = ((menubarSize.x + iconbarSize.x + searchBoxWidth) - headerSize.x);
		
		//availWidth is now the availWidth we have for the menuitems
		var availWidth = menubarSize.x - diff - addMenuWidth;
		
		if( !ka.needMainMenuWidth )
			ka.needMainMenuWidth = availWidth;
		
		ka.removedMainMenuItems = [];

		ka.mainMenuItems.each(function(menuitem, index){
			if( index == 0 ) return;
			
			var width = menuitem.retrieve('width');
			fullsize += width;

			if( fullsize < availWidth ){
				//we have place for this item
				//check if this menuitem is in the additional menu bar or in origin
				if( menuitem.retrieve('inAdditionalMenuBar') == true ){
					menuitem.inject( menubar );
					menuitem.store('inAdditionalMenuBar', false);
				}
			} else {
				//we have no place for this menuitem
				ka.removedMainMenuItems.include( menuitem );
			}
		});
		
		

		if( ka.removedMainMenuItems.length > 0 ){
			
			if( !ka.additionalMainMenu ){
				ka.additionalMainMenu = new Element('a', {
					'class': 'ka-mainlink-additionalmenubar',
					style: 'width: 17px; padding: 2px 2px 0px 0px; cursor: default;'
				}).inject( menubar );
				
				new Element('img', {
					src: _path+'inc/template/admin/images/ka.mainmenu-additional.png',
					style: 'width: 12px; height: 13px; left: 4px;'
				}).inject( ka.additionalMainMenu );
		
				ka.additionalMainMenuContainer = new Element('div', {
					'class': 'ka-mainlink-additionalmenubar-container bar-dock-logo-menu-style',
					style: 'display: none'
				}).inject( $('border') );
				
				ka.makeMenu( ka.additionalMainMenu, ka.additionalMainMenuContainer, true, {y: 30, x: -1});
			}
			
			ka.removedMainMenuItems.each(function(menuitem){
				menuitem.inject( ka.additionalMainMenuContainer );
				menuitem.store('inAdditionalMenuBar', true);
			});
			ka.additionalMainMenu.inject( menubar );
		} else {
			
			if( ka.additionalMainMenu ){
				ka.additionalMainMenu.destroy();
				ka.additionalMainMenuContainer.destroy();
				ka.additionalMainMenu = null;
			}
			
		}
};

ka.makeMenu = function( pToggler, pMenu, pCalPosition, pOffset ){
	

	pMenu.setStyle('display', 'none');
	
	var showMenu = function(){
		pMenu.setStyle('display', 'block');
		pToggler.store('ka.makeMenu.canHide', false);
		
		if( pCalPosition ){
			var pos = pToggler.getPosition($('border'));
			if( pOffset ){
				if( pOffset.x )
					pos.x += pOffset.x;
				if( pOffset.y )
					pos.y += pOffset.y;
			}
			pMenu.setStyles({
				'left': pos.x,
				'top': pos.y
			});
		}
	};
	
	var _hideMenu = function(){
		if( pToggler.retrieve('ka.makeMenu.canHide') != true ) return;
		pMenu.setStyle('display', 'none');
	};
	
	var hideMenu = function(){
		pToggler.store('ka.makeMenu.canHide', true);
		_hideMenu.delay(200);
	};

	pToggler.addEvent('mouseover', showMenu);
	pToggler.addEvent('mouseout', hideMenu);
	pMenu.addEvent('mouseover', showMenu);
	pMenu.addEvent('mouseout', hideMenu);
	
	//ka.additionalMainMenu, ka.additionalMainMenuContainer, true, {y: 80});
}

ka.addAdminLink = function( pLink, pCode, pExtCode ){
    var mlink = null;
    if( pCode == 'system' ){
    	
        mlink = new Element('a', {
            title: _(pLink.title),
            text: ' ',
            'class': 'bar-dock-logo first'
        });
        
        new Element('img', {
            src: _path+'inc/template/admin/images/dock-logo-icon.png'
        }).inject( mlink );

        var menu = new Element('div', {
            'class': 'bar-dock-logo-menu bar-dock-logo-menu-style',
            styles: {
                display: 'none'
            }
        })
        .addEvent('mouseover', function(){
            mlink.store( 'allowToDisappear', false );
        })
        .addEvent('mouseout', function(){
            mlink.fireEvent('mouseout');
        })
        .inject( $('border') );

        $H(pLink.childs).each(function(item, code){
        	
            if( item.isLink === false ) return;
            var sublink = new Element('a', {
                html: _(item.title)
            })
            .inject( menu );
            
            if( item.type ){
            	sublink.addClass('ka-module-items-activated');
            	sublink.addEvent('click', function(){
                    ka.wm.openWindow( pExtCode, pCode+'/'+code, pLink );
                })
            }
            
            if( item.hasSubmenu ){
            	
            	var submenu = new Element('div', {
                    'class': 'bar-dock-logo-menu-style bar-dock-logo-menu-submenu ka-subnavi',
                    styles: {
                        display: 'none'
                    }
                }).inject( sublink );
            	
            	new Element('img', {
            		'class': 'ka-subnavi-top-left',
            		src: _path+'inc/template/admin/images/ka-submenu-top-left.png'
            	}).inject( submenu );
            	
            	new Element('img', {
            		'class': 'ka-subnavi-bottom-left',
            		src: _path+'inc/template/admin/images/ka-submenu-bottom-left.png'
            	}).inject( submenu );
            	
            	sublink.addEvent('mouseover', function(){
            		sublink.store('canHide', false);
    				submenu.setStyle('display', 'block');
    				var size = submenu.getSize();
    				submenu.setStyle( 'right', (size.x*-1)-5 );
            	});
            	
            	submenu.addEvent('mouseover', function(){
            		sublink.fireEvent('mouseover');
            	});
            	submenu.addEvent('mouseout', function(){
            		sublink.fireEvent('mouseout');
            	});

            	sublink.addEvent('mouseout', function(){
            		sublink.store('canHide', true);
            		(function(){
            			
            			if( sublink.retrieve('canHide') )
            				submenu.setStyle('display', 'none');
            			
            		}).delay(250);
            	});

                $H(item.childs).each(function(subitem, subcode){
                	
                    if( item.isLink === false ) return;
                    var subsublink = new Element('a', {
                        html: _(subitem.title)
                    })
                    .inject( submenu );
                    
                    if( subitem.type ){
                    	subsublink.addClass('ka-module-items-activated');
                    	subsublink.addEvent('click', function(){
                            ka.wm.openWindow( pExtCode, pCode+'/'+code+'/'+subcode, pLink );
                        })
                    }
                });
            }
            
        });

        mlink
        .addEvent('mouseover', function(){
            mlink.store( 'allowToDisappear', false );
            menu.setStyle('display', 'block');
        })
        .addEvent('mouseout', function(){
            mlink.store( 'allowToDisappear', true );
            (function(){
                if( mlink.retrieve('allowToDisappear') == true ){
                    menu.setStyle('display', 'none');
                }
            }).delay(250);
        });

    } else {
        mlink = new Element('a', {
            html: _(pLink.title)
        });
        if( pLink.icon != '' ){
            new Element('img', {
                src: _path+'inc/template/'+pLink.icon
            }).inject( mlink );
        }
    }
    

    
    ka._links[ pExtCode+'/'+pCode ] = {
    	level: 'main',
    	object: mlink,
    	link: pLink,
    	module: pExtCode,
    	code: pCode,
    	path: pExtCode+'/'+pCode,
    	title: _(pLink.title)
    };
    
    mlink.inject( $('mainLinks') );
    pLink.module = pExtCode;
    pLink.code = pCode;
    mlink.store('link', pLink);
    ka.linkClick( mlink );
    //mlink.addEvent('click', ka.linkClick.bindWithEvent(mlink));
    
    
}

ka.addModuleLink = function( pLinks, pModule ){
    var moduleContainer = new Element('div', {
        'class': 'ka-module-container'
    }).inject( ka.moduleItems );

    $H(pLinks).each(function(pLink, code){
        if( pLink == null ) return;
        var mlink = new Element('a', {
            html: _(pLink.title),
            'class': 'ka-subnavi-main',
            styles: {
                'background-image': (pLink.icon != '') ? 'url('+_path+'inc/template/'+pLink.icon+')' :''
            }
        }).inject( moduleContainer );
        pLink.module = pModule;
        pLink.code = code;
        mlink.store('link', pLink);
        
        ka._links[ pModule+'/'+code ] = {
            	level: 'sub',
            	object: mlink,
            	link: pLink,
            	module: pModule,
            	code: code,
            	path: pModule+'/'+code,
            	title: _(pLink.title)
            };
        
        ka.linkClick( mlink );
        //mlink.addEvent('click', ka.linkClick.bindWithEvent(mlink));
        

        var childs = $H(pLink.childs);
        if( childs.getLength() > 0 ){
            var subnavi = new Element('div', {
                'class': 'ka-subnavi-npa'
                /*'class': 'ka-subnavi',
                styles: {
                    opacity: 0,
                    display: 'block'
                }*/
            }).inject( ka.moduleItems );

            //ecken
            new Element('img', {
                'class': 'ka-subnavi-top-left',
                'src': _path+'inc/template/admin/images/ka-submenu-top-left.png'
            }).inject( subnavi );
            new Element('img', {
                'class': 'ka-subnavi-bottom-left',
                'src': _path+'inc/template/admin/images/ka-submenu-bottom-left.png'
            }).inject( subnavi );

            var linkCount = 0;
            childs.each(function(item,key){
                
                if( item.isLink === false ) return;
                linkCount++;

                var title = (! item.titleNavi ) ? item.title : item.titleNavi;
                
                
                var smlink = new Element('a', {
                    'class': 'ka-subnavi',
                    html: _(title)
                })
                .addEvent( 'mouseover', function(){
                    mlink.store( 'allowToDisappear', false );
                })
                .addEvent( 'mouseout', function(){
                    //pLink.store( 'allowToDisappear', false );
                    mlink.fireEvent('mouseout');
                })
                .inject( subnavi );
                
                
                item.module = pModule;
                item.code = code+'/'+key;
                smlink.store('link', item);
                
                ka._links[ pModule+'/'+code+'/'+key ] = {
                    	level: 'sub',
                    	object: smlink,
                    	link: item,
                    	module: pModule,
                    	code: code+'/'+key,
                    	path: pModule+'/'+code+'/'+key,
                    	title: _(title)
                    };

                ka.linkClick( smlink );
            });

            if( linkCount == 0 ){
                return;
            }
            
            /*var pos = mlink.getPosition(ka.moduleItems);
            var size = subnavi.getSize();
            
            subnavi.setStyles({
                top: pos.y-5,
                right: (size.x)*-1
            });
            //subnavi.setStyle('display', 'none');

            mlink.addEvent('mouseover', function(){
                this.store( 'allowToDisappear', false );
                //subnavi.setStyle('display', 'block');
                subnavi.setStyle('opacity', 1);
            });
            mlink.addEvent('mouseout', function(){
                mlink.store( 'allowToDisappear', true );
                (function(){
                    if( mlink.retrieve('allowToDisappear') ){
                        //subnavi.setStyle('display', 'none');
                        subnavi.setStyle('opacity', 0);
                    }
                }).delay(100);
            });*/
        }
    });
}

ka.destroyLinkContext = function(){

	if( ka._lastLinkContextDiv ){
		ka._lastLinkContextDiv.destroy();
		ka._lastLinkContextDiv = null;
	}
	
}

ka.linkClick = function( pLink ){
    var mlink = pLink.retrieve('link');
    
    if( ['iframe', 'list', 'custom', 'add', 'edit'].indexOf(mlink.type) != -1 ){

    	var link = ka._links[mlink.module +'/'+ mlink.code];
    	
    	pLink.getParent().addClass('ka-module-items-activated');
    	
    	pLink.addEvent('click', function(e){
    		ka.destroyLinkContext();
    		
    		var e = new Event(e);
    		if( e.rightClick ) return;
    		e.stopPropagation();
    		e.stop();
    		
        	var windows = [];
        	ka.wm.windows.each(function(pwindow){
        		if( !pwindow ) return;
        		if( pwindow.code == mlink.code && pwindow.module == mlink.module ){
        			windows.include( pwindow );
        		}
        	}.bind(this));
        	
        
        	if( windows.length == 0 ){
        		//none exists, just open
        		ka.wm.openWindow( mlink.module, mlink.code );
        	} else if( windows.length == 1){
        		//only one is open, bring it to front
        		windows[0].toFront();
        	} else if( windows.length > 1){
        		//open contextmenu
        		e.stopPropagation();
        		e.stop();
        		ka._openLinkContext(link);
        	}
    	});
    	
    	pLink.addEvent('mouseup', function(e){
    		var e = new Event(e);
    		
    		if( e.rightClick ){
        		e.stopPropagation();
    			ka._openLinkContext(link);
    		}
    	});
    }
}

ka._openLinkContext = function( pLink ){
	
	if( ka._lastLinkContextDiv ){
		ka._lastLinkContextDiv.destroy();
		ka._lastLinkContextDiv = null;
	}
	
	var pos = {x:0, y:0};
	var corner = false;
	
	/*if( pLink.level == 'main' ){
		var div = new Element('div', {
			'class': 'ka-linkcontext-main'
		}).inject( document.body );

		pos = pLink.object.getPosition();
		var size = pLink.object.getSize();

		div.setStyle('left', pos.x);
		//div.setStyle('width', size.x);
	}
	if( pLink.level == 'sub' ){
		*/
	
		var parent = pLink.object.getParent('.ka-module-menu');
		if( !parent )
			parent = document.body;
		var div = new Element('div', {
			'class': 'ka-linkcontext-main ka-linkcontext-sub'
		}).inject( parent );
		
		corner = new Element('div', {
            'class': 'ka-tooltip-corner-top',
            style: 'height: 15px; width: 30px;'
        }).inject( div );

		pos = pLink.object.getPosition(pLink.object.getParent('.ka-module-menu'));
		var size = pLink.object.getSize();

		div.setStyle('left', pos.x);
		div.setStyle('top', pos.y+size.y);
		if( pLink.level == 'main' ){

			corner.setStyle('bottom', 'auto');
			corner.setStyle('top', -8);
		}
	//}
	
	
	ka._lastLinkContextDiv = div;
	
	var windows = [];
	ka.wm.windows.each(function(pwindow){
		if( !pwindow ) return;
		if( pwindow.code == pLink.code && pwindow.module == pLink.module ){
			windows.include( pwindow );
		}
	}.bind(this));
	
	var opener = new Element('a', {
		text: _('Open new %s').replace('%s', "'"+pLink.title+"'"),
		'class': 'ka-linkcontext-opener'
	})
	.addEvent('click', function(){
		ka.wm.openWindow( pLink.module, pLink.code );
		ka._lastLinkContextDiv.destroy();
	})
	.inject( div );
	
	if( windows.length == 0 )
		opener.addClass('ka-linkcontext-last');
	
	var lastItem = false;
	windows.each(function(window){
		lastItem = new Element('a', {
			text: '#'+window.id+' '+window.getTitle()
		})
		.addEvent('click', function(){
			window.toFront();
			ka._lastLinkContextDiv.destroy();
		})
		.inject( div );
	});

	if( pLink.level == 'sub' ){
		var bsize = div.getSize();
		var wsize = window.getSize();
		var mtop = div.getPosition(document.body).y;
		
		if( mtop+bsize.y > wsize.y ){
			mtop = pos.y - bsize.y;
			div.setStyle('top', mtop);
			corner.set('class', 'ka-tooltip-corner');
			corner.setStyle('bottom', '-15px');
		} else {
			corner.setStyle('top', '-7px');
		}
		if( lastItem )
			lastItem.addClass('ka-linkcontext-last');
	}
	
}




ka.renderLayoutElements = function( pDom, pClassObj ){
	
	var layoutBoxes = $H({});
    if( !pDom.getFirst() && (pDom.get('text').search(/{slot.+}/) >= 0 || pDom.get('text').search(/{content.+}/) >= 0) ){
    	
        var value = pDom.get('text');
        var type = 'slot';
        if( pDom.get('text').search(/{slot.+}/) >= 0 ){
        	value = value.substr( 6, value.length-7 );
        } else {
        	value = value.substr( 9, value.length-10 );
        	type = 'content';
        }
        
        var options = {};
        
        var exp = /([a-zA-Z0-9-_]+)=([^"']([^\s]*)|["]{1}([^"]*)["]{1}|[']{1}([^']*)[']{1})/g;
        while( res = exp.exec( value ) ){
            options[ res[1] ] = res[4];
        }
        exp = null;
        if( options.id+0 > 0 ){
        	if( type == 'slot' )
        		layoutBoxes[ options.id ] = new ka.layoutBox( pDom, options, pClassObj ); //options.name, this.win, options.css, options['default'], this, options );
        	else
        		layoutBoxes[ options.id ] = new ka.contentBox( pDom, options, pClassObj );
        }
    }
    
    if( pDom.getFirst() ){
    	pDom.getChildren().each(function(child){
    		layoutBoxes.combine( ka.renderLayoutElements( child, pClassObj ) );
        });
    }
    
    return layoutBoxes;
}







initSmallTiny = function(pId, pContentCssFile){
    return tinymce.EditorManager.init({
        document_base_url : _path,
        relative_urls : false,
        theme : 'advanced',
        mode : 'exact',
        elements: pId,
        //plugins: '-kryn,emotions,xhtmlxtras,contextmenu,inlinepopups,style, media, searchreplace, print, contextmenu, paste,fullscreen,noneditable,visualchars,template',
        plugins : 'safari,style,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template',
         theme_advanced_buttons1 : 'bold,italic,underline,|,link,image',
         theme_advanced_buttons2: 'justifyleft,justifycenter,justifyright,|,outdent,indent',
         theme_advanced_buttons3: 'formatselect',
         theme_advanced_blockformats : "default,h1,h2,h3,h4,h5",
//         theme_advanced_buttons2 : 'cut,copy,paste,pastetext,pasteword,|,bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,undo,redo,link,unlink,emotions,image,forecolor',
//         theme_advanced_buttons3 : 'styleselect,formatselect,fontselect,fontsizeselect,|,search,replace,|,outdent,indent,blockquote',
        theme_advanced_toolbar_location : 'top',
        theme_advanced_statusbar_location : 'bottom',
        theme_advanced_resizing : true,
        theme_advanced_resize_horizontal : false,
        remove_linebreaks : false,
        convert_urls : false,
        content_css: pContentCssFile,
        indentation: '10px',
        skin: 'o2k7',
        skin_variant: 'silver',
        language: (parent) ? parent._session.lang : window._session.lang
    });
}

initResizeTiny = function(pId, pContentCssFile){
    return tinymce.EditorManager.init({
        document_base_url : _path,
        relative_urls : false,
        theme : 'advanced',
        mode : 'exact',
        elements: pId,
        //plugins: '-kryn,emotions,xhtmlxtras,contextmenu,inlinepopups,style, media, searchreplace, print, contextmenu, paste,fullscreen,noneditable,visualchars,template',
        plugins : 'safari,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template',
        theme_advanced_buttons1 : 'code,|,bold,italic,underline,strikethrough,|,link,unlink,anchor,|,image,insertfile,insertimage,|,fullscreen,|,undo,redo,|,cut,copy,paste,pastetext,pasteword',
        theme_advanced_buttons2: 'justifyleft,justifycenter,justifyright,justifyfull,table,|,bullist,numlist,|,formatselect,forecolorpicker,backcolorpicker,charmap,|,pastetext,pasteword,search,replace,|,indent,outdent',
        theme_advanced_buttons3: '',
        theme_advanced_blockformats : "default,h1,h2,h3,h4,h5",
        theme_advanced_toolbar_location : 'top',
        theme_advanced_statusbar_location : 'bottom',
        theme_advanced_resizing : true,
        remove_linebreaks : false,
        convert_urls : false,
        content_css: pContentCssFile,
        indentation: '10px',
        theme_advanced_resizing : true,
        skin: 'o2k7',
        skin_variant: 'silver',
        language: (parent) ? parent._session.lang : window._session.lang
    });
}

initTinyWithoutResize = function(pId, pContentCssFile, pOnInit, pBaseUrl, pOwnOptions ){
    
    var options = {
        document_base_url : (pBaseUrl)?pBaseUrl:_path,
        relative_urls : false,
        theme : 'advanced',
        mode : 'exact',
        elements: pId,
        //plugins: '-kryn,emotions,xhtmlxtras,contextmenu,inlinepopups,style, media, searchreplace, print, contextmenu, paste,fullscreen,noneditable,visualchars,template',
        plugins : 'safari,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,autoresize',
         theme_advanced_buttons1 : 'code,|,bold,italic,underline,strikethrough,|,link,unlink,anchor,|,image,insertfile,insertimage,|,undo,redo,|,cut,copy,paste,pastetext,pasteword,|,justifyleft,justifycenter,justifyright,justifyfull,table',
         theme_advanced_buttons2: 'bullist,numlist,|,formatselect,forecolorpicker,backcolorpicker,charmap,|,pastetext,pasteword,search,replace,|,indent,outdent',
         theme_advanced_buttons3: '',
         theme_advanced_blockformats : "default,h1,h2,h3,h4,h5",
//         theme_advanced_buttons2 : 'cut,copy,paste,pastetext,pasteword,|,bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,undo,redo,link,unlink,emotions,image,forecolor',
//         theme_advanced_buttons3 : 'styleselect,formatselect,fontselect,fontsizeselect,|,search,replace,|,outdent,indent,blockquote',
        theme_advanced_toolbar_location: "external",
        remove_linebreaks : false,
        convert_urls : false,
        content_css: pContentCssFile,
        indentation: '10px',
        theme_advanced_resizing : true,
        skin: 'o2k7',
        skin_variant: 'silver',
        language: (parent) ? parent._session.lang : window._session.lang,
        setup: pOnInit
    }
        
        
    var notoverwritable = ['name', 'id', 'css', 'default', 'document_base_url', 'relative_urls', 'theme mode elements', 'theme_advanced_toolbar_location',
        'remove_linebreaks', 'convert_urls', 'theme_advanced_resizing', 'language', 'setup'];
    
    if( pOwnOptions ){
        $H( pOwnOptions ).each(function(option,key){
           if( notoverwritable.contains(key) ) return;
           if( option == 'false' ) option = false;
           if( option == 'true' ) option = true;
           options[ key ] = option;
        });
        
    }
    
    return tinymce.EditorManager.init( options );
}

initTiny = function(pId, pContentCssFile, pOnInit){
    return tinymce.EditorManager.init({
        document_base_url : _path,
        relative_urls : false,
        theme : 'advanced',
        mode : 'exact',
        elements: pId,
        //plugins: '-kryn,emotions,xhtmlxtras,contextmenu,inlinepopups,style, media, searchreplace, print, contextmenu, paste,fullscreen,noneditable,visualchars,template',
        plugins : 'safari,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,autoresize',
         theme_advanced_buttons1 : 'code,|,bold,italic,underline,strikethrough,|,link,unlink,anchor,|,image,insertfile,insertimage,|,fullscreen,|,undo,redo,|,cut,copy,paste,pastetext,pasteword,|,justifyleft,justifycenter,justifyright,justifyfull,table',
         theme_advanced_buttons2: 'bullist,numlist,|,formatselect,forecolorpicker,backcolorpicker,charmap,|,pastetext,pasteword,search,replace,|,indent,outdent',
         theme_advanced_buttons3: '',
         theme_advanced_blockformats : "default,h1,h2,h3,h4,h5",
//         theme_advanced_buttons2 : 'cut,copy,paste,pastetext,pasteword,|,bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,undo,redo,link,unlink,emotions,image,forecolor',
//         theme_advanced_buttons3 : 'styleselect,formatselect,fontselect,fontsizeselect,|,search,replace,|,outdent,indent,blockquote',
        theme_advanced_toolbar_location : 'top',
        theme_advanced_statusbar_location : 'bottom',
        theme_advanced_resizing : true,
        theme_advanced_resize_horizontal : false,
        theme_advanced_toolbar_location: "external",
        remove_linebreaks : false,
        convert_urls : false,
        content_css: pContentCssFile,
        indentation: '10px',
        theme_advanced_resizing : true,
        skin: 'o2k7',
        skin_variant: 'silver',
        language: (parent) ? parent._session.lang : window._session.lang,
        setup: pOnInit
    });
}
/*
initTiny = function(pId, pContentCssFile, pOnInit){
    return tinymce.EditorManager.init({
        document_base_url : _path,
        relative_urls : false,
        theme : 'advanced',
        mode : 'exact',
        elements: pId,
        //plugins: '-kryn,emotions,xhtmlxtras,contextmenu,inlinepopups,style, media, searchreplace, print, contextmenu, paste,fullscreen,noneditable,visualchars,template',
        plugins : 'safari,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,autoresize',
         theme_advanced_buttons1 : 'code,|,bold,italic,underline,strikethrough,|,link,unlink,anchor,|,image,insertfile,insertimage,|,fullscreen,|,undo,redo,|,cut,copy,paste,pastetext,pasteword',
         theme_advanced_buttons2: 'justifyleft,justifycenter,justifyright,justifyfull,table,|,bullist,numlist,|,formatselect,forecolorpicker,backcolorpicker,charmap,|,pastetext,pasteword,search,replace,|,indent,outdent',
         theme_advanced_buttons3: '',
         theme_advanced_blockformats : "default,h1,h2,h3,h4,h5",
//         theme_advanced_buttons2 : 'cut,copy,paste,pastetext,pasteword,|,bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,undo,redo,link,unlink,emotions,image,forecolor',
//         theme_advanced_buttons3 : 'styleselect,formatselect,fontselect,fontsizeselect,|,search,replace,|,outdent,indent,blockquote',
        theme_advanced_toolbar_location : 'top',
        //theme_advanced_statusbar_location : 'bottom',
        //theme_advanced_resizing : true,
        //theme_advanced_resize_horizontal : false,
        theme_advanced_toolbar_location: "external",

        remove_linebreaks : false,
        convert_urls : false,
        content_css: pContentCssFile,
        indentation: '10px',
        theme_advanced_resizing : true,
        skin: 'o2k7',
        skin_variant: 'silver',
        language: 'de',
        setup: pOnInit
    });
}

*/

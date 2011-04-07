/* ka window.manager */

window.addEvent('resize', function(){
	ka.wm.checkDimensions();
});


ka.wm = {

    windows: new Hash({}),

    /* depend: [was => mitWem] */
    depend: new Hash({}),
    lastWindow: 0,
    events: {},

    openWindow: function( pModule, pWindowCode, pLink, pDependOn, pParams, pInline ){
        /*
            pDependOn:
                0..x: ID of a legal window
                -1: current/active window
        */
        if( pDependOn == -1 )
            pDependOn = ka.wm.lastWindow;

        var id = pModule+'::'+pWindowCode;
        if( pLink && pLink.onlyonce && this.checkOpen( id )){
            return this.toFront( id );
        }
        return ka.wm.loadWindow( pModule, pWindowCode, pLink, pDependOn, pParams, pInline );
    },
    
    checkDimensions: function(){
    	if( ka.wm.goDimensionsCheck )
    		$clear( ka.wm.goDimensionsCheck );
    	
    	ka.wm.goDimensionsCheck = (function(){
			ka.wm._checkDimensions();
    	}).delay(300);
    },
    
    _checkDimensions: function(){
    	ka.wm.windows.each(function(win){
            if(win){
                win.checkDimensions();
    			win.fireEvent('resize');
            }
        });
    },

    addEvent: function( pEv, pFunc ){
        if( !ka.wm.events[pEv] )
            ka.wm.events[pEv] = [];

        ka.wm.events[pEv].include( pFunc );
    },

    fireEvent: function( pEv ){
        if( ka.wm.events[pEv] )
            ka.wm.events[pEv].each(function(func){
                $try(func);
            });
    },

    open: function( pTarget, pParams, pDepend ){
        var firstSlash = pTarget.indexOf( '/' );
        var module = pTarget.substr(0,firstSlash);
        var path = pTarget.substr(firstSlash+1, pTarget.length);
        return ka.wm.openWindow( module, path, null, pDepend, pParams );
    },

    dependExist: function( pWindowId ){
        var dep = false;
        ka.wm.depend.each(function(win,key){
            if( win == pWindowId )
                dep = true; //a depend exist
        });
        return dep;
    },

    getDepend: function( pWindowId ){
        //irgendwie unnötig ?
        // bzw ist doch getWindow()
        //return ka.wm.windows.get( pWindowId );
        return ka.wm.depend.get( pWindowId );
    },

    getOpener: function( pId ){
    	
    	logger('getOpener: '+pId+' ('+ ka.wm.getDepend(pId)+')');
    	logger(ka.wm.windows);
    	logger(ka.wm.depend);
    	
        return ka.wm.windows.get( ka.wm.getDepend(pId) );
    },

    getWindow: function( pId ){
        if( pId == -1 )
            pId == ka.wm.lastWindow;
        return ka.wm.windows.get( pId );
    },

    getDependOn: function( pWindowId ){
        var reswin = null;
        ka.wm.depend.each(function(win,key){
            if( win == pWindowId )
                reswin = ka.wm.windows.get(key); //a depend exist
        });
        return reswin;
    },

    sendSoftReload: function( pTarget ){
        var firstSlash = pTarget.indexOf( '/' );
        var module = pTarget.substr(0,firstSlash);
        var path = pTarget.substr(firstSlash+1, pTarget.length);
        ka.wm.softReloadWindows( module, path );
    },

    softReloadWindows: function( pModule, pCode ){
        ka.wm.windows.each(function(win){
            if( win && win.module == pModule && win.code == pCode )
                win.softReload();
        });
    },

    resizeAll: function(){
        ka.settings.get('user').set('windows', $H());
        ka.wm.windows.each(function(win){
            if(win){
                win.loadDimensions();
            }
        });
    },

    toFront: function( pWindowId ){
        if( ka.wm.dependExist( pWindowId ) ){
            return false;
        }
        if( ka.wm.lastWindow > 0 && ka.wm.windows.get( ka.wm.lastWindow ) && ka.wm.lastWindow != pWindowId ){
            ka.wm.windows.get( ka.wm.lastWindow ).toBack();
        }
        ka.wm.lastWindow = pWindowId;
        return true;
    },

    loadWindow: function( pModule, pWindowCode, pLink, pDependOn, pParams, pInline ){
        var instance = ka.wm.windows.getLength()+1;

        if( pDependOn > 0 ){
            ka.wm.depend.include( instance, pDependOn );
            var w = ka.wm.windows.get( pDependOn );
            if( w ) 
                w.toDependMode(pInline);
        }
        
        var win = new ka.kwindow( pModule, pWindowCode, pLink, instance, pParams, pInline );
        ka.wm.windows.include( instance, win );
        ka.wm.updateWindowBar();
        return win;
    },

    newListBar: function( pWindow ){
        pWindow.setBarButton( bar );
        var bar = new Element('a',{
            'class': 'wm-bar-item',
            title: pWindow.getTitle()
        });
        
        pWindow.setBarButton( bar );
        
        bar.addEvent('click', function(){
            if( pWindow.isOpen )
                pWindow.minimize();
            else
                pWindow.toFront();
        });
        shortTitle = pWindow.getTitle();
        if( shortTitle.length > 22 )
            shortTitle = shortTitle.substr(0,19)+'...';
        
        if( shortTitle == '' )
            bar.setStyle('display', 'none');

        bar.set('text', shortTitle);
        return bar;
    },

    close: function( pWindow ){
        var id = pWindow.id;

        var dependOn = ka.wm.depend.get( id );
        if( dependOn ){
            if( ka.wm.windows.get(dependOn) ){
                ka.wm.windows.get(dependOn).removeDependMode();
            }
        }
        ka.wm.windows.set( id, null );
        ka.wm.depend.erase( id );

        if( dependOn ){
            if( ka.wm.windows.get(dependOn) ){
                ka.wm.windows.get(dependOn).toFront();
            }
        }

        ka.wm.updateWindowBar();
    },

    updateWindowBar: function(){
        $('windowList').empty();
        
        var c = 0;
        ka.wm.windows.each(function(win, winId){
            if(! win ) return;
            if( win.inline ) return;
            
            var item = ka.wm.newListBar( win );
            item.inject( $('windowList') );

            if( win.isOpen ){
                item.setStyle('display', 'none');
            } else {
                c++;
            }
            return
//           if( winId == ka.wm.lastWindow )
            
            
            if( win.isOpen )
                item.set('class', 'wm-bar-item-active');
            
            
        });
        
        if( c > 0 ){
            $('windowList').setStyle('display', 'block');
            $('middle').setStyle('bottom', 25);
            //$('middle').setStyle('right', 35);
        } else {
            $('windowList').setStyle('display', 'none');
            $('middle').setStyle('bottom', 0);
            //$('middle').setStyle('right', 0);
        }
        
    },

    checkOpen: function( pModule, pCode, pInstanceId, pParams ){
        opened = false;
        ka.wm.windows.each(function(win){
            //if( win && win.module == pModule && win.code == pCode && win.params == pParams ){
            if( win && win.module == pModule && win.code == pCode ){
                if( pInstanceId > 0 && pInstanceId == win.id){
                    return;
                }
                opened = win;
            }
        });
        return opened;
    },

    closeAll: function(){  
        ka.wm.windows.each(function(win){
            if( win )
                win.close();
        });
    },

    createOverlays: function(){
        ka.wm.windows.each(function(win, winId){
            if( win )
                win.createOverlay();
        });
    },

    removeOverlays: function(){
        ka.wm.windows.each(function(win, winId){
            if( win )
                win.deleteOverlay();
        });
    }

};

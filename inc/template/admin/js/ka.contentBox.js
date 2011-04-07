ka.contentBox = new Class({

    initialize: function( pElement, pOptions, pClassObj ) {
		
    	this.win = pClassObj.win;
        this.saved = 0;
        this.contents = [];
        this.pageInst = pClassObj;
        this.contentCss = pOptions.css;
        this.alloptions = pOptions;
        
        this.defaultTemplate = pOptions['default'];

        if( pElement ) 
            pElement.empty();

        this.main = new Element('div', {
            'class': 'ka-layoutBox-main' // ka-contentBox-main'
        }).inject( pElement );

        /*this.title = new Element('div', {
            'class': 'ka-layoutBox-title',
            text: pOptions.name
        }).inject( this.main );

        this.addBtn = new Element('img', {
            'src': _path+'inc/template/admin/images/icons/add.png',
            'class': 'ka-layoutBox-add'
        })
        .addEvent('click', this.add.bind(this))
        .inject( this.title );

        this.addButtonBar();
		*/

        this.contentContainer = new Element('div', {
            'class': 'ka-layoutBox-container'
        }).inject( this.main );
        
        
        this.defaultContent = {
    		type: pOptions.type,
    		template: this.defaultTemplate,
    		hide: false,
    		noActions: true
    	};

    	this.layoutContent = new ka.layoutContent(this.defaultContent, this.contentContainer, this );
    	
    	//content.select.delay(50, content);
    	
    	//this.contents.include( this.layoutContent );

        this.contentContainer.store('layoutBox', this);
    	
    	return;
    	/*
        this.addBtn = new ka.Button(_('Add %s').replace('%s', pOptions.name))
        .addEvent('click', function(){
        	
        	this.addBtn.hide();

        	var content = new ka.layoutContent({
        		type: pOptions.type,
        		template: this.defaultTemplate,
        		'new': true,
        		hide: false,
        		noActions: true
        	}, this.contentContainer, this );
        	
        	content.addEvent('remove', function(){
	        	this.addBtn.show();
	        	this.contents = [];
        	}.bind(this));
        	content.select.delay(50, content);
        	
        	this.contents.include( content );
        }.bind(this)).inject( this.contentContainer );
        */
        
    },

    inject: function( pTo, pPos ){
        this.main.inject( pTo, pPos );
    },

    /*addButtonBar: function(){
        var p = _path+'inc/template/admin/images/icons/';

        new Element('img', {
            src: p+'page_paste.png',
            title: _('Paste'),
            'class': 'ka-layoutBox-iconBar-icon'
        })
        .addEvent('click', this.pasteAfter.bind(this))
        .inject( this.title );

        new Element('img', {
            src: p+'page_copy.png',
            title: _('Copy all'),
            'class': 'ka-layoutBox-iconBar-icon'
        })
        .addEvent('click', this.copyAll.bind(this))
        .inject( this.title );

    },*/

    /*pasteAfter: function(){
        var clip = ka.getClipboard();
        if( clip.type == 'pageItem' ){
            content = new Hash(clip.value);
            content.rsn = null;
            content['new'] = false;
            content['top'] = true;//inject to top
            var n = new ka.layoutContent( content, this.contentContainer, this );
            this.contents.include( n );
            n.main.highlight();
        }   
        if( clip.type == 'pageItems' ){
            var arr = $A(clip.value);
            for( var i = arr.length-1; i >= 0; i-- ){
                var content = arr[i];
                content.rsn = null;
                content['new'] = false;
                content['top'] = true;//inject to top
                var n = new ka.layoutContent( content, this.contentContainer, this );
                this.contents.include( n );
                n.main.highlight();
            };
        }
        this.initSort();
    },*/

    initSort: function(){
        //this.win.kwin.initContentLayoutSort(); 
    },

    copyAll: function(){
    	/*
        var mcontents = this.getContents();

        if( mcontents.length > 0 ){
            mcontents.each(function(content,id){
                mcontents[id]['new'] = false;
                mcontents[id]['top'] = false;
            });
            ka.setClipboard( mcontents.length+' Seiteninhalte kopiert.', 'pageItems', mcontents );
        }
        */
    },

    clear: function(){
    	this.layoutContent.remove();
    },

    /*add: function(){
        this.contents.include( new ka.layoutContent( {type: 'text', template: this.defaultTemplate, 'new': true, hide: false}, this.contentContainer, this ));

        //this.win._addContentToBox();
        //ka.wm.openWindow( 'admin', 'pages/manageContent', null, this.win.id, {newItem: 1, layoutBox: this });
        this.initSort();
    },

    drop: function( pType, pElement ){
        var contentObj = new ka.layoutContent( {type: pType.toLowerCase(), afterElement: pElement, hide: false, toEdit: true}, this.contentContainer, this );
        this.contents.include( contentObj );
        this.initSort();
    },*/

    setContents: function( pContents ){
        

    	this.layoutContent.remove();

    	var firstContent = false;
        if( pContents && $type(pContents) == 'array' ){
            pContents.each(function( content ){
            	if( firstContent == false )
            		firstContent = content;
            }.bind(this));
            
            if( firstContent && this.layoutContent ){
            }
        }
        
        var content = this.defaultContent;
        if( firstContent )
        	content = firstContent;
        
        content.noActions = true;
    	this.layoutContent = new ka.layoutContent( content, this.contentContainer, this );
        
    	/*if( this.saved == 0 ){
            this.savedContents = this.contents;
            this.saved = 1;
        }*/
    },

    hasChanges: function(){
        
    },

    getValue: function( pAndClose ){
        return this.getContents( pAndClose );
    },

    deselectAll: function( pWithoutContent ){
    	var selected = 0;
    	
    	if( !this.layoutContent ) return;
    	
    	if( this.layoutContent.isRemoved ) return;

    	this.layoutContent.deselectChilds();
        
    	if( this.layoutContent != pWithoutContent )
    		this.layoutContent.deselect();
    	/*
        this.contents.each(function(content){
            if( content.isRemoved ) return;
            if( content.selected ) selected++;
            if( content != pWithoutContent )
            	content.deselect();
        });
        return selected;
        */
    },

    getContents: function( pAndClose ){
    	if( !this.layoutContent ) return [];
    	if( this.layoutContent.isRemoved ) return []; 
    	
    	var res = [];
    	var content = this.layoutContent.getValue( pAndClose );
        content.noActions = null;
        res.include( content );
        return res;
        /*
        this.contentContainer.getElements('div.ka-layoutContent-main').each(function( pContent ){
            
            var layoutContent = pContent.retrieve('layoutContent');
            if( layoutContent.isRemoved ) return;
            
            res.include( layoutContent.getValue( pAndClose ) );
        }.bind(this));

        return res;
        */
    }
	
});
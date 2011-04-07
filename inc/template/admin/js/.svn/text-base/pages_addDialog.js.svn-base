var admin_pages_addDialog = new Class({

    initialize: function( pWin ){

        this.win = pWin;
        this.input = [];
        
        this.win.setTitle( _('Add pages to %s').replace('%s', this.win.params.domain_title) );
        
        this._renderLayout();
    },

    choosePlace: function( pPage, pPos ){
        if( this.lastContext ) this.lastContext.destroy();
        this.choosenPage = pPage;
        this.choosenPos = pPos;
        this.renderChoosenPlace();
    },

    renderChoosenPlace: function(){
        var pos = _('Below');
        if( this.choosenPos == 'up' )
            pos = _('Above');
        if( this.choosenPos == 'into' )
            pos = _('Into');
        this.choosenPlaceDiv.set('html', _('Position')+': <b>'+pos+' <u>'+this.choosenPage.title+'</u></b>');
    },

    _renderLayout: function(){
        var c = new Element('div', {
            style: 'position: absolute; left: 0px; right: 0px; top: 0px; bottom: 31px; overflow: auto;'
        }).inject( this.win.content );

        var leftSide = new Element('div', {
            'style': 'position: absolute; left: 0px; top: 0px; bottom: 0px; width: 52%; overflow: auto;'
        }).inject( c );
        var leftSide = new Element('div', {
            'style': 'padding: 8px;'
        }).inject( leftSide );
        
        new Element('div',{
        	style: 'padding: 3px; font-size: 13px; font-weight: bold; color: gray; padding-bottom: 25px;',
        	html: _('Step 1: Define the new item')
        }).inject( leftSide );
        
        this.type = new ka.field({
        	label: _('Type'), type: 'select', table_key: "i", table_label: "l", tableItems: [
        	     {i: 0, l: _('Page')},
        	     {i: 1, l: _('Link')},
        	     {i: 2, l: _('Folder')},
        	     {i: 3, l: _('Deposit')},
            ]
        }).inject( leftSide );
        
        this.layout = new ka.field({
        	label: _('Layout'), type: 'select', table_key: "i", table_label: "l", tableItems: []
        }).inject( leftSide );
        
        new Element('option', {
            html: _(' -- No layout --'),
            value: ''
        }).inject( this.layout.input );

        $H(ka.settings.layouts).each(function(la, key){
            var group = new Element('optgroup', {
                label: key
            }).inject( this.layout.input );
            var count = 0;
            $H(la).each(function(layoutFile,layoutTitle){
                new Element('option', {
                    html: (layoutTitle),
                    value: layoutFile
                }).inject( group );
                count++;
            })
            if( count == 0 )
                group.destroy();
        }.bind(this));
        
        this.visible = new ka.field({
        	label: _('Visible'), desc: 'Let the items be visible in frontend navigations after creating', type: 'checkbox'
        }).inject( leftSide );
        
        this.type.addEvent('change', function( pValue ){
        	if( pValue < 2){ //page or link
        		this.layout.show();
        		this.visible.show();
        	} else {
        		this.layout.hide();
        		this.visible.hide();
        	}
        }.bind(this));
/*
        this.type = new Element('select').inject( leftSide );
        new Element('option', {text: _('Page'), value: 0}).inject( this.type );
        new Element('option', {text: _('Link'), value: 1}).inject( this.type );
        new Element('option', {text: _('Folder'), value: 2}).inject( this.type );
        new Element('option', {text: 'Ablage', value: 3}).inject( this.type );
*/

        var d = new Element('div', {'class': 'ka-field-main'}).inject(leftSide);
        var de = new Element('div', {'class': 'ka-field-title'}).inject(d);
        new Element('div', {'class': 'title', html: _('Titles')}).inject(de);
        new Element('div', {'class': 'desc', html: _('Enter here the titles of the new items. Each item in one field.')}).inject(de);
        
        this.inputPane = new Element('ol', {
            style: 'padding-left: 25px;'
        }).inject( leftSide );
        this.addInput();
        this.addInput();
        this.addInput();

        var addImg = new Element('img', {
            src: _path+'inc/template/admin/images/icons/add.png',
            style: 'cursor: pointer; position: relative; top: 4px; margin-right: 3px;'
        })
        .addEvent('click', this.addInput.bind(this))
        .inject( this.inputPane, 'after' );
        
        new Element('span',{
        	text: _('More items'),
        	style: 'cursor: pointer;'
        })
        .addEvent('click', this.addInput.bind(this))
        .inject(addImg, 'after');

        var rightSide = new Element('div', {
            'style': 'position: absolute; right: 0px; top: 0px; bottom: 0px; width: 48%; overflow: auto;border-left: 1px solid silver;'
        }).inject( c );
        
        var rightSide = new Element('div', {
            'style': 'padding: 8px; padding-left: 10px;'
        }).inject( rightSide );
        

        new Element('div',{
        	style: 'padding: 3px; font-size: 13px; font-weight: bold; color: gray;',
        	html: _('Step 2: Define the position')
        }).inject( rightSide );

        new Element('div',{
        	style: 'padding: 3px; color: gray; padding-bottom: 15px;',
        	html: _('To define the position, click on a target and choose a direction. You will see a information about the position in the left bottom area of this window.')
        }).inject( rightSide );

        this.lastContext = null;

        this.win.content.addEvent('mouseover', function(){
            if( this.lastContext ) this.lastContext.destroy();
        }.bind(this));

        new ka.pagesTree( rightSide, this.win.params.domain_rsn, {
            move: false,
            noActive: true,
            onSelection: function( pPage, pTitle, pDomain ){
                if( this.lastContext ) this.lastContext.destroy();
                
                if( pDomain ){
                	if( !ka.checkPageAccess( pPage.domain_rsn, 'addPages', 'd') ){
                    	return;
                    }
                } else {
	                if( !ka.checkPageAccess( pPage.rsn, 'addPages', 'p') ){
	                	return;
	                }
                }
                
                this.lastContext = new Element('div',{
                    'class': 'pagesTree-context-move'
                })
                .addEvent( 'mouseover', function(e){
                    e.stop();
                })
                .inject( this.win.content );
                
                if(! pDomain ){
                    new Element( 'a', {
                        text: _('Above'),
                        'class': 'up'
                    })
                    .addEvent( 'click', function(){ this.choosePlace( pPage, 'up' )}.bind(this))
                    .inject( this.lastContext );
                }
                new Element( 'a', {
                    text: _('Into'),
                    'class': 'into'
                })
                .addEvent( 'click', function(){ this.choosePlace( pPage, 'into' )}.bind(this))
                .inject( this.lastContext );
                
                if(! pDomain ){
                    new Element( 'a', {
                        text: _('Below'),
                        'class': 'down'
                    })
                    .addEvent( 'click', function(){ this.choosePlace( pPage, 'down' ) }.bind(this))
                    .inject( this.lastContext );
                }
                
                var pos = pTitle.getPosition( this.win.content );
                Y = 0;
                
                if(! pDomain )
                    Y = 19;
                
                this.lastContext.setStyles({
                    left: pos.x,
                    top: pos.y-Y+rightSide.scrollTop
                });
            }.bind(this)
        });


        this.bottom = new Element('div', {
        	'class': 'kwindow-win-buttonBar' }).inject( this.win.content );

        this.saveBtn = new ka.Button(_('Cancel')).addEvent('click', function(){ this.win.close(); }.bind(this)).inject( this.bottom );

        this.saveBtn = new ka.Button(_('Add')).addEvent('click', this.addPages.bind(this)).inject( this.bottom );

        this.choosenPlaceDiv = new Element('div', {
            style: 'position: absolute; top: 6px; left: 6px; font-weight: bold; color: white; font-size: 12px;',
            html: _('No position choosen.')
        }).inject( this.bottom );

    },

    addPages: function(){
        var req = {};
        var c = 1;
        this.input.each(function(myi){
            req['field_'+c] = myi.value;
            c++;
        });
        req.pos = this.choosenPos;
        if(! this.choosenPage ){
            this.win._alert(_('Please choose a position.'));
            return;
        }
        req.rsn = this.choosenPage.rsn;
        req.domain_rsn = this.choosenPage.domain_rsn;
        req.type = this.type.getValue();
        req.layout = this.layout.getValue();
        req.visible = this.visible.getValue();

        new Request.JSON({url: _path+'admin/pages/add', noCache: 1, async: false, onComplete: function(){
            this.win.params.onComplete( req.domain_rsn );
            this.win.close();
        }.bind(this)}).post(req);

    },

    addInput: function(){
        var p = new Element('li', {'class': 'ka-field-field'}).inject( this.inputPane );
        var input = new Element('input', {'class': 'text', type: 'text'})
        .addEvent('keydown', function(pEv){
        	pEv = new Event(pEv);
        	if( pEv.key == 'tab' && this.input.indexOf( input ) == this.input.length-1 ){
        		var newfield = this.addInput();
        		(function(){
        			newfield.focus();
        		}).delay(100);
        	}
        }.bind(this))
        .inject( p )
        this.input.include( input );
        return input;
    }
});

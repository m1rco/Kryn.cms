ka.tabPane = new Class({
    Implements: Events,
    initialize: function( pParent ){
        this.box = new Element('div', {
            'class': 'kwindow-win-tabPane'
        }).inject( pParent );

        this.buttonGroup = new ka.smallTabGroup( this.box );
        this.buttonGroup.box.setStyle('position', 'relativ').setStyle('top', 1);
        this.clearer = new Element('div', {style: 'clear: both'}).inject( this.box );
        this.paneBox = new Element('div', {'class': 'kwindow-win-tabPane-pane'}).inject( this.box );
        
        this.index = 0;
        this.panes = [];
        this.buttons = [];
    },
    
    setHeight: function( pHeight ){
    	
    	this.paneBox.setStyle('height', pHeight);
    	
    },
    
    rerender: function(){
    	this.buttonGroup.rerender();
    },
    
    addPane: function( pTitle, pImageSrc ){
    	var id = this.panes.length;
    	var res = {};
    	res.pane = new Element('div').inject(this.paneBox);
    	
		this.panes.include(res.pane);
    	
    	var btn = this.buttonGroup.addButton( pTitle, this._to.bind(this,id), pImageSrc );
    	
    	this.buttons.include(btn);
    	res.button = btn;
    	return res;
    },
    
    _to: function( id ){
    	this.fireEvent('change', id);
    	this.to(id);
    },
    
    to: function( id ){
		this.index = id;
		
		this.panes.each(function(pane){
			pane.setStyle('display', 'none');
		});
		this.buttons.each(function(button){
			button.setPressed(false);
			button.setStyle('border-bottom', '1px solid #EEEEEE');
		})
		
		this.buttons[ id ].setPressed(true);
		this.buttons[ id ].setStyle('border-bottom', '0px');
		this.panes[ id ].setStyle('display', 'block');
		
	},

    destroy: function(){
        this.box.destroy();
    },

    inject: function( pTo, pWhere ){
        this.box.inject( pTo, pWhere );
    },

    hide: function(){
        this.box.setStyle('display', 'none');
    },

    show: function(){
        this.box.setStyle('display', 'block');
    }
});

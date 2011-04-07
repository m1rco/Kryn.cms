ka.Button = new Class({
	
    initialize: function( pTitle, pOnClick, pTooltip ){
        this.main= new Element('a',{
            'class': 'ka-Button ka-button',
            href: 'javascript: ;',
            text: ($type(pTitle)=='string')?pTitle:'',
            title: (pTooltip)?pTooltip:null
        }).addEvent('mousedown', function(e){
            this.set('class', 'ka-Button ka-button ka-Button-active' );
            e.stop();
        }).addEvent('mouseup', function(){
            this.set('class', 'ka-Button ka-button' );
        }).addEvent('mouseout', function(){
            this.fireEvent('mouseup');
        });
        
        
        if( $type(pTitle) == 'element' && pTitle.inject )
        	pTitle.inject( this.main );
        
        new Element('span').inject( this.main );
        if( pOnClick )
            this.main.addEvent('click', pOnClick );
    },

    toElement: function(){
        return this.main;
    },

    setStyle: function( p1, p2 ){
        this.main.setStyle( p1, p2 );
        return this;
    },
    
    setStyles: function( p1 ){
        this.main.setStyles( p1 );
        return this;
    },

    inject: function( p1, p2 ){
        this.main.inject( p1, p2 );
        return this;
    },

    addEvent: function( p1, p2 ){
        this.main.addEvent( p1, p2 );
        return this;
    },

    fireEvent: function( p1 ){
        this.main.fireEvent( p1 );
        return this;
    },
    
    getParent: function( p1 ){
        this.main.getParent( p1 );
        return this;
    },
    
    removeEvents: function( p1 ){
        this.main.removeEvents( p1 );
    },

    set: function( p1, p2 ){
        this.main.set( p1, p2 );
        return this;
    },

    focus: function(){
        this.main.focus();
    },

    startTip: function( pText ){
        if( !this.toolTip )
            this.toolTip = new ka.tooltip( this.main, pText );
        
        this.toolTip.setText( pText );
        this.toolTip.show();
    },

    stopTip: function( pText ){
        this.toolTip.stop( pText );
    },

    show: function(){
        this.main.setStyle('display', 'inline');
    },

    hide: function(){
        this.main.setStyle('display', 'none');
    }
});

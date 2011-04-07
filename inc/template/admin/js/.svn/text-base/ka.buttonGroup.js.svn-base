ka.buttonGroup = new Class({
    initialize: function( pParent ){
        this.buttons = [];
        this.box = new Element('div', {
            'class': 'kwindow-win-buttonGroup'
        }).inject( pParent );
        
        this.boxWrapper = new Element('div', {
        	'class': 'kwindow-win-buttonGroup-wrapper'
        }).inject( this.box );
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
    },

    rerender: function(){
        var c = 1;
        var extraWidth = 0;
        this.boxWrapper.getChildren().each(function(button){

            if( button.retrieve('visible') == false ) return;
            
            if( button.getElement('select') )
                extraWidth += button.getElement('select').getSize().x-28;

            var myclass = 'kwindow-win-buttonWrapper';

            if( button.get('class').indexOf( 'buttonHover' ) >= 0 )
                myclass += ' buttonHover';

            if(c == 1)
                myclass += ' kwindow-win-buttonWrapperFirst';

            button.set('class', myclass );
            button.store('oriClass', myclass);
            
            lastButton = button;
            c++;
        }.bind(this));

        /*var lastButton = null;
        this.boxWrapper.getElements('a').each(function(b){
            if( b.retrieve('visible') == true )
                lastButton = b;
        });

        if( lastButton ){*/
        	lastButton.set('class', lastButton.get('class')+' kwindow-win-buttonWrapperLast');
        	lastButton.store('oriClass', lastButton.get('class'));
        //}
        //c--;

        this.boxWrapper.setStyle('width', (c*32)+extraWidth );
        
        c--;
        this.box.setStyle('width', (c*29)+extraWidth );
        
//        var width = (Browser.Engine.trident)?:this.box.
        var width = this.boxWrapper.offsetWidth+0;
        this.box.setStyle('display', 'block');
        
        if( width > 0 )
        	this.boxWrapper.setStyle('width', width-3 );

    },
    
    addButton: function( pTitle, pButtonSrc, pOnClick ){

        var wrapper = new Element('a', {
            'class': 'kwindow-win-buttonWrapper',
            styles: {
                'background-image': 'url('+pButtonSrc+')'
            }
        })
        .inject( this.boxWrapper );

        if( $type(pTitle) == 'string' ) 
            wrapper.set( 'title', pTitle );
        else if( pTitle && pTitle.inject ){
            pTitle.inject( wrapper );
            wrapper.setStyle('padding', '3px 0px');
        }

        if( pOnClick )
            wrapper.addEvent('click', pOnClick );
        
        var _this = this;
        wrapper.hide = function(){
            wrapper.store( 'visible', false );
            wrapper.setStyle( 'display', 'none' );
            _this.rerender();
        }

        wrapper.startTip = function( pText ){
            if( !this.toolTip )
                this.toolTip = new ka.tooltip( wrapper, pText );
            this.toolTip.setText( pText );
            this.toolTip.show();
        }

        wrapper.stopTip = function( pText ){
        	if( this.toolTip )
        		this.toolTip.stop( pText );
        }

        wrapper.show = function(){
            wrapper.store( 'visible', true );
            wrapper.setStyle( 'display', 'inline' );
            _this.rerender();
        }

        wrapper.store('oriClass', wrapper.get('class'));

        wrapper.setPressed = function( pPressed ){
            if( pPressed )
                wrapper.set('class', wrapper.retrieve('oriClass')+' buttonHover');
            else
                wrapper.set('class', wrapper.retrieve('oriClass'));
        }

        wrapper.store( 'visible', true );
        this.buttons.include( wrapper );
        _this.rerender();

        return wrapper;
    }
});

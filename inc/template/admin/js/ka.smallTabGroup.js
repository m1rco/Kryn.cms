ka.smallTabGroup = new Class({
    initialize: function( pParent ){
        this.buttons = [];
        this.box = new Element('div', {
            'class': 'kwindow-win-tabGroup kwindow-win-smallTabGroup'
        }).inject( pParent );
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

    rerender: function( pFirst ){
        var c = 1;
        var lastButton = null;
        this.buttons.each(function(button){

            if( button.retrieve('visible') == false ) return;

            var myclass = 'kwindow-win-tabWrapper kwindow-win-smallTabWrapper';


            if(c == 1)
                myclass += ' kwindow-win-tabWrapperFirst';

            if( button.get('class').indexOf( 'buttonHover' ) >= 0 )
                myclass += ' buttonHover';

            button.set('class', myclass );
            
            lastButton = button;
            c++;
        }.bind(this));

        if( lastButton ){
        	lastButton.addClass('kwindow-win-tabWrapperLast');
        }
        c--;
    },
    
    addButton: function( pTitle, pOnClick, pImageSrc ){

        var wrapper = new Element('a', {
            'class': 'kwindow-win-tabWrapper kwindow-win-smallTabWrapper',
            title: pTitle,
            text: pTitle
        })
        .inject( this.box );
        
        if( pImageSrc ){
        	new Element('img',{
        		src: pImageSrc
        	}).inject( wrapper, 'top' );
        }
        
        if( pOnClick )
            wrapper.addEvent('click', pOnClick );
        
        var _this = this;
        wrapper.hide = function(){
            wrapper.store( 'visible', false );
            wrapper.setStyle( 'display', 'none' );
            _this.rerender();
        }

        wrapper.show = function(){
            wrapper.store( 'visible', true );
            wrapper.setStyle( 'display', 'inline' );
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
        
        wrapper.setPressed = function( pPressed ){
            if( pPressed ){
                wrapper.addClass('buttonHover');
            } else
                wrapper.removeClass('buttonHover');
        }

        wrapper.store( 'visible', true );
        this.buttons.include( wrapper );
        _this.rerender( true );

        return wrapper;
    }
});

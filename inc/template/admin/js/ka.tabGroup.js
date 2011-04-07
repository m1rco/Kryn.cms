ka.tabGroup = new Class({
    initialize: function( pParent ){
        this.buttons = [];
        this.box = new Element('div', {
            'class': 'kwindow-win-tabGroup'
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
        this.box.setStyle('display', 'inline');
    },

    rerender: function( pFirst ){
        var c = 1;
        var lastButton = null;
        this.buttons.each(function(button){

            if( button.retrieve('visible') == false ) return;

            var myclass = 'kwindow-win-tabWrapper';


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
        /*this.box.setStyle('width', 1 );
        this.box.setStyle('width', this.box.scrollWidth );*/
    },
    
    addButton: function( pTitle, pButtonSrc, pOnClick ){

        var wrapper = new Element('a', {
            'class': 'kwindow-win-tabWrapper',
            title: pTitle,
            text: pTitle,
            styles: {
                'background-image': 'url('+pButtonSrc+')'
            }
        })
        .inject( this.box );
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
                wrapper.addClass('buttonHover'); //('class', wrapper.retrieve('oriClass')+' buttonHover');
            } else
                wrapper.removeClass('buttonHover'); //, wrapper.retrieve('oriClass'));
        }

        wrapper.store( 'visible', true );
        this.buttons.include( wrapper );
        _this.rerender( true );

        return wrapper;
    }
});

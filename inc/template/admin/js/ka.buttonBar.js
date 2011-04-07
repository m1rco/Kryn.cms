ka.buttonBar = new Class({
    initialize: function( pParent ){
        this.buttons = [];
        this.box = new Element('div', {
            'class': 'kwindow-win-buttonBar'
        }).inject( pParent );
    },
    
    destroy: function(){
        this.box.destroy();
    },

    inject: function( pTo, pWhere ){
        this.box.inject( pTo, pWhere );
        return this;
    },

    hide: function(){
        this.box.setStyle('display', 'none');
        return this;
    },

    show: function(){
        this.box.setStyle('display', 'block');
        return this;
    },

    addButton: function( pTitle, pOnClick ){
        return new ka.Button(pTitle).addEvent('click', pOnClick).inject( this.box );
    }
/*
    rerender: function( pFirst ){
        var c = 1;
        this.buttons.each(function(button){

            if( button.retrieve('visible') == false ) return;

            var myclass = 'kwindow-win-buttonWrapper';

            if( button.get('class').indexOf( 'buttonHover' ) >= 0 )
                myclass += ' buttonHover';

            if(c == 1)
                myclass += ' kwindow-win-buttonWrapperFirst';

            button.set('class', myclass );
            if( pFirst )
                button.store('oriClass', myclass);
            c++;
        }.bind(this));

        var lastButton = null;
        this.box.getElements('a').each(function(b){
            if(b.retrieve('visible') == true )
                lastButton = b;
        });

        lastButton.set('class', lastButton.get('class')+' kwindow-win-tabWrapperLast');
        lastButton.store('oriClass', lastButton.get('class'));

        c--;
        this.box.setStyle('width', 1 );
        this.box.setStyle('width', this.box.scrollWidth );
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

        wrapper.setPressed = function( pPressed ){
            if( pPressed )
                wrapper.set('class', wrapper.retrieve('oriClass')+' buttonHover');
            else
                wrapper.set('class', wrapper.retrieve('oriClass'));
        }

        wrapper.store( 'visible', true );
        this.buttons.include( wrapper );
        _this.rerender( true );

        return wrapper;
    }
    */
});

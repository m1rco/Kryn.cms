ka.helpsystem = new Class({

    initialize: function( pDesktop ){
        this.desktop = pDesktop;
        
        this.boxes = [];
        
        this.container = new Element('div', {
            'class': 'ka-helpsystem-container'
        }).inject( this.desktop );
        
    },
    
    _update: function(){
    
    
        var size = $('desktop').getSize();
        var maxHeight = size.y - 10;
        logger( size.y );
        var curHeight = 0;
        
        for( var i = this.boxes.length-1; i> 0; i--){
            var box = this.boxes[i];
            var index = i;    
        
        
        //this.boxes.each(function(box, index){
        
            logger(index+': '+curHeight +' => '+maxHeight );
            curHeight += box.getSize().y;
            logger(index+': '+curHeight +' => '+maxHeight );
            
            if( curHeight > maxHeight )
                box.destroy();
        
        //});
        }
    
    },
    
    newBubble: function( pTitle, pText, pDelay ){
        
        var box = new Element('div', {
            'class': 'ka-helpsystem-bubble',
            styles: {
                opacity: 0
            }
        }).inject( this.container, 'top' );
        this.boxes.include( box );
        
        new Element('h3', {
            html: pTitle
        }).inject( box );
        
        if( pText ){
            new Element('div', {
                'class': 'ka-helpsystem-bubble-desc',
                html: pText
            }).inject( box );
        }
        
        var delay = 4000; //4sec
        if( pDelay > 0 ) delay = pDelay;
        
        var die = (function(){
            box.set('tween', {onComplete: function(){
                box.destroy();
            }});
            box.tween('opacity', 0);
        })
        
        die.delay( delay );
        
        new Element('a', {
            text: 'x',
            'class': 'ka-helpsystem-bubble-closer'
        })
        .addEvent('click', die)
        .inject( box );
    
        box.tween('opacity', 1);        
        this._update();
        
        box.die = die;
        return box;
    }

});
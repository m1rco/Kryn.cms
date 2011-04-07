ka.tooltip = new Class({

    direction: false,

    initialize: function( pTarget, pText, pDirection, pContainer ){
        this.target = pTarget;
        this.text = pText;
        
        if( pDirection )
            this.direction = pDirection;
        
        this.container = pContainer;
        this.start();
    },

    start: function(){
        
        var tparent = this.target.getParent('div.kwindow-border');

        if( !tparent ){
            if( this.target.get('class').contains('ka-Button') ){
                tparent = this.target.getParent();
            } else {
                tparent = document.body; 
            }
        }
        
        if( this.container )
        	tparent = this.container;

        this.container = tparent;
    
        this.main = new Element('div', {
            'class': 'ka-tooltip',
            styles: {
                opacity: 0
            }
        }).inject(tparent);

        this.bg = new Element('div', {
            'class': 'ka-tooltip-bg',
            styles: {
                opacity: 0.7
            }
        }).inject( this.main )
        .set('tween', {duration: 400});

        this.corner = new Element('div', {
            'class': 'ka-tooltip-corner'+((this.direction == false)?'':'-'+this.direction)
        }).inject( this.bg );

        this.textDiv = new Element('div', {
            'class': 'ka-tooltip-text',
            html: this.text
        }).inject( this.main );

        this.createLoader();
        
        return this;
    },

    createLoader: function(){
        this.loader = new Element('img', {
            'class': 'ka-tooltip-loader',
            align: 'left',
            src: _path+'inc/template/admin/images/ka-tooltip-loading.gif'
        }).inject( this.textDiv, 'top' );
    },

    stop: function( pText ){
        if( pText ) {
            this.setText( pText );
            this.destroyTimer = (function(){
                this.destroy();
             }.bind(this)).delay(800);
        } else {
            this.destroy();
        }
        return this;
    },

    setText: function( pText ){
        this.text = pText;
        this.textDiv.set('html', pText);
        this.createLoader();
    },

    destroy: function(){
        this.main.set('tween', {onComplete: function(){
            this.main.destroy();
            this.main = null;
        }.bind(this)});
        this.main.tween('opacity', 0);
    },

    show: function(){
        if( this.destroyTimer ){
            $clear( this.destroyTimer );
            if(this.main)
                this.main.set('tween', {onComplete: $empty});
        }
        if(!this.main) this.start();
        this.main.tween('opacity', 1);
        this.updatePosition();
        this.blink();
    },

    updatePosition: function(){
    	var yOffset = 0;
        var yOffset = this.main.getSize().y;
        
        if( this.direction == 'top' ){
            yOffset = 14 + this.target.getSize().y+33;
        }


        var position = 'leftTop';
        var edge = 'bottomLeft';
        var offset = {y: -7, x: -3};
        
        if( this.direction == 'top' ){
            position = 'leftBottom';            
            edge = 'topLeft';
            offset = {y: 7, x: -3};
        }
        
        if( this.direction == 'left' ){
            position = 'rightCenter';            
            edge = 'centerLeft';
            offset = {y: 0, x: 7};
        }

        this.main.position({
            relativeTo: this.target,
            position: position,
            edge: edge,
            offset: offset
 //           edge: 'centerLeft',
 //           offset: {y: yOffset, x:+1 +(this.target.getSize().x/4)-10}
        });
    },

    hide: function(){
        this.main.setStyle('opacity', 0);
    },

    blink: function(){
        this.bg.tween('opacity', 0.7);
        (function(){
            this.bg.tween('opacity', 1);
        }.bind(this)).delay(400);
        this.blink.delay(1400,this);
    },

});

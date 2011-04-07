ka.loader = new Class({
    initialize: function( pTooltip, pTransBg ){

        
        this.src = _path+'inc/template/admin/images/';
        if( pTooltip == true )
            this.src += 'ka-tooltip-loading.gif';
        else
            this.src += 'loading.gif';
    
        this.main = new Element('div', {
            styles: {
                left: 0, right: 0, 'top': 0, bottom: 0, position: 'absolute',
                display: 'none'
            }
        });
        
        if( !pTransBg ){
            this.main.setStyle('background-color', '#eee');
        } else {
            this.transBg = new Element('div', {
                style: 'position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; background-color: #eee;',
                styles: {
                    opacity: 0.8
                }
            });
        }
        
        this.loadingTable = new Element('table', {
            cellpadding: 0, cellspacing: 0,
            styles: {
                width: '100%', height: '100%'
            }
        }).inject( this.main );
        var tr = new Element('tr').inject( this.loadingTable );
        var td = new Element('td', {align: 'center', valign: 'center', width: '100%', height: '100%'}).inject( tr );
        this.img = new Element('img', {src: this.src}).inject( td );
    },

    setStyle: function( p, p2 ){
        this.main.setStyle( p, p2 );
    },
    
    destroy: function(){
    	if( this.main )
    		this.main.destroy();
        if( this.transBg )
        	this.transBg.destroy();
    },

    inject: function( pTarget, pWhere ){
        this.main.inject( pTarget, pWhere );
        
        
        if( this.transBg )
            this.transBg.inject( this.main, 'before' );
        
        return this;
    },

    show: function(){
        this.main.setStyle('display', 'block');
        
        if( this.transBg )
            this.transBg.setStyle('display', 'block');
            
        return this;
    },

    hide: function(){
        this.main.setStyle('display', 'none');
        
        if( this.transBg )
            this.transBg.setStyle('display', 'none');
            
        return this;
    }
});

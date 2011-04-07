var admin_pages_choosePic = new Class({
    initialize: function( pWin ){
        this.win = pWin;
        this._load();
    }, 

    _load: function(){
        var types = { pictures: { selected: this.win.params.pic, handle: this.choose.bind(this) } };
        this.fb = new ka.fb( types );
        this.fb.inject( this.win.content );

        var buttonOk = new Element( 'input', {
            type: 'button',
            value: 'Ok'
        }).addEvent( 'click', function(){
            if( this.fb.pictures.path != '' )
                this.choose( this.fb.pictures.path );
        }.bind(this));
    },

    choose: function( pSrc ){
        this.win.params.input.value = pSrc;
        this.win.params.image.src = pSrc;
        this.win.close();
    }
});

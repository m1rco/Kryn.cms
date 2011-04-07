var admin_pages_choosePage = new Class({

    initialize: function( pWin ){

        this.win = pWin;
        this.win.content.setStyle('overflow', 'hidden');
        this.input = [];
        this._renderLayout();
    },

    choosePlace: function( pPage, pPos ){
        if( this.lastContext ) this.lastContext.destroy();
        this.choosenPage = pPage;
        this.choosenPos = pPos;
        this.renderChoosenPlace();
    },

    _renderLayout: function(){
        var c = new Element('div', {
            style: 'position: absolute; left: 0px; right: 0px; top: 0px; bottom: 30px; overflow: auto;'
        }).inject( this.win.content );

        this.pagesPane = new Element('div').inject( c );
        this.win.content.addEvent('mouseover', function(){
            if( this.lastContext ) this.lastContext.destroy();
        }.bind(this));

        new ka.pagesTree( this.pagesPane, this.win.params.domain_rsn, {
            onSelection: function( pPage, pTitle, pDomain ){
                this.page = pPage;
            }.bind(this),
            select_rsn: this.win.params.select_rsn
        });


        this.bottom = new Element('div', {
            'class': 'button-list'
        }).inject( this.win.content );

        new ka.Button('Abbrechen').addEvent('click', function(){
            this.win.close();
        }.bind(this)).inject( this.bottom );

        this.saveBtn = new ka.Button('OK').setStyle('margin-left', 5)
        .addEvent('click', function(){
            if( this.page && this.page.rsn > 0 ){
                this.win.params.onChoose( this.page );
                this.win.close();
            } else
                alert( 'Bitte erst ein Punkt auswählen' );
        }.bind(this)).inject( this.bottom );

        this.choosenPlaceDiv = new Element('div', {
            style: 'position: absolute; top: 3px; left: 3px;'
        }).inject( this.bottom );

    }

});

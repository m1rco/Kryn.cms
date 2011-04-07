var admin_backend_tinyDialog = new Class({

    initialize: function( pWin ){
        this.win = pWin;
        var _this = this;
        this.win.forceOverlay = true;

        var url = pWin.params.url;
        var popupId = ka.tinyPopup2Win.getLength()+1;
        ka.tinyPopup2Win.include( popupId, this.win );
        url += '?kPopupId='+popupId;
        url += '&kWinId='+this.win.id;

        logger('newIFRAME: '+this.win.id);
//        var iframe = new Element( 'iframe', {
        var iframe = new IFrame('iframe', {
            src: url,
            frameborder: 0,
            width: '100%',
            height: '100%',
            styles: {
                border: 0
            },
            events: {
                load: function(){
                    //this.contentWindow.win = pWin;
                    //if( this.contentWindow.kload )
                    //   this.contentWindow.kload();
                //    this.contentWindow.tinyMCEPopup.init();
                //    this.contentWindow.tinyMCEPopup._onDOMLoaded();
                }
            }
        }).inject( pWin.content );
        this.win.iframe = iframe;
//        iframe.set('src', pWin.params.url );
    }
});

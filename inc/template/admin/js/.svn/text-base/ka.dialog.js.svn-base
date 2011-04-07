ka._dialog = {};

//ka._dialog.zIndex = 100100101;
//300002: tinymce zindex
//ka._dialog.zIndex = 10002;
ka._dialog.zIndex = 400000;

ka.dialog = new Class({
    Extends: ka.kwindow,

    initialize: function( pModule, pWindowCode, pLink, pInstanceId, pParams ){
    //initialize: function( pTitle, pStyles ){
        this.parent(  pWindowCode, pLink, pInstanceId, pParams );

        new Asset.css( _path+'inc/template/admin/dialog.css' );
        this._createBg();
        this.dialog = new Element( 'div', {
            'class': 'dialog'
        });
        if( pStyles )
            this.dialog.setStyles(pStyles);
        this.dialog.setStyle( 'z-index', ka._dialog.zIndex );
        ka._dialog.zIndex++;
        this.title = new Element( 'h1', { html: pTitle } ).inject( this.dialog );
        this.content = new Element( 'div', { 'class': 'dialog-content'} ).inject( this.dialog );
        this.actions = new Element( 'div', { 'class': 'actions' }).inject( this.dialog );
        this.dialog.inject( document.body );
    },

    addButton: function( pButton ){
        pButton.inject( this.actions );
    },

    close: function(){
        this.bg.destroy();
        this.dialog.destroy();
    },

    getContent: function(){
        return this.content;
    },

    _createBg: function(){
        this.bg = new Element( 'div', {
            'id': 'ka.dialog.__bg',
            'styles': {
                'opacity': 0.8,
                'background-color': 'silver',
                'position': 'absolute',
                'left': 0, 'top': 0,
                'right': 0, 'bottom': 0,
                'z-index': 10001
            }
        }).inject( document.body );
    }
});

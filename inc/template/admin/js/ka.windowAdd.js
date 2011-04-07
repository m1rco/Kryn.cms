ka.windowAdd = new Class({
    Extends: ka.windowEdit,
    initialize: function( pWin ){
        this.windowAdd = true;
        this.parent(pWin);
    },
    loadItem: function(){
        //ist in render() am ende also lösche unnötigen balast
        this.loader.hide();
        this.saveNoClose.hide();
    }
});

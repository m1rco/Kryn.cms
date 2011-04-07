ka.layoutElement = new Class({

	Implements: ka.Base,
	
	initialize: function( pObjInstance, pContainer, pInitialTemplate ){

		this.container = pContainer;
		this.win = pObjInstance.win;
		
		this.objInstance = pObjInstance;
		
		this.layout = this.container;
		
		if( pInitialTemplate )
			this.loadTemplate( pInitialTemplate );
		
	},
	
	getValue: function(){
		var res = {};
		this.layoutBoxes.each(function(layoutBox, boxId){
			res[ boxId ] = layoutBox.getValue();
		}.bind(this));
		return res;
	},
	
	setValue: function( pVal ){
		
		this.setThisValue = pVal;
		logger("setValue");
		logger(pVal);
		
		if( this.loadingDone )
			this._setValue();
		
	},
	
	_setValue: function(){
		if( this.setThisValue ){
			
			this.layoutBoxes.each(function(layoutBox, boxId){
				layoutBox.clear();
				layoutBox.setContents( this.setThisValue[boxId] );
			}.bind(this));
			
		}
	},
	
	loadTemplate: function( pTemplate ){
		
		if( this.template == pTemplate ) return;
		
		this.template = pTemplate;
		
		this.layout.empty();
		
		this.mkTable( this.layout ).set('height', '100%');
		this.mkTr();
		var td = this.mkTd().set('align', 'center').set('valign', 'center');
		
		new Element('img', {
			 src: _path+'inc/template/admin/images/ka-tooltip-loading.gif'
		}).inject(td);

		this.loadingDone = false;

		new Request.JSON({
			url: _path+'admin/backend/loadLayoutElementFile/',
			noCache: 1,
			onComplete: this.renderLayout.bind(this)
		}).post({template: pTemplate});
		
	},
	
	deselectAll: function(  ){
		
		if( !this.layoutBoxes ) return;
		
		this.layoutBoxes.each(function(box,id){
			box.deselectAll();
        });
		
	},
	
	renderLayout: function( pTemplate ){
		if( ! pTemplate || !pTemplate.layout ) return;
		
		this.layout.set('html', pTemplate.layout);
		/*
		var div = new Element('div',{
			style: 'padding-top: 35px;',
			html: pTemplate.layout
		}).inject( this.container );
		*/
		
		this.layoutBoxes = ka.renderLayoutElements( this.layout, this.objInstance );
		
		this.loadingDone = true;
		this._setValue();

		if( this.objInstance.updateAccordion )
			this.objInstance.updateAccordion();
	}
	
});
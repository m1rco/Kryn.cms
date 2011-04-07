ka.Base = new Class({
	
	mkTable: function( pTarget){
		if( pTarget )
			this.oldTableTarget = pTarget;
		
		if( !pTarget && this.oldTableTarget)
			pTarget = this.oldTableTarget;
			
		var table = new Element('table', {width: '100%'}).inject(pTarget);
		new Element('tbody').inject( table );
		this.setTable( table );
		return table;
	},
	
	setTable: function( pTable ){
		this.baseCurrentTable = pTable;
		this.baseCurrentTBody = pTable.getElement('tbody');
	},
	
	mkTr: function(){
		this.currentTr = new Element('tr').inject( this.baseCurrentTBody );
		return this.currenTr;
	},
	
	mkTd: function( pVal ){
		var opts = {};
		if( $type(pVal) == 'string' ){
			opts.html = pVal;
		}
		return new Element('td', opts).inject( this.currentTr );
	}
	
});
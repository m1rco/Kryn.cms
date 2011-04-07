ka.Table = new Class({
	
	safe: false,
	
    initialize: function( pColumns, pOpts ){

        this.opts = pOpts;
        if( pOpts && pOpts.absolute == false ){
            this.main = new Element('div', {
                style: 'position: relative;'
            });
        } else {
            this.main = new Element('div', {
                style: 'position: absolute; left: 0px; right: 0px; bottom: 0px; top: 0px;'
            });
        }

        if( pColumns && $type(pColumns) == 'array' )
            this.setColumns( pColumns );

    },
    
    deselect: function(){
    	this.tableBody.getElements('tr').removeClass('active');
    },
    
    selected: function(){
    	return this.tableBody.getElement('tr.active');
    },

    inject: function( pTo, pWhere ){
        this.main.inject( pTo, pWhere );
        return this;
    },

    hide: function(){
        this.main.setStyle('display', 'none');
    },

    show: function(){
        this.main.setStyle('display', 'block');
    },
    
    loading: function( pActivate ){
    
        if( !pActivate && this.loadingOverlay ){
        
            if( this.tableBody )
                this.tableBody.setStyle('opacity', 1);
                
            this.loadingOverlay.destroy();
            
        } else if( pActivate ){
        
            if( this.tableBody )
                this.tableBody.setStyle('opacity', 0.5);
                
            if( this.loadingOverlay )
                this.loadingOverlay.destroy();
            
            this.loadingOverlay = new Element('div', {
                style: 'position: absolute; left: 0px; top: 21px; right: 0px; bottom: 0px; text-align: center;'
            }).inject( this.body );
            
            new Element('img', {
                src: _path+'inc/template/admin/images/ka-tooltip-loading.gif'
            }).inject( this.loadingOverlay );
            
            new Element('div', {
                html: _('Loading ...')
            }).inject( this.loadingOverlay );
            
            var size = this.loadingOverlay.getSize();
            this.loadingOverlay.setStyle('padding-top', (size.y/2)-50 );
            
        }
    
    
    },

    setColumns: function( pColumns ){
        this.columns = pColumns;

        if( !pColumns && $type(pColumns) != 'array' )
            return;
        
        if( this.head ) this.head.destroy();

        this.head = new Element('div', {
            'class': 'ka-Table-head-container'
        }).inject( this.main );

        if( this.opts && this.opts.absolute == false ){
            this.head.setStyle('position', 'relative');
        }

        this.tableHead = new Element('table', {
            'class': 'ka-Table-head',
            cellpadding: 0, cellspacing: 0
        }).inject( this.head, 'top' );

        var tr = new Element('tr').inject( this.tableHead );
        pColumns.each(function(column,index){
            
            new Element('th', {
                html: column[0],
                width: (column[1])?column[1]:null
            }).inject( tr );

        }.bind(this));
        
        
        if( this.body ) this.body.destroy();

        if( this.opts && this.opts.absolute == false ){
            this.body = new Element('div', {
                style: 'position: relative;'
            }).inject( this.main );
        } else {
            this.body = new Element('div', {
                style: 'position: absolute; left: 0px; top: 21px; right: 0px; bottom: 0px; overflow-y: scroll;'
            }).inject( this.main );
        }

        this.tableBody = new Element('table', {
            'class': 'ka-Table-body',
            cellpadding: 0, cellspacing: 0
        }).inject( this.body, 'bottom' );

    },
    
    addRow: function( pValues, pIndex ){
    	
    	if( !pIndex )
    		pIndex = this.tableBody.getElements('tr').length+1;
    	
    	if( !this.classTr || this.classTr == 'two' )
    		this.classTr = 'one';
    	else
    		this.classTr = 'two';
    	
    	var row = pValues;
    	
    	var tr = new Element('tr', {
            'class': this.classTr
        }).inject( this.tableBody );
    	tr.store('rowIndex', pIndex);
    	
        var count = 0;
        this.columns.each(function(column,index){
            
            var html = "";
            if( ($type(row[count]) == 'string' || $type(row[count]) == 'number') && !row[count].inject )
                html = row[count];

            if( index > 0 )
                width = index;
            
            
            var td = new Element('td', {
                width: (column[1])?column[1]:null
            }).inject( tr );
            
            if( this.safe ){
            	if( column[2] == 'html' )
	            	td.set('html', html);
	            else
	            	td.set('text', html);
            } else {
            	td.set('html', html);
            }

            td.store('rowIndex', pIndex);

            if( row[count] && row[count].inject )
                row[count].inject( td );
            
            count++;

        }.bind(this));
        
    	return tr;
    },
    
    empty: function(){

        this.tableBody.empty();
    	
    },

    setValues: function( pValues ){
        
        this.tableBody.empty();

        var trcount = 0;
        if( $type(pValues) == 'array' ){
            pValues.each(function(row){
                this.addRow( row );
            }.bind(this));
        }
    }


});

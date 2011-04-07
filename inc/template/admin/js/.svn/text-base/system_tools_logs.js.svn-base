var admin_system_tools_logs = new Class({

	initialize: function( pWin ){
		this.win = pWin;
		
		this.win.addEvent('close', function(){
			
			if( this.lastLiveLogTimer )
    			clearTimeout( this.lastLiveLogTimer );
			
		}.bind(this));
		
		this._renderLayout();
	},

	_renderLayout: function(){
        var p = new Element('div', {
            styles: 'position: absolute; left: 0px; top: 0px; right: 0px; bottom: 31px;'
        }).inject( this.win.content );
        
        var bottomBar = new ka.buttonBar( this.win.content );

        this.logsTop = new Element('div', {
            style: 'position: absolute; left: 0px; top: 0px; right: 0px; height: 55px; border-bottom: 1px solid #ddd; padding: 5px;'
        }).inject( p );
        
        
        this.btnDiv = new Element('div', {style: 'position: absolute; right: 15px; top: 15px;'}).inject( this.logsTop );
        
        this.btnClearLogs = new ka.Button(_('Clear logs'))
        .addEvent('click', this.clearLogs.bind(this))
        .inject( this.btnDiv );
        
        this.btnRefresh = new ka.Button(_('Refresh'))
        .addEvent('click', this.reloadLogsItems.bind(this))
        .inject( this.btnDiv );
        
        this.btnDiv2 = new Element('div', {
        	style: 'padding: 0px 17px; float: right;'
        }).inject(this.btnDiv);
        
        this.liveLog = new Element('input', {
        	type: 'checkbox',
        	id: this.win.id+'admin-logs-liveLogCheckbox'
        })
        .addEvent('change', this.toggleLiveLog.bind(this))
        .inject( this.btnDiv2 );
        
        new Element('label', {
        	'for': this.win.id+'admin-logs-liveLogCheckbox',
        	text: _('Live log')
        }).inject( this.btnDiv2 );
        
        this.logsAreaSelect = new ka.field({
            type: 'select', label: _('Area'), small: 1, tableItems: [
                {
                    id: 'all',
                    title: _('All')
                },
                {
                    id: 404,
                    title: _('Lost pages (404)')
                },
                {
                    id: 'authentication',
                    title: _('Authentication')
                },
                {
                    id: 'database',
                    title: _('Database')
                },
                {
                    id: 'system',
                    title: _('System error and notices')
                }
            ],
            table_key: 'id', table_label: 'title'
        })
        .addEvent('change', function( pValue ){
            this.loadLogsItems(1);
        }.bind(this))
        .inject( this.logsTop );
        
        
        this.logsTable = new Element('div', {
            style: 'position: absolute; left: 0px; top: 67px; right: 0px; bottom: 31px; overflow: auto;'
        }).inject( p );

        
        this.logsTable = new ka.Table().inject( this.logsTable );
        this.logsTable.setColumns([
            [_('Date'), 100],
            [_('IP'), 90],
            [_('User'), 80],
            [_('Area'), 100],
            [_('Message')]
        ]);

        
        var myPath = _path+'inc/template/admin/images/icons/';

        this.logsCtrlPrevious = new Element('img', {
            src: myPath + 'control_back.png'
        })
        .addEvent('click', function(){
            this.loadLogsItems( parseInt(this.logsCurrentPage)-1 ); 
        }.bind(this))
        .inject( bottomBar.box );

        this.logsCtrlText = new Element('span', {
            text: 1,
            style: 'padding: 0px 3px 5px 3px; position: relative; top: -4px;'
        }).inject( bottomBar.box );

        this.logsCtrlNext = new Element('img', {
            src: myPath + 'control_play.png'
        })
        .addEvent('click', function(){
            this.loadLogsItems( parseInt(this.logsCurrentPage)+1 ); 
        }.bind(this))
        .inject( bottomBar.box );



        this.loadLogsItems();
    },
    
    toggleLiveLog: function(){
    	if( !this.liveLog.checked && this.lastLiveLogTimer ){
    		clearTimeout( this.lastLiveLogTimer );
    	} else {
    		this.reloadLogsItems(true);
    	}
    	
    },
    
    clearLogs: function(){
    	
        this.btnClearLogs.startTip(_('Clearing logs ...'));
            	
    	new Request.JSON({url: _path+'admin/system/tools/logs/clear', noCache: 1, onComplete: function(){
            this.btnClearLogs.stopTip(_('Cleared'));
            this.loadLogsItems( 1 );
    	}.bind(this)}).get();
    	
    },
    
    renderLogCtrls: function(){
    
        
        this.logsCtrlPrevious.setStyle('opacity', 1);
        this.logsCtrlNext.setStyle('opacity', 1);
        
        if( this.logsCurrentPage == 1)
            this.logsCtrlPrevious.setStyle('opacity', 0.3);
        
        if( this.logsCurrentPage == this.logsMaxPages )
            this.logsCtrlNext.setStyle('opacity', 0.3);
    
        this.logsCtrlText.set('text', this.logsCurrentPage);
    
    },
    
    reloadLogsItems: function( pAgain ){
    
        this.loadLogsItems( this.logsCurrentPage, pAgain );
    
    },
    
    loadLogsItems: function( pPage, pAgain ){
    
        if( !pPage ) pPage = 1;
        
        if( this.lastrq ) this.lastrq.cancel();
        
        this.lastrq = new Request.JSON({url: _path+'admin/system/tools/logs', noCache: 1, onComplete: function(res){
        
            this.logsCurrentPage = pPage;
            this.logsMaxPages = res.maxPages;
            this.renderLogCtrls();
            
            this.logsTable.setValues(res.items);
            
            if( pAgain == true && this.liveLog.checked )
            	this.lastLiveLogTimer = this.reloadLogsItems.delay(1000, this, true);
            
        }.bind(this)}).post({page: pPage, area: this.logsAreaSelect.getValue()});
    
    }
});
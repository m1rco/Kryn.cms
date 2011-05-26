ka.list = new Class({
	
	loadAlreadyTriggeredBySearch: false,
	
    initialize: function( pWindow ){
        this.win = pWindow;
        this.win.content.setStyle('overflow', 'hidden');
        this.page = 1;
        this.checkboxes = [];

        this.sortField = '';
        this.sortDirection = 'ASC';
        this.currentPage = 1;

        this.load();
        var _this = this;
        this.win.softReload = function(){
            //_this.loadPage( parseInt(_this.ctrlPage.value) ); 
            _this.loadPage( _this.currentPage ); 
        }
    },

    load: function(){
        var _this = this;
        new Request.JSON({url: _path+'admin/backend/window/loadClass/', noCache: true, onComplete:function( res ){
            _this.render( res );
        }}).post({ module: this.win.module, 'code': this.win.code });
    },

    deleteItem: function(pItem){
        var _this = this;
        this.lastRequest = new Request.JSON({url: _path+'admin/backend/window/loadClass/deleteItem/', noCache: true, onComplete:function( res ){
            _this.win.softReload();
            _this._deleteSuccess();
        }}).post({ 
            module: this.win.module,
            code: this.win.code,
            item: pItem.values
        });
    },
    
    _deleteSuccess: function()
    { },

    click: function( pColumn ){
        pItem = this.columns[pColumn];
        
        if(!this.values.orderByDirection)
            this.values.orderByDirection = 'ASC';

        if( this.sortField != pColumn ){
            this.sortField = pColumn;
            this.sortDirection = (this.values.orderByDirection.toLowerCase() == 'asc') ? 'ASC':'DESC';
        } else {
            if( this.sortDirection == 'ASC' )
                this.sortDirection = 'DESC'
            else
                this.sortDirection = 'ASC'
        }

        pItem.getParent().getElements('img').each(function(item){
            item.destroy();
        });

        if( this.sortDirection == 'ASC' )
            pic = 'bullet_arrow_up.png';
        else
            pic = 'bullet_arrow_down.png';
        
        new Element('img',{
            src: _path+'inc/template/admin/images/icons/'+pic,
            align: 'top'
        }).inject( pItem );
        this.loadPage( this.currentPage ); 
    },

    render: function( pValues ){
        var _this = this;
        this.values = pValues;
        this.values.columns = $H(pValues.columns);

        /*multilang*/
        if( this.values.multiLanguage ){
        	
        	this.languageSelect = new Element('select', {
                style: 'position: absolute; right: 5px; top: 27px; width: 160px;'
            }).inject( this.win.border );

            this.languageSelect.addEvent('change', this.changeLanguage.bind(this));

            $H(ka.settings.langs).each(function(lang,id){
                new Element('option', {
                    text: lang.langtitle+' ('+lang.title+', '+id+')',
                    value: id
                }).inject( this.languageSelect );
            }.bind(this));
        	
        }
        
        
        /* head */
        this.head = new Element('div', {
            'class': 'ka-list-head'
        }).inject( this.win.content );
        this.headTable = new Element('table',{
            cellspacing: 0
        }).inject( this.head );
        this.headTableTHead = new Element('thead').inject( this.headTable );
        var tr = new Element('tr').inject( this.headTableTHead );


        /*** checkbox-Th ***/
        if( this.values.remove == true ){
            var th = new Element('th',{
                style: 'width: 21px;'
            }).inject( tr );
            new Element('input',{
                value: 1,
                type: 'checkbox'
            })
            .addEvent('click', function(){
                var checked = this.checked;
                _this.checkboxes.each(function(checkbox){
                    checkbox.checked = checked;    
                });
            })
            .inject(th)
        }

        /*** title-Th ***/
        this.columns = new Hash();
        this.values.columns.each(function(column,columnId){
            _this.columns[columnId] = new Element('th',{
                valign: 'top',
                html: _(column.label)
            })
            .addEvent('click', function(){
                _this.click(columnId);
            })
            .inject( tr );
            if( column.width > 0 ){
                _this.columns[columnId].setStyle( 'width', column.width+'px' );
            }
        });
        
        /*** edit-Th ***/
        //fixed mirco
        if( this.values.remove == true || this.values.edit == true || this.values.itemActions ){
            this.titleIconTd = new Element('th',{
                style: 'width: 40px;'
            }).inject( tr );
        }


        /* content */
        this.main = new Element('div',{
            'class': 'ka-list-main'
        }).inject( this.win.content );
        this.table = new Element('table',{
            cellspacing: 0
        }).inject( this.main );
        this.tbody = new Element('tbody').inject( this.table );

        /* bottom */

        this.bottom = new Element('div',{
            'class': 'ka-list-bottom'
        }).inject( this.win.content );

        this.loader = new ka.loader().inject( this.main );

        this.renderActionbar();

        if( !this.loadAlreadyTriggeredBySearch )
        	this.click( _this.values.orderBy );
        //this.loadPage(1);
    },

    changeLanguage: function(){
    	this.loadPage(1);
    },

    renderSearchPane: function(){
        
        this.searchPane = new Element('div', {
            'class': 'ka-list-search-pane'
        }).inject( this.main, 'after' );

        this.searchFields = new Hash();
        var doSearchNow = false;

        if( this.values.filter && this.values.filter.each ){
            this.values.filter.each(function(filter, key){

                
                var mkey = key;
                
                if( $type(key) == 'number' ){
                    mkey = filter;
                }
                
                var field = this.values.filterFields[ mkey ];
                
                
                var title = this.values.columns[mkey].label;
                field.label = _(title);
                field.small = true;
                
                
                var fieldObj = new ka.field(field)
                .addEvent('change', this.doSearch.bind(this))
                .inject( this.searchPane );
                
                this.searchFields.set(mkey, fieldObj );
                
                if( field.type == 'select' ){
                	new Element('option',{
                		value: '',
                		text: _('-- Please choose --')
                	}).inject(fieldObj.input, 'top');
                	fieldObj.setValue("");
                }
                
                if( this.win.params && this.win.params.filter ){
                	$H(this.win.params.filter).each(function(item,key){
                		if( item == mkey ){
                			fieldObj.setValue( this.win.params.item.values[key] );
                        	doSearchNow = true;
                		}
                	}.bind(this));
                }

            }.bind(this));
        } else {
            this.filterButton.destroy();
        }
        
        if( doSearchNow ){
        	this.toggleSearch();
        	this.loadAlreadyTriggeredBySearch = true;
        	logger('do search');
        	this.doSearch();
        }
    },

    doSearch: function(){
        if( this.lastTimer )
            $clear( this.lastTimer );

        var mySearch = function(){
            this.loadPage( 1 ); 
        }.bind(this);
        this.lastTimer = mySearch.delay(200);
    },

    getSearchVals: function(){
        var res = new Hash();

        this.searchFields.each(function(field, key){
            res.set( key, field.getValue());
        });

        return JSON.encode(res);
    },

    toggleSearch: function(){
        if( this.searchEnable == 1 ){
            this.filterButton.set('class', 'ka-list-search-button');
            this.searchEnable = 0;
            this.searchPane.tween('height', 1);
            this.main.tween('bottom', 30);
        } else {
            this.searchEnable = 1;
            this.filterButton.set('class', 'ka-list-search-button ka-list-search-button-active');
            this.searchPane.tween('height', 121);
            this.main.tween('bottom', 120+30);
        }
    },

    renderActionbar: function(){
        var _this = this;


        this.filterButton = new Element('a', {
            href: 'javascript: ;',
            html: _('Search'),
            'class': 'ka-list-search-button'
        })
        .addEvent('click', this.toggleSearch.bind(this))
        .inject( this.bottom );

        this.renderSearchPane();

        var myPath = _path+'inc/template/admin/images/icons/';
        this.navi = new Element('div',{
            'class': 'navi'
        }).inject( this.bottom );

        this.ctrlFirst = new Element('img', {
            src: myPath + 'control_start.png'
        })
        .addEvent('click', function(){
            _this.loadPage( 1 ); 
        })
        .inject( this.navi );

        this.ctrlPrevious = new Element('img', {
            src: myPath + 'control_back.png'
        })
        .addEvent('click', function(){
            _this.loadPage( parseInt(_this.ctrlPage.value)-1 ); 
        })
        .inject( this.navi );

        this.ctrlPage = new Element('input', {
        })
        .addEvent('keydown', function(e){
            if( e.key == 'enter' )
                _this.loadPage( parseInt(_this.ctrlPage.value) ); 
            if( ['backspace','left','right'].indexOf(e.key) == -1 && (!parseInt(e.key)+0 > 0) ){
                e.stop();
            }
        })
        .inject( this.navi );

        this.ctrlMax = new Element('span', {
            text: '/ 0',
            style: 'position: relative; top: -3px; padding: 0px 3px 0px 3px;'
        }).inject( this.navi );

        this.ctrlNext = new Element('img', {
            src: myPath + 'control_play.png'
        })
        .addEvent('click', function(){
            _this.loadPage( parseInt(_this.ctrlPage.value)+1 ); 
        })
        .inject( this.navi );

        this.ctrlLast = new Element('img', {
            src: myPath + 'control_end.png'
        })
        .addEvent('click', function(){
            _this.loadPage( _this._lastItems.maxPages ); 
        })
        .inject( this.navi );

        if( this.values.multiLanguage )
        	this.win.extendHead();
        
        if( this.values.add || this.values.remove || this.values.custom){
            this.actionsNavi = this.win.addButtonGroup();
        }

        if( this.values.remove ){
            this.actionsNavi.addButton(_('Remove selected'), _path+'inc/template/admin/images/icons/'+this.values.iconDelete, function(){
               this.removeSelected();
            }.bind(this));
        }

        if( this.values.add ){
            this.actionsNavi.addButton(_('Add'), _path+'inc/template/admin/images/icons/'+this.values.iconAdd, function(){
                ka.wm.openWindow( _this.win.module, _this.win.code+'/add', null, null, {
                	lang: (_this.languageSelect)?_this.languageSelect.value:false
                });
            });
        }
        
        
        //custom window / function field
        try {
	        if( this.values.custom ){
	        	iconCustom = 'inc/template/admin/images/icons/brick_go.png';
	        	if(this.values.iconCustom)
	        		iconCustom = this.values.iconCustom;
	        	
	        	winModule = _this.win.module;
	        	if(this.values.custom.module)
	        		winModule = this.values.custom.module;
	        	
	        	
	        	customWinCode = _this.win.code+'/custom';
	        	if(this.values.custom.code) {
	        		customWinCode = this.values.custom.code;        		
	        	}
	
	          this.actionsNavi.addButton(this.values.custom.name, _path+iconCustom, function() {
	        	  ka.wm.openWindow(winModule, customWinCode, null, null, {
	              	language: (_this.languageSelect)?_this.languageSelect.value:false
	              });
	        	  
	          });
	        }
        }catch(e) {}

        if( this.values['export'] ){
            this.exportNavi = this.win.addButtonGroup();
            this.exportType = new Element('select',{
                style: 'position: relative; top: -2px;'
            })
            $H(this.values['export']).each(function(fields,type){
                new Element('option', {
                    value: type,
                    html: _(type)
                }).inject(this.exportType);
            }.bind(this));_
            this.exportNavi.addButton(this.exportType, '');
            this.exportNavi.addButton(_('Export'), _path+'inc/template/admin/images/icons/table_go.png', this.exportTable.bind(this));
        }

        if( this.values['import'] ){
//            this.importNavi = this.win.addButtonGroup();
            this.exportNavi.addButton(_('Import'), _path+'inc/template/admin/images/icons/table_row_insert.png');
        }

    },

    removeSelected: function(){
        if( this.getSelected() != false ){
            this.win._confirm(_('Really remove selected?'), function(res){
                if(!res)return;
                this.loader.show();
                new Request.JSON({url: _path+'admin/backend/window/loadClass/removeSelected/', noCache: 1, onComplete: function(res){
                    this.loader.hide();
                    this.loadPage( this.currentPage );
                    this._deleteSuccess();
                }.bind(this)}).post({
                    module: this.win.module,
                    code: this.win.code, 
                    selected: JSON.encode(this.getSelected())
                });
            }.bind(this));
        }
    },

    getSelected: function(){
        var res = [];
        this.checkboxes.each(function(check){
            if( check.checked ) {
                res.include( JSON.decode(check.value) );
            }
        });
        return ( res.length > 0 ) ? res : false;
    },

    exportTable: function(){
        var params = new Hash({
            module: this.win.module,
            code: this.win.code, 
            exportType: this.exportType.value,
            orderBy: this.sortField,
            filter: this.searchEnable,
            filterVals: (this.searchEnable)?this.getSearchVals():'',
            language: (this.languageSelect)?this.languageSelect.value:false,
            orderByDirection: this.sortDirection,
            params: JSON.encode(this.win.params)
        });
        if( this.lastExportForm ){
            this.lastExportForm.destroy();
            this.lastExportFrame.destroy();
        }
        this.lastExportForm = new Element('form', {
            action: _path+'admin/backend/window/loadClass/exportItems/?'+params.toQueryString(),
            method: 'post',
            target: 'myExportFrame'+this.win.id
        }).inject( document.hidden );
        this.lastExportFrame = new IFrame(null, {
            name:  'myExportFrame'+this.win.id
        }).inject( document.hidden );
        this.lastExportForm.submit();
    },

    renderActions: function(){
        if( this.values.add || this.values.navi ){ //wenn aktionen vorhanden, dann bar anzeigen
            this.actions = true;
        }
        if( this.actions ){
            this.table.setStyle('padding-bottom', 50 );
            this.actionBar = new Element( 'div', {
                'class': 'ka-list-actionBar'
            }).inject( this.win.content );
        }
        if( this.values.add ){
            this.actionAdd = new Element('a', {
                'class': 'ka-button',
                html: _('Add')
            }).inject(this.actionBar);
        }

    },

    addDummy: function(){
        var tr = new Element('tr').inject( this.tbody );
        var count = this.dummyCount+this.values.columns.getLength();
        new Element('td',{
            colspan: count,
            styles: { 
                height: 'auto'
            }
        }).inject( tr );
    },

    loadPage: function( pPage ){
        var _this = this;

        if( this._lastItems && pPage != 1 ){
            if( pPage > this._lastItems.maxPages )
                return;
        }
        if( pPage <= 0 )
            return;

        if( this.lastRequest )
            this.lastRequest.cancel();

        _this.tbody.empty();

        this.loader.show();

        this.lastRequest = new Request.JSON({url: _path+'admin/backend/window/loadClass/getItems/', noCache: true, onComplete:function( res ){
            _this._loadItems($H(res));
        }}).post({ 
            module: this.win.module,
            code: this.win.code, 
            page: pPage,
            orderBy: _this.sortField,
            filter: this.searchEnable,
            language: (this.languageSelect)?this.languageSelect.value:false,
            filterVals: (this.searchEnable)?this.getSearchVals():'',
            orderByDirection: _this.sortDirection,
            params: JSON.encode(this.win.params)
        });
    },

    _loadItems: function( pItems ){
        var _this = this;

        this.checkboxes = [];
        this.loader.hide();

        this._lastItems = pItems;

        [this.ctrlFirst, this.ctrlPrevious, this.ctrlNext, this.ctrlLast].each(function(item){
            item.setStyle('opacity', 1);
        });

        _this.ctrlPage.value = pItems.page;
        this.currentPage = pItems.page;
        if( pItems.page <= 1 ){
            this.ctrlFirst.setStyle('opacity', 0.2);
            this.ctrlPrevious.setStyle('opacity', 0.2);
        }

        if( pItems.page >= pItems.maxPages ){
            this.ctrlNext.setStyle('opacity', 0.2);
            this.ctrlLast.setStyle('opacity', 0.2);
        }

        this.ctrlMax.set('text', '/ '+pItems.maxPages);

        _this.tempcount = 0;
        if( pItems.items ){
            pItems.items.each(function(item){
                _this.addItem( item );
                _this.tempcount++;
            });
        }
    },

    select: function( pItem ){
        var tr = pItem.getParent();

        if( this._lastSelect == tr ) return;
        
        if( this._lastSelect )
            this._lastSelect.set('class', this._lastSelect.retrieve('oldClass'));

        tr.store('oldClass', tr.get('class'));
        tr.set('class', 'active' );
        this._lastSelect = tr;
    },

    addItem: function( pItem ){
        var _this = this;
        var tr = new Element('tr',{
            'class': (_this.tempcount%2)?'one':'two'
        }).inject( this.tbody );
       
        if( this.values.remove == true ){
            var td = new Element('td',{
                style: 'width: 21px;'
            }).inject(tr);
            if( pItem['remove'] ){
                var mykey = {};
                this.values.primary.each(function(primary){
                    mykey[primary] = pItem.values[primary];
                });
                //if( this.values.edit ){
                        this.checkboxes.include( new Element('input',{
                        value: JSON.encode(mykey),
                        type: 'checkbox'
                    }).inject(td) );
                //}
                }
        }
        
        this.values.columns.each(function(column,columnId){
            var value = pItem['values'][columnId];

            if( column.format == 'timestamp' ){
                value = new Date(value*1000).toLocaleString();
            }

            if( column.type == 'datetime' || column.type == 'date' ){
                if( value != 0 && value ){
                    var format = ( !column.format ) ? '%d.%m.%Y %H:%M': column.format;
                    value = new Date(value*1000).format( format );
                } else {
                    value = '';
                }
            }
            

            if( column.type == 'select' ){
            	value = pItem['values'][columnId+'__label'];
            }
            

            if( column.imageMap ){
                value = '<img src="'+_path+column.imageMap[value]+'"/>';
            }

            var td = new Element('td', {
                html: value
            })
            .addEvent('click', function(e){
                _this.select(this);
            })
            .addEvent('mousedown', function(e){
                e.stop();
            })
            .addEvent('dblclick', function(e){
                if( _this.values.editCode ){
                    ka.wm.open( _this.values.editCode, pItem ); 
                } else if( pItem.edit ){
                    ka.wm.openWindow( _this.win.module, _this.win.code+'/edit', null, null, pItem );
                }
            })
            .inject( tr );
            
            if( column.type == 'html' )
                td.set('html', value );
            
            //open window if open definied
            //todo: may this section isn't in use ?
            if( pItem.open ){
                td.addEvent('dblclick', function(){
                    var params = ( pItem.open[2] ) ? pItem.open[2] : pItem;
                    ka.wm.openWindow( pItem.open[0], pItem.open[1], null, null, params );
                });
            }
            //todoend
            
            if( column.width > 0 ){
                td.setStyle( 'width', column.width+'px' );
            }
        });
       
        if( this.values.remove == true || this.values.edit == true || this.values.itemActions ){
            var icon = new Element('td',{
                width: 40,
                'class': 'edit'
            }).inject( tr );
           
            if( this.values.itemActions && this.values.itemActions.each ){
                this.values.itemActions.each(function(action){
                    new Element('img', {
                        src: _path+'inc/template/'+action[1],
                        title: action[0]
                    })
                    .addEvent('click', function(){
                        ka.wm.open( action[2], {item: pItem, filter: action[3]} );
                    })
                    .inject( icon );
                });
                icon.setStyle('width', 40+(20*this.values.itemActions.length));
                this.titleIconTd.setStyle('width', 40+(20*this.values.itemActions.length));
            }
            
            if( pItem.edit ){
                new Element('img', {
                    src: _path+'inc/template/admin/images/icons/'+this.values.iconEdit
                })
                .addEvent('click', function(){
                    if( _this.values.editCode ){
                        ka.wm.open( _this.values.editCode, pItem ); 
                    } else if( pItem.edit ){
                       ka.wm.openWindow( _this.win.module, _this.win.code+'/edit', null, null, pItem );
                    }
                })
                .inject( icon );
            }
            if( pItem['remove'] ){
                new Element('img', {
                    src: _path+'inc/template/admin/images/icons/'+this.values.iconDelete
                })
                .addEvent('click', function(){
                    _this.win._confirm(_('Really delete?'), function(res){
                        if(!res) return;
                        _this.deleteItem( pItem );
                    });
                })
                .inject( icon );
            }
        }
    }

})

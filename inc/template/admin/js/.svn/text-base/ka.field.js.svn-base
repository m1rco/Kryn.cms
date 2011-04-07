ka.field = new Class({
	
	Implements: Events,
	
    initialize: function( pField, pFieldId ){
        this.field = pField;
        this.fieldId = pFieldId;
               
        if(! this.field.value ) this.field.value = '';

        
        if( this.field.tableitem ){
        	this.tr = new Element('tr', {
	            'class': 'ka-field-main'
        	}).inject( document.hidden );

        	this.title = new Element('td', {
        		'class': 'ka-field-tdtitle',
        		width: 180
        	}).inject( this.tr );
        	
        	this.main = new Element('td', {
        	}).inject( this.tr );
        	
        } else {
	        this.main = new Element( 'div', {
	            'class': 'ka-field-main'
	        }).inject( document.hidden );
	        
	        if( pField.type == 'headline' ){
	            new Element('div', {
	                style: 'clear: both;'
	            }).inject( this.main );
	            new Element('h2', {
	                'class': 'ka-field-headline',
	                html: _(pField.label)
	            }).inject( this.main );
	            return;
	        }
	
	        if( pField.small ){
	            this.main.set('class', 'ka-field-main ka-field-main-small');
	        }
	        this.title = new Element('div', {
	            'class': 'ka-field-title'
	        }).inject( this.main );
	        
        }
        
        if( this.field.invisible == 1)
            this.main.setStyle('display', 'none');
        


        if( pField.label )
            this.titleText = new Element('div', {
                'class': 'title',
                html: pField.label
            }).inject( this.title );

        if( pField.help && this.titleText ){
            new Element('img', {
                src: _path+'inc/template/admin/images/icons/help_gray.png',
                style: 'float: right; cursor: pointer; position: relative; top: -1px;',
                title: _('View help to this field'),
                styles: {
                    opacity: 0.7
                }
            })
            .addEvent('mouseover', function(){
                this.setStyle('opacity', 1);
            })
            .addEvent('mouseout', function(){
                this.setStyle('opacity', 0.7);
            })
            .addEvent('click', function(){
                ka.wm.open('admin/help', {id: pField.help});
            })
            .inject( this.titleText );
        }
        
        if( this.field.desc ){
            new Element('div', {
                'class': 'desc',
                html: this.field.desc
            }).inject( this.title );
        }

        this.fieldPanel = new Element('div', {
            'class': 'ka-field-field'
        }).inject( this.main );

        this.renderField();
        
        if( this.field['default'] && this.field['default'] != "" && this.field.type != 'datetime' ){
            this.setValue( this.field['default'] );
        }
        
        
        if(! this.field.startempty && this.field.value ){
            this.setValue( this.field.value, true );
        }
        
        if( this.input ){
            if( this.input.get('tag') == 'input' && this.input.get('class') == 'text' ){
                this.input.store( 'oldBg', this.input.getStyle('background-color') );
                this.input.addEvent('focus', function(){
                    this.setStyle('border', '1px solid black');
                    this.setStyle('background-color', '#fff770');
                });
                this.input.addEvent('blur', function(){
                    this.setStyle('border', '1px solid silver');
                    this.setStyle('background-color', this.retrieve('oldBg'));
                });
                this.input.addEvent('keyup', function(){
                    if( this.onChange ) this.onChange();
                }.bind(this));
            }
        
            if( !this.field.disabled ){
                this.input.addEvent('change', function(){
                    this.onChange();
                }.bind(this));
                this.input.addEvent('keyup', function(){
                    this.onChange();
                }.bind(this));
            } else {
                this.input.set('disabled',true);
            }
        }
    },

    renderField: function(){
    	if( this.field.type )
    		this.field.type = this.field.type.toLowerCase();
    	
        switch( this.field.type ){
        case 'password':
            this.renderPassword();
            break;
        //case 'file':
        //    this.renderFile();
        //    break;
        case 'select':
            this.renderSelect();
            break;
        case 'textarea':
           this.renderTextarea(); 
           break;
        case 'wysiwyg':
            this.renderWysiwyg();
            break;
        case 'date':
            this.renderDate();
            break;
        case 'datetime':
            this.renderDate({time:true});
            break;
        case 'checkbox':
            this.renderCheckbox();
            break;
        case 'file':
        case 'filechooser':
            this.renderChooser({pagefiles: 1, upload: 1, files:1});
            break;
        case 'pagechooser':
        case 'page':
            this.renderChooser({pages: 1});
            break;
        case 'chooser':
            this.renderChooser({pages: 1, files: 1, upload: 1, pagefiles: 1});
            break;
        case 'filelist': 
            this.renderFileList();
            break;
        case 'multiupload':
        	this.initMultiUpload();
        	break;
        case 'layoutelement':
        	this.initLayoutElement();
        	break;
        case 'headline':
        	this.renderHeadline();
        	break;
        case 'info':
        	this.renderInfo();
        	break;
        case 'imagegroup':
        	this.renderImageGroup();
        	break;
        case 'custom':
        	this.renderCustom();
        	break;
        case 'number':
        	this.renderNumber();
        	break;
        case 'text':
        default: 
            this.renderText();
            break;
        }
        if(this.input){

        	if( this.field.length+0 > 0 ){
        		//alert(this.field.length);
        		this.input.setStyle('width', (this.field.length.toInt()*9));
        	}
        	
        	this.input.store('oldClass', this.input.get('class') );
        }
    },
    
    renderCustom: function(){
    	var _this = this;
    	
    	if( window[this.field['class']] ){
    		
    		this.customObj = new window[this.field['class']]( this.field, this.fieldPanel );
    		
    		this.customObj.addEvent('change', function(){
    			_this.onChange();
    		});
    		
    		this.setValue = this.customObj.setValue.bind(this.customObj);
    		this.getValue = this.customObj.getValue.bind(this.customObj);
    		this.isEmpty = this.customObj.isEmpty.bind(this.customObj);
    		this.highlight = this.customObj.highlight.bind(this.customObj);
    	} else {
			alert(_('Custom field: '+this.field['class']+'. Can not find this javascript class.'));
    	}
    },
    
    renderImageGroup: function(){
    	
    	this.input = new Element('div', {
    		style: 'padding: 5px;'
    	}).inject( this.fieldPanel );
    	
    	this.imageGroup = new ka.imageGroup( this.input );
    	
    	this.imageGroupImages = {};
    	
    	$H(this.field.items).each(function(image, value){
    		
    		this.imageGroupImages[ value ] = this.imageGroup.addButton( image.label, image.src );
    		
    	}.bind(this));
    	
    	this.imageGroup.addEvent('change', function(){
    		
    		this.onChange();
    		
    	}.bind(this));
    	
    	this.getValue = function(){
    		
    		var value = false;
    		$H(this.imageGroupImages).each(function(button,tvalue){
    			if( button.get('class').test('buttonHover') )
    				value = tvalue;
    		});
    		
    		return value;
    	}
    	
    	this.setValue = function( pValue ){
    		
    		$H(this.imageGroupImages).each(function(button,tvalue){
    			button.removeClass('buttonHover');
    			if( pValue == tvalue )
    				button.addClass('buttonHover');
    		});
    	}
    	
    },

    renderHeadline: function(){
    	
    	this.input = new Element('h2',{
    		html: this.field.label
    	}).inject( this.fieldPanel );
    	
    },
 
    renderInfo: function(){
    	
        return;
        
    },
    
    renderFileList: function( pOpts ){
    	var relHeight = (this.field.height) ? this.field.height : 150;
        var main = new Element('div', {
            styles: {
                position: 'relative',
                'height' : relHeight,
                'width': (this.field.width)?this.field.width:null
            }
        }).inject( this.fieldPanel );
        
        var wrapper = new Element('div', {
            style: 'position: absolute; left: 0px; top: 0px; bottom: 0px; right: 18px;'
        }).inject( main );

        this.input = new Element('select', {
            size: (this.field.size)?this.field.size:5,
            style: 'width: 100%',
            styles: {
                'height': (this.field.height)?this.field.height:null
            }
        }).inject( wrapper );
        var input = this.input;


        var addFile = function( pPath ){
            new Element('option', {
                value: pPath,
                text: pPath
            }).inject( input );
        }

        this.addImgBtn = new Element('img', {
            src: _path+'inc/template/admin/images/icons/add.png',
            style: 'position: absolute; top: 0px; right: 0px; cursor: pointer;'
        })
        .addEvent('click', function(){

            ka.wm.openWindow( 'admin', 'pages/chooser', null, -1, {onChoose: function( pValue ){
                addFile( pValue );
                this.win.close();//close paes/chooser windows -> onChoose.bind(this) in chooser-event handler
            },
            opts: {files: 1, upload: 1}
            });

        }.bind(this))
        .inject( main );


        this.addImgBtn = new Element('img', {
            src: _path+'inc/template/admin/images/icons/delete.png',
            style: 'position: absolute; top: 19px; right: 0px; cursor: pointer;'
        })
        .addEvent('click', function(){
            input.getElements('option').each(function(option){
                if(option.selected) option.destroy();
            });
        }.bind(this))
        .inject( main );


        var _this = this;
        this.getValue = function(){
            var res = [];
            _this.input.getElements('option').each(function(option){
                res.include( option.value );
            });
            return res;
        }

        this.setValue = function( pValues ){
            input.empty();
            if( $type(pValues) == 'string') pValues = JSON.decode(pValues);
            if( $type(pValues) != 'array' ) return;
            pValues.each(function(item){
                new Element('option', {
                    text: item,
                    value: item
                }).inject( input );
            });
            this.onChange();
        }

    },

    setInputActive: function( pSet ){
        var bg = 'white';
        if( pSet ){
            //yes
            this.input.setStyle('cursor', 'auto');
        } else {
            bg = '#ddd';
            this.input.setStyle('cursor', 'default');
        }
        this.input.setStyle('background-color', bg);
        this.input.store( 'oldBg', bg);
    },

    renderFileChooser: function(){
        this.input = new Element('input', {
            'class': 'text',
            type: 'text'
        })
        .inject( this.fieldPanel );
    },

    renderChooser: function( pOpts ){
        this.input = new Element('input', {
            'class': 'text',
            type: 'text',
            style: ((this.field.small == 1) ? 'width: 100px' : 'width: 210px'),
            disabled: this.field.onlyIntern
        })
        .addEvent('focus', function(){
            this.setInputActive( true );
        }.bind(this))
        .addEvent('blur', function(){
            if( this.input.value != this._automaticUrl ){//wurde verändert
                this._value = false;
                this.setInputActive( true );
            } else {
                this.setInputActive( false );
            }
        }.bind(this))
        .addEvent('keyup', function(){
            this.fireEvent('blur');
        })
        .inject( this.fieldPanel );

        var div = new Element('span').inject( this.fieldPanel );
        var button = new ka.Button(_('Choose'))
            .addEvent('click', function(){
                var _this = this;
                ka.wm.openWindow( 'admin', 'pages/chooser', null, -1, {onChoose: function( pValue ){
                    _this.setValue( pValue, true );
                    this.win.close();//close paes/chooser windows -> onChoose.bind(this) in chooser-event handler
                },
                value: this._value,
                cookie: this.field.cookie,
                domain: this.field.domain,
                display: this.field.display,
                opts: pOpts});
        }.bind(this))
        .setStyle('position', 'relative')
        .setStyle('top', '-1px')
        .inject( div, 'after' );

        this.pageChooserPanel = new Element('span', {style: 'color: gray;'}).inject( button, 'after' );

        this.setValue = function( pVal, pIntern ){
            this._value = pVal;
            this.pageChooserPanel.empty();
            if( pVal+0 > 0 ){
                this.setInputActive( false );
                this.pageChooserGetUrl();
            } else {
                this.setInputActive( true );
                this.input.value = pVal;
            }
            this.input.title = this.input.value;
            if( pIntern )
            	this.onChange();
        }

        this.getValue = function(){
            return (this._value)?this._value:this.input.value;
        }
    },

    pageChooserGetUrl: function(){
        if( this.lastPageChooserGetUrlRequest )
            this.lastPageChooserGetUrlRequest.cancel();
        
        this.lastPageChooserGetUrlRequest = new Request.JSON({url: _path+'admin/pages/getUrl', noCache: 1, onComplete: function(res){
            this._automaticUrl = res;
            this.input.value = res;
            this.input.fireEvent('blur');
            this.onChange( this._value, res );
        }.bind(this)}).post({rsn: this._value });

    },

    renderSelect: function(){
        var _this = this;
        var multiple = ( this.field.multi || this.field.multiple );
		  var sortable = this.field.sortable;
		  
		  var selWidth = 133;
	     if( this.field.tinyselect )
            selWidth = 75;
			if(sortable)
			   selWidth -= 8;
			
		  
		  
		  
        if( multiple && (!this.field.size || this.field.size+0 < 4 ) )
        	this.field.size = 4;
        
        this.input = new Element('select', {
            size: this.field.size
        })
        .addEvent('change', function(){
        	_this.onChange();
        })
        .inject( this.fieldPanel );

        if( this.field.directory ){
        	this.input.set('title', _('This list is based on files on this directory:')+' '+this.field.directory);
        	new Element('div', {
        		text:  _('Based on:')+' '+this.field.directory,
        		style: 'font-size: 11px; color: silver'
        	}).inject( this.input, 'after' );
        }
        
        
        
        var label = _this.field.table_label;
        var key = _this.field.table_key ? _this.field.table_key : _this.field.table_id;

        if( _this.field.relation == 'n-n' ){
            var label = _this.field['n-n'].right_label;
            var key = _this.field['n-n'].right_key;
        }
        
        if( !this.field.tableItems && this.field.items )
        	this.field.tableItems = this.field.items;

        if( $type(this.field.tableItems) == 'array' ){
            this.field.tableItems.each(function(item){
                if(!item) return;
                
                if( _this.field.lang && item.lang != _this.field.lang && item.lang ) return;
                
                var text = '';
                if( _this.field.table_view ){
                    $H(_this.field.table_view).each(function(val, mykey){
                        var _val = '';
                        switch( val ){
                        case 'time':
                            _val = new Date(item[mykey]*1000).format('db');
                            break;
                        default:
                            _val = item[mykey];
                        }
                        text = text + ', ' + _val;
                    });
                    text = text.substr(2, text.length);
                } else if( item && item[label] ){
                    text = item[label];
                }

                var t = new Element('option', {
                    text: text,
                    value: item[key]
                })
                if(t && _this.input )
                    t.inject( _this.input );
            });
        } else if ( $type(this.field.tableItems) == 'object' ){

            $H(this.field.tableItems).each(function(item, key){
	        	var t = new Element('option', {
	                text: item,
	                value: key
	            })
	            if(t && _this.input )
	                t.inject( _this.input );
            });
        }
        if( multiple ){

        	this.main.setStyle('width', 355);
        	if( this.field.small )
        		this.main.setStyle('height', 80);
        	else
            	this.main.setStyle('height', 115);
        	
        	var table = new Element('table').inject(this.input.getParent());
        	var tbody = new Element('tbody').inject( table );
        	
        	var tr = new Element('tr').inject( tbody );
        	var td = new Element('td').inject(tr);
        	var td2 = new Element('td', {style: 'vertical-align: middle;'}).inject(tr);
        	var td3 = new Element('td').inject(tr);
        	
        	this.input.setStyle('width', selWidth);
			
        	
        	this.input.inject( td );

        	var toRight = new ka.Button('»')
        	.addEvent('click', function(){
        		if( this.input.getSelected() ){
	        		this.input.getSelected().clone().inject( this.inputVals );
	        		this.input.getSelected().set('disabled', true);
	        		this.input.getSelected().set('selected', false);
        		}
        	}.bind(this))
        	.setStyle('left', -2)
        	.inject( td2 );
        	
        	new Element('span', {html: "<br /><br />"}).inject( td2 );
        		
        	var toLeft = new ka.Button('«')
        	.addEvent('click', function(){
        		if( this.inputVals.getSelected() ){
        			this.input.getElement('option[value='+this.inputVals.value+']').set('disabled', false);
        			this.inputVals.getSelected().destroy();
        		}
        	}.bind(this))
        	.setStyle('left', -2)
        	.inject( td2 );
        	

        	this.input.addEvent('dblclick', function(){
        		toRight.fireEvent('click');
        	}.bind(this))
        	
        	
        	this.inputVals = new Element('select', {
                size: this.field.size,
                style: 'width: '+selWidth+'px'
        	})
        	.addEvent('dblclick', function(){
        		toLeft.fireEvent('click');
        	}.bind(this))
        	.inject(td3);
        	

        	if( this.field.tinyselect )
        		this.inputVals.setStyle('width', 75);
        	
        }//sortable
         if(sortable) {
            var td4 = new Element('td').inject(tr);
            var elUp = new Element('img', {
                  src: _path+'inc/template/admin/images/icons/arrow_up.png',
                  style: 'display: block; cursor: pointer;'
            }).addEvent('click', 
                 function() {
                  if(!this.inputVals.getElements('option') || this.inputVals.getElements('option').length < 2 || !this.inputVals.getSelected())
                     return;
                  
                  var selOption = this.inputVals.getSelected();
                  //check if el is top                
                  if(!selOption.getPrevious('option') || !$defined(selOption.getPrevious('option')[0]))
                     return;
                  var selOptionClone = selOption.clone(true).inject(selOption.getPrevious('option')[0], 'before');
                  selOption.destroy();
                  logger(this.getValue());
               }.bind(this)
               
            ).inject(td4); 
            
            new Element('div', {html: "<br /><br />"}).inject( td4 );
           // var elDown = new ka.Button('Dw').addEvent('click',
			   var elDown = new Element('img', {
                  src: _path+'inc/template/admin/images/icons/arrow_down.png',
                  style: 'display: block; cursor: pointer;'
            }).addEvent('click',
                  function() {
                     if(!this.inputVals.getElements('option') || this.inputVals.getElements('option').length < 2 || !this.inputVals.getSelected())
                        return;
                     
                     var selOption = this.inputVals.getSelected();
                     //check if el is top                
                     if(!selOption.getNext('option') || !$defined(selOption.getNext('option')[0]))
                        return;
                     var selOptionClone = selOption.clone(true).inject(selOption.getNext('option')[0], 'after');
                     selOption.destroy();
                     logger(this.getValue());
                  }.bind(this)            
            
            ).inject(td4);                      
         
         }         
        

        this.setValue = function( pValue, pIntern ){
         
         if( multiple ){
            this.inputVals.empty();
            this.input.getElements('option').set('disabled', false);
         }
         
            this.input.getElements('option').each(function(option){
                option.selected = false;
            });
            
            if( pValue && _this.field['relation'] == 'n-n' ){
                pValue.each(function( _item ){
                   _this.input.getElements('option').each(function(option){
                        if( option.value == _item[_this.field['n-n'].middle_keyright] )
                           if( multiple ){
                              option.clone().inject( this.inputVals );
                              option.set('disabled', true);
                              option.set('selected', false);
                           } else {
                              option.selected = true;
                           }
                    }.bind(this));
                }.bind(this));
                
            } else if( $type(pValue) == 'array' && multiple && !sortable){
                
                this.input.getElements('option').each(function(option){
                    if( pValue.contains( option.value ) ){
                     option.clone().inject( this.inputVals );
                     option.set('disabled', true);
                     option.set('selected', false);
                    }
                }.bind(this));
            } else if( $type(pValue) == 'array' && multiple ){
                 pValue.each(function(pItem) {
                   iSelOption = this.input.getElement('option[value="'+pItem+'"]');
						 if($defined(iSelOption) && $type(iSelOption) != 'null'){
							
	                   iSelOption.clone().inject( this.inputVals );
	                   iSelOption.set('disabled', true);
	                   iSelOption.set('selected', false);
						 }
                 }.bind(this));  
               
                
            } else {
                _this.input.value = pValue;
            }
            if( pIntern )
               this.onChange();
        },
        
        this.getValue = function(){
            var res = [];
            if( multiple == true ){
                _this.inputVals.getElements('option').each(function(option){
                        res.include( option.value );
                });
            } else {
                res = _this.input.value;
            }
            return res;
        }
        
        this.getValue = function(){
            var res = [];
            if( multiple == true ){
                _this.inputVals.getElements('option').each(function(option){
                        res.include( option.value );
                });
            } else {
                res = _this.input.value;
            }
            return res;
        }

    },

    renderWysiwyg: function(){
        this.lastId = 'WindowField'+this.fieldId+((new Date()).getTime())+''+$random(123,5643)+''+$random(13284134,1238845294);
        //this.lastId = 'field'+(new Date()).getTime();
        
        this.input = new Element('textarea', {
            id: this.lastId,
            name: this.lastId,
            value: this.field.value,
            styles: {
                'height': (this.field.height)?this.field.height:80,
                'width': (this.field.width)?this.field.width:''
            }
        }).inject( this.fieldPanel );

        //(function(){
       //     tinyMCE.execCommand('mceAddControl', false, this.lastId );
        //    initTiny( this.lastId );
        //}).bind(this).delay(100);
        if(! this.field.withOutTinyInit ){
            try {
            //initResizeTiny( this.lastId, _path+'inc/template/css/kryn_tinyMceContent.css' );
/*            tinyMCE.init({
                mode: 'exact',
                element: this.lastId,
                content_css: _path+'inc/template/css/kryn_tinyMceContent.css',
                document_base_url : _path
            });
*/
            //initTiny( this.lastId, _path+'inc/template/css/kryn_tinyMceContent.css' );
            } catch(e){
                logger( e );
            }
        }

        this.initTiny = function(){
            ka._wysiwygId2Win.include( this.lastId, this.field.win );
            initResizeTiny( this.lastId, _path+'inc/template/css/kryn_tinyMceContent.css' );
        }.bind(this);

        this.setValue = function( pValue, pIntern ){
            var tiny = tinyMCE.get( this.lastId );
            if( tiny )
                tiny.setContent( pValue );
            else
                this.input.value = pValue;
            
            if( pIntern )
            	this.onChange();
        }

        this.getValue = function(){
            if(! tinyMCE.get( this.lastId ) )
                return false;
            return tinyMCE.get( this.lastId ).getContent();
        }
    },

    renderDate: function( pOptions ){
        this.input = new Element('input', {
            'class': 'text ka-field-dateTime',
            type: 'text',
            style: 'width: 110px'
        })
        .inject( this.fieldPanel );
        var datePicker = new ka.datePicker( this.input, pOptions );

        if( this.field.win ){
        	this.field.win.addEvent('resize', datePicker.updatePos.bind(datePicker));
        	this.field.win.addEvent('move', datePicker.updatePos.bind(datePicker));
        	
        }
        
        this.getValue = function(){
            return datePicker.getTime();
        };
        this.setValue = function( pVal, pIntern ){
            datePicker.setTime( (pVal != 0)?pVal:false );
            
            if( pIntern )
            	this.onChange();
        }.bind(this);
        
        if( this.field['default'] && this.field['default'] != "" ){
            var time = new Date(this.field['default']).getTime();
            if( this.field['default'] ){
                var time = new Date().getTime();
            }
            this.setValue( time, true );
        }
    },

    renderCheckbox: function(){
        var _this = this;
        this.input = new Element('input', {
            type: 'checkbox'
        })
        .inject( this.fieldPanel );

        this.getValue = function(){
            return (this.input.checked)?1:0;
        }

        this.setValue = function(p, pIntern){
            if( p == 0 ) p = false;
            if( p == 1 ) p = true;
            this.input.checked = p;
            
            if( pIntern )
            	this.onChange();
        }

    },

    renderNumber: function(){
    	
    	this.renderText();
    	
    	this.input.addEvent('keyup', function(){
    		
    		this.value = this.value.replace(/[^0-9]/g, '');
    		
    	});
    	
    },
    
    renderText: function(){
        var _this = this;
        this.input = new Element('input', {
            'class': 'text',
            type: 'text'
        })
        .addEvent('blur', function(){
            _this.isEmpty();
        })
        .inject( this.fieldPanel );

        var _this = this;

        if( this.field.check == 'kurl' ){
            this.input.addEvent('keyup', function(e){
                var old = this.getSelectedRange();
                
                var o = ['ä', 'Ä', 'ö', 'Ö', 'ü', 'Ü', 'ß'];
                
                o.each(function(char){
                    if( this.value.contains(char) ){
                        old.start++;
                        old.end++;
                    }
                }.bind(this));
                
                this.value = _this.checkKurl( this.value);
                
                if( this.value.substr(0, 1) == '-' )
                    this.value = this.value.substr( 1, this.value.length );
                
                if( this.value.substr( this.value.length-1, 1) == '-' )
                    this.value = this.value.substr(0, this.value.length-1);
                
                this.selectRange( old.start, old.end );
            });
        }
    },

    checkKurl: function( pValue ){
        if( this.field.check == 'kurl' )
            return pValue
            .replace(/Ä/g, 'AE')
            .replace(/ä/g, 'ae')
            .replace(/Ö/g, 'OE')
            .replace(/ö/g, 'oe')
            .replace(/Ü/g, 'UE')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/\W/g, '-').replace(/-+/g, '-').toLowerCase();
        else
            return pValue;
    },

    renderTextarea: function(){
        var _this = this;
        this.input = new Element('textarea', {
            styles: {
                'height': (this.field.height)?this.field.height:80,
                'width': (this.field.width)?this.field.width:''
            }
        })
        .addEvent('blur', function(){
            _this.isEmpty();
        })
        .inject( this.fieldPanel );
    },
    
    renderFile: function(){
        this.input = new Element('input', {
            'class': 'text',
            type: 'file',
            name: this.fieldId
        }).inject( this.fieldPanel );
        var _this = this;
        this.setValue = function(){};
    },

    renderPassword: function(){
        var _this = this;
        this.input = new Element('input', {
            'class': 'text',
            type: 'password'
        })
        .addEvent('blur', function(){
            _this.isEmpty();
        })
        .inject( this.fieldPanel );
    },

    empty: function(){
        if( this.emptyIcon ) this.emptyIcon.destroy();
        if( !this.input ) return;

        this.emptyIcon = new Element('img',{
            src: _path+'inc/template/admin/images/icons/exclamation.png',
            'class': 'emptyIcon'
        }).inject( this.input.getParent()  );
        //this.emptyIcon.setStyles({
        //    left: this.input.getPosition(this.input.getParent()).x + this.input.getSize().x
        //});
        this.input.set('class', this.input.get('class')+' empty' );
    },

    highlight: function(){
        if( !this.input ) return;
        this.input.highlight();
    },

    isEmpty: function(){
        if( !this.input ) return;
        if( this.field.empty == false){
            var val = this.getValue();
            if( val == '' ){
                this.empty();
                return true;
            }
        }
        if( this.emptyIcon ) this.emptyIcon.destroy();
        this.input.set('class', this.input.retrieve('oldClass') );
        return false;
    },

    isOk: function(){
    	if( this.field.empty === false )
    		return !this.isEmpty();
    	return true;
    },

    getValue: function(){
        if( !this.input ) return;
        return this.input.value;
    },

    toString: function(){
        return this.getValue();
    },

    setValue: function( pValue, pIntern ){
        if( $type(pValue) == false ) return;
        if( !this.input ) return;
        this.input.value = pValue;
        
        if( pIntern )
        	this.onChange();
    },

    onChange: function(){
    	this.fireEvent('change', this.getValue());
    },

    inject: function( pTo, pP ){
    	
    	if( this.field.onlycontent ){
    		this.fieldPanel.inject( pTo, pP );
    		return this;
    	}
    		
    	
        if( this.main.getDocument() != pTo.getDocument() ){
            pTo.getDocument().adoptNode( this.tr || this.main );
        }
        
        if( this.tr )
        	this.tr.inject( pTo, pP );
    	else
    		this.main.inject( pTo, pP );
        
        if( this.customObj )
        	this.customObj.inject( this.fieldPanel );
        
        return this;
    },
    
    destroy: function(){
    	this.main.destroy();
    },

    hide: function(){
    	if( this.tr )
            this.tr.setStyle( 'display', 'none' );
    	else
    		this.main.setStyle( 'display', 'none' );
    },
    
    
    /**
     * Is hidden because a depends issue.
     */
    isHidden: function(){
    	if( this.tr ){
            if( this.tr.getStyle('display') == 'none' ){
            	return true;
            }
    	} else if( this.main.getStyle('display') == 'none' )
    		return true;
    	return false;
    },

    show: function(){
    	if( this.tr )
            this.tr.setStyle( 'display', 'table-row' );
    	else
    		this.main.setStyle( 'display', 'block' );
    },    
    
    
    initLayoutElement: function(){
    	
    	_win = this.field.win;	
		this.obj = new ka.field_layoutElement(this);
		
    	this.setValue = this.obj.setValue.bind(this.obj);
    	this.getValue = this.obj.getValue.bind(this.obj);
    },
    
    initMultiUpload: function() {    
    	//need to pass the win instance seperatly otherwise the setOptions method will thrown an error 
    	_win = this.field.win;	
    	this.field.win = false;
    	
    	
    	_this = this;
    	//init ext js class
    	if(this.field.extClass){
			try {
				this.obj = new window[ this.field.extClass ]( this.field, _win, _this );				
			}catch(e) {
				
				this.obj = new ka.field_multiUpload(this.field, _win, _this);
			}
    	}else{
    		this.obj = new ka.field_multiUpload(this.field, _win, _this);
    	}
    	
    	this.isEmpty = this.obj.isEmpty.bind(this.obj);
    }
});

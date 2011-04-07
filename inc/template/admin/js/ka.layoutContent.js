ka.layoutContent = new Class({

    Implements: Events,
	
	noAccess: false,
    isRemoved: false,
	
    initialize: function( pContent, pContainer, pLayoutBox ){
        this.content = $H(pContent);
        this.container = pContainer;
        this.w = this.container.getWindow();
        this.editMode = 0;
        this.layoutBox = pLayoutBox;

        this.langs = {
            picture: _('Picture'),
            template: _('Template'),
            text: _('Text'),
            layoutelement: _('Layout Element'),
            navigation: _('Navigation'),
            pointer: _('Pointer'),
            html: _('HTML'),
            php: _('PHP'),
            plugin: _('Plugin')
        };
        
        if( this.layoutBox.pageInst.page && !ka.checkPageAccess( this.layoutBox.pageInst.page.rsn, 'content-'+pContent.type ) ){
        	this.noAccess = true;
        }

        this.renderBox();

        
    },

    renderBox: function(){
        
        var pos = null;
        if( this.content['new'] ||  this.content['top'] ){
            pos = 'top';
        }

        var toElement = this.container;
        if( this.content['afterElement'] ){
            toElement = this.content['afterElement'];
            pos = 'after';
        }

        this.main = new Element('div', {
            'class': 'ka-layoutContent-main'
        }).inject( toElement, pos );

        var _this = this;
        this.main.addEvent('mouseover', function(){
            /*
            _this.setBubbleContent();
            */this.pluginChooser

            _this.options.set('tween', {onComplete: function(){}});
            _this.options.tween('opacity', 1);
            
        });

        this.main.addEvent('click', function(e){
            /*_this.hideBubbleBox();*/
            _this.select();
        	e.stop();
            e.stopPropagation();
        });

        this.main.addEvent('mouseout', function(){
            _this.options.tween('opacity', 0);
            /*_this.hideBubbleBox();*/
        });

        this.main.store( 'layoutContent', this );
        this.main.layoutContent = this;

        this.title = new Element('div', {
            'class': 'ka-layoutContent-title'
        })
        .inject( this.main );

        this.options = new Element('div', {
            'class': 'ka-layoutContent-options',
            styles: {
                opacity: 0
            }
        })
        .inject( this.main );

        this.titleType = new Element('span', {
        }); //.inject( this.options );

        this.optionsTemplate = new Element('span', {
        });
        //.inject( this.options );

        this.bubbleBox = new Element('div', {
            'class': 'ka-layoutContent-bubbleBox',
            text: "hi",
            styles: {
                opacity: 0,
                display: 'none'
            }
        })
        .inject( this.main );

        this.bubbleBoxContent = new Element('div').inject( this.bubbleBox );

        this.optionsImg = new Element('div', {
        })
        .inject( this.options );
        //.inject( this.bubbleBox );

        new Element('div', {style: 'clear: both'}).inject( this.options );

        this.body = new Element('div', {
            'class': 'ka-layoutContent-div'
        }).inject( this.main );

        this.body.addEvent('click', function(){
            //if( this.editMode == 0 )
                //this.toggleEdit();
        }.bind(this));

        this.renderTitleActions();

        this.title.getElements('img').setStyle('opacity', 0.5);

        new Element('div', {style: 'clear: both; height: 1px;'}).inject( this.title );

        this.setDivContent();
        if( this.content['new'] ||this.content.toEdit ){
            this.select();
        }

        /*
        if( this.content['new'] ||this.content.toEdit ){
            this.toggleEdit();
        }
        */

    },

    hideBubbleBox: function( pNow ){
        if( pNow ){
            this.bubbleBox.setStyle('opacity', 0);
            this.bubbleBox.setStyle('display', 'none'); 
        } else {
            this.bubbleBox.set('tween', {onComplete: function(){
                this.bubbleBox.setStyle('display', 'none'); 
            }.bind(this)});
            this.bubbleBox.tween('opacity', 0);
        }
    },

    setBubbleContent: function(){

        var title = this.content.title;
        if( title == ""){
            title = _('[No title]');
        }

        this.bubbleBoxContent.set('html', '<div style="font-weight: bold;">'+title+'</div>'+
                _('Template file')+': '+ this.getTemplateTitle(this.content.template)+'<br />'+
                '');

    },

    renderTitleActions: function(){
        var p = _path+'inc/template/admin/images/icons/';

        if( !this.content.noActions ){
	        if( !this.noAccess ){
		        new Element('img', {
		            src: p+'delete.png',
		            title: _('Delete')
		        })
		        .addEvent('click', this.remove.bindWithEvent(this))
		        .inject( this.optionsImg );
	        }

	        new Element('img', {
	            src: p+'page_paste.png',
	            title: _('Paste')
	        })
	        .addEvent('click', this.pasteAfter.bindWithEvent(this))
	        .inject( this.optionsImg );
	
	        new Element('img', {
	            src: p+'page_copy.png',
	            title: _('Copy')
	        })
	        .addEvent('click', this.copy.bindWithEvent(this))
	        .inject( this.optionsImg );
	
	        new Element('img', {
	            src: p+'arrow_down.png',
	            title: _('Move down')
	        })
	        .addEvent('click', this.toDown.bindWithEvent(this))
	        .inject( this.optionsImg );
	
	        new Element('img', {
	            src: p+'arrow_up.png',
	            title: _('Move up')
	        })
	        .addEvent('click', this.toUp.bindWithEvent(this))
	        .inject( this.optionsImg );
	
	
	        new Element('img', {
	            src: p+'arrow_out.png',
	            'class': 'ka-layoutContent-mover',
	            style: 'cursor: move',
	            title: _('Drag and drop')
	        })
	        .addEvent('click', function(e){
	            if( e ) e.stop();
	        })
	        .inject( this.optionsImg );
	
	        
	        this.hideImg = new Element('img', {
	            src: p+'lightbulb.png',
	            title: _('Hide/Unhide')
	        })
	        .inject( this.optionsImg );
	        
	        if( !this.noAccess ){
	        	this.hideImg.addEvent('click', this.toggleHide.bindWithEvent(this))
	        }
        }
    },

    /*
    * ACTIONS
    */

    remove: function(e){
    	this.deselect();
    	this.isRemoved = true;
        this.fireEvent('remove');
        this.main.destroy();
        this.content = null;
        if( e ){
            e.stop();
            e.stopPropagation();
        }
    },

    toUp: function(e){
        if( e ) e.stop();
        var previous = this.main.getPrevious();
        if( previous )
            this.main.inject( previous, 'before' );
        if( this.content.type == 'text' )
            this.type2Text(true);
    },

    toDown: function(e){
        if( e ) e.stop();
        var next = this.main.getNext();
        if( next )
            this.main.inject( next, 'after' );
        if( this.content.type == 'text' )
            this.type2Text(true);
    },

    copy: function( e ){
       if( e ) e.stop();
       var title = (this.content.title=='')?_('[No title]'):this.content.title;
       this.content['new'] = false;
       this.content['top'] = false;
       ka.setClipboard( 'Seiteninhalt \''+title+'\' kopiert.', 'pageItem', this.content );
    },

   toggleHide: function( e ){
        if( e ) e.stop();
        if( this.content.hide == 1 ){
            this.content.hide = 0;
        } else {
            this.content.hide = 1;
        }
        this.setHide( this.content.hide );
    },

    pasteAfter: function( e ){
        if( e ) e.stop();
        var clip = ka.getClipboard();
        content = new Hash(clip.value);
        if( clip.type == 'pageItem' ){
            content.rsn = null;
            content['new'] = false;
            var n = new ka.layoutContent( content, this.container, this.layoutBox );
            n.main.inject( this.main, 'after' );
            n.main.highlight();
            this.container.retrieve('layoutBox').contents.include( n );
       }
        if( clip.type == 'pageItems' ){
            var arr = $A(clip.value);
            for( var i = arr.length-1; i >= 0; i-- ){
                var content = arr[i];
                content.rsn = null;
                content['new'] = false;
                var n = new ka.layoutContent( content, this.contentContainer, this.layoutBox );
                n.main.inject( this.main, 'after' );
                n.main.highlight();
                this.container.retrieve('layoutBox').contents.include( n );
            };
        }
        var layoutBox = this.container.retrieve('layoutBox');
        layoutBox.initSort();
    },

    toggleEdit: function(){
        if( this.editMode == 0 ){
            this.editMode = 1;
            this.toEditMode();
        } else {
            this.editMode = 0;
            this.toViewMode();
        }
    },

    toEditMode: function(){
    	
        //this.body.empty();
        this.width = this.main.getSize().x;

        this.layoutBox.pageInst._showElementPropertyToolbar();
        
        
        if(this.content.title && this.content.title.length > 1)
        	this.layoutBox.pageInst.elementPropertyFields.eTitle.setValue( this.content.title );
        else
        	this.layoutBox.pageInst.elementPropertyFields.eTitle.setValue('');
        
        //setting accessfields
        this.layoutBox.pageInst.elementAccessFields.unsearchable.setValue(this.content.unsearchable);
     
        if(this.content.access_from > 0)
        	this.layoutBox.pageInst.elementAccessFields.access_from.setValue( this.content.access_from );
        else
        	this.layoutBox.pageInst.elementAccessFields.access_from.setValue('');

        if(this.content.access_to > 0)
        	this.layoutBox.pageInst.elementAccessFields.access_to.setValue( this.content.access_to );
        else
        	this.layoutBox.pageInst.elementAccessFields.access_to.setValue('');

        var temp = '';      
        if( this.content.access_from_groups && $type(this.content.access_from_groups) != 'array') {
        	
        	if( $type(this.content.access_from_groups) == 'number' )
        		this.content.access_from_groups = ''+this.content.access_from_groups+'';

            temp = this.content.access_from_groups.split(',');
      
        }else if($type(this.content.access_from_groups) == 'array') {
        	temp = this.content.access_from_groups;
    	}
        this.layoutBox.pageInst.elementAccessFields.access_from_groups.setValue( temp );
        
        
            
        
        
        /*
        
        this.eTypeSelect = new ka.field({
            label: _('Type'),
            type: 'select',
            help: 'admin/element-type',
            small: 1,
            tableItems: [
                {i: 'text', label: _('Text')},
                {i: 'picture', label: _('Picture')},
                {i: 'plugin', label: _('Plugin')},
                {i: 'pointer', label: _('Pointer')},
                {i: 'navigation', label: _('Navigation')},
                {i: 'template', label: _('Template')},
                {i: 'html', label: _('HTML')},
                {i: 'php', label: _('PHP')}
            ],
            table_key: 'i',
            table_label: 'label'
        }).inject( p ); */
        this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.addEvent('change', this.changeType.bind(this));



        //template select
        //this.optionsTemplate.empty();

       // var templateP = new Element('div', {
       //     'class': 'ka-field-main ka-field-main-small'
       // }).inject( p );

        //new Element('div', {
       //     'class': 'ka-field-title',
      //      html: '<div class="title">'+_('Template')+'</div>'
       // }).inject( templateP );

      //  var newP = new Element('div', {
      ////      'class': 'ka-field-field'
      //  }).inject( templateP );


      //  this.eTemplate = new Element('select', {
        //}).inject( w2 );
     //   }).inject( newP );

    //    if( this.content.type != "text" )
    //        this.eTitle.input.focus();

      //  var limitLayouts = [];


      //  this.eTemplateNoLayout = new Element('option', {
      //      html: _('-- no layout --'),
     //       value: ''
      //  }).inject(this.eTemplate);

     /*   $H(ka.settings.contents).each(function(la, key){
            var group = new Element('optgroup', {
                label: key
            });
            var count = 0;
            $H(la).each(function(layoutFile,layoutTitle){
                if( limitLayouts && limitLayouts.length > 0 && !limitLayouts.contains( layoutFile ) ) return;
                new Element('option', {
                    html: layoutTitle,
                    value: layoutFile
                }).inject( group );
                count++;
            })
            if( count != 0 )
                group.inject( this.eTemplate );
        }.bind(this));
*/
        if( this.content.template == '' || !this.content.template ){
            var opt = this.layoutBox.pageInst.elementPropertyFields.eTemplate.getElements('option')[1];
            if( opt ) {
            	this.layoutBox.pageInst.elementPropertyFields.eTemplate.value = opt.value;
            }
        } else {
        	this.layoutBox.pageInst.elementPropertyFields.eTemplate.value = this.content.template;
        }
        

        this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.setValue( this.content.type );
       // this.layoutBox.pageInst.elementPropertyFields.ePanel = new Element('div', {'class': 'ka-pages-layoutContent-ePanel'}).inject( p );

        this.changeType();
    },

    toData: function( pForce ){
    	
    	if( this.noAccess ) return;
    	
        //fetch data from forms
        //if( this.editMode != 1 ) return;
        if(! this.layoutBox.pageInst.elementPropertyFields.eTitle ) return;
        if(! this.layoutBox.pageInst.elementPropertyFields.eTemplate ) return;
        if( this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.getValue() == "") return;
        if( !this.content ) this.content = {};
        
        
        if( this.content.type == 'layoutelement' ){
        	this.saveLayoutElement();
        }

        if( !pForce && !this.selected ) return;

        this.content.title = this.layoutBox.pageInst.elementPropertyFields.eTitle.getValue();
        this.content.type = this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.getValue();
        this.content.template = this.layoutBox.pageInst.elementPropertyFields.eTemplate.value;
      
        this.content.unsearchable = this.layoutBox.pageInst.elementAccessFields.unsearchable.getValue();
        this.content.access_from = this.layoutBox.pageInst.elementAccessFields.access_from.getValue();
        this.content.access_to = this.layoutBox.pageInst.elementAccessFields.access_to.getValue();
        this.content.access_from_groups = this.layoutBox.pageInst.elementAccessFields.access_from_groups.getValue();
        
        switch( this.content.type ){
        case 'plugin':
            this.content.content = this.pluginChooser.getValue();
            break;
        case 'text':
            try {
                var tiny = this.w.tinyMCE.get(this.lastId);
                if( tiny )
                    this.content.content = tiny.getContent();
            } catch( e ){
                logger(e);
            }
            break;
        case 'html':
        case 'php':
            this.content.content = this.textarea.value;
            break;
        case 'pointer':
            break;
        case 'navigation':
            this.content.content.template = this.navigationTemplate.getValue();
            break;
        case 'template':
            this.content.content = this.templateFileField.getValue();
            break;
        case 'picture': 
            this.setPicContentValue(true);
            //this.content.content = 'none::'+this.type2PicInput.value;
            break;
        }
    },

    toViewMode: function(){

        //set form-data to this.content
        this.toData();

        //display data
        this.setDivContent();
    },

    getTemplateTitle: function( pFile ){
        if( pFile == "" ) return _('No layout');
        var res = 'not-found';
        $H(ka.settings.contents).each(function(la, key){
            $H(la).each(function(layoutFile,layoutTitle){
                if( pFile == layoutFile )
                    res = layoutTitle;
            });
        });
        return res;
    },


    //toEditMode
    changeType: function(){
    	
    	this.oldType = this.content.type;
    	
        if( this.layoutBox.pageInst.elementPropertyFields.eTypeSelect )
            this.content.type = this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.getValue();

        //if( this.content.type != "text" )
        this.layoutBox.pageInst.elementPropertyFields.ePanel.empty();

//        this.body.setStyle('background-image', 'url('+_path+'inc/template/admin/images/ka-keditor-elementtypes-item-'+this.content.type+'-bg.png)');

        if( this.content.type != 'plugin' && this.content.type != 'picture' ){
            this.layoutBox.pageInst.hidePluginChooserPane( true );
        }
        
        if( this.content.type != 'layoutelement' ){
        	this.oldLayoutElementLayout = null;
        	this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect.hide();
        } else {
        	this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect.show();
        }

        switch( this.content.type ){
        case 'text':
            this.type2Text();
            break;
        case 'plugin':
            this.type2Plugin();
            break;
        case 'html':
        case 'php':
            this.type2HTML();
            break;
        case 'navigation':
            this.type2Navi();
            break;
        case 'pointer':
            this.type2Pointer();
            break;
        case 'template':
            this.type2Template();
            break;
        case 'layoutelement':
        	this.toLayoutElement();
        	break;
        case 'picture':
            this.type2Pic();
            break;
        }

        this.setDivContent();

    },
    
    saveLayoutElement: function(){
    	
    	if( !this.layoutElement ) return;
    	
    	var layout = this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect.getValue();
    	var contents = this.layoutElement.getValue();
    	
    	this.content.content = JSON.encode({
    		layout: layout,
    		contents: contents
    	});
    	
    },
    
    toLayoutElement: function(){

        this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect.removeEvents();
        
        this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect
        .addEvent('change', this._loadLayoutElement.bind(this));
        
		this._loadLayoutElement();
    },
    
    _loadLayoutElement: function(){
    	
    	if( this.oldType == this.content.type && this.layoutElement ){
    		//change layout possible
    		var newLayout = this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect.getValue();
    		this.layoutElement.loadTemplate( newLayout );
    		return;
    	}

    	var content = false;
    	if( this.content.content ){
    		try {
    			content = JSON.decode(this.content.content);
    		} catch( e ){
    			content = false;
    		}
    	}
    	
    	var contents = false;
    	if( content )
    		contents = content.contents;

    	this.body.set('html', _('Loading ...'));
    	
    	if( !content ){
    		content = {
				layout: this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect.getValue(),
				contents: {}
    		}
    	}
    	
    	this.layoutElement = new ka.layoutElement( this.layoutBox.pageInst, this.body, content.layout );

		if( contents ){
	    	this.layoutBox.pageInst.elementPropertyFields.eLayoutSelect.setValue(content.layout);
			this.layoutElement.setValue( contents );
		}
		
    },

    type2HTML: function(){
        this.body.empty();
        var p = new Element('div', {
            style: 'margin-right: 4px;'
        }).inject( this.body );
        
        this.textarea = new Element( 'textarea', {
            style: 'width: 100%; margin: 0px; padding: 1px; border: 1px solid silver;',
            'class': 'text', rows: 5,
            text: this.content.content
        }).inject( p );
        
        this.textarea.addEvent('keyup', function(){
        	var t = this.value.split("\n");
        	this.rows = t.length-1; 
        });
        
        this.textarea.fireEvent('keyup');
    },

    type2Navi: function(){    	
        var _this = this;
        try {
            if( $type(_this.content.content) == 'string' )
                _this.content.content = JSON.decode(_this.content.content);
            if( $type(_this.content.content) != 'object' )
                _this.content.content = {};
        } catch(e){
            _this.content.content = {};
        }

        var templateNavi = new ka.field(
            {label: _('Navigation template'), type: 'select', small: true}
        ).inject( this.layoutBox.pageInst.elementPropertyFields.ePanel );
        this.navigationTemplate = templateNavi;

        templateNavi.addEvent('change', function( pValue ){
            _this.content.content.template = templateNavi.input.value;
        });

        $H(ka.settings.navigations).each(function(la, key){
            var group = new Element('optgroup', {
                label: key
            });
            var count = 0;
            $H(la).each(function(layoutFile,layoutTitle){
                if( limitLayouts && limitLayouts.length > 0 && !limitLayouts.contains( layoutFile ) ) return;
                new Element('option', {
                    html: layoutTitle,
                    value: layoutFile
                }).inject( group );
                count++;
            })
            if( count != 0 )
                group.inject( templateNavi.input );
        }.bind(this));

        templateNavi.setValue( this.content.content.template );


        var field = new ka.field(
            {label: _('Entry point'), type: 'pageChooser', empty: false, small: true, onlyIntern: true}
        ).inject( this.layoutBox.pageInst.elementPropertyFields.ePanel );

        if( this.content.content.entryPoint )
            field.setValue( this.content.content.entryPoint );

        field.addEvent('change', function( pValue ){
            _this.content.content.entryPoint = pValue;
            _this.setDivContent();
        });
    },

    type2Pointer: function(){

        var field = new ka.field(
            {label: _('Choose deposit'), type: 'pageChooser', empty: false, small: true}
        ).inject( this.layoutBox.pageInst.elementPropertyFields.ePanel );

        field.setValue(this.content.content);
        
        var _this = this;
        /*
        var loadDiv = function(){
            _this.pointerWindow = ka.wm.openWindow( 'admin', 'pages/chooser', null, _this.w.win.id, {onChoose: function( pPage ){
                _this.content.content = pPage;
                _this.setDivPointer( );
                this.win.close();
            },
            cookie: 'pointer',
            domain: _this.w.currentPage.domain_rsn,
            value: _this.content.content,
            opts: {pages: 1}
            });
        }
        this.setDivPointer();
        */

        field.addEvent('change', function( pPage ){
            _this.content.content = pPage;
            _this.setDivPointer();
        });
    },

    renderNavigationChoosenPage: function(){
        this.navigationChoosenPageDiv.set('html', this.navigationChoosenPage.title+': '+this.navigationChoosenPage.realUrl);
    },

    type2Plugin: function(){
        
        this.layoutBox.pageInst.pluginChooserPane.empty();
        this.pluginChooser = new ka.pluginChooser( this.content.content, this.layoutBox.pageInst.pluginChooserPane );
        this.pluginChooser.addEvent('ok', function(){
            this.deselect();
        }.bind(this));
        this.layoutBox.pageInst.showPluginChooserPane();
        
    },

    type2Template: function(){

        this.templateFileField = new ka.field({
            label: _('Template file'), type: 'file', small: 1
        })
        .inject( this.layoutBox.pageInst.elementPropertyFields.ePanel );
        
        this.templateFileField.setValue( this.content.content );

        return;
        /*
        var temp = new Element('div', {
            style: 'margin-right: 4px; margin-bottom: 3px;'
        }).inject( this.ePanel );

        this.type2TemplateInput = new Element('input', {
            value: this.content.content,
            style: 'width: 100%'
        })
        .inject( temp );

        var div = new Element('div').inject( this.ePanel );
        this.type2PicBtn = new ka.Button(_('Choose'))
        .addEvent('click', function(){
            var _this = this;
            ka.wm.openWindow( 'admin', 'pages/chooser', null, _this.w.win.id, {
                onChoose: function( pPage ){
                    _this.type2TemplateInput.value = pPage;
                    this.win.close();
                },
                display: 'icon',
                value: this.content.content,
                opts: {files: 1, upload: 1}
            });

        }.bind(this)) //this.type2PicChoose.bind(this))
        .inject( div );
        */
    },



    getPicProperties: function(){
        
        res = {};
        
        res.align = this.picAlign.getValue();
        res.link = this.picLink.getValue();
        res.alt = this.picAlt.getValue();
        res.title = this.picTitle.getValue();

        res.width = this.picDimensionWidth.value;
        logger('newWidth: '+this.picDimensionWidth.value);
        res.height = this.picDimensionHeight.value;
    
        return res;
    },

    setPicContentValue: function( pNoRender ){
    	if( !this.picUrl ) return;
        
        var url = this.picUrl.getValue();
        
        var opts = this.getPicProperties();
        this.content.content = JSON.encode(opts)+'::'+url;
        
        if( this.selected == true ){
            logger('setPicContentValue: selected=true');
            if( $type(url) == 'string' && url.length > 0 ){
            
                if( this.picBorderDiv.getElement('img.ka-content-type-img') &&
                    this.picBorderDiv.getElement('img.ka-content-type-img').get('src') == url
                  ){
                    
                } else {
                    this.picBorderDiv.empty();
                    //logger(this.picBorderDiv.getElement('img.ka-content-type-img').get('src') +' == '+ url);
                    var fId = 'adminFilesImgOnLoad'+new Date().getTime()+((Math.random()+"").replace(/\./g, ''));
                    window[fId] = function(){
                        this.picLoaded();
                    }.bind(this);
                    
                    this.picBottomPic = new Element('img', {
                        src: url,
                        'class': 'ka-content-type-img',
                        align: 'center',
                        onLoad: fId+'()'
                    }).inject( this.picBorderDiv );
                    
                    if( this.picLoading )
                        this.picLoading.destroy();
                    
                    this.picLoading = new Element('div', {
                      style: 'position: absolute; left: 0px; text-align: center; top: 0px; height: 120px; width: 130px; background-color: #eee',
                      html: '<br /><br /><img src="'+_path+'inc/template/admin/images/loading.gif" />'
                    }).inject( this.picBorderDiv );
                }
            }
            
            this.picBorderDiv.setStyle('text-align', opts.align);
        }
        
        if( pNoRender !== true )
            this.setDivContent();
    },

    type2Pic: function(){



        this.layoutBox.pageInst.pluginChooserPane.empty();
        //this.pluginChooser = new ka.pluginChooser( this.content.content, this.layoutBox.pageInst.pluginChooserPane );
        //this.pluginChooser.addEvent('ok', function(){
        //    this.deselect();
        //}.bind(this));
        this.layoutBox.pageInst.showPluginChooserPane();

        var url = '';
        var opts = {align: 'left', link: '', alt: '', title: '', width: '', height: ''};
        
        if( this.content.content && this.content.content.split ){
            var t = this.content.content.split('::');
            url = t[1];
            if( t[0] != 'none' && t[0] != "" && t[0].substr(0, 1) == '{' )
                opts = JSON.decode( t[0] );
        }
        
        this.picTopDiv = new Element('div', {
            style: 'position: absolute; left: 0px; top: 0px; right: 140px; bottom: 35px; overflow: auto;'
        }).inject( this.layoutBox.pageInst.pluginChooserPane );
        
        var table = new Element('table').inject( this.picTopDiv );
        this.tbody = new Element('tbody').inject( table );
        
        this.picUrl = new ka.field(
            {label: _('Choose image'), tableitem: 1, type: 'fileChooser', empty: false}
        )
        .addEvent('change', function(){
            this.setPicContentValue();
        }.bind(this))
        .inject( this.tbody );

        this.picUrl.setValue( url );
        
        
        if( !opts.link ) opts.link = '';
        
        this.picLink = new ka.field({
            label: _('Link'), tableitem: 1, type: 'chooser'
        }).inject( this.tbody );
        
        this.picLink.setValue( opts.link );
        
        
        if( !opts.alt ) opts.alt = '';
        if( !opts.title ) opts.title = '';

        this.picTitle = new ka.field({
            label: _('Title'), tableitem: 1
        }).addEvent('change', function(){
            this.setPicContentValue();
        }.bind(this))
        .inject( this.tbody );
        this.picTitle.setValue( opts.title );
        
        
        this.picAlt = new ka.field({
            label: _('Alternative description'), tableitem: 1
        })
        .addEvent('change', function(){
            this.setPicContentValue();
        }.bind(this))
        .inject( this.tbody );
        this.picAlt.setValue( opts.alt );
        
        
        this.picAlign = new ka.field({
            label: _('Image align'), type: 'select', tableItems: [
                {id: 'left', l: _('Left')},
                {id: 'center', l: _('Center')},
                {id: 'right', l: _('Right')}
            ],
            table_key: 'id', table_label: 'l', tableitem: 1
        })
        .addEvent('change', function(){
            this.setPicContentValue();
        }.bind(this))
        .inject( this.tbody );
        this.picAlign.setValue( opts.align );
        
        
        this.picBorderDiv = new Element('div', {
            style: 'border: 1px solid silver; position: absolute; overflow: hidden; top: 15px; right: 5px; width: 130px; bottom: 100px; background-color: white;'
        })
        .inject( this.layoutBox.pageInst.pluginChooserPane );
        
        this.picSizeZoomer = new Element('div', {
            style: 'position: absolute; border: 1px solid silver; height: 19px; right: 5px; bottom: 73px; width: 130px; background-color: #ddd; -webkit-border-radius: 3px; -moz-border-radius: 3px;'
        }).inject( this.layoutBox.pageInst.pluginChooserPane );

        this.picSizeZoomerText = new Element('div', {
            style: 'width: 20px; position: absolute; top: 3px; left: 0px; width: 100%; text-align: center; height: 19px; '
        }).inject( this.picSizeZoomer );
        
        this.picSizeZoomerKnob = new Element('div', {
            style: 'width: 20px; position: absolute; top: 0px; height: 19px; background-color: gray; -moz-border-radius: 3px; -webkit-border-radius: 3px;',
            styles: {
                opacity: 0.6
            }
        }).inject( this.picSizeZoomer );
        
        this.loadingImg = false;
        
        this.picSlider = new Slider(this.picSizeZoomer, this.picSizeZoomerKnob, {
            steps: 100,
            onChange: function( pVal ){
                if( this.loadingImg == false ){
                    this.picSizeZoomerText.set('text', 'Loading ...');
                } else {
                    
                    this.picSizeZoomerText.set('text', pVal+'%');
                    this.picCalcSize( pVal );
                    this.setPicContentValue();
                    
                }
            }.bind(this)
        }).set(100);
        
        this.picDimensionWidth = new Element('input', {
            'class': 'text',
            value: opts.width,
            style: 'width: 50px; position: absolute; right: 81px;bottom: 45px;'
        })
        .addEvent('change', this.setPicContentValue.bind(this))
        .inject( this.layoutBox.pageInst.pluginChooserPane );
        
        new Element('div', {
            text: 'x',
            style: 'position: absolute; right: 68px; bottom: 47px; color: gray; font-weight: bold; '
        }).inject( this.layoutBox.pageInst.pluginChooserPane );
        
        this.picDimensionHeight = new Element('input', {
            'class': 'text',
            value: opts.height,
            style: 'width: 50px; position: absolute; right: 5px; bottom: 45px;'
        })
        .addEvent('change', this.setPicContentValue.bind(this))
        .inject( this.layoutBox.pageInst.pluginChooserPane );
        
        this.picBottom = new Element('div', {
            style: 'position: absolute; left: 0px; right: 0px; height: 29px; bottom: 0px;',
            'class': 'ka-pluginchooser-bottom'
        }).inject( this.layoutBox.pageInst.pluginChooserPane );
        
        
        /*if( $type(url) == 'string' && url.length > 0 ){

            
            var fId = 'adminFilesImgOnLoad'+new Date().getTime()+((Math.random()+"").replace(/\./g, ''));
            window[fId] = function(){
                this.picLoaded();
            }.bind(this);
            
            this.picBottomPic = new Element('img', {
                src: url,
                align: 'center',
                onLoad: fId+'()'
            }).inject( this.picBorderDiv );
            
            if( this.picLoading )
                this.picLoading.destroy();
            
            this.picLoading = new Element('div', {
                style: 'position: absolute; left: 0px; text-align: center; top: 0px; height: 100%; width: 100%; background-color: #eee',
                html: '<br /><br /><img src="'+_path+'inc/template/admin/images/loading.gif" />'
            }).inject( this.picBorderDiv );
            
            
        } else {
            this.picLoaded();
        }*/
        
        if( this.picBottomPic )
            this.picBottomPic.set('style', '');
        
        this.picBottomOk = new ka.Button(_('OK'))
        .addEvent('click', function(){
            this.deselect();
        }.bind(this))
        .inject( this.picBottom );


        this.setPicContentValue();

        return;
    },
    
    picCalcSize: function( pProz ){
      
        var faktor = pProz / 100;

        if( !this.imgSize ) return;

        this.picDimensionWidth.value = Math.ceil(this.imgSize.x * faktor);
        this.picDimensionHeight.value = Math.ceil(this.imgSize.y * faktor);

        
        if( this.picDivContentImg ){
            logger('picCalcSize');
            this.picDivContentImg.set('width', this.picDimensionWidth.value);
            this.picDivContentImg.set('height', this.picDimensionHeight.value);            
        }
        
        
        return;
        
        if( this.imgSize.x > this.imgSize.y ){
            var newX = this.imgSize.x * faktor;
            this.img.width = newX;
        } else {
            var newY = this.imgSize.y * faktor;
            this.img.height = newY;
        }

        this.picDimensionHeight.value = this.img.height;
        this.picDimensionWidth.value = this.img.width;
    },
    
    picLoaded: function(){
        this.loadingImg = true;

        this.picSizeZoomerText.set('text', '100%');
        
        if( this.picBottomPic ){
            this.imgSize = {x: this.picBottomPic.width, y: this.picBottomPic.height };
            this.picBottomPic.set('style', 'max-width: 100%; max-height: 100%');

            //this.picDimensionWidth.value = this.imgSize.x;
            //this.picDimensionHeight.value = this.imgSize.y;
        }

        if( this.picLoading )
            this.picLoading.destroy();
        

        var opts = JSON.decode(this.content.content.split('::')[0]);
        var proz = 100;
        if( opts ){
            if( opts.width && opts.height ){

                proz = Math.floor(opts.width / (this.imgSize.x / 100));
                var prozHeight = Math.floor(opts.height / (this.imgSize.y / 100));
                if( proz == prozHeight ){
                    if( proz > 100 )
                        proz = 100;
                    if( proz < 0 )
                        proz = 0;
                } else {
                    proz = -1;
                    this.picSizeZoomerText.set('text', _('User defined'));
                }
                
            }
        }
        if( proz != -1 )
            this.picSlider.set( proz );
        
    },

    type2PicChoose: function(){
        ka.wm.openWindow( 'admin', 'pages/choosePic', null, this.w.win.id, {
            input: this.type2PicInput,
            image: this.type2PicImage,
            pic: this.content.content
        });
    },

    renderType2Pic: function(){
        
    },

    type2Text: function( pForce ){
        
        if( this.lastId && !pForce ) return;
        this.body.empty();

        this.lastId = 'WindowField'+((new Date()).getTime())+''+$random(123,5643)+''+$random(13284134,1238845294);
        this.main.store( 'tinyMceId', this.lastId );
        var text = new Element('textarea', {
            id: this.lastId,
            value: this.content.content,
            style: 'height: 100%; width: 100%'
        }).inject( this.body );

//        if( this.width > 440 ){
            var _this = this;
            this.w['tinyOnLoad-'+this.lastId] = function(ed,evt){

                /*
                var updateHeight = function(editor){
                    var text = "";

                    logger( editor );
                    var container = editor.contentAreaContainer;type
                    var formObj = document.forms[0]; // this might need some adaptation to your site
                    var dimensions = {
                            x: 0,
                            y: 0,
                            maxX: 0,
                            maxY: 0
                    };
                    var doc;
                    var docFrame;

                    dimensions.x = formObj.offsetLeft; // get left space in front of editor
                    dimensions.y = formObj.offsetTop; // get top space in front of editor

                    dimensions.x += formObj.offsetWidth; // add horizontal space used by editor
                    dimensions.y += formObj.offsetHeight; // add vertical space used by editor

                    container.children[0].style.height = container.style.height = (editor.contentDocument.body.offsetHeight+25)+'px';
                };

                ed.onMouseDown.add(updateHeight);
                ed.onChange.add(updateHeight);
                */

                var setToolbar = function(){
                    var mtop = _this.w.document.html.scrollTop;
                    
                    /*var pos = _this.w.$(_this.lastId+'_parent').getPosition(_this.w.document.body);
                    mtop = mtop - pos.y + 53;
                    logger( mtop );*/
                    
                   // _this.w.$(_this.lastId+'_external').getParent().setStyle('top', mtop+'px');
                };

                ed.onInit.add(function(){
                    _this.tinyMceClickCount = 0;
                    _this.w.document.addEvent('scroll', function(){
                        setToolbar();
                    });
                    /*
                    _this.w.$(_this.lastId+'_external').addEvent('click', function(e){
                        e.stop();
                        e.stopPropagation();
                        return false;
                    });
                    */
                    _this.w.$(_this.lastId+'_external').getParent().set('class', 'tinyMceExternalToolbarParent');
                    _this.w.$(_this.lastId+'_external').getParent().addEvent('click', function(e){
                        _this.dontHideTinyToolbar = true;
                        e.stop();
                        e.stopPropagation();
                        return false;
                    });
                    _this.w.$(_this.lastId+'_external').set('class', 'mceExternalToolbar mceEditor o2k7Skin o2k7SkinSilver');
                    
                    var tparent = _this.w.document.body;
                    var layoutElementParent = _this.w.$(_this.lastId+'_external').getParent('.ka-field-layoutelement-layoutcontent')
                    
                    if( layoutElementParent  ){
                    	
                    	tparent = layoutElementParent.getNext('.ka-field-layoutelement-tinytoolbar');
                    	_this.w.$(_this.lastId+'_external').getParent().setStyle('position', 'absolute');
                    	
                    } else {

                        _this.w.$(_this.lastId+'_external').getParent().setStyle('position', 'fixed');
                        _this.w.$(_this.lastId+'_external').getParent().setStyle('z-index', '80000000');
                        
                    }
                    
                    _this.w.$(_this.lastId+'_external').getParent().inject( tparent );
                    _this.w.$(_this.lastId+'_external').getParent().setStyle('display', 'none');
                    //_this.w.$(_this.lastId+'_external').getParent().setStyle('opacity', 0.9);

//                    ed.contentDocument.body.onfocus = function(){
                    var s = ed.settings;
                    
                    var showTiny = function(){
                    	_this.tinyMceClickCount++;
                        if( _this.tinyMceClickCount >= 1 )
                            _this.select();
                        _this.w.$(_this.lastId+'_external').getParent().setStyle('display', 'block');
                    }
                    
                    tinymce.dom.Event.add(s.content_editable ? ed.getBody() : (tinymce.isGecko ? ed.getDoc() : ed.getWin()), 'focus', function(e) {
                    	showTiny();
                    });
                    
                    ed.onExecCommand.add(function(ed, l){
                    	//_this.ignoreNextDeselect = true;
                    	_this.layoutBox.pageInst.ignoreNextDeselectAll = true;
                    	(function(){
                        	_this.layoutBox.pageInst.ignoreNextDeselectAll = false;
                    	}).delay(500);
                    });
                    
                    tinymce.dom.Event.add(s.content_editable ? ed.getBody() : (tinymce.isGecko ? ed.getDoc() : ed.getWin()), 'click', function(e) {
                    	showTiny();
                    });

                    tinymce.dom.Event.add(s.content_editable ? ed.getBody() : (tinymce.isGecko ? ed.getDoc() : ed.getWin()), 'blur', function(e) {
                        //_this.deselect();
                        //_this.w.$(_this.lastId+'_external').getParent().setStyle('display', 'none');
                    });

                    _this.hideTinyMceToolbar = function(){
                        _this.dontHideTinyToolbar = false;
                        (function(){
                            if( _this.dontHideTinyToolbar != true && _this.w.$(_this.lastId+'_external') ){
                                _this.w.$(_this.lastId+'_external').getParent().setStyle('display', 'none');
                                if( _this.w.$('menu_'+_this.lastId+'_contextmenu') )
                                    _this.w.$('menu_'+_this.lastId+'_contextmenu').destroy();
                            }
                        }).delay( 200 );
//                    });
                    }


                });
                ed.onMouseDown.add(setToolbar);

                ed.onDeactivate.add(function(){
                });

//                ed.onActivate.add(function(){

            }

        ka._wysiwygId2Win.include( this.lastId, this.layoutBox.win );
        //ka._wysiwygId2Win.include( this.lastId, this.w );
        
        if( !this.layoutBox.contentCss )
        	this.layoutBox.contentCss = '';
        
        var fn = function(){
            this.w.initTinyWithoutResize(this.lastId, 
                _path+'inc/template/css/kryn_tinyMceContentElement.css'+','+this.layoutBox.contentCss, 
                'tinyOnLoad-'+this.lastId, 
                this.layoutBox.pageInst.getBaseUrl(),
                this.layoutBox.alloptions
            );
        }.bind(this);
        
        fn.delay(200); //delay 200ms, because a strange behavior with paste a text-element after another failed
        
/*        } else {
            new Element('a', {
                text: '[Im grossen Editor bearbeiten]',
                href: 'javascript: ;'
            })
            .addEvent('click', function(){
                this.openInBigEditor();
            }.bind(this))
            .inject( text, 'before');
            this.w.initSmallTiny(this.lastId, this.layoutBox.contentCss);
        }*/

    },

    openInBigEditor: function(){
        var tiny = this.w.tinyMCE.get(this.lastId);
        if( tiny )
            this.content.content = tiny.getContent();
        ka.wm.openWindow( 'admin', 'pages/bigEditor', null, this.w.win.id, {content: this.content.content, onSave: function( pContent ){
            this.content.content = pContent;
            if( this.editMode == 1 ){
                var tiny = this.w.tinyMCE.get(this.lastId);
                tiny.setContent( pContent );
            }
        }.bind(this)});
    },

    setHide: function( pHide ){
    	if( !this.hideImg ) return;
    	
        if( this.content.hide == 0 ){
            this.hideImg.set('src', _path+'inc/template/admin/images/icons/lightbulb.png');
        } else {
            this.hideImg.set('src', _path+'inc/template/admin/images/icons/lightbulb_off.png');
        }
    },

    setDivContent: function(){
        
        $(this.titleType).set('text', this.langs[this.content.type] );

//        this.body.setStyle('background-image', 'url('+_path+'inc/template/admin/images/ka-keditor-elementtypes-item-'+this.content.type+'-bg.png)');

        if( this.content.type != 'text' ){
            this.lastId = false;
        }

        switch( this.content.type ){
        case 'text':
            /*
            this.body.set('html', this.content.content);
            this.body.getElements('a').set('href', 'javascript:;');
            */
            this.type2Text();
            break;
        case 'plugin':
            this.setDivPlugin();
            break;
        case 'navigation':
            this.setDivNavigation();
            break;
        case 'template':
            this.setDivTemplate();
            break;
        case 'pointer':
            this.setDivPointer();
            break;
        case 'html':
        case 'php':
            this.type2HTML();
            break;
        case 'layoutelement':
        	this.toLayoutElement();
        	break;
        case 'picture':
            this.setDivPic();
            break;
        }
        
        this.setHide( this.content.hide );

        var title = this.content.title;
        if( title == ""){
            title = _('[No title]');
        }
        this.title.set('text', title);
        this.title.set('title', this.langs[ this.content.type ]);

        new Element('img', {
            'src': _path+'inc/template/admin/images/ka-keditor-elementtypes-item-'+this.content.type+'-bg.png',
            width: 20,
            align: 'left'
        }).inject( this.title, 'top' );

        this.optionsTemplate.set('html', '<span style="color: #444;"> | '+
                this.getTemplateTitle(this.content.template)+
                '</span>');

    },

    setDivHTML: function(){
        /*this.body.empty();
        new Element('div', {
            text: this.content.content
        }).inject( this.body );
        */
    },

    setDivTemplate: function(){
        this.body.empty();
        new Element('div', {
            html: _('File: %s').replace('%s', this.content.content)
        }).inject( this.body );
    },

    setDivPic: function(){
        if( !this.picDivContentImg )
            this.body.empty();
        
        this.type2PicSrc = '';
        
        if( this.content.content ){
            var t = this.content.content.split('::');
            this.type2PicSrc = t[1];
            var temp  = t[0];
            if( temp != 'none' )
                this.opts = JSON.decode( temp );
        }
        
        if( this.type2PicSrc == '' && $type(this.type2PicSrc) != 'string' ) return;

        if( this.body.getElements('img.ka-type-picture').length == 0 ){
        
            this.picDivContentDiv = new Element('div', {
                styles: {
                    'overflow-x': 'hidden'
                }
            }).inject( this.body );
            
            this.picDivContentImg = new Element('img', {
                src: this.type2PicSrc,
                'class': 'ka-type-picture',
                height: 40,
                title: this.type2PicSrc
            }).inject( this.picDivContentDiv );
        
        }
        
        if( this.opts && this.opts.align ){
            this.picDivContentDiv.setStyle('text-align', this.opts.align);
        }
        
        if( $type(this.type2PicSrc) == 'string' )
            this.picDivContentImg.set('src', this.type2PicSrc);
        
        if( this.opts ){
            if( this.opts.width && this.opts.height ){
                this.picDivContentImg.set('width', this.opts.width);
                this.picDivContentImg.set('height', this.opts.height);
            }
        }
            
    },

    setDivPlugin: function( pContainer ){
        var mybody = (pContainer)?pContainer:this.body;
        if( this.bodyPluginRequest )
            this.bodyPluginRequest.cancel();

        this.bodyPluginRequest = new Request.JSON({url: _path+'admin/backend/plugins/preview/', noCache: 1, onComplete: function(html){
            this.body.empty();
            var div = new Element('div', {
                html: html
            }).inject( mybody );
        }.bind(this)}).post({ content: this.content.content });
    },

    setDivNavigation: function( pContainer ){
        var mybody = (pContainer)?pContainer:this.body;
        if( this.bodyNavigationRequest )
            this.bodyNavigationRequest.cancel();

        try {
            if( $type(this.content.content) != 'object')
                this.content.content = JSON.decode( this.content.content );
        } catch(e) {
        }
        if( $type(this.content.content) != 'object' ) return;

        this.bodyNavigationRequest = new Request.JSON({url: _path+'admin/backend/navigationPreview/', noCache: 1, onComplete: function(html){
            this.body.empty();
            var div = new Element('div', {
                html: html
            }).inject( mybody );
            new Element('img', {
                src: _path+'inc/template/admin/images/icons/bullet_go.png',
                title: _('Open target')
            })
            .addEvent('click', function(){
                this.w.kpage.loadPage( this.content.content, true );
            }.bind(this))
            .inject( div, 'top' ); 

        }.bind(this)}).post({content: this.content.content.entryPoint});
    },

    setDivPointer: function( pContainer ){
        var mybody = (pContainer)?pContainer:this.body;
        if( this.bodyPointerRequest )
            this.bodyPointerRequest.cancel();

        this.bodyPointerRequest = new Request.JSON({url: _path+'admin/backend/pointerPreview/', noCache: 1, onComplete: function(html){
            this.body.empty();
            var div = new Element('div', {
                html: html
            }).inject( mybody );
            new Element('img', {
                src: _path+'inc/template/admin/images/icons/bullet_go.png',
                title: _('Open target')
            })
            .addListener('click', function(){
                this.w.kpage.loadPage( this.content.content, true );
            }.bind(this))
            .inject( div, 'top' ); 
        }.bind(this)}).post({content: this.content.content});
    },

    select: function(){
    	if( this.noAccess ) return;
        if( this.selected ) return;
        
        if( this.content.noActions ){
        	this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.hide();
        } else {
        	this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.show();
        }
        
        this.layoutBox.pageInst._deselectAllElements( this );
        
        this.selected = true;
        this.main.set('class', 'ka-layoutContent-main ka-layoutContent-main-selected');
        this.toEditMode();
    },
    
    deselectChilds: function(){

        if( this.layoutElement )
        	this.layoutElement.deselectAll();
    	
    },

    deselect: function(){
    	//if( this.ignoreNextDeselect ){
    	//	this.ignoreNextDeselect = false;
    	//	return;
    	//}
    	
    	if( this.noAccess ) return;
        if( !this.selected ) return;
        
       
        this.layoutBox.pageInst.elementPropertyFields.eTypeSelect.removeEvents('change');
        this.layoutBox.pageInst._hideElementPropertyToolbar();
        
        this.selected = false;
        this.toData( true );

        this.main.set('class', 'ka-layoutContent-main');
        if( this.content.type == 'text' && this.hideTinyMceToolbar ){
            this.hideTinyMceToolbar();
        }
        
        this.setDivContent();
    },

    prepareData: function(){
    
        switch( this.content.type ){
        case 'navigation':
            if( $type(this.content.content) == 'object' )
                this.content.content = JSON.encode( this.content.content );
            break;
        }
    },

    getValue: function( pAndClose ){

        this.toData();

        this.prepareData();
        /*
        if( pAndClose == true && this.editMode == 1 ) {
            this.toggleEdit();
        } else if( this.editMode == 1 ) {
            this.toData();
        }*/
        
        return this.content;
    }

});

ka.field_layoutElement = new Class({
	
	Implements: ka.Base,
	
	initialize: function( pFieldObj ){
		this.fieldObj = pFieldObj;
		this.field = this.fieldObj.field;
		this.win = this.field.win;
		
		//todo when we have in this.field the 'width' or 'height' then we dont make 'fullscreen'
		
		this.main = this.fieldObj.main;

		this.main.setStyle('position', 'absolute');
		this.main.setStyles({
			'left': 0,
			right: 0,
			'top': 0,
			bottom: 0
		});

		this.loadLayouts();

		this.tree = new Element('div', {
			'class': 'ka-pages-tree-elementPropertyToolbar',
			style: 'position: absolute; left: 0px; top: 70px; display: none; bottom: 0px; width: 215px; border-right: 1px solid silver; background-color: #eee;'
		})
		.addEvent('click', function(e){
			e = new Event(e);
			e.stop();
            //e.stopPropagation();
		})
		.inject( this.main );

		this._createElementSettingsToolbar();

		
		
		this.win.border.addEvent('click', function(){
        	if( this.ignoreNextDeselectAll ){
        		this.ignoreNextDeselectAll = false;
        		return;
        	}
            this._deselectAllElements();
        }.bind(this));
		
	},

	isEmpty: function(){
		var vals = this.getValue();
		if( $H(vals.layouts).getLength() == 0 )
			return true;
		return false;
	},
	
	getValue: function(){
		var res = {
			contents: this.layoutElement.getValue(),
			template: this.select.value	
		};
		this.lastLayoutElementContents = res.contents;
		return res;
	},
	
	setValue: function( pValue ){
		
		var value = pValue;
		try {
			if( $type(pValue) == 'string' )
				value = JSON.decode( pValue );
		} catch( e ){
			value = {contents: {1: [{type:'text', 'content': pValue}]}};
		}
		
		if( value.template != this.select.value ){
			this.select.value = value.template;
			this.loadLayout();
		}
		this.lastLayoutElementContents = value.contents;
		this.layoutElement.setValue( value.contents );
	},
	
	loadLayouts: function(){
		
		this.mkTable(this.main).set('width', 260);
		this.mkTr();
		this.mkTd(_('Layout')).set('width', 80);
		var td = this.mkTd();
		
		this.select = new Element('select')
		.addEvent('change', this.loadLayout.bind(this))
		.inject(td);
		
		$H(ka.settings.configs).each(function(config, key){
			
			if( config['themes'] ){
				
				
				$H(config['themes']).each(function(options, themeTitle){
					
					if( options['layoutElement'] ){
						
			    		var group = new Element('optgroup', {
			                label: _(themeTitle)
			            }).inject( this.select );
			    		
						$H(options['layoutElement']).each(function(templatefile, label){
							new Element('option', {
			                    html: _(label),
			                    value: templatefile
			                }).inject( group );
						}.bind(this));
				
					}

				}.bind(this));
			}
		}.bind(this));
		
		this.layoutContent = new Element('div', {
			'class': 'ka-field-layoutelement-layoutcontent',
			style: 'left: 216px;'
		}).inject( this.main );
		
		this.layoutToolbar = new Element('div', {
			'class': 'ka-field-layoutelement-tinytoolbar'
		}).inject( this.main );
		
		this.loadLayout();
		
	},
	
	loadLayout: function(){
		var layout = this.select.value;
		
		if( this.layoutElement )
		    this.lastLayoutElementContents = this.layoutElement.getValue();
		
		this.layoutElement = new ka.layoutElement( this, this.layoutContent, layout );

        if( this.lastLayoutElementContents )
            this.layoutElement.setValue( this.lastLayoutElementContents );
		
	},
	
	
	
	
	
	
	
	
	
	

	
	_deselectAllElements: function( pContent ){
		
		logger('deselect ka.field');
        var selected = 0;
    	
        if( !this.layoutElement ) return;
        if( !this.layoutElement.layoutBoxes ) return;
        
    	this.layoutElement.layoutBoxes.each(function(box,id){
            selected = selected + box.deselectAll( pContent );
        });
		this.hidePluginChooserPane();
    	
    	if( !pContent ){
    		this._hideElementPropertyToolbar();
    	}
	},
	
	showPluginChooserPane: function(){
	        
		var toolbarSize = this.elementPropertyToolbar.getSize();
		        
		this.pluginChooserPane.setStyle('left', toolbarSize.x);
		var width = 600;
		
		this.elementPropertyHeight = this.tree.getSize().y.toInt()-42;
		
		if( toolbarSize.y < 10 ){
		    this.pluginChooserPane.tween('height', this.elementPropertyHeight);
		    this.pluginChooserPane.setStyle('width', width);
		} else {
		    this.pluginChooserPane.setStyle('height', this.elementPropertyHeight);
		    this.pluginChooserPane.tween('width', width);
		}
	
	},

	hidePluginChooserPane: function( pToolbarStillOpen ){
	    if( pToolbarStillOpen )
	        this.pluginChooserPane.tween('width', 1);
		else
		    this.pluginChooserPane.tween('height', 1);
	},

    _createElementSettingsToolbar : function() {
    	
    	

        this.pluginChooserPane = new Element('div', {
            'class': 'ka-pages-pluginchooserpane',
            style: 'position: absolute; left: 0px; bottom: 0px; height: 0px; width: 0px; background-color: #eee; overflow: auto;'
        }).inject( this.tree );
        this.pluginChooserPane.set('tween', {transition: Fx.Transitions.Cubic.easeOut});
        

    	//create titlebars and content container
        this.elementPropertyToolbar = this.tree; 
        //new Element('div', {
        //    'class': 'ka-pages-tree-elementPropertyToolbar'
        //}).inject( this.tree );
        
        
        this.elementPropertyToolbarInner = new Element('div').inject(this.elementPropertyToolbar);
        
        this.elementPropertyToolbar.set('tween', {transition: Fx.Transitions.Cubic.easeOut});

        this.elementPropertyToolbarTitle = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarTitle',
            html: '<img src="'+_path+'inc/template/admin/images/icons/tree_minus.png" /> '+_('Element properties')
        }).inject( this.elementPropertyToolbarInner );

        this.elementPropertyToolbarContent = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarContent'
        }).inject( this.elementPropertyToolbarInner );

        
        this.elementAccessToolbarTitle = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarTitle',
            html: '<img src="'+_path+'inc/template/admin/images/icons/tree_plus.png" /> '+_('Element access')
        }).inject( this.elementPropertyToolbarInner );
        
        this.elementAccessToolbarContent = new Element('div', {
            'class': 'ka-pages-tree-elementPropertyToolbarContent'
        }).inject( this.elementPropertyToolbarInner );
        
        
        
        
        //general propertie fields##########################################################
        this.elementPropertyFields = {};    	

        //this.width = this.main.getSize().x;

        //var p = new Element('div');

        this.elementPropertyFields.eTitle = new ka.field({
            label: _('Title'), small: 1
        }).inject( this.elementPropertyToolbarContent );
        
        
        this.elementPropertyFields.eTypeSelect = new ka.field({
            label: _('Type'),
            type: 'select',
            help: 'admin/element-type',
            small: 1,
            tableItems: [
                {i: 'text', label: _('Text')},
                {i: 'layoutelement', label: _('Layout Element')},
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
        }).inject( this.elementPropertyToolbarContent );
        
        

        //template select
       // this.optionsTemplate.empty();
        var templateP = new Element('div', {
            'class': 'ka-field-main ka-field-main-small'
        }).inject( this.elementPropertyToolbarContent );

        new Element('div', {
            'class': 'ka-field-title',
            html: '<div class="title">'+_('Template')+'</div>'
        }).inject( templateP );

        var newP = new Element('div', {
            'class': 'ka-field-field'
        }).inject( templateP );


        
        
        this.elementPropertyFields.eTemplate = new Element('select', {
        //}).inject( w2 );
        }).inject( newP );

        var limitLayouts = [];


        this.elementPropertyFields.eTemplateNoLayout = new Element('option', {
            html: _('-- no layout --'),
            value: ''
        }).inject(this.elementPropertyFields.eTemplate);

        $H(ka.settings.contents).each(function(la, key){
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
                group.inject( this.elementPropertyFields.eTemplate );
        }.bind(this));
        
        this.elementPropertyFields.eLayoutSelect = new ka.field({
            label: _('Layout'),
            type: 'select',
            small: 1,
            tableItems: []
        }).inject( this.elementPropertyToolbarContent );
        
        $H(ka.settings.configs).each(function(config, key){
			
			if( config['themes'] ){
				$H(config['themes']).each(function(options, themeTitle){
					
					if( options['layoutElement'] ){
						
			    		var group = new Element('optgroup', {
			                label: _(themeTitle)
			            }).inject( this.elementPropertyFields.eLayoutSelect.input );
			    		
						$H(options['layoutElement']).each(function(templatefile, label){
							new Element('option', {
			                    html: _(label),
			                    value: templatefile
			                }).inject( group );
						}.bind(this));
				
					}

				}.bind(this));
			}
		}.bind(this));
        this.elementPropertyFields.eLayoutSelect.hide();
        
        

       
        this.elementPropertyFields.ePanel = new Element('div', {'class': 'ka-pages-layoutContent-ePanel'}).inject( this.elementPropertyToolbarContent );

      
        
        //accessfields
        this.elementAccessFields = {};
        
        this.elementAccessFields['unsearchable'] = new ka.field(
                {label: _('Unsearchable'), type: 'checkbox', small: 1}
            ).inject( this.elementAccessToolbarContent );
        
        
        this.elementAccessFields['access_from'] = new ka.field(
                {label: _('Release at'), type: 'datetime', small: 1}
            ).inject( this.elementAccessToolbarContent );

        this.elementAccessFields['access_to'] = new ka.field(
                {label: _('Hide at'), type: 'datetime', small: 1}
            ).inject( this.elementAccessToolbarContent );

        this.elementAccessFields['access_from_groups'] = new ka.field(
                {label: _('Limit access to groups'), desc: ('For no restrictions leave it empty'), small: 1,
                type: 'select', size: 5, multiple: true, tinyselect: true,
                tableItems: ka.settings.groups, table_label: 'name', table_key: 'rsn', help: 'admin/element-access-grouplimitation'
                }
            ).inject( this.elementAccessToolbarContent );
      
        this.updateAccordion = function(){
        	this._initElementSettingsToolbarAccordion(this.tree.getSize().y.toInt()-42);
        }.bind(this);
        
        this.updateAccordion.delay(500);
        this.win.addEvent('resize', this.updateAccordion.bind(this));
    },
    
    //init the accordion 
    _initElementSettingsToolbarAccordion : function(pAccordionContentHeight) {
    	
    	//kill last acc object if it exists
    	if(this.elementPropertyToolbarAccordion)
    		delete this.elementPropertyToolbarAccordion;
    	
    	var _this = this;
    	
        this.elementPropertyToolbarAccordion = new Accordion(
    		this.tree.getElements('.ka-pages-tree-elementPropertyToolbarTitle'),
    		this.tree.getElements('.ka-pages-tree-elementPropertyToolbarContent'), {
            duration: 400,
            display: 0,
            fixedHeight: pAccordionContentHeight,
            transition: Fx.Transitions.Cubic.easeOut,
            onActive: function(toggler, element){                          
                toggler.addClass('accordion-current');
                _this.tree.getElements('.ka-pages-tree-elementPropertyToolbarTitle img').each(function(img){
                	img.set('src', _path+'inc/template/admin/images/icons/tree_plus.png');
                });
                toggler.getElement('img').set('src', _path+'inc/template/admin/images/icons/tree_minus.png');
                
                element.setStyles({ overflowX: 'hidden', overflowY: 'auto' });
            },
            onBackground: function(toggler, element){
                toggler.removeClass('accordion-current');            
            }
        }, this.elementPropertyToolbar );
        
        this.lastAccordionHeight = pAccordionContentHeight;
        
        this.elementPropertyToolbarAccordion.display(0);
    	
    },
    
    initContentLayoutSort: function(){
    	
    	
    },
    

    _calcElementPropertyToolbarHeight : function () {
    	  var height = 221;
          tY = this.tree.getSize().y;
          if( tY*0.4 > height ){
              height = tY*0.4;
          }
          this.elementPropertyHeight = height;
          return height;
    },
    
    _calcAccordionHeight : function() {
    	//if(!this.elementPropertyHeight)
      		totalBoxHeight = this._calcElementPropertyToolbarHeight();
      	//else
      	//	totalBoxHeight = this.elementPropertyHeight;
    	
    	return Math.round(totalBoxHeight - 2 - ( this.elementPropertyToolbarTitle.getSize().y*2));
    },
	
	_hideElementPropertyToolbar: function(){
		this.tree.setStyle('display', 'none');
	},
	
	_showElementPropertyToolbar: function(){
		this.tree.setStyle('display', 'block');
        this.updateAccordion();
	},
	
	getBaseUrl: function(){
		return _baseUrl;
	}
	
	
	
	
	
	
});
ka.fieldProperty = new Class({

	Implements: Events,
	
    initialize: function( pKey, pProperty, pOpts ){
    
        this.key = (pKey)?pKey:'';
        this.property = pProperty ? pProperty : {};
        this.opts = pOpts;
        
        
        this.main = new Element('div');
        
        this.main.store('object', this);
        
        this.keyInput = new Element('input', {
            'class': 'text',
            value: pKey
        }).inject( this.main );
        
         this.titleInput = new Element('input', {
            'class': 'text',
            value: (this.property ) ? this.property.label : _('No title')
        }).inject( this.main );
        
        this.typeSelect = new Element('select', {
        }).inject( this.main );
        
        if( pOpts.small ){
            this.typeSelect.setStyle('width', 80);
            this.keyInput.setStyle('width', 80);
            this.titleInput.setStyle('width', 80);
        }
        
        this.fieldTypes = {int: _('Number'), text: _('Text'), password: _('Password'), checkbox: _('Checkbox'), select: _('Select'),
        textarea: _('Textarea'), wysiwyg: _('WYSIWYG'), file: _('File chooser'), page: _('Page chooser'), fileList: _('File select box'), files: _('Files list chooser')};
        
        $H(this.fieldTypes).each(function(pTitle, pType){
        
            new Element('option', {
                value: pType,
                text: pTitle
            }).inject( this.typeSelect );
        
        }.bind(this));
        
        this.typeSelect.addEvent('change', this.changeType.bind(this));
        
        this.destroyer = new Element('img', {
            'src': _path+'inc/template/admin/images/icons/delete.png',
            title: _('Delete property'),
            style: 'cursor: pointer; position: relative; top: 3px; left: 1px;'
        })
        .addEvent('click', function(){
            this.fireEvent('remove');
        }.bind(this))
        .inject( this.main );
        
        this.additionalOptsDiv = new Element('div').inject( this.main );
        
        this.additionalOptsTable = new Element('table', {width: '100%', 'class': 'ka-Table-head'}).inject( this.additionalOptsDiv );
        this.additionalOpts = new Element('tbody', {'class': 'ka-Table-body'}).inject( this.additionalOptsTable );
        
        this.addEvent('remove', this.remove.bind(this));
    },
    
    changeType: function(){
    
        this.additionalOpts.empty();
        
        switch( this.typeSelect.value ){
        
            case 'select':
                
                this.mkInput('table', _('Table:'));
                this.mkInput('table_key', _('Table key:'));
                this.mkInput('table_label', _('Table label:'));
                
                this.mkInput('table_values', _('alt. Items (JSON):'), 'textarea');
                
                
                break;
        
        
        }
    
    },
    
    mkInput: function( pKey, pTitle, pType ){
        
        var input;
        if( !this.propertyTrClass || (this.propertyTrClass  && this.propertyTrClass == 'two')  )
            this.propertyTrClass = 'one';
        else
            this.propertyTrClass = 'two';
            
        var tr = new Element('tr', {'class': this.propertyTrClass}).inject( this.additionalOpts );
        
        var td = new Element('td', {width: 120}).inject(tr);
        
        new Element('span', {text: pTitle}).inject( td );
        
        var td = new Element('td').inject(tr);
        
        if( pType == 'checkbox' ){
            input = new Element('input', {type: 'checkbox'}).inject(  td );
        } else if( pType == 'textarea' ){
            input = new Element('textarea').inject(  td );
        } else {
            input = new Element('input', {'class': 'text', style: 'width: 60px;'}).inject(  td );
        }
        
        
    },
    
    remove: function(){
        
        this.main.destroy();
        
    },
    
    inject: function( pTarget, pPos ){
        this.main.inject( pTarget, pPos );
    }


});
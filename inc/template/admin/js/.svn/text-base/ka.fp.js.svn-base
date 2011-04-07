/* filepicker */
ka.fp = new Class({
    initialize: function( pElement, pOptions ){
        new Asset.css( _path+'inc/template/admin/css/ka.fp.css' );
        this.element = pElement;
        this.options = pOptions;
        this._loadElements(); 
        this.fb = null;
        this.dialog = null;
    },

    selectAll: function(){
        this.element.getElements('option').setProperty('selected', true );
    },

    _loadElements: function(){
        var _this = this;


        this.element.setProperty( 'multiple', true );
        this.element.addEvent( 'blur', function(){
            _this.selectAll();
        });

        var cor = this.element.getCoordinates();

        this.cont = new Element( 'div', {
            styles: {
                height: cor.height,
                width: cor.width,
                position: 'relative'
            }
        }).inject(this.element, 'after');

        this.element.inject( this.cont );

        var cor = this.element.getCoordinates(this.cont);

        new Element('div', {
            'class': 'ka-fp-element',
            styles: {
                left: cor.right
            },
            text: '+'
        })
        .addEvent( 'click', function(){
            _this._openChooseDialog();
        })
        .inject( this.cont);

        new Element('div', {
            'class': 'ka-fp-element',
            styles: {
                left: cor.right,
                top: 21
            },
            text: '-'
        })
        .addEvent( 'click', function(){
            _this._deleteSelectedItem();
        })
        .inject( this.cont);

        this.selectAll();
    },

    _deleteSelectedItem: function(){
        this.element.getElements('option').each(function(item){
            if( item.selected ){
                item.destroy();
            }
        });
    },

    _OK: function(){
        var res = this.fb.getValue();
        if( res == false )
            return false;
        this.dialog.close();
        new Element( 'option', {
            value: res,
            text: res
        }).inject( this.element );
        this.selectAll();
    },

    _openChooseDialog: function(){
        var _this = this;
        this.dialog = new ka.dialog('Datei auswaehlen');

        this.fb = new ka.fb({
            pictures: {
                handle: function(){_this._OK()}
            },
            upload: {
                path: '_uploades/'
            }
        });

        this.fb.inject( this.dialog.getContent() );

        var ok = new ka.Button('OK')
        .addEvent('click', function(){
            _this._OK();
        });
        this.dialog.addButton( ok );

        var cancel = new ka.Button('Abbrechen')
        .addEvent('click', function(){
            _this.dialog.close();
        });
        this.dialog.addButton( cancel );
    }
});

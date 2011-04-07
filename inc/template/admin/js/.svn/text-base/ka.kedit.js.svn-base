if( typeof ka == "undefined" ) window.ka = {};

ka.kedit = new Class({
    initialize: function( pDocument ){
        this.body = pDocument.body;
        this.body.setStyle('margin-top', 60);
        this._createLayout();
    },
    _createLayout: function(){
        this.panelBorder = new Element('div', {
            'class': 'ka-kedit-panelBorder'
        }).inject( this.body ); 

        this.panel = new Element('div', {
            'class': 'ka-kedit-panel'
        }).inject( this.panelBorder ); 

        this.saveBtn = new ka.Button('Speichern')
        .inject( this.panel );
        this.saveBtn.set('class', this.saveBtn.get('class')+' ka-kedit-save')
        this.saveBtn.setStyle('display', 'none');

        this.toEditBtn = new ka.Button('Editieren aktivieren')
        .inject( this.panel )
        .addEvent('click', this.toggleEdit.bind(this))

        this.toEditBtn.set('class', this.toEditBtn.get('class')+' ka-kedit-toEdit')
        this.editMode = Cookie.read('keditMode');
        if( this.editMode == 1 ){
            this.editMode = 0;
            this.toggleEdit();
        }
    },

    toggleEdit: function(){
        if( this.editMode != 1 ){ // == 0
            this.editMode = 1;
            this.toEditBtn.set('text', 'Editieren beenden');
            this.saveBtn.setStyle('display', 'inline');
        } else {
            this.editMode = 0;
            this.toEditBtn.set('text', 'Editieren aktivieren');
            this.saveBtn.setStyle('display', 'none');
        }

        Cookie.write('keditMode', this.editMode );
    }
});

window.addEvent('domready', function(){
    new ka.kedit( document );
});

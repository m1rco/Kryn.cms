var admin_system_languages = new Class({

    initialize: function( pWin ){
        this.win = pWin;
        this._createLayout();
    },

    _createLayout: function(){


        this.win.content.empty();

        this.info = new Element('div', {
            style: 'position: absolute; left: 0px; right: 0px; top: 0px; height: 23px; border-bottom: 2px solid gray; padding: 4px; font-weight: bold; color: gray; text-align: center;',
            html: _('The native language is english. Do not translate the english language, unless you want to adjust some phrases.')
        }).inject( this.win.content );

        this.main = new Element('div',{
            'class': 'admin-system-lanuages-main'
        }).inject( this.win.content );


        this.topNavi = this.win.addSmallTabGroup();
        this.buttons = $H({});
//        this.buttons['general'] = this.topNavi.addButton(_('General'),'', this.viewType.bind(this, 'general'));
//        this.buttons['extensions'] = this.topNavi.addButton(_('Extensions'), '', this.viewType.bind(this, 'extensions'));
        this.buttons['extensions'] = this.topNavi.addButton(_('Extensions'));

        this.buttons['extensions'].setPressed( true );

        this.languageSelect = new Element('select', {
            'style': 'margin-left: 7px;'
        })
        .addEvent('mousedown', function(e){
            e.stopPropagation();
        })
        .addEvent('change', function(){
            this.loadLanguage();
        }.bind(this))
        .inject( this.win.titleGroups );

        $H(ka.settings.langs).each(function(lang,id){
            new Element('option', {
                text: lang.langtitle+' ('+lang.title+', '+id+')',
                value: id
            }).inject( this.languageSelect );
        }.bind(this));

        this.languageSelect.value = window._session.lang;

 
        //this.viewType( 'general' );

        var buttonBar = new ka.buttonBar(this.win.content);
        buttonBar.addButton(_('Save'), this.save.bind(this));

        this.loader = new ka.loader().inject( this.win.content );

        this.loadLanguage();

    
    },

    save: function(){
        var mods = {};
        this.loader.show();
        this.main.getElements('.system-language-mod').each(function(modDiv){
            mods[ modDiv.lang ] = {};
            modDiv.getElements('tr').each(function(tr){
                
                
                var rtl = tr.getElements('input')[0].checked;
                var value = tr.getElements('input')[1].value;
                
                if( rtl ){
                    value = [value, 1];
                }
                if( value != '' )
                    mods[ modDiv.lang ][ tr.getElements('td')[0].get('text') ] = value;
            });
        });

        var req = {};
        req.langs = JSON.encode( mods );
        req.lang = this.languageSelect.value;

        new Request.JSON({url: _path+'admin/system/languages/saveAllLanguages', onComplete: function(){
            this.loader.hide();
        }.bind(this)}).post( req );
    },

    loadLanguage: function(){
        this.loader.show();
        new Request.JSON({url: _path+'admin/system/languages/getAllLanguages', noCache: 1, onComplete: function(res){
            this._loadLanguage( res );
            this.loader.hide();
        }.bind(this)}).post({lang: this.languageSelect.value});

    },


    _loadLanguage: function( pLangs ){
        this.main.empty();
        $H(pLangs).each(function(mod, modKey){
                
            var lang = window._session.lang;
            if( !mod.config ) return;
            var title = ( mod.config.title[lang] ) ? mod.config.title[lang] : mod.config.title['en'];

            var h3 = new Element('h3', {
                text: title ,
                style: 'cursor: pointer;'
            }).inject( this.main );

            var langDiv = new Element('div', {
                'class': 'system-language-mod',
                style: 'display: none; padding: 2px;',
                lang: modKey
            }).inject( this.main );

            var img = new Element('img', {
                src: _path+'inc/template/admin/images/icons/tree_plus.png',
                style: 'position: relative; top: 1px; margin-right: 3px;',
                lang: 0
            })
            .addEvent('click', function(e){
                if( this.lang == 0 ) {
                    this.src = _path+'inc/template/admin/images/icons/tree_minus.png';
                    this.lang = 1;
                } else {
                    this.src = _path+'inc/template/admin/images/icons/tree_plus.png';
                    this.lang = 0;
                }
                langDiv.setStyle('display', (this.lang==0)?'none':'block');
                if( e ) 
                    e.stop();

            })
            .inject( h3, 'top' );

            h3.addEvent('click', function(e){
                img.fireEvent('click');
                e.stop();
            });

            var table = new Element('table', {
                cellpadding: 0, cellspacing: 0,
                width: '99%'
            }).inject( langDiv );
            var tbody = new Element('tbody').inject( table );
            
            this._renderLangs( mod.lang, tbody );

        }.bind(this));
    },

    _renderLangs: function( pLangs, pContainer ){
        $H(pLangs).each(function(lang,key){

            var tr = new Element('tr', {'class': 'system-language-mod-item'}).inject( pContainer );
            new Element('td', {text: key, valign: 'top', width: '50%'}).inject( tr );

            var value = lang;
            var rtl = false;
            if( $type(value) == 'array' ){
                value = value[0];
                rtl = true;
            }


            var tdMiddle = new Element('td', {width: 30}).inject( tr );
            new Element('input', {type: 'checkbox', title: _('RTL?'), checked: rtl}).inject( tdMiddle );

            var tdRight = new Element('td').inject( tr );
            new Element('input', {value: value, 'class': 'text', valign: 'top', style:'width: 99%'}).inject( tdRight );
        });
    }

    /*
    viewType: function( pType ){
        this.buttons.each(function(button,id){
            button.setPressed(false);
        }.bind(this));
        this.buttons[pType].setPressed(true);
    }*/

});

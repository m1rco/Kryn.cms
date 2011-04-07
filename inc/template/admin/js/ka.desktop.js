/*var icons = [
    {
        title: 'TestIcon',
        winModule: 'admin',
        winCode: 'pages',
        icon: 'admin/images/ext/dir.png'
    } 
];*/

var icons = [];

ka.desktop = new Class({

    initialize: function( pContainer ){
        
        this.container = new Element('div', {
            style: 'position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px;'
        }).inject( pContainer );
        this.widgets = [];
    
        this.icons = []; //dom object
        this._icons = []; //data object

        this.container.addEvent('mousedown', function(e){
            this.closeContext();

            if( this.icons ){
                this.icons.each(function(icon){
                    icon.set('class', 'ka-desktop-icon');
                });
            }

            if( e.rightClick )
                this.onContext(e, true);

        }.bind(this));
    },

    closeContext: function(){
        if( this.oldContext ) this.oldContext.destroy();
    },
    
    addWidget: function( pWidget ){
    
        pWidget.desktop = 1;
        var widget = new ka.widget( pWidget, this.container);
        
        widget.addEvent('change', function(){
            this.saveWidgets();
        }.bind(this));
        
        widget.addEvent('close', function(){
            this.widgets.erase( widget );
            this.widgets.clean();
            this.saveWidgets();
        }.bind(this));
        
        this.widgets.include( widget );
        
    },
    
    onContext: function( pEvent, pOnWorkspace ){
        this.closeContext();
        
        this.oldContext = new Element('div', {
            'class': 'ka-desktop-context',
            styles: {
                left: pEvent.client.x,
                'top': pEvent.client.y
            }
        }).inject( document.body );
       

        if( !pOnWorkspace ){
            new Element('a', {
                html: _('Open')
            })
            .addEvent('click', function(){
                this.openSelected();
            }.bind(this))
            .inject( this.oldContext );
        }

        /*
        new Element('a', {
            ///text: _('New')
        }).inject( this.oldContext );
*/

        var choosenIcons = false;
        var count = 0;
        this._icons.each(function(icon){
            if( icon.icon.get('class').search('active') > 0 ){
                choosenIcons = true;
                count++;
            }
        });

        if( choosenIcons ){
            new Element('a', {
                html: _('Remove')
            })
            .addEvent('click', function(){
                this.deleteSelected();
            }.bind(this))
            .inject( this.oldContext );
        }
        
        if( count == 1 ){
            new Element('a', {
                html: _('Rename')
            })
            .addEvent('click', function(){
                this.renameIcon();
            }.bind(this))
            .inject( this.oldContext );
        }

        if( pOnWorkspace ){
            this.btnSettings = new Element('a', {
                html: _('Settings')
            })
            .addEvent('click', function(){
                this.closeContext();
                ka.wm.openWindow('admin', 'system/desktopSettings');
            }.bind(this))
            .inject( this.oldContext );
        }
    
    },

    openSelected: function(){
        this.closeContext();
        this._icons.each(function(item,id){
            if( item.icon && item.icon.get('class').search('-active') > 0 ){
                item.icon.fireEvent('dblclick');
            }
        });
    },

    renameIcon: function(){

        var myitem = null;
        this._icons.each(function(item,id){
            if( item.icon && item.icon.get('class').search('-active') > 0 ){
                myitem = item;
            }
        });
        this.closeContext();
        var name = prompt(_('Name:'), myitem.title);
        if( !name ) return;
        myitem.title = name;
        myitem.icon.getElement('div[class=ka-desktop-icon-title]').set('text', name);
        this.save();
    },

    deleteSelected: function(){
        this.closeContext();
        if(!confirm(_('Really remove?'))) return;
        this._icons.each(function(item,id){
            if( item.icon && item.icon.get('class').search('-active') > 0 ){
                item.icon.destroy();
                this._icons.erase(item);
            }
        }.bind(this));
        this.save();
    },

    loadIcons: function( pIcons ){
        this.icons = []; //dom object
        this._icons = []; //data object

        if( pIcons == null ) return;
        var myicons = pIcons;
        
        if( myicons.each ){
            myicons.each(function(icon){
                this.addIcon( icon );
            }.bind(this));
        }
    },

    load: function(){
        if( this.lastLoad )
            this.lastLoad.cancel();
        if( this.lastWLoad )
            this.lastLoad.cancel();

        this.container.empty();

        this.lastLoad = new Request.JSON({url: _path+'admin/backend/getDesktop', noCache: 1, onComplete: function( pRes ){
            this.loadIcons( JSON.decode(pRes) );
        }.bind(this)}).post();
        
        this.lastWLoad = new Request.JSON({url: _path+'admin/backend/getWidgets', noCache: 1, onComplete: function( pRes ){
            this.loadWidgets( JSON.decode(pRes) );
        }.bind(this)}).post();
    },

    loadWidgets: function( pWidgets ){
        if( pWidgets && pWidgets.each ){
            pWidgets.each(function(widget){
            
                widget.desktop = true;
                this.addWidget( widget );
                
            }.bind(this));
        }
    },
    
    saveWidgets: function(){
        if( this.lastWSave )
            this.lastWSave.cancel()
            
        var widgets = [];
        this.widgets.each(function(item){
            widgets.include( item.getValue() );
        });
        
        this.lastWSave = new Request.JSON({url: _path+'admin/backend/saveWidgets', noCache: 1, onComplete: function(){

        }}).post({widgets: JSON.encode( widgets )});
    },

    save: function(){
        if( this.lastSave )
            this.lastSave.cancel();
            
        this._icons.each(function(item,id){
            if( !item.icon || !item.icon.getStyle )
                this._icons[id] = null;
        }.bind(this));

        this._icons.clean();
        
        this.lastSave = new Request.JSON({url: _path+'admin/backend/saveDesktop', noCache: 1, onComplete: function(){

        }}).post({icons: JSON.encode( this._icons )});
    },

    addIcon: function( pIcon ){
        var _this = this;
        
        //todo
        pIcon.icon = 'admin/images/ext/dir.png';

        var m = new Element('div', {
            'class': 'ka-desktop-icon',
            styles: {
                'background-image': 'url('+_path+'inc/template/'+pIcon.icon+')'
            }
        })
        .inject( this.container );
        m.addEvent('mousedown', this.mousedown.bindWithEvent(m, this))

        m.addEvent('dblclick', function(){
            ka.wm.openWindow( pIcon.module, pIcon.code, null, null, pIcon.params );
        });
    
        pIcon.icon = m;
        this._icons.include( pIcon );


        //todo
        // set position
        if( pIcon.left > 0 || pIcon['top'] > 0 ){
            m.setStyle('left', pIcon.left );
            m.setStyle('top', pIcon['top'] );
        } else {
            m.setStyle('left', 0);
            m.setStyle('top', 0);
        }

        m.makeDraggable({
            container: this.container,
            snap: 1,
            grid: 10,
            onComplete: function(el){
                pIcon.left = el.getStyle('left').toInt();
                pIcon['top'] = el.getStyle('top').toInt();
                this.save();
            }.bind(this)
        });
        
        this.icons.include( m );

        new Element('div', {
            'class': 'ka-desktop-icon-title',
            text: pIcon.title
        }).inject( m );
    },

    mousedown: function( e, pThis ){
        pThis.closeContext();
    
        var count = 0;
        pThis._icons.each(function(item,id){
            if( item.icon && item.icon.get('class').search('-active') > 0 ){
                count++;
            }
        });
 

        if( !e.control && !e.rightClick ){
            pThis.icons.each(function(icon){
                icon.set('class', 'ka-desktop-icon');
            });
        }
            
        if( !e.rightClick && this.get('class').search('-active') > 0 )
            this.set( 'class', 'ka-desktop-icon' );
        else
            this.set( 'class', 'ka-desktop-icon ka-desktop-icon-active' );
        
        if( e.rightClick )
            pThis.onContext(e);

        e.stop();
        return false;
    }
});

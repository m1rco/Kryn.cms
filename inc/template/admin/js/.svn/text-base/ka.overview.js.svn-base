ka.overview = {};
ka.overview.widgets = {};

ka.overview.loadWidgets = function( pWidgets ){
    ka.overview.widgets = new Hash(pWidgets);
    ['left', 'right'].each(function(Position){
        if(! ka.overview.widgets.get(Position) )
            ka.overview.widgets.set(Position, [])
        ka.overview._load( Position, ka.overview.widgets[Position] );
    });
}

ka.overview._addWidget = function( pModule, pWidget ){
    new Request.JSON({url: _path+'admin/overview/widgets/getWidgetInfo/', onComplete: function(res){
        ka.overview.widgets.get(ka.overview.lastPos).include(res);
        ka.overview.loadWidgets( ka.overview.widgets );
        ka.overview.saveAll();
        ka.overview.addDialog.close();
    }}).post({ module: pModule, widget: pWidget });
}

ka.overview.addWidget = function( pPos ){
    wm.openWindow( 'admin', 'overview/add', {}, win.id );
    return;
    ka.overview.lastPos = pPos;
    ka.overview.addDialog = new ka.dialog('Widget hinzufuegen');
    ka.overview.addDialog.getContent().set('text', 'Lade ...');

    new Request.JSON({url: _path+'admin/overview/widgets/getAll/', onComplete: function(res){
        ka.overview.addDialog.getContent().set('html', res);
    }}).post();

    buttonCancel = new Element( 'a', {
        'class': 'button',
        'text': 'Abbrechen'
    }).addEvent( 'click', function(){ ka.overview.addDialog.close(); });
    ka.overview.addDialog.addButton( buttonCancel );

/*
    ka.overview.widgets.get(pPos).include({
        module: 'admin',
        widget: 'widgetSessions',
        height: 150
    });
    ka.overview.loadWidgets( ka.overview.widgets );
    ka.overview.saveAll();
*/
}

ka.overview._load = function( pPos, pWidgets ){
    $('overview.'+pPos).getElements('div[class=box]').each(function(item){
        if(item.get('alt')!='fake')
            item.destroy();
    });
    if( pWidgets.length > 0 ){
        pWidgets.each(function(widget){
            var widget = ka.overview.renderWidget(widget);
            widget.inject( $('overview.'+pPos) );
        });
    }
}

ka.overview.__load = function( pWidget, pBox ){
    new Request.JSON({url: _path+'admin/overview/widgets/load/', onComplete: function(res){
        ka.overview.__render( pWidget, pBox, res );
    }}).post(pWidget);
}

ka.overview.__render = function( pWidget, pBox, pValues ){
    if( pValues ){
        pBox.getElement('div[class=title]').set('html', pValues.title ); 
        pBox.getElement('div[class=content]').set('html', pValues.content ); 
    }
}

ka.overview.zindex = 10234421;

ka.overview.renderWidget = function( pWidget ){
    var div = new Element('div', {
        'class': 'box'
    });

    div.store( 'values', pWidget );

    var title = new Element( 'div', {
        'class': 'title',
        text: ''
    })
    .addEvent( 'mouseup', function(){
        ka.overview.saveAll();
    })
    .inject( div );

    div.makeDraggable({
        handle: title,
        droppables: $$('div.box'),
        onStart: function(element){
            ka.overview.zindex++;
            element.setStyle( 'z-index', ka.overview.zindex );
            var placeholder = new Element('div' );
            var pos = element.getPosition(element.getParent());
            //element.getElement('div[class=content]').set('html', pos.y );
            element.store( 'oldposition', pos );
            element.setStyle( 'opacity', 0.5 );
            placeholder.setStyles({
                'position': 'absolute',
                'backgrond-color': '#f2f2f2',
                'border': '2px dashed silver'
            });
            placeholder.setStyles( element.getCoordinates() );
            placeholder.inject( element.getParent() );
            element.store( 'placeholder', placeholder );
        },
        onEnter: function( element, dropped ){
            dropped.highlight();
        },
        onDrop: function(element, dropped){
            element.setStyle( 'opacity', 1 );
            if(! dropped ){
                var pos = element.retrieve('oldposition');
                element.set('morph',{ onComplete:function(){
                    element.retrieve('placeholder').destroy();
                }, duration: 500});
                element.morph({
                    left: 0,
                    top: 0
                });
                //element.getElement('div[class=content]').set('html', pos.y );
            } else {
                element.setStyles({
                   left: 0, top: 0 
                });
                element.inject(dropped, 'after' );
                ka.overview.saveAll();
                element.retrieve('placeholder').destroy();
            }
        }
    });

    var actions = new Element( 'div', {
        'class': 'actions'
    }).inject( div );

    new Element( 'img', {
        src: _path+'inc/template/admin/images/icons/delete.png',
        align: 'right'
    })
    .addEvent( 'click', function(){
        div.destroy();
        ka.overview.saveAll();
        ka.overview.getWidgets();
    })
    .inject( actions );

    new Element( 'img', {
        src: _path+'inc/template/admin/images/icons/arrow_up.png',
        align: 'right'
    })
    .addEvent( 'click', function(){
        var up = div.getPrevious();
        if( up.get('class') == 'box' && up.get('alt') != 'fake' ){
            div.inject( up, 'before' );
            ka.overview.saveAll();
        }
    })
    .inject( actions );

    new Element( 'img', {
        src: _path+'inc/template/admin/images/icons/arrow_down.png',
        align: 'right'
    })
    .addEvent( 'click', function(){
        var down = div.getNext();
        if( down.get('class') == 'box' && down.get('alt') != 'fake' ){
            div.inject( down, 'after' );
            ka.overview.saveAll();
        }
    })
    .inject( actions );

    new Element( 'img', {
        src: _path+'inc/template/admin/images/icons/arrow_refresh.png',
        align: 'right'
    })
    .addEvent( 'click', function(){
        ka.overview.__load( pWidget, div );
    })
    .inject( actions );

    var content = new Element( 'div', {
        'class': 'content',
        text: ''
    }).inject( div );

    if(! pWidget.noFixHeight ){
        content.setStyle('height', pWidget.height);
        var sizer = new Element('div', {
            'class': 'sizer'
        }).inject( div );
        var drag = sizer.makeDraggable({
            container: document.body,
            onDrop: function( element, droppable ){
                ka.overview.saveAll();
            },
            onDrag: function( element, pEvent ){
                var _parent = element.getParent();
                element.setStyle( 'left', 0 );
                var _title = _parent.getElement('div[class=title]').getSize().y;
                _parent.getElement('div[class=content]').setStyle('height', element.getPosition(_parent).y-_title-10 );
           }
        });
        sizer.addEvent( 'mousedown', function(e){
            drag.start(e);
        })
    } else {
        content.setStyle( 'margin-bottom', 0 );
    }
    
    ka.overview.__load( pWidget, div );

    return div;
}

ka.overview.saveAll = function(){
    var widgets = new Hash({ left: [], right: [] });
    ['left', 'right'].each(function(Position){
        $('overview.'+Position).getElements('div[class=box]').each(function(widget){
            if( widget.get('alt') == 'fake') return;
            widgets[Position].include( ka.overview.getValues( widget ) );
        });
    });

    new Request.JSON({url: _path+'admin/overview/widgets/saveAll/', onComplete: function(res){

    }}).post({widgets: JSON.encode(widgets) });
}

ka.overview.getValues = function( pWidget ){
    var widget = pWidget.retrieve( 'values' );
    if(! widget.noFixHeight )
        widget.height = pWidget.getElement('div[class=content]').getSize().y-9;
    return widget;
}

ka.overview.getWidgets = function(){
    new Request.JSON({url: _path+'admin/overview/widgets/loadAll/', onComplete: function(res){
        ka.overview.loadWidgets( res );
    }}).post();
}

window.addEvent('kload', function(){
    ka.overview.getWidgets();
});

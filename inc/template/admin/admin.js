
function show(p, inline){ $(p).setStyle('display', ((inline == true) ? 'inline' : 'block') ) };
function hide(p){ $(p).setStyle('display', 'none') };

function itemBoxOnClick(pObject){
    var _parent = pObject.parentNode;
    if(_parent.style.height == '20px' || _parent.style.height == ''){
        _parent.style.height = 'auto';
        setCookie("adminbox["+_parent.id+"]", "1");
    } else {
        parent.style.height = '20px';
        setCookie("adminbox["+_parent.id+"]", "0");
    }
    return false;
}

var ka = {}; // kryn adminstration
ka.clipboard = false;

ka.addClipboard = function( pType, pContent ){
    var info = 'Item';
    switch( pType ){
    case 'content':
        info = '<b>'+pContent.title+'</b> [Inhalt ('+pContent.type+')]';
        break;
    case 'contents':
        info = '<b>'+pContent.length+' Inhalte</b>';
    }
    ka.clipboard = {type: pType, content: pContent};
    $( '_clipboard.info' ).set( 'html', info+' in der Zwischenablage.' );
}

ka.getClipboard = function(){
    return ( ka.clipboard ) ? ka.clipboard : false;
}


ka.tabBar = new Class({
    initialize: function( pId ){
        this.id = pId;
        var _this = this;
        var first = false;
        $( this.id+'_tabBars' ).getElements( 'div' ).each(function(item){
            item.store( 'class', item.className );
        });
        $( this.id+'_tabBars' ).getElements( 'div' ).each(function(item){
            var t = item.id.split('.');
            var id = t[1];
            if(t[0]!='bar') return;

            if( !first )
                first = id;

            $( 'pane.'+id ).setStyle( 'display', 'none' );

            item.addEvent( 'click', function() { _this._tabBarClick( id ) } );
        });
        if( first )
            _this._tabBarClick( first );
    },

    _tabBarClick: function( id ) {
        this._tabBarHideAll();
        $( 'pane.'+id ).setStyle( 'display', 'block' );
        $( 'bar.'+id ).store( 'class', $( 'bar.'+id ).className );
        $( 'bar.'+id ).className += ' tabBarButtonActive';
    },

    _tabBarHideAll: function(){
        $( this.id+'_tabPanes' ).getElements( 'div' ).each(function(item){
            var t = item.id.split( '.' );
            if( t[0] == 'pane' )
                item.setStyle( 'display', 'none' );
        });
        $( this.id+'_tabBars' ).getElements( 'div' ).each(function(item){
            var t = item.id.split('.');
            if(t[0]!='bar') return;
            item.className = item.retrieve('class');
        });
    }

});

window.addEvent( 'mousedown', function(){
    if(! $( 'header' ) ) return;
//    setTimeout("ka._closeMenus();", 200 );
});

ka.setActiveMenu = function( pUrl ){
    var pos = pUrl.lastIndexOf( 'admin/' );
    var url = pUrl.substr(pos);
    var split = url.split('/');
    if( split[1] ){
        $$( '.header .mainlinks a' ).each(function(item){
            item.set('class', item.retrieve('oldClass'));
        });
        var ac = $( 'header' ).getElements('a[lang='+split[1]+']');
        ac.set( 'class', ac.get('class')+' active' );
    }
}

ka.toggleModuleOpener = function( pOpen ){
    if( pOpen ){
        $('moduleLinks').setStyle('display', 'block');
        $('header').store( 'oldHeight', $('header').getStyle('height') );
        $('middle').store( 'oldTop', $('middle').getStyle('top') );
        $('header').setStyle('height', $('header').scrollHeight+18 );
        $('middle').setStyle('top', parseInt($('header').getStyle('height'))+5  );
//        $('header').setStyle( 'top', parseInt($('middle').retrieve('oriTop'))+$('moduleLinks').getSize().y);
    } else {
        $('moduleLinks').setStyle('display', 'none');
        $('header').setStyle( 'height', $('header').getStyle('oldHeight') );
        $('middle').setStyle( 'top', $('middle').getStyle('oldTop') );
    }

}

ka.prepareModuleOpener = function(){
    var op = $('moduleOpen');
    $('middle').store( 'oriTop', $('middle').getStyle('top') );
    op.addEvent('click', function(){
        if( this.retrieve('open') )
            this.store('open', false );
        else
            this.store('open', true );
        ka.toggleModuleOpener( this.retrieve('open') );
    });
}

window.addEvent( 'domready', function(){
    if( parent.ka ){
        //parent.ka.setActiveMenu( location.href );
    }
    $$( '.header .mainlinks a' ).each(function(item){
        item.store( 'oldClass', item.get('class') );
    });
    if( $('moduleOpen') )
        ka.prepareModuleOpener();
});

window.addEvent( 'load', function(){
    if($('debug'))
    $('debug').addEvent('click', function(){
        ka._debug = '';
        this.set('html', '');
    });

    //date-fields
    $$('input.date').each( function(el){
        new DatePicker(el);
    });

    //wysiwyg
    $$('textarea.wysiwyg').each( function(el){
        initTiny( el.id );
    });

    //tips
    new Tips($$('.tips'),{
        className: 'adminTips'
    });


    //table list
    $$('table.list td').addEvent('mouseover', function(){
        this.getParent().getElements('td').setStyle('background-color', '#f2f2f2'); //tr;
    });
    $$('table.list td').addEvent('mouseout', function(){
        this.getParent().getElements('td').setStyle('background-color', '#f9f9f9'); //tr;
    });


    //files
    $$('select.files').each( function(el){
        new ka.fp(el, JSON.decode((el.get('alt'))));
    });

    // admin index.tpl
    if(! $( 'header' ) ) return; 

    $( 'header' ).getElements('a').each(function(item){
        if( item.lang == "" )
            return;
        item.addEvent( 'mousedown', function(e){
            if( e ){
                var ev = new Event(e).stop();
            }
            if( this.set('alt') == '0')
                return;
            var t = item.lang.split( '=' );
            var module = ( t[1] ) ? t[1] : item.lang;
            ka.showMenu( item, module, item.lang );
        });
        item.addEvent( 'mouseover', function(e){
            if( ka._lastMenu ){
                item.fireEvent( 'mousedown' );
            }
        });
    });
});

ka._closeMenus = function( e ){
    if( ka._lastMenu ){
        ka._lastMenuId = false;
        ka._lastMenu.destroy();
        ka._lastMenu = false;
        $$( 'div.subMenu' ).destroy();
    }
}

ka.menus = {};
ka.showMenu = function( pItem, pModule, pLink ){

    if( pModule+pLink == ka._lastMenuId )
        return;

    var l = $( 'link.'+pModule );
    if( !l ) return;
    if( !pLink )
        pLink = pModule;
    var t = l.getCoordinates( $('header') );
//    ka._closeMenus();
    ka._lastMenuItem = pItem;
    ka._lastMenuId = pModule+pLink;

    var middle = t.left + (t.width/2);

    var menu = new Element( 'div', {
        'class': 'subMenu',
        'styles': {
            'position': 'absolute',
            'top': t.top+19,
            'left': t.left,
            'z-index': '20000',
            'min-width': (parseInt(t.width)-1) + 'px',
            'background-color': 'transparent',
            'border': '1px solid #ccc',
        }
    });
    ka._lastMenu = menu;

    if( ka.menus[pModule] ){
        ka._showMenu( pItem, menu, middle, ka.menus[pModule] );
        return;
    }

    new Request.JSON({url: _path + 'admin/getAdminLinks/module=' + pModule, onComplete: function( response ){
        var html = '';
        response.each(function(item){
            if(item=='-')
                html += '<a href="javascript:;" onclick="return false;">-------</a>';
            else
                html += '<a href="'+_path+'admin/'+pLink+'/'+item[1]+'" target="content">'+item[0]+'</a>';
        });
        ka.menus[pModule] = html;
        ka._showMenu( pItem, menu, middle, html );
    }}).get();

}

ka._showMenu = function( pItem, menu, middle, html ){
        menu.innerHTML = html;
        menu.inject( $('header') );
        //var size = menu.getSize();
        //menu.setStyle( 'left', middle - (parseInt(size.x)/2) );
}

initTiny = function(pId){
    tinyMCE.init({
        document_base_url : _path,
        relative_urls : false,
        theme : 'advanced',
        mode : 'exact',
        elements: pId,
        //plugins: '-kryn,emotions,xhtmlxtras,contextmenu,inlinepopups,style, media, searchreplace, print, contextmenu, paste,fullscreen,noneditable,visualchars,template',
        plugins : 'safari,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template',
         theme_advanced_buttons1 : 'code,|,link,unlink,anchor,|,image,insertfile,insertimage,|,fullscreen,|,undo,redo,|,cut,copy,paste,pastetext,pasteword,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,table,|,bullist,numlist',
         theme_advanced_buttons2: 'formatselect,forecolorpicker,backcolorpicker,charmap,|,pastetext,pasteword,search,replace,|,indent,outdent',
         theme_advanced_buttons3: '',
         theme_advanced_blockformats : "default,h1,h2,h3,h4,h5",
//         theme_advanced_buttons2 : 'cut,copy,paste,pastetext,pasteword,|,bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,undo,redo,link,unlink,emotions,image,forecolor',
//         theme_advanced_buttons3 : 'styleselect,formatselect,fontselect,fontsizeselect,|,search,replace,|,outdent,indent,blockquote',
        theme_advanced_toolbar_location : 'top',
        remove_linebreaks : false,
        convert_urls : false,
        indentation: '10px',
        theme_advanced_resizing : true,
        skin: 'o2k7',
        skin_variant: 'silver',
        language: 'de'
    });
}

ka._debug = '';

debug = function(pContent){
    ka._debug += pContent+"\n";
    $('debug').set('html', ka._debug);
};

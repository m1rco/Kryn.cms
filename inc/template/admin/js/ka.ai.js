/* admin index */
if( typeof window.ka == 'undefined' ){
    window.ka = {};
}
window.kaExist = true;

window.ka.ai = {};

if( $type(ka.langs) != 'object' ) ka.langs = {};

var logger = function( pVal ){
    if( typeof console != "undefined" )
        console.log( pVal );
}

ka.openFrontend = function(){
	if( top ){
		top.open(_path, '_blank');
	}
}

window._ = function( p ){
    if( !ka && parent ) ka = parent.ka;
    if( ka && !ka.lang && parent && parent.ka ) ka.lang = parent.ka.lang;
    if( ka.lang ) {
        if( $type(ka.lang[p]) == 'string' && ka.lang[p] != ''){
            return _kml2html(ka.lang[p]);
        } else if( $type(ka.lang[p]) == 'array' ){
            return _kml2html( '<div dir="rtl">'+ka.lang[p][0]+'</div>' );
        }
    }
    return _kml2html(p);
}

window._kml2html = function( pRes ){
    
    var kml = ['ka:help'];
    if( pRes ) {
        pRes = pRes.replace(/<ka:help\s+id="(.*)">(.*)<\/ka:help>/g, '<a href="javascript:;" ka.wm.open(\'admin/help\', {id: \'$1\'})">$2</a>');
    }
    return pRes;
} 

ka._wysiwygId2Win = new Hash({});

ka.tinyPopup2Win = new Hash({});

window.addEvent( 'load', function(){
    window.ka.ai.renderLogin();
    
    document.hidden = new Element('div', {
        styles: {
            position: 'absolute',
            left: -154,
            top: -345,
            width: 1, height: 1, overflow: 'hidden'
        }
    }).inject( document.body );
    
    $('ka-search-query').addEvent('keyup', function(e){
        if( this.value != '' )
            ka.doMiniSearch(this.value);
        else
            ka.hideMiniSearch();
    });
    
    

	if( parent.inChrome && parent.inChrome() ){
		parent.doLogin();
		
	} else {
	    if( _session.user_rsn > 0 ){
	        ka.ai.loginSuccess( _session, true );
	    }
	}
});

ka.doMiniSearch = function(){
    
    if(! ka._miniSearchPane ){
        $('ka-search-query').set('class', 'text mini-search-active');
        ka._miniSearchPane = new Element('div', {
            'class': 'ka-mini-search'
        }).inject( $('border') );
        
        ka._miniSearchLoader = new Element('div', {
            'class': 'ka-mini-search-loading'
        }).inject( ka._miniSearchPane );
        new Element('img', {
            src: _path+'inc/template/admin/images/ka-tooltip-loading.gif'
        }).inject( ka._miniSearchLoader );
        new Element('span', {
            html: _('Searching ...')
        }).inject( ka._miniSearchLoader );
        ka._miniSearchResults = new Element('div', {'class': 'ka-mini-search-results'}).inject( ka._miniSearchPane );

    }
    
    ka._miniSearchLoader.setStyle('display', 'block');
    ka._miniSearchResults.set('html', '');

    
    if( ka._lastTimer ) $clear(ka._lastTimer);
    ka._lastTimer = ka._miniSearch.delay( 500 );
    
}

ka._miniSearch = function(){
    
    new Request.JSON({url: _path+'admin/mini-search', noCache: 1, onComplete: function( res ){
        ka._miniSearchLoader.setStyle('display', 'none');
        ka._renderMiniSearchResults( res );
    }}).post({q: $('ka-search-query').value, lang: window._session.lang});
    
}

ka._renderMiniSearchResults = function( pRes ){
    
    ka._miniSearchResults.empty();
    
    if( $type(pRes) == 'object' ){
        
        $H(pRes).each(function(subresults, subtitle){
            var subBox = new Element('div').inject( ka._miniSearchResults );
        
            new Element('h3', {
                text: subtitle
            }).inject( subBox );
            
            var ol = new Element('ul').inject( subBox );
            subresults.each(function(subsubresults, index){
                var li = new Element('li').inject( ol );
                new Element('a', {
                    html: ' '+subsubresults[0],
                    href: 'javascript: ;'
                })
                .addEvent('click', function(){
                    ka.wm.open(subsubresults[1], subsubresults[2]);
                    ka.hideMiniSearch();
                })
                .inject( li );
        	});
        });
    } else {
        new Element('span', {html: _('No results') }).inject( ka._miniSearchResults );
    }
    
    
}


ka.hideMiniSearch = function(){
    if( ka._miniSearchPane ){
        ka._miniSearchPane.destroy();
        $('ka-search-query').set('class', 'text');
        ka._miniSearchPane = false;
    }
}


ka.ai.prepareLoader = function(){
    ka.ai._loader = new Element('div', {
        'class': 'ka-ai-loader'
    })
    .setStyle( 'opacity', 0 )
    .set('tween', {duration: 400})
    .inject( document.body );

    frames['content'].onload = function(){
        ka.ai.endLoading();
    };
    frames['content'].onunload = function(){
        ka.ai.startLoading();
    };
}

ka.ai.endLoading = function(){
    ka.ai._loader.tween( 'opacity', 0 );
}

ka.ai.startLoading = function(){
    var co = $('middle');
    ka.ai._loader.setStyles( co.getCoordinates() );
    ka.ai._loader.tween( 'opacity', 1 );
}

ka.ai.renderLogin = function(){
    ka.ai.login = new Element('div', {
        'class': 'ka-login'
    }).inject( document.body );

    var middle = new Element('div', {
        'class': 'ka-login-middle'
    }).inject( ka.ai.login );
    ka.ai.middle = middle;
    ka.ai.middle.set('tween', {tranition: Fx.Transitions.Cubic.easeOut});

    ka.ai.loginMiddleBg = new Element('div',{
        'class': 'ka-login-middleBg'
    }).inject( ka.ai.middle );
    
    new Element('img', {
        'class': 'ka-login-middle-logo',
        'src': _path+'inc/template/admin/images/logo-login.png'
    }).inject( middle );
    
    var form = new Element('form', {
        id: 'loginForm',
        'class': 'ka-login-middle-form',
        action: './admin',
        method: 'post'
    })
    .addEvent('submit', function(e){ e.stop() })
    .inject( middle );
    ka.ai.loginForm = form;

    var icon = new Element('div', {
        'class': 'ka-login-icon',
        html: _('Administration')
    }).inject( middle );
    ka.ai.loginIcon = icon;
    
    ka.ai.loginLabelUsername = new Element('div', {
        'class': 'label',
        'html': _('Username')
    }).inject( form );
    
    ka.ai.loginLabelPassword = new Element('div', {
        'class': 'label label-pw',
        'html': _('Password')
    }).inject( form );
    
    ka.ai.loginName = new Element('input', {
        name: 'loginName',
        'class': 'ka-login-input-username',
        type: 'text'
    })
    .addEvent('keyup', function(e){
        if(e.key == 'enter'){
            ka.ai.doLogin();
        }
    })
    .inject( form );
    
    ka.ai.loginPw = new Element('input', {
        name: 'loginPw',
        type: 'password',
        'class': 'ka-login-input-passwd'
    })
    .addEvent('keyup', function(e){
        if(e.key == 'enter'){
            ka.ai.doLogin();
        }
    })
    .inject( form );
    
    ka.ai.buttonLogin = new ka.Button(_('Login'))
    .addEvent('click', function(){
        //form.submit();
        ka.ai.doLogin();
    })
    .inject( form );

    ka.ai.loginLangSelection = new Element('select', {
        'class': 'loginLangSelection'
    })
    .addEvent('change', function(){
        window._session.forceLang = this.value;
        ka.loadLanguage( this.value );
        ka.ai.reloadLogin();
    })
    .inject( form );

    ka.possibleLangs
    .each(function(lang){
        new Element('option', {
            html: lang.title+' ('+lang.langtitle+')',
            value: lang.code
        }).inject( ka.ai.loginLangSelection );
    });
    ka.ai.loginLangSelection.value = window._session.lang;
    
    ka.ai.loginMessage = new Element('div', {
        'class': 'loginMessage'
    }).inject( middle );

    ka.ai.loginName.focus();
}

ka.ai.reloadLogin = function(){
    ka.ai.loginLabelUsername.set('html', _('Username'));
    ka.ai.loginLabelPassword.set('html', _('Password'));
    ka.ai.buttonLogin.set('html', _('Login')+'<span></span>');
    ka.ai.loginIcon.set('html', _('Administration'));
}

ka.ai.doLogin = function(){
    ka.ai.loginMessage.set('html', _('Check Login. Please wait ...') );
    new Request.JSON({url: _path+'admin/user:login/json:1', noCache: 1, onComplete: function(res){
        if( res.user_rsn > 0 ){
            ka.ai.loginSuccess(res);
        }
        else
            ka.ai.loginFailed();
    }}).post({ username: ka.ai.loginName.value, passwd: ka.ai.loginPw.value });
}

ka.ai.logout = function( pScreenlocker ){
    
    ka.ai.inScreenlockerMode = pScreenlocker;
    
    if( ka.ai.loaderCon )
        ka.ai.loaderCon.destroy();
    
    ka.ai.loginLabelPassword.value = '';

    ka.ai.middle.set('tween', {transition: Fx.Transitions.Cubic.easeOut});
    ka.ai.middle.tween('margin-top', ka.ai.middle.retrieve('oldMargin'));

    if( ka.ai.loaderTxt )
        ka.ai.loaderTxt.destroy();
    
    
    window.fireEvent('logout');
    
    if( !pScreenlocker ){
        logger('destroy all windows');
        ka.wm.closeAll();
        new Request({url: _path+'admin/user:logout'}).post();
    }
    
    /*Cookie.dispose('krynsessionid', {path: '/admin/'});
    Cookie.dispose('krynsessionid', {path: '/admin'});
    Cookie.dispose('krynsessionid', {path: '/'});
    Cookie.dispose('krynsessionid');
    */
    
    if( ka.ai.loader )
        ka.ai.loader.destroy();

    ka.ai.loginForm.setStyle('display', 'block');
    ka.ai.loginMessage.set('html', '');
    ka.ai.login.setStyle( 'display', 'block' );
    ka.ai.loginPw.value = '';
    ka.ai.loginPw.focus();
    window._session.user_rsn = 0;
    ka.ai.buttonLogin.setStyle('opacity', 1);
    ka.ai.buttonLogin.addEvent('click', ka.ai.doLogin);
}

ka.ai.loginSuccess = function(pId, pAlready){

    
    if( pAlready && window._session.hasBackendAccess == '0' )
        return;
    
    Cookie.dispose('krynsessionid', {path: '/admin/'});
    Cookie.dispose('krynsessionid', {path: '/admin'});
    Cookie.dispose('krynsessionid', {path: '/'});
    Cookie.dispose('krynsessionid');
    Cookie.write('krynsessionid', pId.sessionid, {duration: 365, path: '/'} );

    ka.ai.loginName.value = pId.username;
    
    /*if( window._session.forceLang == '' )
        ka.loadLanguage(pId.lang);
    else
        ka.loadLanguage( window._session.forceLang );
	*/

    ka.ai.loginForm.setStyle('display', 'none');
    window._sid = pId.sessionid;
    
    $('user.username').set('text', ka.ai.loginName.value);
    $('user.username').onclick = function(){
        logger( pId );
        ka.wm.open('users/users/editMe/', {values: {rsn:pId.user_rsn}});
    }

    window._session.user_rsn = pId.user_rsn;
    window._session.username = pId.username;
    window._session.lastlogin = pId.lastlogin;

    $(document.body).setStyle('background-position', 'center top');

    var mesg = _('Please wait');
    if( pAlready ){
    //    mesg = 'Session erfasst.';
    }
    ka.ai.loginMessage.set('html', mesg);

    ka.ai.buttonLogin.setStyle('opacity', 0.5);
    ka.ai.buttonLogin.removeEvents('click');
    ka.ai.loadBackend();
}

ka.ai.loginFailed = function(){
    ka.ai.loginPw.focus();
    ka.ai.loginMessage.set('html', '<span style="color: red">'+_('Login failed')+'.</span>');
    (function(){
        ka.ai.loginMessage.set('html', '');
    }).delay(3000);
}

ka.ai.loadBackend = function(){

    if( ka.ai.allFilesLoaded ){
        ka.ai.loadDone();
        return;
    }

    if( ka.ai.loaderCon )
        ka.ai.loaderCon.destroy();

    if( ka.ai.loaderTxt )
        ka.ai.loaderTxt.destroy();

    ka.ai.loaderCon = new Element('div', {
        'class': 'ka-ai-loader-con'
    }).inject( ka.ai.middle );

    ka.ai.loaderTxt = new Element('div', {
        'class': 'ka-ai-loader-txt',
        html: _('Loading administration.')
    }).inject( ka.ai.middle );

    ka.ai.loader = new Element('div', {
        'class': 'ka-ai-loader',
        styles: {
    		width: 80,
            opacity: 0.3
        }
    }).inject( ka.ai.loaderCon );
    ka.ai.loader.set('tween', {duration: 900, transition: Fx.Transitions.Quad.easeInOut});

    //381
    ka.ai.loaderAni = function(){
        ka.ai.loader.tween('left', 381-80);
        ka.ai.loader.tween('width', 80);
        (function(){
        	ka.ai.loader.tween('left', 0);
            ka.ai.loader.tween('width', 381);
        }).delay(900);
    };
    
    ka.ai.loaderTimer = ka.ai.loaderAni.periodical(1800);
    
    new Asset.css(_path+'admin/loadCss/style.css');
    new Asset.javascript(_path+'admin/backend/loadJs/script.js');
}

ka.ai.loaderDone = function(){
	if( $type(ka.ai.loaderAni) == 'integer' )
		clearInterval(ka.ai.loaderAni);

	ka.ai.loaderTxt.set('html', _('Loading done'));
    ka.ai.loader.setStyle('left', 0);
    ka.ai.loader.setStyle('width', 381);
    ka.ai.loadDone.delay(200);
}

ka.ai.loadDone = function(){
    
    ka.check4Updates.delay(2000);
    
    ka.ai.allFilesLoaded = true;
    ka.ai.middle.store('oldMargin', ka.ai.middle.getStyle('margin-top'));
    ka.ai.middle.set('tween', {transition: Fx.Transitions.Cubic.easeOut});
    ka.ai.middle.tween('margin-top', -250);
    if( ka.ai.blender ) ka.ai.blender.destroy();
    ka.ai.blender = new Element('div', {
        style: 'left: 0px; top: 0px; right: 0px; bottom: 0px; position: absolute; background-color: white; z-index: 15012300',
        styles: { 
            opacity: 0
        }
    }).inject( document.body );
    
    ka.ai.blender.set('tween', {duration: 1000, onComplete: function(){
        ka.ai.login.setStyle( 'display', 'none' );
        ka.ai.blender.set('tween', {onComplete: $empty});

        
        //load settings, bg etc
        ka.loadSettings();

        
        ka.init();
        ka._desktop.load();
        ka.loadMenu();
        
        //start checking for unindexed sites
        //checkSearchIndex.init();
	    //start autocrawling process
	    //system_searchAutoCrawler.init();
        
        var lastlogin = new Date();
        if( window._session.lastlogin > 0 ){
            lastlogin = new Date(window._session.lastlogin*1000);
        }
        ka._helpsystem.newBubble(_('Welcome back, %s').replace('%s', window._session.username),
        _('Your last login was %s').replace('%s', lastlogin.format('%d. %b %I:%M')), 3000 );    
    
        ka.ai.blender.tween( 'opacity', 0 );
    }});
    ka.ai.blender.tween('opacity', 1 )

}

<?php


/*
 * This file is part of Kryn.cms.
 *
 * (c) Kryn.labs, MArc Schmidt <marc@kryn.org>
 *
 * To get the full copyright and license informations, please view the
 * LICENSE file, that was distributed with this source code.
 *
 */



class pages {

    public static function init(){

        /*
        kryn::addCss( 'admin/pages.css' );
        kryn::addJs( 'admin/pages.js' );
        kryn::addJs( 'admin/ka.pluginChooser.js' );
        kryn::addJs( 'admin/pages_addDialog.js' );
        kryn::addJs( 'admin/filebrowser.js' );
        kryn::addJs( 'admin/dialog.js' );

        kryn::addJs( 'admin/js/ka.pagesTree.js' );
        kryn::addCss( 'admin/css/ka.pagesTree.css' );*/
        //<script type="text/javascript" src="{$cfg.path}inc/tinymce/jscripts/tiny_mce/tiny_mce.js"></script>

        switch( getArgv(3) ){
        case 'domain':
            return pages::domain();
        case 'save':
            return pages::save();
        case 'getLayout':
            return layout::get( getArgv('name'), getArgv('plain') );
        case 'move':
            return pages::move();
        case 'add':
            return pages::add();
//            return pages::save( true );
        case 'getPage':
            return pages::getPage( getArgv( 'rsn' ), true );
        case 'deletePage':
            return pages::deletePage( getArgv('rsn') );
        case 'getNotices':
            return pages::getNotices( getArgv( 'rsn' ) );
        case 'addNotice':
            return pages::addNotice( getArgv( 'rsn' ) );
        case 'getIcons':
            return json( pages::getIcons( getArgv('rsn') ) );
        case 'getDomains':
            return pages::getDomains(getArgv('language'));
        case 'getTree':
            return pages::getTree( getArgv('domain') );
        case 'getTemplate':
            return pages::getTemplate( getArgv('template') );
        case 'getVersions':
            return pages::getVersions();
        case 'getUrl': 
            return pages::getUrl( getArgv('rsn') );
        case 'getPageVersions':
            json( self::getPageVersion( getArgv('rsn')));
        case 'getVersion':
            $rsn = getArgv('rsn')+0;
            $version = getArgv('version')+0;
            return json(pages::getVersion($rsn, $version));
        /*case 'addVersion':
            return pages::addVersion( getArgv('rsn')+0, getArgv('name',true) );*/
        case 'setLive':
            return json( pages::setLive(getArgv('version')) );

        case 'paste':
            return json( self::paste() );
            
        case 'deleteAlias':
            return pages::deleteAlias( getArgv('rsn')+0 );
        case 'getAliases':
            return pages::getAliases( getArgv('page_rsn')+0 );

        default:
            return pages::itemList();
        }
    }
    
    public static function getAliases( $pRsn ){
        $pRsn = $pRsn+0;
    
        $items = dbTableFetch('system_urlalias', 'to_page_rsn = '.$pRsn, -1);
        json( $items );
    }
    
    public static function deleteAlias( $pRsn ){
        $pRsn = $pRsn+0;
    
        dbDelete('system_urlalias', 'rsn = '.$pRsn);
    }

    public static function setLive( $pVersion ){
        
        $pVersion = $pVersion+0;
        $version = dbTableFetch('system_pagesversions', 1, 'rsn = '.$pVersion);
        
        if( $version['rsn'] > 0 ){
            $newstVersion = dbTableFetch('system_pagesversions', 1, 'page_rsn = '.$version['page_rsn'].' ORDER BY created DESC');

            if( $newstVersion['rsn'] == $pVersion )
                dbUpdate('system_pages', array('rsn' => $version['page_rsn']), array('draft_exist' => 0));
            else
                dbUpdate('system_pages', array('rsn' => $version['page_rsn']), array('draft_exist' => 1));
            
            dbUpdate('system_pagesversions', array('page_rsn' => $version['page_rsn']), array('active' => 0));
            dbUpdate('system_pagesversions', array('rsn' => $version['rsn']), array('active' => 1));
            return 1;
        }
        return 0;
    
    }

    public static function paste(){

        //$to = getArgv('');
        //$page = dbTableFetch('system_pages', 1, 'rsn = ');
        if( getArgv('type') == 'pageCopy' ){
            self::copyPage( getArgv('page'), getArgv('to'), getArgv('pos') );
        }
        if( getArgv('type') == 'pageCopyWithSubpages' ){
            self::copyPage( getArgv('page'), getArgv('to'), getArgv('pos'), true );
        }

        $page = dbTableFetch('system_pages', 1, 'rsn = '.(getArgv('to')+0));
        pages::cleanSort( $page['domain_rsn'], $page['prsn'] );
        pages::updateUrlCache( $page['domain_rsn'] );
        pages::updateMenuCache( $page['domain_rsn'] );

        $page = dbTableFetch('system_pages', 1, 'rsn = '.(getArgv('page')+0));
        pages::cleanSort( $page['domain_rsn'], $page['prsn'] );
        pages::updateUrlCache( $page['domain_rsn'] );
        pages::updateMenuCache( $page['domain_rsn'] );

        return true;

    }

    public static function copyPage( $pFrom, $pTo, $pPos, $pWithSubpages = false, $pWithoutThisPage = false ){
        global $user;
        
        $pFrom = $pFrom+0;
        $pTo = $pTo+0;
        $pWithoutThisPage = $pWithoutThisPage+0;
        
        $toPage = dbTableFetch('system_pages', 1, 'rsn = '.$pTo);
        $fromPage = dbTableFetch('system_pages', 1, 'rsn = '.$pFrom);
        $newPage = $fromPage;

        $siblingWhere = "prsn = ".$toPage['prsn'];
        $newPage['domain_rsn'] = $toPage['domain_rsn'];
        if( $pPos == 'down' || $pPos == 'up'){
            $newPage['sort'] = $toPage['sort'];
            $newPage['prsn'] = $toPage['prsn'];
            $newPage['sort_mode'] = $pPos;
        } else {
            $newPage['sort'] = 1;
            $siblingWhere = "prsn = ".$toPage['rsn'];
            $newPage['sort_mode'] = 'up';
            $newPage['prsn'] = $toPage['rsn'];
        }
        $newPage['draft_exist'] = 1;
        $newPage['rsn'] = null;
        $newPage['visible'] = 0;
        
        if( $pWithSubpages ){
            $withoutPage = '';
            if( $pWithoutThisPage ){
                $withoutPage = ' AND rsn != '.$pWithoutThisPage;
            }
            
            $childs = dbTableFetch('system_pages', -1, 'prsn = '.$pFrom . $withoutPage.' ORDER BY sort ' );
        }
        
        //ceck url & titles
        $siblings = dbTableFetch('system_pages', -1, $siblingWhere);
       
        if( count($siblings) > 0 ){
                    
            $newCount = 0;
            $t = $newPage['title'];
            $needlePos = strpos( $t, ' #')+2;
            $needleLast = substr( $t, $needlePos );
            
            
            foreach( $siblings as &$sibling ){
                
                //check title
                if( $needleLast+0 == 0 && $newPage['title'] == substr( $sibling['title'], 0, strlen($newPage['title'])) ){
                    //same start, if last now a number ?
                    $end = substr($sibling['title'], strlen($newPage['title'])+2);
                    if( $end+0 > 0 ){
                        if( $newCount < $end+1 )
                            $newCount = $end+1; //$newPage['title'] .= ' #'.($end+1);
                    } else if( $end == '' ) { //equal title
                        if( $newCount == 0 )
                            $newCount = 1; //$newPage['title'] .= ' #1';
                    }
                } else {
                     
                    $ts = $sibling['title'];
                    $needleSPos = strpos( $ts, ' #')+2;
                    $needleSLast = substr( $ts, $needleSPos );
                    
                    if( $needleLast+0 > 0 && $needleSLast+0 > 0 ){
                        //both seems to be increased
                        if( $newCount < $needleSLast+1 )
                            $newCount = $needleSLast+1;
                    }
                
                }
                
                if( $newPage['url'] == substr( $sibling['url'], 0, strlen($newPage['url'])) ){
                    //same start, if last now a number ?
                    $end = substr($sibling['url'], strlen($newPage['url']));
                    if( $end+0 > 0 ){
                        $newPage['url'] .= '_'.($end+1);
                    } else if( $end == '' ) { //equal title
                        $newPage['url'] .= '_1';
                    }
                }
            }
            
            if( $newCount > 0 ){
                if( $needlePos > 2 )
                    $newPage['title'] = substr( $t, 0, $needlePos-2 ).' #'.$newCount;
                else 
                    $newPage['title'] .= ' #'.$newCount;

            }
        }
        
        if( $newPage['prsn'] == 0 ){
            if( !kryn::checkPageAcl($newPage['domain_rsn'], 'addPages', 'd') )
                json('access-denied');
        } else {
            if( !kryn::checkPageAcl($newPage['prsn'], 'addPages') )
                json('access-denied');
        }
        
        unset( $newPage['rsn'] );
        $lastId = dbInsert('system_pages', $newPage );
        
        if( !$pWithoutThisPage )
            $pWithoutThisPage = $lastId;

        if( $newPage['prsn'] == 0 ){
            if( !kryn::checkPageAcl($newPage['domain_rsn'], 'canPublish', 'd') )
                json('access-denied');
        } else {
            if( !kryn::checkPageAcl($newPage['prsn'], 'canPublish') )
                json('access-denied');
        }
        
        //copy contents
        $curVersion = dbTableFetch('system_pagesversions', 1, 'active = 1 AND page_rsn = '.$pFrom );
        $contents = dbTableFetch('system_contents', -1, 'version_rsn = '.$curVersion['rsn']);
        
        if( count($contents) > 0 ){
            $newVersion = dbInsert('system_pagesversions', array(
                'page_rsn' => $lastId,
                'owner_rsn' => $user->user_rsn,
                'created' => time(),
                'modified' => time(),
                'active' => 0
            ));

            foreach( $contents as &$content ){
                $content['page_rsn'] = $lastId;
                unset($content['rsn']);
                $content['mdate'] = time();
                $content['cdate'] = time();
                $content['version_rsn'] = $newVersion;
                dbInsert('system_contents', $content);
            }
        }


        //copy subpages
        if( $pWithSubpages ){
            if( count($childs) > 0 ){
                foreach($childs as &$child ){
                    self::copyPage( $child['rsn'], $lastId, 'into', true, $pWithoutThisPage ); 
                }
            }
        }

        return $lastId;
    }

    public static function domain(){
        switch( getArgv(4) ) {
        case 'add':
            return self::addDomain();
        case 'delete':
            return self::delDomain();
        case 'getMaster':
            return self::getDomainMaster();
        case 'get':
            return self::getDomain();
        case 'save':
            return self::saveDomain();
        }
    }

    public static function getDomainMaster(){
        $rsn = getArgv('rsn')+0;
        if( !kryn::checkPageAcl($rsn, 'domainLanguageMaster', 'd') ){
            json('access-denied');
        }
        $cur = dbTableFetch('system_domains', 1, "rsn = $rsn");
        $res = dbTableFetch('system_domains', 1, "domain = '".$cur['domain']."' AND master = 1");
        json( $res );
    }

    public static function saveDomain(){
        $rsn = getArgv('rsn')+0;
        
        $dbUpdate = array();
        $canChangeMaster = false;
        
        
        if( kryn::checkPageAcl($rsn, 'domainName', 'd') ){
            $dbUpdate[] = 'domain';
        }
        
        if( kryn::checkPageAcl($rsn, 'domainTitle', 'd') ){
            $dbUpdate[] = 'title_format';
        }
        
        if( kryn::checkPageAcl($rsn, 'domainStartpage', 'd') ){
            $dbUpdate[] = 'startpage_rsn';
        }
        
        if( kryn::checkPageAcl($rsn, 'domainPath', 'd') ){
            $dbUpdate[] = 'path';
        }
        if( kryn::checkPageAcl($rsn, 'domainFavicon', 'd') ){
            $dbUpdate[] = 'favicon';
        }
        if( kryn::checkPageAcl($rsn, 'domainLanguage', 'd') ){
            $dbUpdate[] = 'lang';
        }
        if( kryn::checkPageAcl($rsn, 'domainLanguageMaster', 'd') ){
            $canChangeMaster = true;
            $dbUpdate[] = 'master';
        }
        if( kryn::checkPageAcl($rsn, 'domainEmail', 'd') ){
            $dbUpdate[] = 'email';
        }
        
    
        if( kryn::checkPageAcl($rsn, 'themeProperties', 'd') ){
            $dbUpdate[] = 'publicproperties';
        }
        if( kryn::checkPageAcl($rsn, 'limitLayouts', 'd') ){
            $dbUpdate[] = 'layouts';
        }
        if( kryn::checkPageAcl($rsn, 'domainProperties', 'd') ){
            $dbUpdate[] = 'extproperties';
        }
        if( kryn::checkPageAcl($rsn, 'aliasRedirect', 'd') ){
            $dbUpdate[] = 'alias';
            $dbUpdate[] = 'redirect';
        }
        
    
        if( kryn::checkPageAcl($rsn, 'phpLocale', 'd') ){
            $dbUpdate[] = 'phplocale';
        }
        if( kryn::checkPageAcl($rsn, 'robotRules', 'd') ){
            $dbUpdate[] = 'robots';
        }
        if( kryn::checkPageAcl($rsn, '404', 'd') ){
            $dbUpdate[] = 'page404interface';
            $dbUpdate[] = 'page404_rsn';
        }
        
        if( kryn::checkPageAcl($rsn, 'domainOther', 'd') ){
            $dbUpdate[] = 'resourcecompression';
        }
        
        $domain = getArgv('domain',1);
        if( $canChangeMaster ){
            if( getArgv('master') == 1 ){
                dbUpdate( 'system_domains', "domain = '$domain'", array('master' => 0 ));
            }
        }
        
        dbUpdate( 'system_domains', array('rsn'=>$rsn), $dbUpdate);
        pages::updateDomainCache();
        json( $domain );
    }

    public static function getDomain(){
    	global $kryn;
    	
        $rsn = getArgv('rsn')+0;
        
        if( !kryn::checkPageAcl($rsn, 'showDomain', 'd') ){
            json('access-denied');
        }
    	
        $res['domain'] = dbExfetch( "SELECT * FROM %pfx%system_domains WHERE rsn = $rsn" );
        json( $res );
    }

    public static function delDomain(){
        $domain = getArgv('rsn')+0;
        
    
        if( !kryn::checkPageAcl($domain, 'deleteDomain', 'd') ){
            json('access-denied');
        }
        
        dbDelete('system_pages', "domain_rsn = $domain");
        dbDelete('system_domains', "rsn = $domain");
        json(true);
    }

    public static function updateDomainCache(){
        $res = dbExec('SELECT * FROM %pfx%system_domains');
        $domains = array();
        while( $domain = dbFetch( $res, 1 ) ){
        	
            $code = $domain['domain'];
            $lang = "";
            if( $domain['master'] != 1 ){
                $lang = '_'.$domain['lang'];
                $code .= $lang;
            }
            
            if( $code != '' )
            	$domains['n2d'][$code] = $domain;
            	
            $domains['r2d']['rsn='.$domain['rsn']] = $domain;
            $alias = explode(",", $domain['alias']);
            if( count($alias) > 0 ){
                foreach( $alias as $ad ){
                    $domainName = str_replace(' ', '', $ad);
                    if( $domainName != '' )
                    	$domains['n2d'][$domainName.$lang] = $domain;
                }
            }
            $redirects = explode(",",$domain['redirect']);
            if( count($redirects) > 0 ){
                foreach( $redirects as $redirect ){
                    $domainName = str_replace(' ', '', $redirect);
                    if( $domainName != '' )
                    	$domains['n2r'][$domainName] = $domain;
                }
            }
        }
        kryn::setPhpCache('domains', $domains);
        return $domains;
    }

    public static function addDomain(){
        
        if( !kryn::checkUrlAccess('admin/pages/addDomains') )
            json('access-denied');
        
        dbInsert( 'system_domains', array('domain', 'lang', 'master' => 0, 'search_index_key' => md5(getArgv('domain').'-'.mktime().'-'.rand())));
        json(true);
    }


    /*
     *
     *  Pages
     */

    public static function getPageVersion( $pRsn ){
        $pRsn = $pRsn+0;

        $res = array();
        if( !kryn::checkPageAcl($pRsn, 'versions') ){
            json('access-denied');
        }
    
        //$res['live'] = dbTableFetch( 'system_pages', 1, "rsn = $pRsn" );
        $res['versions'] = dbExFetch( "SELECT v.*, u.username FROM %pfx%system_user u, %pfx%system_pagesversions v
            WHERE page_rsn = $pRsn AND u.rsn = v.owner_rsn ORDER BY created DESC", -1);

        return $res;
    }

    public static function getUrl( $pRsn ){
        $pRsn = $pRsn+0;
        
        json(kryn::getPagePath($pRsn));
        
        /*$domain = dbExfetch("SELECT d.rsn, d.domain FROM %pfx%system_domains d, %pfx%system_pages p WHERE p.domain_rsn = d.rsn AND p.rsn = $pRsn");
        kryn::$domain = $domain;
        $cachedUrls = kryn::readCache( 'urls' );
        $url = $cachedUrls['rsn']['rsn='.$pRsn];
        if( strpos( $url, 'http') === false )
            $url = "http://".$domain['domain'].'/'.$url;
        json( $url );*/
    }

    public static function deletePage( $pPage, $pNoCacheRefresh = false ){
        
    
        if( !kryn::checkPageAcl($pPage, 'deletePages') ){
            json('access-denied');
        }
        
        $page = dbExfetch( "SELECT * FROM %pfx%system_pages WHERE rsn = $pPage", 1);

        $subpages = dbTableFetch('system_pages', 'prsn = '.$pPage, -1 );
        if( count($subpages) > 0 ){
            foreach( $subpages as $page ){
                self::deletePage( $page['rsn'], true );
                dbExec( "DELETE FROM %pfx%system_pages WHERE rsn = $pPage" );
            }
        }

        dbExec( "DELETE FROM %pfx%system_pages WHERE rsn = $pPage" );

        if( !$pNoCacheRefresh ) {
            pages::cleanSort( $page['domain_rsn'], $page['prsn'] );
            pages::updateUrlCache( $page['domain_rsn'] );
            pages::updateMenuCache( $page['domain_rsn'] );
        }
    }

    public static function getDomains( $pLanguage ){
        $where = " 1=1 ";
        if( $pLanguage != "" )
            $where = "lang = '$pLanguage'";
        
        $res = dbTableFetch( 'system_domains', DB_FETCH_ALL, "$where ORDER BY domain ASC");
        if( count($res) > 0 ){
            foreach( $res as $domain ){
                
                if( kryn::checkPageAcl($domain['rsn'], 'showDomain', 'd') ){
                    $result[] = $domain;
                }
            }
        }
        json($result);
    }


    public static function getTemplate( $pTemplate ){
        global $kryn, $cfg;
        
        $kryn->resetJs();
        $kryn->resetCss();

        $domainPath = str_replace('\\','/',str_replace('\\\\\\\\','\\',urldecode(getArgv('path'))));
//        $url = 'http://'.getArgv('domain').str_replace('\\','/',str_replace('\\\\\\\\','\\',urldecode(getArgv('path'))));
        $path = 'http://'.getArgv('domain').$domainPath.'inc/template/';

        kryn::addJs( $path.'kryn/mootools-core.js' );
        kryn::addJs( $path.'kryn/mootools-more.js' );
        kryn::addJs( $path.'admin/js/ka.js' );
        kryn::addJs( $path.'js=global.js' );
        kryn::addCss( $path.'admin/css/ka.layoutBox.css' );
        kryn::addCss( $path.'admin/css/ka.field.css' );
        kryn::addCss( $path.'admin/css/ka.Button.css' );
        kryn::addCss( $path.'admin/css/ka.pluginChooser.css' );
        kryn::addCss( $path.'admin/css/inpage.css' );

        kryn::addCss( $path.'admin/css/ka.layoutBox.css' );
        kryn::addCss( $path.'admin/css/ka.layoutContent.css' );

        kryn::addHeader( '<script type="text/javascript" src="'.'http://'.getArgv('domain').$domainPath.'inc/tinymce/jscripts/tiny_mce/tiny_mce.js"></script>');


        $rsn = getArgv('rsn')+0;
        $page = dbTableFetch('system_pages', 1, "rsn = $rsn");
        //$domain = dbTableFetch('system_domains', 1, "domain = '".getArgv('domain',1)."'");
        $domain = dbTableFetch('system_domains', 1, "rsn = '".$page['domain_rsn']."'"); //.getArgv('domain',1)."'");
        /*$domain = array(
            'domain' => getArgv('domain'),
            'path' => $domainPath,
            'master' => 1
        );*/
        $domainName = $domain['domain'];

        $http = 'http://';
        if( $_SERVER['HTTPS'] == '1' || strtolower($_SERVER['HTTPS']) == 'on' )
            $http = 'https://';

        $port = '';
        if( ($_SERVER['SERVER_PORT'] != 80 && $http == 'http://') || 
            ($_SERVER['SERVER_PORT'] != 443 && $http == 'https://') 
           ){
            $port = ':'.$_SERVER['SERVER_PORT'];
        }

        if( getArgv(1) == 'admin' ){
            $domain['path'] = str_replace( 'index.php', '', $_SERVER['SCRIPT_NAME'] );
        }

        if( $domain['path'] != '' ){
            tAssign( 'path', $domain['path']);
            $cfg['path'] = $domain['path'];
            $cfg['templatepath'] = $domain['path'].'inc/template';
            tAssign( 'cfg', $cfg );
            tAssign( '_path', $domain['path']);
        }

        kryn::$baseUrl = $http.$domainName.$port.$cfg['path'];
        if( $domain['master'] != 1 ){
            kryn::$baseUrl = $http.$domainName.$port.$cfg['path'].$possibleLanguage.'/';
        }

        $kryn->current_page = $page;
        kryn::$page = $page;

        $page = tpl::buildPage('');

        /*tAssign('layout', '<div id="krynContentManager_layoutContent"></div>');
        tAssign('page', $page);
        $kryn->current_page['template'] = $pTemplate;
        kryn::$domain = dbTableFetch('system_domains', 1, "rsn = ".$page['domain_rsn']);
        $kryn->loadMenus();


        $pTemplate = str_replace('..', '', $pTemplate);

        if( $pTemplate == '__kTemplate' )
            $pTemplate = 'kryn/kTemplate.tpl';
        else
            $pTemplate = "kryn/templates/$pTemplate.tpl";

        $kryn->admin = false; //for buildHeader
        $page = tFetch( $pTemplate );
        kryn::replacePageIds( $page );
        $kryn->noCssLayout = true;

        $page = str_replace('{$kryn.header}', tpl::buildHead(true), $page );
        */

        if( getArgv('json') == '0' )
            die( $page );
        else
            json( $page );
    }

    public static function getVersion( $pPageRsn, $pVersion ){
        
        $pPageRsn = $pPageRsn+0;
        
        if( !kryn::checkPageAcl($pPageRsn, 'versions') ){
            json('access-denied');
        }
        
        $conts = array();
        if( $pVersion > 0 ){
            $conts = dbTableFetch( 'system_contents', DB_FETCH_ALL, "page_rsn = $pPageRsn AND version_rsn = $pVersion
            AND (cdate > 0 AND cdate IS NOT NULL)  ORDER BY sort");
        }

        if( count($conts) == 0 ){
            //may a old kryn version
            $conts = dbTableFetch( 'system_contents', DB_FETCH_ALL, "page_rsn = $pPageRsn AND version_rsn = 1 ORDER BY sort");
        }

        if( count($conts) > 0 ){
            foreach( $conts as $cont ){
                $contents[ $cont['box_id'] ][] = $cont;
            }
        }
        return $contents;
    }

    public static function getVersions(){
        $rsn = getArgv('rsn')+0;
        
        
        if( !kryn::checkPageAcl($rsn, 'versions') ){
            json('access-denied');
        }
        
        $res = dbExfetch("SELECT v.*, u.username FROM %pfx%system_pagesversions v, %pfx%system_user u
            WHERE u.rsn = v.owner_rsn AND page_rsn = $rsn ORDER BY created DESC", -1);
        json($res);
    }

    public static function addNotice( $pRsn ){
        global $user;
        dbInsert( 'system_page_notices', array('page_rsn'=>$pRsn, 'user_rsn'=>$user->user_rsn, 'content', 'created'=>time()));
        json(true);
    }

    public static function getNotices( $pRsn ){
        $res['notices'] = dbExfetch( 'SELECT n.*, u.username
            FROM %pfx%system_page_notices n, %pfx%system_user u
            WHERE u.rsn = n.user_rsn AND page_rsn = '.$pRsn.' ORDER BY rsn', DB_FETCH_ALL);
        $res['count'] = count($res['notices']);
        json($res);
    }

    public static function getTree( $pDomainRsn ){
    	$pDomainRsn = $pDomainRsn+0;
    	
        $viewAllPages = (getArgv('viewAllPages') == 1)?true:false;
        if( $viewAllPages && !kryn::checkUrlAccess('users/users/acl') )
            $viewAllPages = false;
    	
        if( !$viewAllPages && !kryn::checkPageAcl( $pDomainRsn, 'showDomain', 'd') ){
            json('access-denied');
        }
    	
        $items = dbTableFetch('system_pages', DB_FETCH_ALL, "domain_rsn = $pDomainRsn ORDER BY sort");

        $domain = dbExfetch("SELECT d.rsn FROM %pfx%system_domains d WHERE d.rsn = $pDomainRsn", 1);
        kryn::$domain = $domain;

        $cachedUrls = kryn::readCache( 'urls' );
        $count = 1;
        $res = array('pages'=>array());
        $pages = array();
        //http://ilee/krynSvn7/admin/pages/getTree/?noCache=1300455170461&domain=1&viewAllPages=0
        foreach( $items as $page ){
            
            if( $viewAllPages || kryn::checkPageAcl( $page['rsn'], 'showPage' ) ){
                $page['realUrl'] = $cachedUrls['rsn']['rsn='.$page['rsn']];
                $pages[] = $page;
                //$res['pages']['myid'+$count] = $page;
                $count++;
            }
            
        }
        $res['pages'] = $pages;
        $res['domain'] = dbTableFetch( 'system_domains', 1, "rsn = $pDomainRsn");
        json( $res );
    }

    public static function getIcons( $pRsn ){
        global $cfg;

        $page = pages::getPageByRsn( $pRsn );

        if( $page['visible'] == '0' && $page['type'] != '2' )
            $pngs[] = 'bullet_white';

        if( $page['access_denied'] == '1' )
            $pngs[] = 'bullet_delete';

        if( $page['type'] == '1' )
            $pngs[] = 'bullet_go';


        if( count($pngs) > 0 )
            foreach( $pngs as $png ){
                $res .= '<img src="' . $cfg['path'] . 'inc/template/admin/images/icons/'.$png.'_.png" />';
            }
        return $res;
    }

    public static function move(){
        $whoId = $_REQUEST['rsn']+0;
        $targetId = $_REQUEST['torsn']+0;
        $mode = getArgv('mode', 1);

        //get page data
        $who = pages::getPageByRsn( $whoId );
        $target = pages::getPageByRsn( $targetId );

        if( $targetId == 'domain' ){ //then move to domain
            $target['domain_rsn'] = getArgv('domain_rsn');
            $targetId = 0;
            $mode = 'into';
            if( !kryn::checkPageAcl($target['domain_rsn'], 'addPages', 'd') ){
                json('access-denied2');
            }
        }
        
        $oldRealUrl  = kryn::pageUrl($whoId, $who['domain_rsn']);
                
        //handle mode
        switch( $mode ){
        case 'into':
            if( $targetId != 0 && !kryn::checkPageAcl($targetId, 'addPages') ){
                json('access-denied');
            }
            dbExec( "UPDATE %pfx%system_pages SET prsn = $targetId, domain_rsn = '".$target['domain_rsn']."', sort = 1, sort_mode = 'up' WHERE rsn = $whoId" );
            break;
        case 'down':
            if( $target['prsn'] == 0 ){
             if( !kryn::checkPageAcl($target['domain_rsn'], 'addPages', 'd') ){
                    json('access-denied');
                }
            } else {
                if( !kryn::checkPageAcl($target['prsn'], 'addPages') ){
                    json('access-denied');
                }
            }
            
            dbExec( "UPDATE %pfx%system_pages SET prsn = ".$target['prsn'].", sort = ".$target['sort'].",
            sort_mode = 'down', domain_rsn = '".$target['domain_rsn']."'  WHERE rsn = $whoId" );
            break;
        case 'up':
            if( $target['prsn'] == 0 ){
             if( !kryn::checkPageAcl($target['domain_rsn'], 'addPages', 'd') ){
                    json('access-denied');
                }
            } else {
                if( !kryn::checkPageAcl($target['prsn'], 'addPages') ){
                    json('access-denied');
                }
            }
            dbExec( "UPDATE %pfx%system_pages SET prsn = ".$target['prsn'].", sort = ".$target['sort'].",
            sort_mode = 'up', domain_rsn = '".$target['domain_rsn']."' WHERE rsn = $whoId" );
            break;
        }

        
        
        $newRealUrl = kryn::pageUrl($whoId, $who['domain_rsn']);
        dbDelete('system_urlalias', 'domain_rsn = '.$who['domain_rsn']." AND url = '".$newRealUrl."'");
        
        if( $oldRealUrl != $newRealUrl ){
            $existRow = dbExfetch("SELECT rsn FROM %pfx%system_urlalias WHERE to_page_rsn=".$whoId." AND url = '".$oldRealUrl."'", 1);
         
            if( $existRow['rsn']+0 == 0 )
                dbInsert('system_urlalias', array( 'domain_rsn' => $who['domain_rsn'], 'url' => $oldRealUrl, 'to_page_rsn' => $whoId));
        }
        

        pages::cleanSort( $target['domain_rsn'], 0 );
        pages::updateUrlCache( $target['domain_rsn'] );
        pages::updateMenuCache( $target['domain_rsn'] );
        
        if( $target['domain_rsn'] != $who['domain_rsn'] ){
            pages::cleanSort( $who['domain_rsn'], 0 );
            pages::updateUrlCache( $who['domain_rsn'] );
            pages::updateMenuCache( $who['domain_rsn'] );
        }
        
        
        return true;
    }

    public static function cleanSort( $pDomain, $pParent ){
        //$pages = dbExfetch( "SELECT * FROM %pfx%system_pages WHERE domain_rsn = $pDomain AND prsn = $pParent AND sort_mode = '' ORDER BY sort", DB_FETCH_ALL );
        $pages = dbExfetch( "SELECT * FROM %pfx%system_pages WHERE domain_rsn = $pDomain AND prsn = $pParent ORDER BY sort, sort_mode", DB_FETCH_ALL );
        //$cleanPage = dbExfetch( "SELECT * FROM %pfx%system_pages WHERE domain_rsn = $pDomain AND prsn = $pParent AND sort_mode != ''" );

        $count = count($pages);
        $c = 1;
        $lastPage = false;
        if( count($pages) > 0 ) 
        foreach( $pages as &$page ){

            if( $page['sort_mode'] == 'up' ){
                if( $lastPage ) {
                    dbExec( "UPDATE %pfx%system_pages SET sort = ".($c)." WHERE rsn = ".$lastPage['rsn'] );
                    dbExec( "UPDATE %pfx%system_pages SET sort = ".($c-1)." WHERE rsn = ".$page['rsn'] );
                } else {
                    dbExec( "UPDATE %pfx%system_pages SET sort = ".($c)." WHERE rsn = ".$page['rsn'] );
                    $c++;
                }
            } else {
                dbExec( "UPDATE %pfx%system_pages SET sort = ".$c." WHERE rsn = ".$page['rsn'] );
            }
            $c++;

            if( $page['sort_mode'] == 'down' ){
                dbExec( "UPDATE %pfx%system_pages SET sort = ".($c)." WHERE rsn = ".$page['rsn'] );
                $c++;
            }

            $lastPage = $page;
            pages::cleanSort( $pDomain, $page['rsn'] );
        }

        dbExec( "UPDATE %pfx%system_pages SET sort_mode = '' WHERE domain_rsn = $pDomain AND prsn = $pParent" );
    }


    public static function itemList(){
        global $modules, $tpl, $kryn, $db, $navigation;
        $kryn->addMenu("Seiten", "pages");

        $path = "inc/template/kryn/templates/";
        $h = opendir($path);
        while($datei = readdir($h)){
            if(is_file($path.$datei) && $datei != 'head.tpl' && substr($datei, -4) == '.tpl' ){
                $files[] = str_replace(".tpl", "", $datei);
            }
        }
        $tpl->assign("files", $files);
        if(!empty($_REQUEST['rsn']) || !empty($_REQUEST['csd'])){
            if( !empty($_REQUEST['rsn']) ) {
                $link = pages::getPageByRsn( ($_REQUEST['rsn']+0) );
                $tpl->assign("cLink", $link);
            } elseif(! (strpos($_REQUEST['csd'], "navi:") === false) ){
                $naviRsn = str_replace("navi:", "", $_REQUEST['csd'])+0;
                if($naviRsn > 0){
                    $navi = $db->exfetch("SELECT * FROM ".pfx."system_navigations WHERE rsn = ".$naviRsn);
                    $tpl->assign("cNavi", $navi);
                }
            } else {
                $link = pages::getPageByRsn( ($_REQUEST['csd']+0) );
                $tpl->assign("cLink", $link);
            }
        }

        $domains = dbExfetch( "SELECT * FROM %pfx%system_domains", DB_FETCH_ALL );
        tAssign("domains", $domains);

        # nicht notwendig zur zeit
        #$systemLinks = $db->exfetch("SELECT * FROM ".pfx."system_links WHERE system = 1", DB_FETCH_ALL);
        #$tpl->assign("systemLinks", $systemLinks);
        tAssign( 'groups', users::getGroups() );
        tAssign( 'layouts', kryn::readFolder( 'inc/template/kryn/layouts/') );
        tAssign( 'navigations', kryn::readFolder( 'inc/template/kryn/navigations/') );
        tAssign( 'contents', kryn::readFolder( 'inc/template/kryn/contents/' ));

        return tFetch("admin/pages.tpl");
    }

    public static function getPageByRsn($pRsn){
        return dbExfetch("SELECT * FROM %pfx%system_pages WHERE rsn = ".($pRsn+0));
    }

    public static function add(){
        
        $found = (getArgv('field_1')!='')?true:false;
        $c = 1;
        $rsn = getArgv('rsn')+0;
        $pos = getArgv('pos');
        $type = getArgv('type')+0;
        
        $layout = getArgv('layout',1);
        $visible = getArgv('visible');

        if( $rsn > 0 )
            $page = dbTableFetch( 'system_pages', 1, "rsn = $rsn" );

        $domain_rsn = ($rsn>0)?$page['domain_rsn']:getArgv('domain_rsn');
        $prsn = ($rsn>0)?$page['prsn']:0;
        
        if( $prsn == 0 ){
            if( !kryn::checkPageAcl($domain_rsn, 'addPages', 'd') ){
                json('access-denied');
            }
        } else {
            if( !kryn::checkPageAcl($prsn, 'addPages') ){
                json('access-denied');
            }
        }

        while($found){
            $val = getArgv('field_'.$c);
            if( $val == '' ){
                $found = false;
                continue;
            }
            if( $pos == 'into' ){
                $sort = 1;
                $sort_mode = 'up';
                $prsn = ($rsn>0) ? $page['rsn'] : 0;
            } else {
                $sort = $page['sort'];
                $sort_mode = $pos;
            }
                    
            dbInsert('system_pages', array('title' => $val, 'sort' => $sort, 'sort_mode' => $sort_mode,
                'access_denied' => 0, 'cdate' => time(), 'mdate' => time(), 'cache' => 0,
                'access_from' => 0, 'access_to' => 0, 
                'url' => kryn::toModRewrite( $val ), 'layout' => $layout, 'visible' => $visible,
                'prsn' => $prsn, 'domain_rsn' => $domain_rsn, 'type' => $type));
            $c++;
        }
        if( $c > 1 )
            self::cleanSort( $domain_rsn, $prsn );

        pages::updateUrlCache( $domain_rsn );
        pages::updateMenuCache( $domain_rsn );

        json( true );
    }

    public static function save(){
        global $user, $kcache;

        $rsn = getArgv('rsn')+0;
        
        $domain_rsn = getArgv('domain_rsn')+0;

        $aclCanPublish = false;
        $canSaveContents = false;
        
        if( kryn::checkPageAcl($rsn, 'contents') && kryn::checkPageAcl($rsn, 'canPublish') ){
        	$aclCanPublish = true;
        }

        $groups = '';
        if( is_array(getArgv('access_from_groups')) )
            $groups = esc(implode(",",getArgv('access_from_groups')));


        $active = 0;
        $publishPage = false;
        if( getArgv('andPublish') == 1 && $aclCanPublish ){
            $publishPage = true;
        }
        
        
        $updateArray = array();
        
        if( kryn::checkPageAcl($rsn, 'general') ){
        	
        	if( kryn::checkPageAcl($rsn, 'title') )
        		$updateArray[] = 'title';
        	
       		if( kryn::checkPageAcl($rsn, 'page_title') )
        		$updateArray[] = 'page_title';
        		
       		if( kryn::checkPageAcl($rsn, 'type') )
        		$updateArray[] = 'type';
        		
       		if( kryn::checkPageAcl($rsn, 'url') )
        		$updateArray[] = 'url';
        		
       		if( kryn::checkPageAcl($rsn, 'meta'))
        		$updateArray[] = 'meta';
        	
        	$updateArray[] = 'target';
        	$updateArray[] = 'link';
        }
        
        
        if( kryn::checkPageAcl($rsn, 'access') ){
        	
        	if( kryn::checkPageAcl($rsn, 'visible') )
        		$updateArray[] = 'visible';
        		
        	if( kryn::checkPageAcl($rsn, 'access_denied') )
        		$updateArray[] = 'access_denied';
        		
        	if( kryn::checkPageAcl($rsn, 'force_https') )
        		$updateArray[] = 'force_https';
        		
        	if( kryn::checkPageAcl($rsn, 'releaseDates') ){
        		$updateArray[] = 'access_from';
        		$updateArray[] = 'access_to';
        	}
        	
        	if( kryn::checkPageAcl($rsn, 'limitation') ){
        		$updateArray['access_from_groups'] = $groups;
        		$updateArray[] = 'access_need_via';
        		$updateArray[] = 'access_nohidenavi';
        		$updateArray[] = 'access_redirectto';
        	}
        }    
        
        if( kryn::checkPageAcl($rsn, 'contents') ){
        	
        	$canSaveContents = true;
        	
        	if( kryn::checkPageAcl($rsn, 'canChangeLayout') )
        		$updateArray[] = 'layout';
        	
        }
        
        if( kryn::checkPageAcl($rsn, 'properties') ){
        	$updateArray[] = 'properties';
        }

        if( kryn::checkPageAcl($rsn, 'search') ){
        	
        	if( kryn::checkPageAcl($rsn, 'exludeSearch') ){
        		$updateArray[] = 'unsearchable';
        		
		        if(getArgv('unsearchable', 1)+0 > 0)
		             dbExec("DELETE FROM %pfx%system_search WHERE page_rsn = '".$rsn."' AND domain_rsn=".$domain_rsn);
        	}
        		
        	if( kryn::checkPageAcl($rsn, 'searchKeys') )
        		$updateArray[] = 'search_words';
        	
        }
        
        $updateArray['draft_exist'] = ($publishPage)?0:1;
        $updateArray['mdate'] = time();
        
        
        $oldPage = dbTableFetch("system_pages", "rsn = ".($rsn+0), 1);
        if( in_array('url', $updateArray) && $oldPage['url'] != getArgv('url',1) ){
            
            $kcache['realUrl'] = kryn::getcache( 'urls_'.$oldPage['domain_rsn'] );
            $oldRealUrl = $kcache['realUrl']['rsn'][ 'rsn='.$rsn ];
            $existRow = dbExfetch("SELECT rsn FROM %pfx%system_urlalias WHERE to_page_rsn=".$page." AND url = '".$oldRealUrl."'", 1);
         
            if( $existRow['rsn']+0 == 0 )
                dbInsert('system_urlalias', array( 'domain_rsn' => $oldPage['domain_rsn'], 'url' => $oldRealUrl, 'to_page_rsn' => $rsn));
        }
    
        dbUpdate('system_pages', array('rsn' => $rsn), $updateArray);
        
        //if page marked as unsearchable the delete it from index
        

        if( $canSaveContents && !(getArgv('dontSaveContents') == 1) && (getArgv('type') == 0 || getArgv('type') == 3) ){
            $contents = json_decode( $_POST['contents'], true);

            $active = 0;
            if( getArgv('andPublish') == 1 && $aclCanPublish ){
                $active = 1;
                dbUpdate( 'system_pagesversions', array('page_rsn' => $rsn), array('active' => 0) ); 
            }

            $time = time();

            $version_rsn = dbInsert('system_pagesversions', array(
                'page_rsn' => $rsn, 'owner_rsn' => $user->user_rsn, 'created' => $time, 'modified' => $time,
                'active' => $active
            ));

            //dbExec( 'UPDATE %pfx%system_contents SET version_rsn = version_rsn+1 WHERE page_rsn = '.$rsn);
            //dbDelete( 'system_contents', "page_rsn = $rsn AND version_rsn > 10");

            
            if( count($contents) > 0 ){
                foreach( $contents as $boxId => &$box ){
                    $sort = 1;
                    foreach( $box as &$content ){
                        $contentGroups = '';
                        if( is_array($content['access_from_groups']))
                            $contentGroups = esc(implode(",",$content['access_from_groups']));
                        
                            
                        //TODO verify the content type whether the user can save/change it
                        //if contents already exists and cant changed, make sure, that we have here the RSN of this contents, to get the content from the
                        //version before.
                    
                        if( kryn::checkPageAcl($rsn, 'content-'.$content['type']) ){
                        	
                            dbInsert('system_contents', array(
                                'page_rsn' => $rsn,
                                'box_id' => $boxId,
                                'title' => $content['title'],
                                'content' => $content['content'],
                                'template' => $content['template'],
                                'type' => $content['type'],
                                'mdate' => $time,
                                'cdate' => $time,
                                'hide' => $content['hide'],
                                'sort' => $sort,                            
                                'version_rsn' => $version_rsn, 
                                'unsearchable' => $content['unsearchable'], 
                                'access_from' => $content['access_from'], 
                                'access_to' => $content['access_to'], 
                                'access_from_groups' => $contentGroups
                            ));
                        
                            $sort++;
                        } else {
                            
                            $oldContent = dbTableFetch('system_contents', 'rsn = '.($content['rsn']+0), 1);
                            if( $oldContent['rsn']+0 > 0 && $oldContent['type'] == $content['type'] ){
                                
                                $oldContent['version_rsn'] = $version_rsn;
                                unset($oldContent['rsn']);
                                dbInsert('system_contents', $oldContent);
                                $sort++;
                                
                            }
                        }
                    }
                }
            }
        }

        
        if( kryn::checkPageAcl($rsn, 'resources') ){
	        if( getArgv('getType') == 0  || getArgv('getType') == 3 ){ //page or deposit
	        	
	        	
       			if( kryn::checkPageAcl($rsn, 'css') ){
		            if( getArgv('resourcesCss') != '' )
		                kryn::fileWrite( "inc/template/css/_pages/$rsn.css", getArgv('resourcesCss') );
		            else
		                @unlink("inc/template/css/_pages/$rsn.css");
       			}
	                
       			
       			if( kryn::checkPageAcl($rsn, 'js') ){
		            if( getArgv('resourcesJs') != '' )
		                kryn::fileWrite( "inc/template/js/_pages/$rsn.js", getArgv('resourcesJs') );
		            else
		                @unlink("inc/template/js/_pages/$rsn.js");
       			}
        	}
        }

        pages::updateUrlCache( $domain_rsn );
        pages::updateMenuCache( $domain_rsn );
        $res = self::getPage( $rsn );

        json( $res );
    }

    public static function saveold( $pNew = false ){
        global $db, $kryn;
        $rsn = $_REQUEST['rsn']+0;
        $title = esc($_REQUEST['title']);
        $page_title = esc($_REQUEST['page_title']);
        $template = $_REQUEST['template'];

        $type = $_REQUEST['type']+0;

        $pageurl = esc($_REQUEST['purl']);
        if( $type != 1 ){
            //is not a Link
            $pageurl = kryn::toModRewrite($_REQUEST['purl']);
        }

        $visible = ( empty($_REQUEST['visible']) ) ? '0' : '1';
        $access_denied = ( empty($_REQUEST['access_denied']) ) ? 0 : 1;
        $meta = $_REQUEST['meta'];

        $delete = $_REQUEST['delete'];
        $layout = $_REQUEST['layout'];
        $domain_rsn = $_REQUEST['domain_rsn']+0;
        $cache = $_REQUEST['cache']+0;

        $accessFrom = strtotime($_REQUEST['access_from'])+0;
        $accessTo = strtotime($_REQUEST['access_to'])+0;

        //$content = preg_replace('/<img(.*) src="(.*)admin\/plugins\/icon\/plugin=(.*)?\/"(.*)\/>/', '{krynplugin plugin="$3"}', $_REQUEST['content']);

        $res = false;
        if (!empty($_REQUEST['adminPageSave'])) {
            if($delete == "1"){
                $page = dbExfetch( "SELECT* FROM %pfx%system_pages WHERE rsn = $rsn" );
                dbExec( "UPDATE %pfx%system_pages SET prsn = " . $page['prsn'] . " WHERE prsn = $rsn" );
                dbExec( "DELETE FROM %pfx%system_pages WHERE rsn = $rsn" );
            } else if( $pNew ) {
                $navi = $_REQUEST['navigation_rsn']+0;
                $time = time();

                $domain_rsn = $_REQUEST['domain_rsn']+0;
                $prsn = $_REQUEST['prsn'];
                $where = $_REQUEST['where'];

                if( $prsn == "" ){ //oberstes
                    $sort = 1;
                    $mode = 'up';
                    $prsn = 0;
                } else {
                    $page = pages::getPageByRsn( $prsn );
                    if( $where == 'into' ){ //erstes in pRsn
                        $sort = 1; 
                        $mode = 'up';
                    } else { //nach pRsn
                        $prsn = $page['prsn'];
                        $sort = $page['sort'];
                        $mode = 'down';
                    }
                }

                /*
                 dbExec( "INSERT INTO %pfx%system_pages
                         (domain_rsn, prsn, type, title, page_title, url, template, layout, language, sort, sort_mode,
                         visible, access_denied, meta, cdate, mdate)
                         VALUES( $domain_rsn, $prsn, $type, '$title', '$page_title', '$pageurl', '$template', '$layout', '$language', $sort, '$mode',
                             $visible, '$access_denied', '$meta', '$time', '$time'  ) ");
                 */
                $rsn = dbInsert( 'system_pages', array(
                    'domain_rsn' => $domain_rsn,
                    'prsn' => $prsn,
                    'type' => $type,
                    'title' => $title,
                    'page_title' => $page_title,
                    'url' => $pageurl,
                    'template' => $template,
                    'layout' => $layout,
                    'sort' => $sort,
                    'sort_mode' => $mode,
                    'visible' => $visible,
                    'access_denied' => $access_denied,
                    'meta' => $meta,
                    'cdate' => $time,
                    'mdate' => $time,
                    'cache' => $cache,
                    'access_to' => $accessTo,
                    'access_from' => $accessFrom,
                ));

                pages::cleanSort( $domain_rsn, 0 );

                //$page = dbExfetch( "SELECT * FROM %pfx%system_pages WHERE title = '$title' AND cdate = $time " );
                $page = pages::getPageByRsn($rsn);

            } else { //sa've normal
                dbExec("UPDATE ".pfx."system_pages SET
                        title = '$title',
                        page_title = '$page_title',
                        url = '$pageurl',
                        template = '$template',
                        type = $type,
                        layout = '$layout',
                        visible = $visible,
                        access_denied = '$access_denied',
                        meta = '$meta',
                        cache = $cache,
                        mdate = ".time().",
                        access_to = $accessTo,
                        access_from = $accessFrom
                        WHERE rsn = $rsn");
            }

            //$_conts = str_replace( "'", "\'", $_POST['contents'] );
            $_conts = $_POST['contents'];
            $contents = json_decode( $_conts, true);

            // SAVE IN DATABASE
            dbExec( 'UPDATE %pfx%system_contents SET version_rsn = version_rsn+1 WHERE page_rsn = '.$rsn);
            dbDelete( 'system_contents', "page_rsn = $rsn AND version_rsn > 10");
            if( count($contents) > 0 ){
                foreach( $contents as $boxId=>$box ){
                    $sort = 1;
                    foreach( $box as $content ){
                        //$content['content'] = mysql_real_escape_string( $content['content'] );
                        dbInsert('system_contents', array(
                            'page_rsn' => $rsn,
                            'box_id' => $boxId,
                            'title' => $content['title'],
                            'content' => $content['content'],
                            'template' => $content['template'],
                            'type' => $content['type'],
                            'mdate' => time(),
                            'sort' => $sort,
                            'version_rsn' => 1 
                        ));
                        /*dbExec( "
                            INSERT INTO %pfx%system_contents (page_rsn, box_id, title, content, template, type, mdate, sort)
                            VALUES( $rsn, $boxId, '".$content['title']."', '".$content['content']."', '".$content['template']."',
                                '".$content['type']."', ".time().", $sort )
                                ");*/
                        $sort++;
                    }
                }
            }

            //save resources
            kryn::fileWrite( "inc/template/css/_pages/$rsn.css", getArgv('resourcesCss') );
            kryn::fileWrite( "inc/template/js/_pages/$rsn.js", getArgv('resourcesJs') );

            pages::updateUrlCache( $domain_rsn );
            pages::updateMenuCache( $domain_rsn );
            $res = self::getVersion( $rsn, 1 );
        }
        json( $res );
    }

    public static function updatePageCaches( $pDomainRsn, $pAll = false ){
        global $kryn, $admin;
        $resu = dbExec( "SELECT * FROM %pfx%system_pages WHERE domain_rsn = $pDomainRsn". (($pAll == false) ? " AND cache = 1":"")  );
        $kryn->forceKrynContent = true;
        $kryn->admin = false;
        $kryn->resetCss();
        $kryn->resetJs();
        tAssign( 'admin', false );

        while( $page = dbFetch( $resu ) ){
            $kryn->current_page = $page;
            kryn::fileWrite( "inc/cache/_pages/".$page['rsn'].".html", $kryn->display(true) );
        }
    }

    public static function updateMenuCache( $pDomainRsn ){
        $resu = dbExec( "SELECT rsn, title, url, prsn FROM %pfx%system_pages WHERE
        				 domain_rsn = $pDomainRsn AND (type = 0 OR type = 1 OR type = 4)");
        $res = array();
        while( $page = dbFetch( $resu, 1 ) ){
            if( $pge['type'] == 0 )
                $res[ $page['rsn'] ] = pages::getParentMenus( $page );
            else
                $res[ $page['rsn'] ] = pages::getParentMenus( $page, true );
        }
        kryn::setPhpCache( "menus_$pDomainRsn", $res );
        return $res;
    }

    public static function getParentMenus( $pPage, $pAllParents = false ){
        global $kryn;
        $prsn = $pPage['prsn'];
        $res = array();
        while( $prsn != 0 ){
            $parent_page = dbExfetch( "SELECT rsn, title, url, prsn, type FROM %pfx%system_pages WHERE rsn = " . $prsn, 1 );
            if( $parent_page['type'] == 0 || $parent_page['type'] == 1 || $parent_page['type'] == 4 ){
                //page or link or page-mount
                array_unshift($res, $parent_page );
            } else if( $pAllParents ){
                array_unshift($res, $parent_page );
            }
            $prsn = $parent_page['prsn'];
        }
        return $res;
    }

    public static function updateUrlCache( $pDomainRsn ){
        global $kryn;
        
        $pDomainRsn = $pDomainRsn+0;
        
        $resu = dbExec( "SELECT rsn, title, url, type, link FROM %pfx%system_pages WHERE domain_rsn = $pDomainRsn AND prsn = 0"  );
        $res = array( 'url' => array(), 'rsn' => array());
        
        $domain = kryn::getDomain( $pDomainRsn );
        while( $page = dbFetch( $resu, 1 ) ){
            $page = self::__pageModify( $page, array('realurl' => '') );
            $newRes = pages::getChildPages( $page, $domain );
            $res['url'] = array_merge( $res['url'], $newRes['url'] );
            $res['rsn'] = array_merge( $res['rsn'], $newRes['rsn'] );
            //$res['r2d'] = array_merge( $res['r2d'], $newRes['r2d'] );
        }
        $kryn->realUrls = $res;
        
        $aliasRes = dbExec('SELECT to_page_rsn, url FROM %pfx%system_urlalias WHERE domain_rsn = '.$pDomainRsn);
        while( $row = dbFetch( $aliasRes ) ){
            $res['alias'][$row['url']] = $row['to_page_rsn'];
        }
        
        self::updatePage2DomainCache($pDomainRsn);
        kryn::setCache( "urls_$pDomainRsn", $res );
        return $res;
    }
    
    public static function updatePage2DomainCache( $pDomain = false ){
    	
        $r2d = array();
        $where = "";
        if( $pDomain+0 > 0 )
            $where = 'WHERE domain_rsn = '.($pDomain+0);
        $res = dbExec('SELECT rsn, domain_rsn FROM %pfx%system_pages '.$where);
        
        while( $row = dbFetch($res) ){
        	$r2d[ $row['domain_rsn'] ] .= $row['rsn'].',';
        }
        kryn::setPhpCache( "r2d", $r2d );
        return $r2d;
    }

    public static function getChildPages( $pPage, $pDomain = false ){
        global $kryn;
        $res = array( 'url' => array(), 'rsn' => array(), 'r2d' => array() );

        if( $pPage['type'] == 1 ){ //link
            //$realUrl = $pPage['realurl'];
            //$pPage['realurl'] = $pPage['prealurl'];
        }
        
        /*$res['r2d']['rsn='.$pPage['rsn']] = array(
            'rsn'    => $pDomain['rsn'],
            'path'   => $pDomain['path'],
            'domain' => $pDomain['domain'],
            'master' => $pDomain['master']
        );*/

        if( $pPage['type'] < 2 ){ //page or link or folder
            if( $pPage['realurl'] != '' ){
                $res['url'][ 'url='.$pPage['realurl'] ] = $pPage['rsn'];
                $res['rsn'] = array( 'rsn=' . $pPage['rsn'] => $pPage['realurl'] );
            } else {
                $res['rsn'] = array( 'rsn=' . $pPage['rsn'] => $pPage['url'] );
            }
        }

        $pages = dbExfetch( "SELECT rsn, title, url, type, link
                             FROM %pfx%system_pages
                             WHERE prsn = " . $pPage['rsn'],
                             DB_FETCH_ALL );
        
        if( is_array($pages) ) {
            foreach( $pages as $page ){
                $page = self::__pageModify( $page, $pPage );
                $newRes = pages::getChildPages( $page );

                $res['url'] = array_merge( $res['url'], $newRes['url'] );
                $res['rsn'] = array_merge( $res['rsn'], $newRes['rsn'] );
                $res['r2d'] = array_merge( $res['r2d'], $newRes['r2d'] );

            }
        }
        return $res;
    }

    public static function __pageModify( $page, $pPage ){
        if( $page['type'] == 0 ){
            $del = '';
            if( $pPage['realurl'] != '' )
                $del = $pPage['realurl'] . '/';
            $page['realurl'] = $del . $page['url'];

        } elseif( $page['type'] == 1 ){//link
            if( $page['url'] == '' ){ //if empty, use parent-url else use url-hiarchy
                $page['realurl'] = $pPage['realurl'];
            } else {
                $del = '';
                if( $pPage['realurl'] != '' )
                    $del = $pPage['realurl'] . '/';
                $page['realurl'] = $del . $page['url'];
            }

            $page['prealurl'] = $page['link'];
        } else if( $page['type'] != 3 ){ //keine ablage
            //ignore the hiarchie-item
            $page['realurl'] = $pPage['realurl'];
        }
        return $page;
    }

    //not in use - may delete it
    public static function writeContent( $pRsn, $pLayout, $pContent ){
        $_layout = kryn::readTempFile( "kryn/layouts/$pLayout.tpl" );
        foreach( $pContent as $layout ){
            $html = '';
            foreach( $layout as $content ){
                $html .= $content['type'].'<br />';
            }
            $_layout = preg_replace( '/\{krynContent .*\}/', $html, $_layout );
        }   
        kryn::writeTempFile( '_pages/' . $pRsn . '.tpl', $_layout );
    }

    public static function edit(){
            return template::edit();
    }

    public static function getPage( $pRsn, $pLock = false){
        global $kryn;
        $pRsn = $pRsn+0;
        $res = pages::getPageByRsn( $pRsn );
        $res['resourcesCss'] = kryn::readTempFile( "css/_pages/$pRsn.css"); 
        $res['resourcesJs'] = kryn::readTempFile( "js/_pages/$pRsn.js"); 
        
        $curVersion = dbTableFetch('system_pagesversions', 1, "page_rsn = $pRsn AND active = 1");
        if(! $curVersion['rsn'] > 0 ){
            $curVersion = dbTableFetch('system_pagesversions', 1, "page_rsn = $pRsn ORDER BY rsn DESC");
        }
        $contents = self::getVersion( $pRsn, $curVersion['rsn'] );
        $res['_activeVersion'] = $curVersion['rsn'];
        
        $res['alias'] = dbExfetch('SELECT * FROM %pfx%system_urlalias WHERE to_page_rsn='.$pRsn, -1);
        
        $domain = dbExfetch("SELECT d.rsn FROM %pfx%system_domains d, %pfx%system_pages p WHERE p.domain_rsn = d.rsn AND p.rsn = $pRsn");
        kryn::$domain = $domain;
        $cachedUrls = kryn::readCache( 'urls' );
        $res['realUrl'] = $cachedUrls['rsn']['rsn='.$pRsn];
        $res['contents'] = json_encode( $contents );

        $res['versions'] = dbExfetch( "SELECT version_rsn, MAX(mdate) FROM %pfx%system_contents WHERE page_rsn = $pRsn GROUP BY version_rsn", DB_FETCH_ALL );

        json( $res );
    }
    
    public static function getValidUrl(){
        
    }
    
    public static function increasePage($pRsn){
            global $db;
            $currentPage = $db->exfetch("SELECT * FROM ".pfx."system_pages WHERE rsn = ".$pRsn);
            $sort = $currentPage['sort']+1;
            $db->exec("UPDATE ".pfx."system_pages SET sort = $sort WHERE rsn = ".$pRsn);
    }
}

?>

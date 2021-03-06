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


class usersAcl {
    
    function init(){
        switch( getArgv(5) ){
            case 'search':
                return self::search();
            case 'loadTree':
                return self::loadTree();
            case 'load':
                return self::load();
            case 'loadDomains':
                return self::loadDomains();
            case 'loadPages':
                return self::loadPages();
            case 'save':
                return self::save();
            case 'getPageItemInfo':
            	return self::getPageItemInfo();
        }
    }
    
    public static function getPageItemInfo(){
    	$code = getArgv('code');
    	$code = str_replace('%', '', $code);
    	
    	
    	$rcode = substr( $code, 1, strlen($code) );
    	$t = explode( '[', $rcode );
    	$rsn = $t[0]+0;
    	
    	if( substr($code, 0, 1) == 'd' ){
    		//domain
    		
    		$domains = kryn::getPhpCache('domains');
    		$res['title'] = $domains['r2d']['rsn='.$rsn]['domain'];
    		$res['path'] = $domains['r2d']['rsn='.$rsn]['lang'];
    		
    	} else {
    		//page
    		$page = dbExfetch('SELECT title FROM %pfx%system_pages WHERE rsn = '.$rsn);
    		$res['title'] = $page['title'];
    		$res['path'] = kryn::pageUrl( $rsn, false, true );
    		
    	}
    	
    	
    	json($res);
    }
    
    public static function loadPages(){
        
        $domain = getArgv('domain')+0;
        
        //$res = dbExec('SELECT rsn, title FROM ');
        //$domains = dbExfetch("SELECT rsn, domain FROM %pfx%system_domains WHERE lang = '$lang'", -1);       
        json($domains);
    }
    
    
    public static function loadDomains(){
    	
    	$lang = getArgv('lang', 2);
    	
    	$domains = dbExfetch("SELECT rsn, domain FROM %pfx%system_domains WHERE lang = '$lang'", -1);    	
    	json($domains);
    }

    public static function save(){

        //$target_rsn = getArgv('rsn')+0;
        //$type = (getArgv('type',1) == 'user')?'users':'groups';

        //$target_type = ($type=='users')?2:1;

        
        //$acl_type = getArgv('acl_type', 2)+0;
        $acl_target_type = getArgv('acl_target_type', 2)+0;
        $acl_target_rsn = getArgv('acl_target_rsn', 2)+0;
        
        if( $acl_target_rsn == 0 ) json(0);
        
        $aclsAdmin = json_decode( getArgv('aclsadmin'), true );
        $aclsPages = json_decode( getArgv('aclspages'), true );
        
        //backend ACLs ( == post 'acls' )
        dbDelete('system_acl', "target_type = $acl_target_type AND target_rsn = $acl_target_rsn");
        
        $row = dbExfetch('SELECT MAX(prio) as maxium FROM %pfx%system_acl');
        $prio = $row['maxium']+1+count($aclsAdmin)+count($aclsPages);
        
        if( count($aclsAdmin) ){
            foreach( $aclsAdmin as $code => $access ){
                dbInsert('system_acl', array(
                    'type' => 1,
                    'prio' => $prio,
                    'target_type' => $acl_target_type,
                    'target_rsn'  => $acl_target_rsn,
                    'access' => $access,
                    'code' => $code
                ));
                $prio--;
            }
        }
        
        if( count($aclsPages) ){
            foreach( $aclsPages as $code => $access ){
                dbInsert('system_acl', array(
                    'type' => 2,
                    'prio' => $prio,
                    'target_type' => $acl_target_type,
                    'target_rsn'  => $acl_target_rsn,
                    'access' => $access,
                    'code' => $code
                ));
                $prio--;
            }
        }

        // todo
        //frontend ACLs( == post 'front' )

        json(1);
    }

    public static function loadTree(){
        global $kryn;
        $res = array();

        $dbmods = dbTableFetch('system_modules', -1, 'activated = 1');
        foreach( $dbmods as $mod ){
            $res[ $mod['name'] ] = $kryn->installedMods[$mod['name']];
            $res[ $mod['name'] ]['name'] = $mod['name'];
        }

        json( $res );
    }



    public static function getInfo( $pParentCode, $pLinks ){
        $res = array();
        if( count($pLinks) > 0 ){
            foreach( $pLinks as $key => $link ){
                $code = $pParentCode . '/' . $key;
                if( $link['childs'] ){
                    $res = array_merge( $res, self::getInfo( $code, $link['childs'] ) );
                }
                $link['childs'] = null;
                $res[$code] = $link; 
            }
        }
        return $res;
    }

    public static function load(){
        global $modules;

        //$type = getArgv('type');
        //$rsn = getArgv('rsn');

        $where = 'target_type = '.(getArgv('acl_target_type')+0);
        $where .= ' AND target_rsn = '.(getArgv('acl_target_rsn')+0);
        //$where .= ' AND type = '.(getArgv('acl_type')+0);
        
        /*if( $type == 'user' ){
            $where = 'target_type = 2';
        } else {
            $where = 'target_type = 1';
        }
        $where .= " AND target_rsn = $rsn ORDER BY prio DESC";*/
        
        $where .= " ORDER BY prio DESC"; 

        $acls = dbTableFetch( 'system_acl', DB_FETCH_ALL, $where );

        $adminInfos = array();
        $dbmods = dbTableFetch('system_modules', -1, 'activated = 1');
        if( count( $dbsmods ) > 0 ){
            foreach( $dbsmods as $mod ){
                $config = kryn::getModuleConfig( $mod );
                if( $config['admin'] ){
                    $adminInfos = array_merge($adminInfos, self::getInfo( 'admin', $config['admin'] ));
                }
            }
        }

                /*
        if( count($acls) > 0 ){
            foreach( $acls as &$acl ){
                
                $temp = explode( '/', $acl['code'] );

                if( $temp[0] == 'admin' ){
                    if( strpos($acl['code'], '%') > 0 )
                        $andAll = ' inkl. Unterseiten';

                    $code = str_replace('%', '', $acl['code']);

                    if( substr( $code, -1 ) == '/' )
                        $code = substr($code, 0, -1);

                    if( $code == 'admin' ){
                        $acl['title'] = 'Komplette Administration'.$andAll;
                    } else {
                        $infos = $adminInfos[ $code ];
                        $acl['title'] = $infos['title'].$andAll;
                    }
                } 
            }
        }*/

        json( $acls );
    }
    
    public static function search(){
        $q = getArgv('q', true);
        $type = getArgv('type');

        $q = str_replace("*", "%", $q);

        if( $type == 'user' )
            $res = dbTableFetch('system_user', DB_FETCH_ALL, "username LIKE '$q%' AND rsn > 0 ORDER BY username LIMIT 30");
        else
            $res = dbTableFetch('system_groups', DB_FETCH_ALL, "name LIKE '$q%' ORDER BY name LIMIT 30");

        json( $res );
    }

}
?>

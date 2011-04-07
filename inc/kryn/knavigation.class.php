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



/**
 * Navigation class
 * 
 * Layer between Layouts and navigation (pages)
 * 
 * @package Kryn
 * @internal
 * @subpackage Layout
 * @author Kryn.labs <info@krynlabs.com>
 */


class knavigation {
    public $navigations;

    function getAdminLinks( $pParam, $pIsDomain = false ){

        if( $pIsDomain )
            $sql = "SELECT * FROM %pfx%system_pages WHERE domain_rsn= ".$pParam['rsn']." AND prsn = 0 ORDER BY sort";
        else
            $sql = "SELECT * FROM %pfx%system_pages WHERE prsn = ".$pParam['rsn']." ORDER BY sort";
        return dbExfetch( $sql, DB_FETCH_ALL );
    }

    public static function getLinks( $pRsn, $pWithFolders = false, $pDomain = false ){
        global $kryn, $user, $time;

        $time = time();
        
        $withFolders = "";
        if( $pWithFolders )
            $withFolders = " OR type = 2";
        
        if( $pDomain )
        	$domainRule = 'AND domain_rsn = '.kryn::$domain['rsn'];
            
        $sql = "SELECT * FROM %pfx%system_pages
            WHERE
            prsn = $pRsn
            $domainRule
            AND ( type = 0 OR type = 1 $withFolders)
            
            AND ( 
                ( type = 2 )
                OR
                (
                    type != 2  AND visible = 1
                )
            )
            AND access_denied != '1'
            ORDER BY sort";
            
        if(! is_numeric($pRsn) )
            return array();

        $res = dbExec( $sql );

        $pages = array();
        while( $page = dbFetch( $res )){
        	
        	//persmission check
        	if( $page['access_nohidenavi'] != 1 )
        	    $page = kryn::checkPageAccess( $page, false );
            
	        if( $page ){
	            $page[ 'links' ] = self::getLinks( $page['rsn'] );
	            $pages[] = $page;
	        }
        }
        return $pages;
    }


    public static function activePage( $pRsn ){
        global $kryn;
        $isActive = self::_activePage( $kryn->menus[ $pRsn ], $pRsn );
    }

    public static function _activePage( $pages, $pRsn ){
        if(! count($pages) > 0 ) return false;
        if( $page['rsn'] == $pRsn )
            return true;
        else
            return self::_activePage( $page[0], $pRsn );
    }
    
    public static function arrayLevel( $pArray, $pLevel ){
        $page = $pArray;
        return $pArray[ $pLevel-2 ];
    }

    public static function plugin( $pOptions ){
        global $kryn, $user, $cfg;
        
        
        $pTemplate = $pOptions['template'];
        $pWithFolders = ($pOptions['folders']==1)?true:false;
        
        $navi = false;
        
        
        /*if(! $kryn->cacheNavigationWhere ) {
            if( $cfg['db_type'] == 'mysql')
                $whereGroups = "  find_in_set('0', access_from_groups) > 0";
            else
                $whereGroups = " ','||access_from_groups||',' LIKE '%,0,%' ";
              
            if( count( $user->user['groups'] ) > 0 ){
                foreach( $user->user['groups'] as $group )
                    if( $cfg['db_type'] == 'mysql')
                        $whereGroups .= " OR FIND_IN_SET('".$group['group_rsn']."', access_from_groups ) > 0 ";
                    else
                        $whereGroups .= " OR ','||access_from_groups||',' LIKE '%,".$group['group_rsn'].",%' ";
            }
            $kryn->cacheNavigationWhere = $whereGroups;
        } */
        if( $pOptions['id']+0 > 0 ){
            $navi = kryn::getPage($pOptions['id']+0, true); // dbExfetch( "SELECT * FROM %pfx%system_pages WHERE rsn = ".($pOptions['id']+0) );
            $navi['links'] = self::getLinks( $navi['rsn'], $pWithFolders );
        }

        if( $pOptions['level'] > 1 ){

            $currentLevel = count( $kryn->menus[kryn::$page['rsn']] )+1;

            $page = self::arrayLevel( $kryn->menus[kryn::$page['rsn']], $pOptions['level'] );

            if( $page['rsn'] > 0 )
                $navi = kryn::getPage( $page['rsn'], true ); //dbExfetch( "SELECT * FROM %pfx%system_pages WHERE rsn = ".$page['rsn'] );
            elseif( $pOptions['level'] == $currentLevel+1 )
                $navi = kryn::$page;

            $navi['links'] = self::getLinks( $navi['rsn'], $pWithFolders, kryn::$domain['rsn'] );
        }

        if( $pOptions['level'] == 1 ){
            $navi['links'] = self::getLinks( 0, $pWithFolders, kryn::$domain['rsn'] );
        }
         
        if( $navi !== false ){
            tAssign("navi", $navi);
            //$pTemplate = ($pTemplate) ? $pTemplate.'.tpl' : 'default.tpl';
           // print tFetch($pTemplate);
            return tFetch($pTemplate);
        }

        switch( $pOptions['id'] ){
            case 'history':
                $tpl = (!$pTemplate) ? 'main' : $pTemplate;
                tAssign( 'menus', kryn::readCache('menus') );
                if( file_exists( "inc/template/$tpl" ))
                    return tFetch( $tpl );
                return tFetch("kryn/history/$tpl.tpl");
                break;
        }
    }

}

?>

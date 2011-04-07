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
 * SystemSearch class
 * 
 * @package Kryn
 * @internal
 * @subpackage Core
 * @author Kryn.labs <info@krynlabs.com>
 */


class systemSearch extends baseModule{
    static $indexedPages;
    static $indexedPagesName;
    static $indexBlacklistUrls;
    static $indexBlacklistUrlsName;
    public static $forceSearchIndex = false;
    
    public static $returnCodes = false;
    
    static $jsonOut = false; 
    
    static $jsonFoundPages = array();
    
    static $pageUrl;
    
    static $curDomain;
    
    public static $blacklistTimeout = 3600; //1h
    public static $minWaitTimeTillNextCrawl = 260; //for 'keep index up 2 date' adminSearchIndexer::getIndex();
    
    public static $redirectTo = '';
    
    
    public static $autoCrawlPermissionLifetime = 60; //sec
    
    public static function initSearch() {   
        /*if(getArgv('backendAutoCrawler', 1)) {
        		self::checkAutoCrawlPermission();
        }*/
    	
        global $kdb;
        
        if(getArgv(1) == 'admin')
            return;
  
        /*
        self::$pageUrl = '/'.$_REQUEST['_kurl'];
         
        //remove last slash 
        if(strrpos(self::$pageUrl, '/') == strlen(self::$pageUrl)-1 )
            self::$pageUrl = substr(self::$pageUrl, 0, strlen(self::$pageUrl)-1);
        */
        
        if(isset($_REQUEST['jsonOut']))        
            self::$jsonOut = true;
            
        
        //indexing forced no matter if already indexed
        if(isset($_REQUEST['forceSearchIndex']) && $_REQUEST['forceSearchIndex']) {
            //force could only be enabled with correct search_index_key for this domain
            $validation = dbExFetch("SELECT rsn FROM %pfx%system_domains WHERE rsn = ".kryn::$domain['rsn']." AND search_index_key = '".esc($_REQUEST['forceSearchIndex'])."'", 1);
            if(!empty($validation) && $validation['rsn'] == kryn::$domain['rsn'] )
                self::$forceSearchIndex = $_REQUEST['forceSearchIndex'];
            
        }
              
        
        //cache is only valid for one month 
        //if indexed version already stored in db and original page didn't change then check if the index is not older then 48h
        /*self::$indexedPagesName = 'indexedPages_'.kryn::$domain['rsn'].'_'.date('Y_m');
        self::$indexedPages = kryn::getPhpCache(self::$indexedPagesName);
        
                
        if(!self::$indexedPages){         
                   
            //delete old indexcache files
            $arOldFiles = glob('inc/cache/indexedPages_'.kryn::$domain['rsn'].'_*');
            if(!empty($arOldFiles)) {
                foreach( $arOldFiles as $file ) {
                    unlink($file);    
                }
            }            
            
            self::$indexedPages = array();
            $dbIndexedPages = dbExFetch("SELECT SE.page_rsn, SE.url 
                                        FROM 
                                        %pfx%system_search SE,
                                        %pfx%system_pages SP 
                                        WHERE 
                                            SE.page_rsn = SP.rsn 
                                            AND SE.mdate >= SP.mdate 
                                            AND SP.mdate+3600*48 > ".time(), -1);      
            
            foreach($dbIndexedPages as $value) {
                self::$indexedPages[$value['url']] = $value['url'];
            }
            
            kryn::setPhpCache(self::$indexedPagesName, self::$indexedPages);
        }*/  
        
        /*
       self::$indexBlacklistUrlsName = 'indexBlacklistUrls-'.kryn::$domain['rsn'];
       self::$indexBlacklistUrls = kryn::getPhpCache(self::$indexBlacklistUrlsName);
       if(!self::$indexBlacklistUrls) {
           self::$indexBlacklistUrls = array();
           $dbBlacklistPages = dbExFetch("SELECT url FROM %pfx%system_search_blacklist WHERE domain_rsn = ".kryn::$domain['rsn'], -1);          
           if(!empty($dbBlacklistPages)) {
             foreach($dbBlacklistPages as $page) {
               self::$indexBlacklistUrls[] = $page['url'];
             }
           }
           kryn::setPhpCache(self::$indexBlacklistUrlsName, self::$indexBlacklistUrls);
       }
       */
         
       self::$curDomain = kryn::$domain['rsn'];
        
    }
    
    
    //init the search from the backend
    //we only need the indexedPages and blacklist cache
    /*public static function initSearchFromBackend($pDomainRsn) {                
        global $kdb;
        
        //cache is only valid for 24h 
        //if indexed version already stored in db and original page didn"t change then check if indexing is not older then 48h
        self::$indexedPagesName = 'indexedPages_'.$pDomainRsn.'_'.date('Y_m_d');
        self::$indexedPages = kryn::getPhpCache(self::$indexedPagesName);
        
                
        if(!self::$indexedPages){              
            self::$indexedPages = array();
            $dbIndexedPages = dbExFetch("SELECT SE.page_rsn, SE.url 
                                        FROM %pfx%system_search SE,
                                        %pfx%system_pages SP 
                                        WHERE 
                                            SE.page_rsn = SP.rsn 
                                            AND SE.mdate >= SP.mdate 
                                            AND SP.mdate+3600*48 > ".time(), -1);      
            
            foreach($dbIndexedPages as $value) {
                self::$indexedPages[$value['url']] = $value['url'];
            }
            
            kryn::setPhpCache(self::$indexedPagesName, self::$indexedPages);
        }       
        
       self::$indexBlacklistUrlsName = 'indexBlacklistUrls-'.$pDomainRsn;
       self::$indexBlacklistUrls = kryn::getPhpCache(self::$indexBlacklistUrlsName);
       if(!self::$indexBlacklistUrls) {
           self::$indexBlacklistUrls = array();
           $sql = "SELECT url FROM %pfx%system_search_blacklist WHERE domain_rsn = ".$pDomainRsn;           
           $dbBlacklistPages = dbExFetch($sql, -1);
           if(!empty($dbBlacklistPages)) {
             foreach($dbBlacklistPages as $page) {
               self::$indexBlacklistUrls[] = $page['url'];
             }
           }
           kryn::setPhpCache(self::$indexBlacklistUrlsName, self::$indexBlacklistUrls);
       }
       
       self::$curDomain = kryn::$domain['rsn'];        
    } */

    
    
    //add fake css to head to index this page
    /*public static function checkPageIndex() {      
        global $cfg, $kryn;
        
      
        if( 
            !self::checkStartpageTrowBack() && 
            !kryn::$page['unsearchable'] && 
            stripos(self::$pageUrl, '/kVersionId') === false && 
            (!array_key_exists(self::$pageUrl, self::$indexedPages) || self::$forceSearchIndex) ) {
                
                
                
                
            $getParam = '?enableSearchIndexMode=true';
            if(self::$forceSearchIndex)
                $getParam .= '&forceSearchIndex='.self::$forceSearchIndex;
                
            $lang = '';
            if( kryn::$domain['master'] != "1" )
                $lang = kryn::$domain['lang'];
                
            $target = $cfg['path'].$lang.self::$pageUrl.'/'.$getParam;
            $target = str_replace("//", "/", $target);
           // $kryn->htmlBodyEnd .= "\n".'<link rel="stylesheet" type="text/css" href="'.$target.'" />';
            $kryn->htmlBodyEnd .= "\n".'<div style="background-image: url('.$target.'); width: 0px; height: 1px;"></div>';
            
        }
    }*/
    
    
    //create a new search index for this page
    public static function createPageIndex($pContent) {  
        global $kryn, $cfg;
        
        if( getArgv(1) == 'admin' || kryn::$page['rsn']+0 == 0 ) return;
        
        self::$indexedPages = kryn::getCache('systemSearchIndexedPages');
        $indexedPages =& self::$indexedPages;
        
        $indexedContent = self::stripContent( $pContent );
        $contentMd5 = md5($indexedContent);
        $hashkey = kryn::$page['rsn'].'_'.$contentMd5;
        
        $a = '/'.kryn::getRequestPageUrl(true);
        $b = $indexedPages[$hashkey]['url'];
        
        if( $indexedPages[$hashkey] && $b === "" )
            $b = '/';
        
        self::$pageUrl = $a; 
        
        if( $indexedPages[$hashkey] && $indexedPages[$hashkey]['md5'] == $contentMd5 && $b == $a && self::$forceSearchIndex === false ){
    
            return self::exitPage('Page with this content is already indexed!', 3);
        }
        
        //check if we have additional arguments which doesnt change the content
        if( $indexedPages[$hashkey] && $indexedPages[$hashkey]['md5'] == $contentMd5 && strlen($b) < strlen($a)
            && self::$forceSearchIndex === false ){
        
            self::updateBlacklist( self::$pageUrl );
            self::$redirectTo = $b;
            return self::exitPage('Given arguments doesnt change the content!', 2);
                
        }
        
        //check if we are blacklistet
        
        if( $indexedPages[kryn::$domain['rsn'].'_'.$a] && $indexedPages[kryn::$domain['rsn'].'_'.$a]['blacklist']+0 > 0 ){
        
            if( time()-$indexedPages[kryn::$domain['rsn'].'_'.$a]['blacklist'] < self::$blacklistTimeout ){
            
                return self::exitPage('Page blacklisted', 8);
                
            } else if( time()-$indexedPages[kryn::$domain['rsn'].'_'.$a]['blacklist'] > self::$blacklistTimeout ){
                
                //blacklist is expired, remove from blacklistand index
                self::removeBlacklist( self::$pageUrl );
                
            }
        }
            
        //if(self::checkStartpageTrowBack())
        //    return self::exitPage('Startpage trow back!');
            
        if(kryn::$page['unsearchable']) {
            self::updateBlacklist( self::$pageUrl );
            //self::removePageFromIndexTable(self::$pageUrl);
            return self::exitPage('Page is flagged as unsearchable!', 5);
        }
        
        if( getArgv('kVersionId') ){
            self::updateBlacklist( self::$pageUrl );
            return self::exitPage('Version indexing not allowed!', 6);
        }
        
        
            
        //check if content is empty
        if(strlen(trim($indexedContent)) < 1) {
            self::updateBlacklist( self::$pageUrl );
            return self::exitPage('No content found!. Site was not indexed!', 7);
        }
        
        
        //we now ready to index this content
        
        dbDelete('system_search', " url='".esc(self::$pageUrl)."' AND domain_rsn = '".kryn::$domain['rsn']."'");
        dbInsert('system_search', array(
            'url' => self::$pageUrl,
            'title' => kryn::$page['title'],
            'md5' => $contentMd5,
            'mdate' => time(),
            'page_rsn' => kryn::$page['rsn'],
            'domain_rsn' => kryn::$domain['rsn'],
            'page_content' => $indexedContent
        ));  
        
        self::getLinksInContent($pContent);
        self::cacheAllIndexedPages();
        return self::exitPage('Indexing successfully completed!', 1);
              
        /*    
        //check if content is empty
        if(strlen(trim($indexedContent)) < 1) {
            dbExec("DELETE FROM 
                    %pfx%system_search 
                    WHERE 
                        page_rsn = ".kryn::$page['rsn']." 
                        AND domain_rsn = ".kryn::$domain['rsn']."                     
                        AND url = '".esc(self::$pageUrl)."' 
                    ");
            self::updateBlacklist( self::$pageUrl );
            return self::exitPage('No content found!. Site was not indexed!', 7);
        }  
        
        
        
        
        //check if same page under same domain with same content md5 is already present in db
        //TODO field-name 'md5' in query causing sql error
        $sameContentPages = dbExFetch("SELECT url FROM 
                                    %pfx%system_search 
                                    WHERE 
                                        page_rsn = ".kryn::$page['rsn']." 
                                        AND domain_rsn = ".kryn::$domain['rsn']." 
                                        AND md5 = '".$contentMd5."' 
                                    ORDER BY url"
                             , -1);
                             

        $shorterUrlPageFound = false;                     
        if(!empty($sameContentPages)) {
            $shortestUrl = self::$pageUrl;
            foreach($sameContentPages as $value) {
                //current page is shorter then already stored pages in db
                // delete all pages with longer url 
                if(strlen($value['url']) >= strlen($shortestUrl)) {
                    dbExec("DELETE FROM 
                            %pfx%system_search 
                            WHERE 
                                page_rsn = ".kryn::$page['rsn']." 
                                AND domain_rsn = ".kryn::$domain['rsn']." 
                                AND md5 = '".$contentMd5."' 
                                AND url = '".esc($value['url'])."' 
                            "
                    );
                //found a shorter urled paged then the current one
                }else{
                    $shortestUrl = $value['url'];
                    $shorterUrlPageFound = true;
                }
            }
        }
        
        
        if(!$shorterUrlPageFound) {
            //if mysql(i)
            if($cfg['db_type'] == 'mysql' || $cfg['db_type'] == 'mysqli' ) {
                 $sql = "INSERT INTO %pfx%system_search 
                          (url, title, md5, mdate, page_rsn, domain_rsn, page_content) 
                          VALUES ('".esc(self::$pageUrl)."', '".esc(kryn::$page['title'])."', '".$contentMd5."', ".time().", ".kryn::$page['rsn'].", ".kryn::$domain['rsn'].", '".esc($indexedContent)."')
                          ON DUPLICATE KEY UPDATE 
                          title='".esc(kryn::$page['title'])."', md5='".$contentMd5."', mdate=".time().", page_rsn=".kryn::$page['rsn'].", page_content='".esc($indexedContent)."'";
                dbExec($sql);    
            }else{
                dbExec("DELETE FROM %pfx%system_search WHERE url='".esc(self::$pageUrl)."' AND domain_rsn = '".kryn::$domain['rsn']."'");
               
                $sql = "INSERT INTO %pfx%system_search 
                              (url, title, md5, mdate, page_rsn, domain_rsn, page_content) 
                              VALUES ('".esc(self::$pageUrl)."', '".esc(kryn::$page['title'])."', '".$contentMd5."', ".time().", ".kryn::$page['rsn'].", ".kryn::$domain['rsn'].", '".esc($indexedContent)."')";
                dbExec($sql); 
            }
                                  
            //check for new links to index in content
            self::getLinksInContent($pContent);
        
            //self::addToIndexedPageCache(self::$pageUrl);
            self::cacheAllIndexedPages();
            return self::exitPage('Indexing successfully completed!', 1);
        } else {
            
            self::updateBlacklist( self::$pageUrl );
            self::$redirectTo = substr($shortestUrl, 1);
            return self::exitPage('Given arguments doesnt change the content!', 2);
            
        }
        */
    }
    
    public static function updateBlacklist( $pUrl, $pDomainRsn = false ){
        global $kcache;
    
        if(!$pDomainRsn)
            $pDomainRsn = kryn::$domain['rsn'];
    
        $url = esc( $pUrl );
        
        if( !$kcache['krynPhpCache_systemSearchIndexedPages'][$pDomainRsn.'_'.$pUrl]['blacklist'] ||
            $kcache['krynPhpCache_systemSearchIndexedPages'][$pDomainRsn.'_'.$pUrl]['blacklist'] == 0 ){
            
            dbUpdate('system_search', "url = '$url' AND domain_rsn = $pDomainRsn", array(
                'blacklist' => time()
            ));
        
        } 
        $kcache['krynPhpCache_systemSearchIndexedPages'][$pDomainRsn.'_'.$pUrl]['blacklist'] = time();
        kryn::setCache('systemSearchIndexedPages', $kcache['krynPhpCache_systemSearchIndexedPages']);
    }
    
    public static function removeBlacklist( $pUrl, $pDomainRsn = false ){
        global $kcache;
    
        if(!$pDomainRsn)
            $pDomainRsn = kryn::$domain['rsn'];
    
        $url = esc( $pUrl );
        dbUpdate('system_search', "url = '$url' AND domain_rsn = $pDomainRsn", array(
            'blacklist' => 0
        ));
        $kcache['krynPhpCache_systemSearchIndexedPages'][$pDomainRsn.'_'.$pUrl]['blacklist'] = 0;
        kryn::setCache('systemSearchIndexedPages', $kcache['krynPhpCache_systemSearchIndexedPages']);
    }
    
    public static function toBlacklist(){
        self::updateBlacklist( kryn::$pageUrl );
    }
    
    public static function stripContent( $pContent ){
        
        $arSearch = array('@<script[^>]*>.*</script>@Uis',  // javascript
                       '@<style[^>]*>.*</style>@Uis',    //  style tags
                       '@<\!--unsearchable-begin-->.*<\!--unsearchable-end-->@Uis', //unsearchable html comment
                       '@<!--.*-->@Uis',         // comments
                       '@style="(.*)"@Uis',                   // css inline styling
                       '@class="(.*)"@Uis',                   //css class
                       '@id="(.*)"@Uis',
                      
        );
        $pContent = preg_replace($arSearch, '', $pContent);
            
        $contentMd5 = md5(strip_tags($pContent));
        return kryn::compress(strip_tags($pContent, '<p><br><br /><h1><h2><h3><h4><h5><h6>'));
    }
    
    
    public static function cacheAllIndexedPages(){
        $res = dbExec('SELECT url, page_rsn, domain_rsn, md5, blacklist FROM %pfx%system_search');
        $cache = array();
        while( $row = dbFetch($res) ){
            $cache[$row['page_rsn'].'_'.$row['md5']] = $row;
            //if( $row['blacklist']+0 > 0 ){
            //    $cache['blacklist'][$row['domain_rsn'].'_'.$row['url']] = $row['blacklist'];
            //}
            $cache[$row['domain_rsn'].'_'.$row['url']] = array('blacklist' => $row['blacklist']);
        }
        self::$indexedPages =& $cache;
        kryn::setCache('systemSearchIndexedPages', $cache);
    }
    
    //search for links in parsed html content
    public static function getLinksInContent($pContent) {
        global $cfg, $kryn;
        
        $kryn->replacePageIds($pContent);       
        $searchPattern = '#<a[^>]+href[^>]*=[^>]*\"([^\"]+)\"[^>]*>(.*)<\/a>#Uis';          
        preg_match_all($searchPattern, $pContent, $matches, PREG_SET_ORDER);
        foreach($matches as $value) {
                      
            $linkBackup = $value[1];
            $value[1] = strtolower($value[1]); 
            //check if link is valid
            //kick all anchors, javascript btns, admin and downloadcenter links
            if(strlen($value[1]) < 2 || strpos($value[1], '.') !== false || strpos($value[1], '#') !== false || strpos($value[1], 'mailto:') !== false || strpos($value[1], 'action_select') !== false
                || strpos($value[1], 'javascript:') === 0 || strpos($value[1], 'downloadfile') !== false
                || strpos($value[1], '/admin') === 0 || strpos($value[1], 'admin') === 0 || strpos($value[1], 'users-logout:') !== false
                || (strpos($value[1], 'http://'.kryn::$domain['domain']) === false && (strpos($value[1], 'http://') === 0) || strpos($value[1], 'https://') === 0)
                || strpos($value[1], 'user:logout') !== false
            )
                continue;
            

           
                
                
           //restore case-sensitivity     
           $value[1] = $linkBackup;
           
           if( strpos($value[1], kryn::$domain['path']) === 0 ){
               $value[1] = substr($value[1], strlen(kryn::$domain['path']));
           }
           
           if( $value[1] == '' )
               $value[1] = '/';
           
           //add slash     
           if(strpos($value[1], 'http://') !== 0 && strpos($value[1], 'https://') !== 0 && strpos($value[1], '/') !== 0)
                $value[1] = '/'.$value[1];
                
           //remove last slash 
           if(strrpos($value[1], '/') == strlen($value[1])-1)
                $value[1] = substr($value[1], 0, strlen($value[1])-1);
            
           //if absolute link transform to relative
           if(strpos($value[1], 'http://') === 0 || strpos($value[1], 'https://') === 0) {              
               $value[1] = substr($value[1], stripos($value[1], kryn::$domain['domain'].$cfg['path'])+strlen(kryn::$domain['domain'].$cfg['path'])-1);
           }     
        
           $value[1] = str_replace('//', '/', $value[1]);
           $value[1] = str_replace('//', '/', $value[1]);
        
           if( substr($value[1], -1) == '/' )
               $value[1] = substr($value[1], 0, -1);
            
            
            
           
           if( !self::$indexedPages[kryn::$domain['rsn'].'_'.$value[1]] && strlen($value[1]) > 0 )
                self::disposePageForIndex($value[1], 'LINK '.esc($value[1]), kryn::$domain['rsn']);
                self::$jsonFoundPages[] = $value[1];
           //}
        }        
      
    }   
    

    
    public static function getSearchIndexOverview($pPageRsn) {
        $indexes = dbExFetch("SELECT url, title , mdate, md5 FROM %pfx%system_search WHERE page_rsn =".esc($pPageRsn)." AND mdate > 0 ORDER BY url, mdate DESC", -1);
        $arIndexes = array();
        foreach($indexes as $page) {
            $arIndexes[] = array($page['url'], $page['title'], date('d.m.Y H:i', $page['mdate']), $page['md5']);
        }
        
        return $arIndexes;
    }
    
    /*
    
    //create a full site index over all pages in the tree with passed domain    
    //TODO get the startpage_rsn for given domain and rewrite page url of startpage to '/' before disposePageForIndex is called  - see pushPageTree method
    public static function getFullSiteIndexUrls($pDomainRsn = false) {
        $whereAdd = "";
        if($pDomainRsn)
            $whereAdd = "WHERE domain_rsn = ".$pDomainRsn;
        
            
            //$cfg['path']
            
        $pages = self::getAllSearchablePages($pDomainRsn);
        foreach($pages as $page) {
            self::disposePageForIndex('/'.$page['url'], $page['title'], $page['domain_rsn'], $page['rsn']);
        }
        
        $totalPages = array();
        $unidexedPages = array();
        
        $preTotalPages = dbExFetch("SELECT url, page_rsn, mdate FROM %pfx%system_search ".$whereAdd." ORDER BY mdate", -1);
        //create absolute links
        
        foreach($preTotalPages as $key => $value) {          
           //if(!self::checkForIndexBlacklist($value['url']))        
                $totalPages[] = $value['url'];
          
           //unindexed pages array
           //if($value['mdate'] == 0 && !in_array($value['url'], self::$indexedPages) && !self::checkForIndexBlacklist($value['url']))
           if($value['mdate'] == 0 && !in_array($value['url'], self::$indexedPages) )
                 $unidexedPages[] = $value['url'];
           
        }
        $unindexedCount = self::countUnindexedPages($pDomainRsn);
        
        $indexedPages = kryn::getPhpCache('indexedPages_'.$pDomainRsn.'_'.date('Y_m'));
        
        return array('totalCount' => count($totalPages), 'indexedCount' => count($indexedPages), 'unindexedCount' => $unindexedCount, 'urls'=>$totalPages, 'urlsUnindexed' => $unidexedPages);     
        
    }
    
    //TODO get the startpage_rsn for given domain and rewrite page url of startpage to '/' before disposePageForIndex is called  - see pushPageTree method
    public static function getUnindexSitePercent($pDomainRsn=false) {
        $whereAdd = "";
        if($pDomainRsn)
            $whereAdd = "WHERE domain_rsn = ".$pDomainRsn;
            
        $pages = self::getAllSearchablePages($pDomainRsn);
        foreach($pages as $page) {
            self::disposePageForIndex('/'.$page['url'], $page['title'], $page['domain_rsn'], $page['rsn']);
        }
        
        $totalPages = 0;
        $unidexedPages = 0;
        
        $preTotalPages = dbExFetch("SELECT url, page_rsn, mdate FROM %pfx%system_search ".$whereAdd." ORDER BY mdate", -1);
        foreach($preTotalPages as $key => $value) {            
           //if(!self::checkForIndexBlacklist($value['url']))        
                $totalPages++;           
          
           //unindexed 
           //if($value['mdate'] == 0 && !in_array($value['url'], self::$indexedPages) && !self::checkForIndexBlacklist($value['url']))
           if($value['mdate'] == 0 && !in_array($value['url'], self::$indexedPages) )
                 $unidexedPages++; 
        }        
        
        $percent = round((100/$totalPages)*$unidexedPages);
        return array('total'=> $totalPages, 'unindexed' => $unidexedPages, 'percent' => $percent);
        
    }
    
    
    
    //count all pages in search table with mdate 0 and not already stored in cache index
    public static function countUnindexedPages($pDomainRsn = false) {
        $whereAdd = "";
        if($pDomainRsn)
            $whereAdd = "AND domain_rsn = ".$pDomainRsn;
                   
            
        $indexedRsns = false;
        if(self::$indexedPages && !empty(self::$indexedPages)) {
             foreach(self::$indexedPages as $value) {
                 $whereAdd .= " AND url != '".$value."'";
             }  
        }  
       
        $counter = 0;
        $count = dbExFetch("SELECT url FROM %pfx%system_search WHERE mdate=0 ".$whereAdd, -1);
        return count( $count );
        
        
        foreach($count as $value) {           
            if(!self::checkForIndexBlacklist($value['url']))
                $counter++;
            
        }
                  
        return $counter;
        
    } 
    
    
    //read all searchable pages from page table with given domain rsn
    public static function getAllSearchablePages($pDomainRsn = false) {
        $whereAdd = "";
        if($pDomainRsn)
            $whereAdd = "AND domain_rsn = ".$pDomainRsn;
        
            
        $urls = kryn::getPhpCache('urls_'.$pDomainRsn);
        if(!$urls) {
            require_once( 'inc/modules/admin/pages.class.php' );
            pages::updateUrlCache( $pDomainRsn );
            $urls = kryn::getPhpCache('urls_'.$pDomainRsn);
        }
        
       
        $searchablePages = false;
        $preSearchablePages = dbExFetch("SELECT rsn, prsn, url, domain_rsn, title, mdate FROM %pfx%system_pages WHERE type = 0 AND ( unsearchable = 0 OR unsearchable IS NULL) ".$whereAdd, -1);
        if(!empty($preSearchablePages)) {
            foreach($preSearchablePages as $page) {
                //if sublevel page get complete url path
                if($page['prsn'] != 0) {
  
                    $page['url'] = $urls['rsn']['rsn='.$page['rsn']];
                }                       
                //if(!self::checkForIndexBlacklist($page['url'], $page['domain_rsn']))              
                $searchablePages[] = $page;                     
                              
            }            
        }
        return $searchablePages;
    }
    */
    
    
    //insert a page into the searchtable for further indexing
    public static function disposePageForIndex($pUrl, $pTitle, $pDomainRsn, $pPageRsn='0') {
        global $cfg;
        
        $url = esc($pUrl);
        $pPageRsn += 0;
        
        dbDelete('system_search', "page_rsn = $pPageRsn AND url = '$url'");
        return dbInsert('system_search', array(
            'url' => $url,
            'title' => esc($pTitle),
            'mdate' => 0,
            'domain_rsn' => $pDomainRsn+0,
            'page_rsn' => $pPageRsn
        ));
    }
    
    //remove page from searchindex table
    /*public static function removePageFromIndexTable($pUrl, $pDomainRsn=false) {
        if(!$pDomainRsn)
           $pDomainRsn = kryn::$domain['rsn'];
           
        if(!$pDomainRsn)
            return;           
        dbExec("DELETE FROM %pfx%system_search WHERE url = '".esc($pUrl)."' AND domain_rsn = ".$pDomainRsn);       
    }*/
    
    
    
    //clear complete search index
    public static function clearSearchIndex() {
        //cache files first
        $arOldFiles = glob('inc/cache/indexedPages_*');
        if(!empty($arOldFiles)) {
            foreach( $arOldFiles as $file ) {
                unlink($file);    
            }
        }

        dbExec("DELETE FROM %pfx%system_search");
        kryn::removeCache('systemSearchIndexedPages');
        return array('state' => true);
        
    }
    
    
    //add page rsn to temporary indexed sites index
    /*private static function addToIndexedPageCache($pUrl) {
        self::$indexedPages[$pUrl] = $pUrl;
        kryn::setPhpCache(self::$indexedPagesName, self::$indexedPages);
    }*/
    
    
    /*
    //add url to blacklist index
    private static function addToIndexBlacklist($pUrl) {  
        global $cfg;
        if($cfg['db_type'] == 'mysql' ||$cfg['db_type'] == 'mysqli' ) {
             dbExec("INSERT IGNORE INTO %pfx%system_search_blacklist (url, domain_rsn) VALUES ('".esc($pUrl)."', ".self::$curDomain.")");
        }else{
            $test = dbExFetch("SELECT url FROM %pfx%system_search_blacklist WHERE url = '".esc($pUrl)."' AND domain_rsn = ".self::$curDomain, 1);
            if(!$test || empty($test)) {
                dbExec("INSERT INTO %pfx%system_search_blacklist (url, domain_rsn) VALUES ('".esc($pUrl)."', ".self::$curDomain.")");
            }
        }

        //if already indexed the delete it from index table
        dbExec("DELETE FROM %pfx%system_search WHERE url = '".esc($pUrl)."' AND domain_rsn=".self::$curDomain);
        
        self::$indexBlacklistUrls[] = $pUrl;
        kryn::setPhpCache(self::$indexBlacklistUrlsName, self::$indexBlacklistUrls);
    }*/
    
    
    
    
    
    
    /*
    //check if a page url is blacklisted 
    public static function checkForIndexBlacklist($pUrl) {
         //add slash     
         if(strpos($pUrl, '/') !== 0)
                $pUrl = '/'.$pUrl;
                
        if (!self::$indexBlacklistUrls || !is_array(self::$indexBlacklistUrls))
            return false;
            
        //first stage - check if complete url is blacklisted
        if(in_array($pUrl, self::$indexBlacklistUrls)) {
            self::removePageFromIndexTable($pUrl);
            return true; 
            
        } 
         
        //second stage check for url parts
        //if found then put it on the blacklist and remove it from the search table
        $arParts = explode('/', $pUrl);        
        if(!empty($arParts) && count($arParts) > 1) {
            $partsLeft = count($arParts)-1;
            $tempSearch = '/'.$arParts[0];
            while($partsLeft > 0) {               
               
                if(in_array($tempSearch, self::$indexBlacklistUrls)) {
                    //self::addToIndexBlacklist($pUrl); //disabled 17.03.2011
                    self::removePageFromIndexTable($pUrl);
                    return true;
                }
                
                $partsLeft--;
                $tempSearch .= '/'.$arParts[count($arParts)-1-$partsLeft];
           }
          
        }        
        return false;        
    }
    */
    
    
    //check if the page with the current url is a real page or just a throw back on the startpage
    /*public static function checkStartpageTrowBack() {
        //not on startpage
        if(kryn::$page['rsn'] != kryn::$domain['startpage_rsn']) 
            return false;
            
        
        //url identical with startpage
        if(self::$pageUrl == kryn::$page['realUrl'])
            return false;

        //starpage with extended parameters    
        if(strpos(self::$pageUrl, kryn::$page['realUrl']) !== false)
            return false;

            
        //self::addToIndexBlacklist(self::$pageUrl);    //disabled 17.03.2011
        self::removePageFromIndexTable(self::$pageUrl);    
        return true; 
    }*/
    
    
    
    //void page output while in searchmode
    public static function exitPage($pMsg, $pCode = false) {
        if( self::$returnCodes == true )
            return $pCode;
        
        if(self::$jsonOut) {
    		$hasPermission = false;
    		if( getArgv('crawlerId') ){
    			include_once('inc/modules/admin/adminSearchIndexer.class.php');
                json(array(
                    'msg' => $pMsg,
                    'foundPages' => self::$jsonFoundPages,
                    'access' => adminSearchIndexer::hasPermission()
                ));
    		}
        }else{
            @ob_end_clean();
            header("HTTP/1.0 404 Not Found");
            exit();
        }
            
    }
    
    
    
    //automatic backend searchcrawler
    
    /*
    
	 // get all page urls and domain rsns what have never been indexed before but are know in the searchindex table
    public static function getWaitlist() {
    	
		$items = dbExFetch("SELECT url, domain_rsn FROM %pfx%system_search WHERE mdate = 0 ORDER BY domain_rsn", -1);    	
    	$hasPermission = self::checkAutoCrawlPermission();
    	
    	return array('items' => $items, 'hasPermission' => $hasPermission);
    }
    
    //get all available pages from the searchindex table that have been indexed 
    public static function getUpdatelist() {
    	$items = dbExFetch("SELECT url, domain_rsn FROM %pfx%system_search WHERE mdate > 0 ORDER BY domain_rsn", -1);   	
    	$hasPermission = self::checkAutoCrawlPermission();
    	
    	return array('items' => $items, 'hasPermission' => $hasPermission);    	
    }
    
    //check for autocrawling permission
    public static function checkAutoCrawlPermission() {  
    	global $user;
    	$hasPermission = false;
    	$uId = getArgv('backendAutoCrawler', 1);
      $tNow = time();
      
    	if(!$user || $user->user_rsn < 1 ) {
    		
    		return $hasPermission;
    	}
         
      if( !file_exists( 'inc/template/admin/crawler.php' )) {
      	self::writePermission($tNow);      	
      }
      
      include( 'inc/template/admin/crawler.php' );
      $arPerm = $kcache['krynPhpCache_backendAutoCrawlerPermission'];
      
      $tDiff = $tNow - $arPerm['tstamp'];
     
     
      
      if($arPerm['uId'] != $uId && $tDiff < self::$autoCrawlPermissionLifetime)       	
      	return $hasPermission;
      
		
      //checks passed - current call has permission
      $hasPermission = true;
      self::writePermission($tNow);	
      return $hasPermission;   
    }
    
    //write permission file if not existent or keep it updated
    public static function writePermission($pTstamp =false) {    	
		$uId = getArgv('backendAutoCrawler', 1);
		if(!$pTstamp)
			$tStamp = time();
		else
			$tStamp = $pTstamp;
			
			
		$params = array('uId' => $uId, 'tstamp' => $tStamp);	 
      $varname = '$kcache[\'krynPhpCache_backendAutoCrawlerPermission\'] ';
      $phpCode = "<"."?php \n$varname = ".var_export($params,true).";\n ?".">";
      kryn::fileWrite('inc/template/admin/crawler.php', $phpCode);
    }
    
    //if no sites are stored in the searchindex table then go and push them in directly from the pages tbl
    public static function pushPageTree() {
    	$hasPermission = self::checkAutoCrawlPermission();
    	$pushCount = 0;
    	if(!$hasPermission)
    		return array('pushCount' => $pushCount, 'hasPermission' => $hasPermission);   
    	
    	//get all domains
    	$domains = dbExFetch("SELECT rsn, startpage_rsn FROM %pfx%system_domains", -1);
    	if(!$domains || empty($domains))
    		return array('pushCount' => $pushCount, 'hasPermission' => $hasPermission);
    	foreach($domains as $domain) {
    		//init with current domain rsn to make blacklist and other domain specific stuff available
    		systemSearch::initSearchFromBackend($domain['rsn']);
    		//at first insert the startpage with /
    		self::disposePageForIndex('/', 'Home', $domain['rsn'], $domain['startpage_rsn']);    		
    		$pushCount++;
    		
    		//get all other pages
    	   $pages = self::getAllSearchablePages($domain['rsn']);
         foreach($pages as $page) {
         	//dont push push in the startpage twice
         	 if($page['rsn'] != $domain['startpage_rsn']) {
	             self::disposePageForIndex('/'.$page['url'], $page['title'], $page['domain_rsn'], $page['rsn']);
	             $pushCount++;         	 	
         	 } 
         }   		
    	}

    	return array('pushCount' => $pushCount, 'hasPermission' => $hasPermission);
    	
    } */
}

?>

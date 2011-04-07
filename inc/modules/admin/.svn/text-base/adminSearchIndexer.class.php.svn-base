<?php
class adminSearchIndexer {

    public static function init() {
        
        require_once('inc/kryn/systemSearch.class.php');  
        
        switch(getArgv(4)) {
            
            case 'hasPermission': 
                json(array('access' => self::hasPermission()));
                
            case 'getWaitlist':
                json(self::getWaitlist());
                
            case 'getIndex':
                json(self::getIndex());
                
            case 'getIndexedPages4AllDomains':
                json( self::getIndexedPages4AllDomains() );
                
            
            case 'clearIndex' : 
                json(systemSearch::clearSearchIndex());
            break;
            
            case 'getNewUnindexedPages':
                json(self::getNewUnindexedPages());
            
            case 'getSearchIndexOverview' :
                json(systemSearch::getSearchIndexOverview(getArgv('page_rsn')+0));    
				break; 
            /*    
            case 'getFullSiteIndexUrls' :
               //systemSearch::initSearchFromBackend($_REQUEST['domain_rsn']+0);     
                json(systemSearch::getFullSiteIndexUrls($_REQUEST['domain_rsn']+0));
            break;
            
            case 'getUnindexSitePercent' :
                //systemSearch::initSearchFromBackend($_REQUEST['domain_rsn']+0);     
                json(systemSearch::getUnindexSitePercent($_REQUEST['domain_rsn']+0));
            break;    
                
            
            
            case 'getWaitlist' :
            		json(systemSearch::getWaitlist());
            break;
            case 'getUpdatelist':
            	json(systemSearch::getUpdatelist());
            break;
            case 'pushPageTree':
            	json(systemSearch::pushPageTree());
            break;
            
            
            
            
            
            
            case 'hasPermissionCheck':
            	json(array('hasPermission' => systemSearch::checkAutoCrawlPermission()));
            break;
            */	  
            default:
                json(getArgv(4));
            break;
        }
        
        exit();
    }
    
    public static function getIndexedPages4AllDomains(){
        
        $items = dbExfetch('
        	SELECT max(d.domain) as domain, max(d.lang) as lang, count(s.domain_rsn)+0 as indexedcount
        	FROM %pfx%system_domains d
        	LEFT OUTER JOIN %pfx%system_search s ON (s.domain_rsn = d.rsn AND s.mdate > 0 AND (blacklist IS NULL OR blacklist = 0) )
        	
        	GROUP BY d.rsn
        ', -1);
        
        return $items;
    }
    
    public static function getNewUnindexedPages(){
        
        $res['access'] = self::hasPermission();
        if( $res['access'] == false ) return $res;
        
        $dres = dbExec('
        SELECT p.rsn, p.title, p.domain_rsn FROM %pfx%system_pages p
        WHERE p.type = 0 AND p.rsn NOT IN( SELECT page_rsn FROM %pfx%system_search )
        AND (p.unsearchable != 1 OR p.unsearchable IS NULL)
        ');
        
        $res['pages'] = array();
        
        
        require_once( 'inc/modules/admin/pages.class.php' );
        
        while( $row = dbFetch($dres) ){
        
            $res['pages'][] = $row;
            
        
            $urls = kryn::getCache('urls_'.$row['domain_rsn']);
            if(!$urls) {
                $urls = pages::updateUrlCache( $row['domain_rsn'] );
            }
            
            $row['url'] = $urls['rsn']['rsn='.$row['rsn']];
            systemSearch::disposePageForIndex('/'.$row['url'], $row['title'], $row['domain_rsn'], $row['rsn']);
            
        }
        
        return $res;
    }
    
    public static function getWaitlist(){
        $res['access'] = self::hasPermission();
        if( $res['access'] == false ) return $res;
        
        $blacklistTimeout = time() - systemSearch::$blacklistTimeout;
        
        $res['pages'] = dbExfetch('
        	SELECT s.url, d.domain, d.master, d.lang, d.path FROM %pfx%system_search s, %pfx%system_domains d WHERE
        	d.rsn = s.domain_rsn AND s.mdate = 0 AND (s.blacklist IS NULL OR  s.blacklist < '.$blacklistTimeout.' )' 
        	, -1);
        return $res;
    }
    
    public static function getIndex(){
        $res['access'] = self::hasPermission();
        if( $res['access'] == false ) return $res;
        
        $blacklistTimeout = time() - systemSearch::$blacklistTimeout;
        $nextCheckTimeout = time() - systemSearch::$minWaitTimeTillNextCrawl;
        
        $res['pages'] = dbExfetch('
        	SELECT s.url, d.domain, d.master, d.lang, d.path FROM %pfx%system_search s, %pfx%system_domains d WHERE
        	d.rsn = s.domain_rsn AND s.mdate < '.$nextCheckTimeout.'  AND (s.blacklist IS NULL OR  s.blacklist < '.$blacklistTimeout.' )'
        	, -1);
        
        return $res;
    }
    
    /**
     * checks the permission whether we have crawler access or not.
     * Set us as new crawler when old crawler is expired and/or update the crawler-time.
     */
    
    public static function hasPermission(){
        global $currentCrawler;
        
        $timeout = 2*60;
        
        $id = getArgv('crawlerId', 1);
        include("inc/modules/admin/crawler.php");
        
        if( !$currentCrawler || $currentCrawler['id'] == $id || time()-$currentCrawler['time'] > $timeout ){
            //we the new one
            $crawler['id'] = $id;
            $crawler['time'] = time();
            $php = "<?php \n".'$currentCrawler = '.var_export($crawler, true)."; \n?>";
            kryn::fileWrite("inc/modules/admin/crawler.php", $php);
            return true;
        }
        
        return false;
    }
}

?>
<?php

class search extends baseModule {
    public function doSearch( $pConf ){
        global $cfg;
        
        tAssign('pConf', $pConf);
    
        if( getArgv('searchDo') != '1' ){
            return;
        }
    
        $pSearchWord = strtolower(getArgv('q',1));
        $pages = array();
        $pagePoints = array();
        $domainRsn = kryn::$domain['rsn']+0;
       
        
        if(strlen($pSearchWord) > 1) {            
            $sql = "
                SELECT P.*, SE.title, SE.url, SE.page_content AS content
                FROM %pfx%system_search SE,%pfx%system_pages P
                WHERE
                    P.rsn = SE.page_rsn AND
                    ( P.access_from = 0 OR P.access_from IS NULL OR P.access_from >= ".time()." ) AND
                    ( P.access_to = 0 OR P.access_to IS NULL OR P.access_to <= ".time()." ) AND                    
                    SE.mdate != 0 AND
                    (SE.blacklist IS NULL OR SE.blacklist = 0) AND
                    P.access_denied = '0' AND
                    (P.unsearchable = 0 OR P.unsearchable IS NULL) AND
                    P.domain_rsn = $domainRsn AND (
                         LOWER(SE.page_content) LIKE '%".$pSearchWord."%' OR
                         LOWER(P.title) LIKE '%".$pSearchWord."%' OR
                         LOWER(P.search_words) LIKE '%".$pSearchWord."%' OR
                         LOWER(SE.url) LIKE '%".$pSearchWord."%'
                         )            
            ";
           $prePages = dbExFetch ($sql, -1);
           foreach($prePages as $page) {
               $page['matching_content'] = strip_tags(str_ireplace(array('</p>', '<br>', '<br />', "\s\s"), array("\n", "\n", "\n", "\s"), $page['content']));
                                      
               $page['access_redirectto'] = 0;
               $page = kryn::checkPageAccess($page);                     
               if(!empty($page) && is_array($page) ) {
                   //truncate matching text if needed
                    $page = search::truncateContent($page, $pConf, $pSearchWord);
                    
                    $page['url'] = substr($page['url'], 1);
                    $page['matching_url'] = preg_replace('/('.$pSearchWord.')/is', '<b class="foundUrl">$1</b>', $page['url']);
                    $page['matching_title'] = preg_replace('/('.$pSearchWord.')/is', '<b class="foundUrl">$1</b>', $page['title']);
                    
                    $pagePoints[] = $page['points'] = search::genRatingPoints($pSearchWord, $page['title'], $page[''], $page['search_words'], $page['url'], $page['matching_content']);
                    $pages[] = $page;
               }
           }
            
            //search stats            
            $foundSearchWord = 0;
            if(!empty($pages))
                $foundSearchWord = 1;

           array_multisort($pagePoints, SORT_DESC, SORT_NUMERIC, $pages);              
           search::statSearchWord($foundSearchWord, $pSearchWord);
        }

        $langSuffix = '';
        if(kryn::$domain['master'] != 1)
            $langSuffix = kryn::$domain['lang'].'/';
        
        tAssign('langSuffix', $langSuffix);
        tAssign('path', $cfg['path']);
        tAssign('domain', kryn::$domain['domain']);
        tAssign('results', $pages);
        return tFetch('search/results/'.$pConf['template'].'.tpl');           
            
    }
    
    public static function genRatingPoints($pSearchWord, $pPageTitle, $pPageSearchWords, $pPageUrl, $pPageContent) {
       $points = 0;
                     
       //first level check page title        
       $points += 10000*substr_count($pPageTitle, $pSearchWord);
       //second search words
       $points += 1000*substr_count($pPageSearchWords, $pSearchWord);
       //third url
       $points += 100*substr_count($pPageUrl, $pSearchWord);
       //last content
       $points += 10*substr_count($pPageContent, $pSearchWord);       
       
       return $points;
        
    }
    
    
    public static function statSearchWord($pFound, $pWord) {
        //check if already there
        $test = dbExFetch("SELECT searchCount FROM %pfx%system_search_stats WHERE word = '".$pWord."' AND found = ".$pFound, 1);
        if($test && !empty($test)) {
            $sql = "UPDATE %pfx%system_search_stats SET searchCount=".($test['searchCount']+1)." WHERE word = '".$pWord."' AND found = ".$pFound;
            dbExec($sql);     
        }else{
            $sql = "INSERT INTO %pfx%system_search_stats (word, searchCount, found) VALUES ('".$pWord."', 1, '".$pFound."')";               
            dbExec($sql);
        }    
    }
    
    
    
    public static function truncateContent($page, $pConf, $pSearchWord) {
        $length = $pConf['truncateChars']+0;
        if($length < 1 || strlen($page['matching_content']) < $length)  {
            $page['matching_content'] = preg_replace('/('.$pSearchWord.')/is', '<b class="foundWord">$1</b>', $page['matching_content']); 
            return $page;
            
        }
                
        $length -= min($length, 3);
        $start = 0;
        //check where the first match is                           
        $firstMatchPos = stripos($page['matching_content'], $pSearchWord);
        if($firstMatchPos+strlen($pSearchWord) > $length) {
            $leftChars = $length-strlen($pSearchWord)-3;
            $start = round($leftChars/2);                               
            $page['matching_content'] = preg_replace('/\s+?(\S+)?$/', '', substr($page['matching_content'], 0, $firstMatchPos+strlen($pSearchWord)+$start+1));
            $page['matching_content'] = substr($page['matching_content'], strrpos(substr($page['matching_content'], 0 , $firstMatchPos-$start-1) , ' '));
            $page['matching_content'] = '... '. $page['matching_content'];
        }else{
            $page['matching_content'] = preg_replace('/\s+?(\S+)?$/', '', substr($page['matching_content'], 0, $length+1));
        }
                                        
        $page['matching_content'] .=' ...';
           
        
        $page['matching_content'] = preg_replace('/('.$pSearchWord.')/is', '<b class="foundWord">$1</b>', $page['matching_content']);                 

        
        return $page;
    }
    

    public function searchForm( $pConf ){
        tAssign('pConf', $pConf);
        return tFetch('search/form/'.$pConf['template'].'.tpl');
    }
}

?>

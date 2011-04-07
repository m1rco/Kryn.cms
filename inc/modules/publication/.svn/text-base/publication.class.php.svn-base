<?php

class publication extends baseModule {
    


    public static function newsDetailFixed( $pConf ){
        
        $_REQUEST['e2'] = $pConf['news_rsn'];
        require_once( 'inc/modules/publication/publicationNews.class.php');
        return publicationNews::itemDetail( $pConf );
    }
    
    public function newsList( $pConf ){
        require_once( 'inc/modules/publication/publicationNews.class.php');
        return publicationNews::itemList( $pConf );
    }

    public function newsDetail( $pConf ){
        require_once( 'inc/modules/publication/publicationNews.class.php');
        return publicationNews::itemDetail( $pConf );
    }


    public function categoryList( $pConf ){
                
        $categories = implode($pConf['category_rsn'], ",");
        tAssign('pConf', $pConf);
        
        if( count($categories) > 0 )
            $where = " category_rsn IN ($categories) AND ";
        
        $sqlCount = "SELECT MAX(c.rsn) as rsn, MAX(c.title) as title, count(n.rsn) as count
            FROM %pfx%publication_news n, %pfx%publication_news_category c
            WHERE
             n.category_rsn = c.rsn AND deactivate = 0 GROUP BY category_rsn";
        $categoriesItems = dbExfetch( $sqlCount, -1 );
        tAssign('categories', $categoriesItems);
        
        return tFetch('publication/categoryList/'.$pConf['template'].'.tpl');
    
    }
    
    public function getOrderOptions( $pFields ){
        $array['title'] = _l('Title');
        $array['releaseat'] = _l('Release date');
        $array['releasedate'] = _l('News date');
        $array['category_rsn'] = _l('Category');
        return $array;
    }
    
     public function getOrderDirectionOptions( $pFields ){
        $array['desc'] = _l('Descending');
        $array['asc'] = _l('Ascending');
        return $array;
    }
    
    
    public function rssList( $pConf ){
        $categories = implode($pConf['category_rsn'], ",");
        if(!$pConf['itemsPerPage'] || $pConf['itemsPerPage']+0 < 1)
            $pConf['itemsPerPage'] = 10;
        

        $sql = "SELECT n.*, c.title as categoryTitle FROM %pfx%publication_news n, %pfx%publication_news_category c WHERE
            category_rsn IN ($categories) and deactivate = 0 and category_rsn = c.rsn
            ORDER BY releaseDate DESC LIMIT ".$pConf['itemsPerPage'];           

        
        $list = dbExFetch($sql, DB_FETCH_ALL);
        if($list) {
            foreach($list as $key=> $value) {
                $list[$key]['title'] = strip_tags(html_entity_decode($list[$key]['title'], ENT_NOQUOTES, 'UTF-8'));
                
                $json = json_decode( $list[$key]['intro'], true );
                if( $json && $json['contents'] && file_exists('inc/template/'.$json['template']) ){
                    
                    $oldContents = kryn::$contents;
                    kryn::$contents = $json['contents'];
                    $list[$key]['intro'] = tFetch($json['template']);
                    kryn::$contents = $oldContents;
                }
                
                $list[$key]['intro'] = strip_tags(html_entity_decode($list[$key]['intro'], ENT_NOQUOTES, 'UTF-8'));
            }
        }
        
        
        tAssign('items', $list);

        tAssign('pConf', $pConf);
        
        @ob_end_clean();       
        
        tAssign('local',  substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 5));
        header("Content-type: text/xml");      
        print tFetch('publication/news/rss/'.$pConf['template'].'.tpl');
        die();
    }

}


?>

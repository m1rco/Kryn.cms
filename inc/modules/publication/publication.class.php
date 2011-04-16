<?php

class publication extends baseModule 
{
    public static function newsDetailFixed( $pConf ){
        $_REQUEST['e2'] = $pConf['news_rsn'];
        require_once('inc/modules/publication/publicationNews.class.php');
        return publicationNews::itemDetail( $pConf );
    }
    
    public static function newsList( $pConf ){
        // Check if RSS is requested
        if($pConf['enableRss'] && getArgv('publication_rss')+0 == 1)
            self::rssList($pConf); // rssList calls die(), no return needed
        
        require_once('inc/modules/publication/publicationNews.class.php');
        return publicationNews::itemList( $pConf );
    }

    public static function newsDetail( $pConf ){
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
    
    
    public static function rssList( $pConf )
    {
        require_once( 'inc/modules/publication/publicationNews.class.php');
        return publicationNews::rssList($pConf);
    }

}


?>

<?php

class publicationNews
{
    
    public static function itemDetail( $pConf )
    {
        global $user;
        
        // Get important variables from config
        $replaceTitle = $pConf['replaceTitle']+0 == 1; // Ensure it's set
        $categoryRsn = $pConf['category_rsn'];
        $allowComments = $pConf['allowComments']+0;
        $template = $pConf['template'];
        
        // News item to show
        $rsn = getArgv('e2')+0;
        
        if( $rsn > 0 )
        {
            // Create category where clause
            $whereCategories = "";
            if(count($categoryRsn))
                $whereCategories = "AND n.category_rsn IN (".implode(",", $categoryRsn).")";
            
            // Create query
            $now = time();
            $sql = "
                SELECT
                    n.*,
                    c.title as categoryTitle
                FROM
                    %pfx%publication_news n,
                    %pfx%publication_news_category c
                WHERE
                    1=1
                    $whereCategories
                    AND n.deactivate = 0
                    AND c.rsn = n.category_rsn
                    AND n.rsn = $rsn
                    AND (n.releaseAt = 0 OR n.releaseAt <= $now)
            ";
            
            $news = dbExfetch($sql, 1);
            
            // Is it a valid news row
            $isNews = $news !== false;
            tAssign('isNews', $isNews);
            
            if($isNews)
            {
                // Set title if allowed
                if($replaceTitle)
                    kryn::$page['title'] = $news['title'];
                    
                // Handle comment calls
                if($allowComments && $news['deactivateComments']+0 == 0)
                {
                    if(getArgv('publication-add-comment')+0)
                    {
                        $name = $user->user_rsn == 0 ? getArgv('name', 1) : $user->user['username'];
                        if($name != "")
                        {
                            dbInsert(
                                'publication_comments',
                                array(
                                    'parent_rsn' => $rsn,
                                    'owner_rsn' => $user->user_rsn,
                                    'owner_username' => $name,
                                    'created' => time(),
                                    'ip' => $_SERVER['REMOTE_ADDR'],
                                    'session_id' => $user->sessionid,
                                    'subject',
                                    'website',
                                    'email',
                                    'message'
                                )
                            );
                            self::updateCommentsCount($rsn);
                            $news['commentscount']++;
                        }
                    }
                    
                    // Default itemsPerPage if not set
                    $itemsPerPage = $pConf['itemsPerPage']+0;
                    if(!$itemsPerPage)
                        $itemsPerPage = 15;
                        
                    // From which comment page are we looking?
                    $page = getArgv('e3')+0;
                    if(!$page)
                        $page = 1;
                    
                    // Default max pages if not set
                    $maxPages = $pConf['maxPages']+0;
                        
                    // Set comments start
                    $start = $itemsPerPage * $page - $itemsPerPage;
                    
                    // Count comments
                    $sqlCount = "
                        SELECT
                            count(*) as commentsCount
                        FROM
                            %pfx%publication_comments
                        WHERE
                            parent_rsn = $rsn
                    ";
                    $countRow = dbExfetch($sqlCount, 1);
                    $count = $countRow['commentsCount'];
                    tAssign('commentsCount', $count);
                
                    // Set amount of pages
                    $pages = 1;
                    if($count && $itemsPerPage)
                        $pages = ceil($count / $itemsPerPage);
                    
                    // Update max pages when needed
                    if(!$maxPages)
                        $pConf['maxPages'] = $pages;
                   
                    tAssign('pages', $pages);
                    tAssign('currentCommentPage', $page);
                    
                    // Fetch comments
                    $comments = dbTableFetch('publication_comments', -1, "parent_rsn = $rsn LIMIT $start, $itemsPerPage");
                    if($comments !== false)
                        tAssign('comments', $comments);
                }
                
                // Retrieve content of news
                $json = json_decode($news['content'], true);
                if($json && $json['contents'] && file_exists('inc/template/'.$json['template']))
                {
                    $oldContents = kryn::$contents;
                    kryn::$contents = $json['contents'];
                    $news['content'] = tFetch($json['template']);
                    kryn::$contents = $oldContents;
                }
                
                // Retrieve intro of news
                $json = json_decode($news['intro'], true);
                if($json && $json['contents'] && file_exists('inc/template/'.$json['template']))
                {
                    $oldContents = kryn::$contents;
                    kryn::$contents = $json['contents'];
                    $news['intro'] = tFetch($json['template']);
                    kryn::$contents = $oldContents;
                }
                
                tAssign('news', $news);
            }
            else 
                tAssign('isNews', false); // Not found (or not visible)
        }
        else 
            tAssign('isNews', false); // Not a valid news item

        // Assign config and load template
        tAssign('pConf', $pConf);
        kryn::addCss("publication/news/css/detail/$template.css");
        return tFetch("publication/news/detail/$template.tpl");
    }

    public static function updateCommentsCount( $pNewsRsn ){
        $comments = dbExfetch('SELECT count(*) as comcount FROM %pfx%publication_comments WHERE parent_rsn = '.$pNewsRsn );
        dbUpdate('publication_news', array('rsn' => $pNewsRsn), array('commentscount' => $comments['comcount']) );
    } 
    
    public static function itemList( $pConf )
    {
        // Get important variables from config
        $categoryRsn = $pConf['category_rsn'];
        $itemsPerPage = $pConf['itemsPerPage']+0;
        $maxPages = $pConf['maxPages']+0;
        $order = $pConf['order'];
        $orderDirection = $pConf['orderDirection'];
        $template = $pConf['template'];
        
        // Create category where clause
        $whereCategories = "";
        if(count($categoryRsn))
            $whereCategories = "AND category_rsn IN (".implode(",", $categoryRsn).")";
        if(getArgv('publication_filter')+0)
            $whereCategories = "AND category_rsn = ".(getArgv('publication_filter')+0);
        
        // Get current page
        $page = getArgv('e1')+0;
        if(!$page)
            $page = 1;
            
        // If items per page is not set, make it default value
        if(!$itemsPerPage)
            $itemsPerPage = 5;
            
        // Set start of lookup
        $start = $itemsPerPage * $page - $itemsPerPage;
        
        // Create order by
        $orderBy = "releaseDate DESC";
        if($order)
            $orderBy = "$order $orderDirection";
        
        // Create query
        $now = time();
        $sql = "
            SELECT
                n.*,
                c.title as categoryTitle
            FROM
                %pfx%publication_news n,
                %pfx%publication_news_category c
            WHERE
                1=1
                $whereCategories
                AND n.deactivate = 0
                AND c.rsn = n.category_rsn
                AND (n.releaseAt = 0 OR n.releaseAt <= $now)
            ORDER BY $orderBy
            LIMIT $start, $itemsPerPage
        ";
        $list = dbExfetch($sql, -1);
        
        // Create count query
        $sqlCount = "
            SELECT
                count(*) as newsCount
            FROM
                %pfx%publication_news n
            WHERE
                1=1
                $whereCategories
                AND deactivate = 0
                AND (n.releaseAt = 0 OR n.releaseAt <= $now)
        ";
        $countRow = dbExfetch($sqlCount, 1);
        $count = $countRow['newsCount'];
        tAssign('count', $count);
        
        // Set pages
        $pages = 1;
        if($count && $itemsPerPage)
            $pages = ceil($count / $itemsPerPage);
            
        if(!$maxPages)
            $pConf['maxPages'] = $pages;
            
        // Assign pages to template
        tAssign('pages', $pages);
        tAssign('currentNewsPage', $page);
        
        // Process news items
        foreach($list as &$news)
        {
            // Retrieve content of news
            $json = json_decode($news['content'], true);
            if($json && $json['contents'] && file_exists('inc/template/'.$json['template']))
            {
                $oldContents = kryn::$contents;
                kryn::$contents = $json['contents'];
                $news['content'] = tFetch($json['template']);
                kryn::$contents = $oldContents;
            }
            
            // Retrieve intro of news
            $json = json_decode($news['intro'], true);
            if($json && $json['contents'] && file_exists('inc/template/'.$json['template']))
            {
                $oldContents = kryn::$contents;
                kryn::$contents = $json['contents'];
                $news['intro'] = tFetch($json['template']);
                kryn::$contents = $oldContents;
            }
        }
        
        // Assign list to template
        tAssign('items', $list);
        
        // Assign config and load template
        tAssign('pConf', $pConf);
        kryn::addCss("publication/news/css/list/$template.css");
        kryn::addJs("publication/news/js/list/$template.js");
        return tFetch("publication/news/list/$template.tpl");
    }
    
    public static function rssList( $pConf )
    {
        // Fetch important vars from conf var
        $categoryRsn = $pConf['category_rsn'];
        $itemsPerPage = $pConf['itemsPerPage']+0; // Make sure it's set
        $template = $pConf['rssTemplate'];
        
        // Create category where clause
        $whereCategories = "";
        if(count($categoryRsn))
            $whereCategories = "AND n.category_rsn IN (".implode(",", $categoryRsn).") ";
        
        // Set items per page to default when not set
        if($itemsPerPage < 1)
            $itemsPerPage = 10; // Default
        
        // Create query
        $now = time();
        $sql = "
            SELECT
                n.*, 
                c.title as categoryTitle 
            FROM
                %pfx%publication_news n, 
                %pfx%publication_news_category c 
            WHERE
                    1=1
                $whereCategories 
                AND n.deactivate = 0
                AND n.category_rsn = c.rsn
                AND (n.releaseAt = 0 OR n.releaseAt <= $now)
            ORDER BY
                releaseDate DESC
            LIMIT $itemsPerPage";
        
        $list = dbExFetch($sql, DB_FETCH_ALL);
        
        $hasItems = $list !== false;
        tAssign('hasItems', $hasItems); // Tells template if the query failed or not
        
        if($hasItems)
        {
            foreach($list as $index=>$item)
            {
                $list[$index]['title'] = strip_tags(html_entity_decode($item['title'], ENT_NOQUOTES, 'UTF-8'));
                
                $json = json_decode($item['intro'], true);
                if($json && $json['contents'] && file_exists('inc/template/'.$json['template']))
                {
                    $oldContents = kryn::$contents;
                    kryn::$contents = $json['contents'];
                    $item['intro'] = tFetch($json['template']);
                    kryn::$contents = $oldContents;
                }
                
                $list[$index]['intro'] = strip_tags(html_entity_decode($item['intro'], ENT_NOQUOTES, 'UTF-8'));
            }
        }
        
        // Assign list to template
        tAssign('items', $list);
        // Assign config to template
        tAssign('pConf', $pConf);
        
        // Clear current output
        @ob_end_clean();
        
        // Assign accept language to template
        tAssign('local', substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 5));
        
        // Set header as XML
        header("Content-type: text/xml");
        
        // Ouput formatted XML list and die
        echo tFetch("publication/news/rss/$template.tpl");
        die();
    }

}

?>

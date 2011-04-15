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
                $whereCategories = "AND category_rsn IN (".implode(",", $categoryRsn).")";
            
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
                    AND (n.releaseAt = 0 OR n.releaseAt < $now)
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
                    if($page == 0)
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
                    $news['contents'] = tFetch($json['template']);
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
    

    public static function itemList( $pConf ){
        $categories = implode($pConf['category_rsn'], ",");
        
        if( $categories != "" )
            $where = " category_rsn IN ($categories) AND ";
        
        $page = getArgv('e1')+0;
        $page = ($page==0)?1:$page;


        if( $pConf['itemsPerPage'] == "" )
            $pConf['itemsPerPage'] = 5;
        
        
        if( $page == 1 )
            $start = 0;
        else
            $start = ($pConf['itemsPerPage'] * $page) - $pConf['itemsPerPage'];

        if( getArgv('publication_filter') ){
            $filter = " AND category_rsn = ".(getArgv('publication_filter')+0);
        }

        
        if( $pConf['order'] ){
            $order = $pConf['order'].' '.$pConf['orderDirection'];
        } else {
            $order = "releaseDate DESC";
        }
        
        $sql = "SELECT n.*, c.title as categoryTitle FROM %pfx%publication_news n, %pfx%publication_news_category c WHERE
            $where deactivate = 0 and category_rsn = c.rsn
            $filter
            ORDER BY $order LIMIT ".$pConf['itemsPerPage']." OFFSET $start  ";

        $sqlCount = "SELECT count(*) as newscount
            FROM %pfx%publication_news n, %pfx%publication_news_category c WHERE
            $where deactivate = 0 and category_rsn = c.rsn
            $filter
            ";
        $countRow = dbExfetch( $sqlCount, 1 );

        $count = $countRow['newscount'];
        tAssign( 'count', $count );
        $pages = 1;
        if( $count > 0 && $pConf['itemsPerPage'] > 0 )
            $pages = ceil($count/ $pConf['itemsPerPage'] );

        if( $pConf['maxPages']+0 == 0 )
            $pConf['maxPages'] = $pages;

        tAssign( 'pages', $pages );
        tAssign( 'currentNewsPage', $page );

        $list = dbExFetch($sql, DB_FETCH_ALL);
        
        foreach( $list as &$news ){
            
            $json = json_decode( $news['content'], true );
            if( $json && $json['contents'] && file_exists('inc/template/'.$json['template']) ){
                
                $oldContents = kryn::$contents;
                kryn::$contents = $json['contents'];
                $news['content'] = tFetch($json['template']);
                kryn::$contents = $oldContents;
            }
            
            $json = json_decode( $news['intro'], true );
            if( $json && $json['contents'] && file_exists('inc/template/'.$json['template']) ){
                
                $oldContents = kryn::$contents;
                kryn::$contents = $json['contents'];
                $news['intro'] = tFetch($json['template']);
                kryn::$contents = $oldContents;
            }
        }
        
        tAssign('items', $list);

        tAssign('pConf', $pConf);
        kryn::addCss( 'publication/news/css/list/'.$pConf['template'].'.css' );
        kryn::addJs( 'publication/news/js/list/'.$pConf['template'].'.js' );
        return tFetch('publication/news/list/'.$pConf['template'].'.tpl');
    }

}

?>

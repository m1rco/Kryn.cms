<?php

class publicationNews {
    
    public static function itemDetail( $pConf ){
        global $user;
        
        
        if( $pConf['replaceTitle'] == "" )
            $pConf['replaceTitle'] = "1";

        $id = getArgv('e2')+0;
        if( $id > 0 ){
            $cats = implode($pConf['category_rsn'], ",");
            
            if( $cats != "" )
                $where = " category_rsn IN ($cats) AND ";
            
            $news = dbExFetch("SELECT n.*, c.title as categoryTitle FROM %pfx%publication_news n, %pfx%publication_news_category c WHERE
            $where deactivate = 0 and category_rsn = c.rsn AND n.rsn = ".$id, 1);
            if( $news['rsn'] != $id )
                return "[Errror:ext:publication] Invalid news id.";

            if( $pConf['replaceTitle'] == "1" ){
                kryn::$page['title'] = $news['title'];
            }

            if( $pConf['allowComments'] == 1 && $news['deactivateComments'] != 1 ){

                if( getArgv('publication-add-comment') == 1 ){
                    
                    $name = ($user->user_rsn == 0 ) ? getArgv('name',1) : $user->user['username'];
                    if( $name != ""  ){
                        dbInsert('publication_comments', array(
                            'parent_rsn' => $news['rsn'],
                            'owner_rsn' => $user->user_rsn,
                            'owner_username' => $name,
                            'created' => time(),
                            'ip' => $_SERVER['REMOTE_ADDR'],
                            'session_id' => $user->sessionid,
                            'subject',
                            'website',
                            'email',
                            'message'
                        ));
                        
                        self::updateCommentsCount( $news['rsn'] );
                        $news['commentscount']++;
                    }
                }


                if( $pConf['itemsPerPage']+0 == 0 )
                    $pConf['itemsPerPage'] = 15;

                $page = getArgv('e3')+0;
                $page = ($page==0)?1:$page;

                if( $pConf['maxPages']+0 == 0)
                    $pConf['maxPages'] = 10;

                if( $page == 1 )
                    $start = 0;
                else
                    $start = ($pConf['itemsPerPage'] * $page) - $pConf['itemsPerPage'];


                $sqlCount = "SELECT count(*) as comcount
                    FROM %pfx%publication_comments WHERE
                    parent_rsn = ".$news['rsn'];
                $countRow = dbExfetch( $sqlCount, 1 );

                $count = $countRow['comcount'];
                tAssign( 'count', $count );
                $pages = 1;
                if( $count > 0 && $pConf['itemsPerPage'] > 0 )
                    $pages = ceil($count/ $pConf['itemsPerPage'] );

                if( $pConf['maxPages']+0 == 0 )
                    $pConf['maxPages'] = $pages;

                tAssign( 'pages', $pages );
                tAssign( 'currentCommentsPage', $page );
                
                $limit = $pConf['itemsPerPage'].' OFFSET '.$start;
                $comments = dbTableFetch('publication_comments', -1, 'parent_rsn = '.$news['rsn'].' LIMIT '.$limit );
                if( $comments )
                    tAssign('comments', $comments);
            }
        
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
            
            tAssign('news', $news);
            tAssign('pConf', $pConf);
            kryn::addCss( 'publication/news/css/detail/'.$pConf['template'].'.css' );
            return tFetch('publication/news/detail/'.$pConf['template'].'.tpl');
        }
    }

    public static function updateCommentsCount( $pNewsRsn ){
        $comments = dbExfetch('SELECT count(*) as comcount FROM %pfx%publication_comments WHERE parent_rsn = '.$pNewsRsn );
        dbUpdate('publication_news', array('rsn' => $pNewsRsn), array('commentscount' => $comments['comcount']) );
    } 
    

    public static function itemList( $pConf ){
        if($pConf['enableRss'] && getArgv('publication_rss') && getArgv('publication_rss') == 1) {
            $pConf['template'] = $pConf['rssTemplate'];
            $this->rssList($pConf);
            return;
        }
        
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

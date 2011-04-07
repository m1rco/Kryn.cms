<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     block.unsearchable.php
 * Type:     block
 * Name:     unsearchable
 * Purpose:  makes content invisible for search indexing
 * -------------------------------------------------------------
 */
function smarty_block_unsearchable($params, $content, &$smarty) {
    if (is_null($content)) {
        return;
    }
    
    $crawlLinks = false;
    if($params && $params['crawlLinks'] == true)
        $crawlLinks = true;
    
    global $searchIndexMode;
    
    if($crawlLinks && $searchIndexMode)
        systemSearch::getLinksInContent($content);
    
    return '<!--unsearchable-begin-->'.$content.'<!--unsearchable-end-->';
}

?>

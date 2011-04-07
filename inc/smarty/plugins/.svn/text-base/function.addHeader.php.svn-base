<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     function.addHeader.php
 * Type:     function
 * Name:     addHeader
 * Purpose:  inject content into the head section of the html document
 * -------------------------------------------------------------
 */

function smarty_function_addHeader( $params, &$smarty ){
    if($params && $params['content'] && strlen($params['content'])) {
        if($params['replaceWithBrace'])
            $params['content'] = str_replace($params['replaceWithBrace'], '{', $params['content']);
            
        if($params['replaceWithClosingBrace'])
            $params['content'] = str_replace($params['replaceWithClosingBrace'], '}', $params['content']);
            
            
            
        
        kryn::addHeader($params['content']);
    }    
}
?>
<?php

function smarty_function_resizeImage( $params, &$smarty ){
    global $kryn;
    
    $imagelink = $params['file'];
    
    $imagelink = str_replace('//', '/', $imagelink);
    $thumbnail = ($params['thumbnail']+0 > 0 || $params['thumbnail']=="true")?true:false; 
        
    if( $params['dimension'] ){
        $imagelink = resizeImageCached( $imagelink, $params['dimension'], $thumbnail );
    }
    if( $params['width'] && $params['height'] ){
        $imagelink = resizeImageCached( $imagelink, $params['width'].'x'.$params['height'], $thumbnail );
    }
    return $imagelink;
}

?>
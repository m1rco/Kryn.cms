<?php

function smarty_function_page( $params, &$smarty ){
    global $kryn;

    $params['withRessources'] = $params['withRessources'] ? true : false;
    
    if( $params['id']+0 > 0 )
        return kryn::renderPageContents( $params['id'], $params['slot'], $params );
    else 
        return '';
    
    /*
    if( $params['slot']+0 > 0 ){
        
        $temp = $kryn->pointer_page;
        
        $oldForceKryn = $kryn->forceKrynContent;
        $kryn->forceKrynContent = true;
        
        $kryn->pointer_page = array('rsn' => $params['id'] );
        $res = smarty_function_krynContent( array('id' => $params['slot']), $smarty );
        $kryn->pointer_page = $temp;
        
        $kryn->forceKrynContent = $oldForceKryn;
        
        return $res;
    } else {
        return kryn::getPageContent( $params['id'],  $params['withRessources'] );
    }*/
}

?>
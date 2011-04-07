<?php
function smarty_modifier_active($string){
    global $kryn;

    if( is_numeric( $string ) )
        $rsn = $string;
    else
        $rsn = $string['rsn'];

    if( $rsn == kryn::$page['rsn'] ) return true;

    $kcache['realUrl'] = kryn::readCache( 'urls' );
    $url = $kcache['realUrl']['rsn'][ 'rsn=' . kryn::$page['rsn'] ] . '/';
    $purl = $kcache['realUrl']['rsn'][ 'rsn=' . $rsn ] . '/';

    $pos = strpos( $url, $purl );
    if( $url == '/' || $pos != 0  || $pos === false){
        return false;
    } else {
        return true;
    }
}
?>

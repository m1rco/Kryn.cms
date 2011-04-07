<?php

/*
 * This file is part of Kryn.cms.
 *
 * (c) Kryn.labs, MArc Schmidt <marc@kryn.org>
 *
 * To get the full copyright and license informations, please view the
 * LICENSE file, that was distributed with this source code.
 *
 */


/**
 * Global important functions for working with Kryn.cms
 * 
 * @author Kryn.labs <info@krynlabs.com>
 * @package Kryn
 * @subpackage Framework
 */


/**
 * klog saves log informations to the log monitor.
 * 
 * @package Kryn
 * @subpackage Log
 */
function klog( $pArea, $pMsg ){
    errorHandler( $pArea, $pMsg );
}

/**
 * Returns the value in $_REQUEST[$pVal] but with the possibility to escape the
 * value with pEscape.
 * @param string $pVal
 * @param integer $pEscape 1: Will be escaped with esc(), 2: will delete character beside a-Z0-9.
 * @return string|array
 */
function getArgv( $pVal, $pEscape = false ){
    //if( !is_numeric($pVal) && !array_key_exists( $_REQUEST, $pVal ))
    //   kryn::error( "param $pVal is empty.", ERROR_FATAL );
    if( $pEscape == 2 ){
        return preg_replace("/\W/", "", $_REQUEST[ $pVal ]);
    } else if( $pEscape == 1 || $pEscape == true){
        return esc( $_REQUEST[ $pVal ] );
    } else 
        return $_REQUEST[ $pVal ];
}


/**
 * This convert the argument in json, send the json to the client and exit the script.
 *
 * @param mixed
 */
function json( $pValue ){
    @ob_end_clean();
    //header('Content-Type: application/json');
    //header('HTTP/1.1 200 OK');
    header('Content-Type: text/javascript; charset=utf-8');
    die( json_encode( $pValue ) );
}



/**
 * Translate the specified string to the current language if available.
 * If not available it returns the given string.
 * @param string $pString
 * @return string Translated string 
 */
function _l( $pString ){
    if( !is_array(kryn::$lang) ) return $pString;
    if( array_key_exists( $pString, kryn::$lang ) && kryn::$lang[$pString] != '' ){
        return kryn::$lang[ $pString ];
    }
    return $pString;
}

?>

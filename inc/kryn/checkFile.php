<?php

/**
 * 
 * Filechecker for tiny URLs.
 * 
 * tiny URLs are in Kryn URLs to inc/template/ but without inc/template.
 * 
 * @internal
 * @package Kryn
 * @author Kryn.labs <info@krynlabs.com>
 */

$pfile = preg_replace('/\.\.+/', '.', $_REQUEST['_kurl']);
$temp = 'inc/template/';
$file = false;

if( file_exists($temp.$pfile) ){
	$file = $temp.$pfile;
} else if( file_exists( $temp.substr($pfile, 3, strlen($pfile) ) ) ){
	$file = $temp.substr( $pfile, 3, strlen($pfile) );
}

if( $file && !is_dir($file) ){
    $cfg['path'] = str_replace( 'index.php', '', $_SERVER['SCRIPT_NAME'] );
	header( "HTTP/1.1 301 Moved Permanently" );
    header('Location: '.$cfg['path'].$file);
    exit;
}
?>
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
 * Index.php
 * 
 * 
 * @author Kryn.labs <info@krynlabs.com>
 * @package Kryn
 * 
 */
header("Content-Type: text/html; charset=utf-8");

$time = time();
$_start = microtime(true);

@set_include_path(get_include_path() . PATH_SEPARATOR . './inc/pear/');

//bd 2uuugg;

/**
 * Define globals
 * @globals 
 */
$cfg = array();
$modules = array();
$searchIndexMode = false;
$languages = array();
$kcache = array();
$_AGET = array();


# install
if( !file_exists('inc/config.php') ){
    header("Location: install.php");
    exit;
};
include('inc/config.php');

$umask = (in_array('umask', $cfg))?$cfg['umask']:002;
@umask($umask);

if( !array_key_exists('display_errors', $cfg) )
    $cfg['display_errors'] = 0;

    
if( $cfg['display_errors'] == 0 ){
    @ini_set('display_errors', 0 );
} else {
    @ini_set('display_errors', 1 );
    @ini_set('error_reporting', E_ALL & ~E_NOTICE);
}

include('inc/kryn/misc.global.php');
include('inc/kryn/database.global.php');
include('inc/kryn/template.global.php');
include('inc/kryn/internal.global.php');
include('inc/kryn/framework.global.php');

@set_error_handler('errorHandler');

include( 'inc/kryn/checkFile.php' );

# Load important classes
include('inc/smarty/Smarty.class.php');
include('inc/kryn/database.class.php');
include('inc/kryn/baseModule.class.php');
include('inc/kryn/kryn.class.php');
include('inc/kryn/acl.class.php');
include("inc/kryn/adminForm.class.php");
include('inc/kryn/knavigation.class.php');
include('inc/kryn/tpl.class.php');
include('inc/kryn/user.class.php');
include('inc/kryn/systemSearch.class.php');

# Init classes and globals
$tpl = new Smarty();
$tpl->caching = false;
$tpl->template_dir = 'inc/template/';
$tpl->compile_dir = $cfg['tpl_cpl'];

$kryn = new kryn();
tAssign( 'time', $time);

date_default_timezone_set( $cfg['timezone'] );

if( !empty($cfg['locate']) )
    setlocale( LC_ALL, $cfg['locale']);
    

# Init db/stdn config
$kdb = new database(
             $cfg['db_type'],
             $cfg['db_server'],
             $cfg['db_user'],
             $cfg['db_passwd'],
             $cfg['db_name'],
             ($cfg['db_pdo']+0 == 1 || $cfg['db_pdo'] === '' )?true:false,
             ($cfg['db_forceutf8']=='1')?true:false
);

define('pfx', $cfg['db_prefix']);

if( !file_exists($cfg['tpl_cpl']) )
    @mkdir( $cfg['tpl_cpl'] );

if( $_SERVER['REDIRECT_PORT']+0 > 0 )
    $_SERVER['SERVER_PORT'] = $_SERVER['REDIRECT_PORT'];
    
$_REQUEST['lang'] = ($_GET['lang']) ? $_GET['lang'] : $_POST['lang'];

$kryn->prepareUrl();

# Javascript
if($_REQUEST['js'] == 'global.js'){
    $cfg['path'] = str_replace( 'index.php', '', $_SERVER['SCRIPT_NAME'] );
	die("var path = '".$cfg['path']."'; var _path = '".$cfg['path']."'; var _baseUrl = 'http://".$_SERVER['SERVER_NAME'].$cfg['path']."'");
}

$kryn->loadConfig();
$kryn->initConfig();
$kryn->loadModules();
$kryn->loadLanguage();

$user = new user();
$user->init();
if($user->user['rsn'] != GUEST){
    $user->user_logged_in = true;
}

$kryn->initModules();

tAssign("request", $_REQUEST);
tAssign("user", $user->user);

$kryn->checkAccess();

systemSearch::initSearch();


$kryn->admin = false;
tAssign( 'admin', false );
if( getArgv(1) == 'admin' ){
    tAssign( 'admin', true );
    $kryn->admin = true;
    $modules['admin']->content();
} else {
    $kryn->display();
}

exit;

?>

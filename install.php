<?php

/*
* This file is part of Kryn.cms.
*
* (c) Kryn.labs, MArc Schmidt <marc@kryn.org>
*
* To get the full copyright and license informations, please view the
* LICENSE file, that was distributed with this source code.
*/

header("Content-Type: text/html; charset=utf-8");

$GLOBALS['krynInstaller'] = true;

include('inc/kryn/misc.global.php');
include('inc/kryn/database.global.php');
include('inc/kryn/template.global.php');
include('inc/kryn/internal.global.php');
include('inc/kryn/framework.global.php');
$lang = 'en';
$cfg = array();


@ini_set('display_errors', 1);
@ini_set('error_reporting', E_ALL & ~E_NOTICE);

if( $_REQUEST['step'] == 'checkDb' )
    checkDb();

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de" dir="ltr">
  <head>
    <title>Kryn.cms installation</title>
    <style type="text/css">
      h1 {
        margin: 0px 0px 10px 0px;
        border-bottom: 1px solid #00273c;
        font-size: 12px;
        font-weight: bold;
        color: #145E84;
      }
      
      h2 {
        color: #145E84;
      }
      
      td {
        vertical-align: top;
      }

      a, a:link {
        text-decoration: none;
        color: gray;
      }

      body {
        text-align: center;
        font-size: 11px;
        font-family: Verdana,Arial,sans-serif;
      }

      table {
        font-size: 11px;
        margin: 5px;
        margin-left: 10px;
        width: 400px;
        color: #555;
      }

      table th {
        color: #444;
        border-bottom: 1px solid silver;
        font-weight: normal;
        text-align: left;
      }
      
      table.modulelist td {
      	border-bottom: 1px solid #eee;
      }

      input.text {
        border: 1px solid silver;
        width: 250px;
        text-indent: 4px;
      }

      .wrapper {
        text-align: left;
        margin: auto;
        width: 700px;
        left: 60px;
        border: 1px solid silver;
        -moz-border-radius: 10px;
        -webkit-border-radius: 10px;
        padding: 45px 35px;
        background-color: #f6f6f6;
        position: relative;
        color: #333;
      }

      a.button, a.button:link {
        -moz-border-radius: 4px 4px 4px 4px;
        background-image: url(inc/template/admin/images/button-bg.png);
        background-repeat: no-repeat;
        color: #222222;
        cursor: default;
        font-weight: normal;
        line-height: 22px;
        margin: 0 3px;
        outline: 0 none;
        padding: 5px 5px 6px 10px;
        position: relative;
        text-decoration: none;
        top: 2px;
        cursor: pointer;
      }
      
      a.button span, a.button:link span {
        background-image: url(inc/template/admin/images/button-bg.png);
        background-position: right top;
        background-repeat: no-repeat;
        height: 25px;
        position: absolute;
        right: -4px;
        top: 0;
        width: 6px;
	  }		
	  
	  a.button:hover {
        background-position: left -27px;
        color: white;
      }

      a.button:hover span {
        background-position: right -27px;
      }
      
      a.button:active span {
        background-position: right -53px;
      }
      a.button:active {
        background-position: left -53px;
        color: white;
      }

      .step a, .step a:link {
        display: block;
        text-align: left;
        padding: 12px 5px 12px 15px;
        -moz-border-radius: 10px;
        -webkit-border-radius: 10px;
      }

      .step a.active {
        color: black;
        background-color: #e8e8e8;
        font-weight: bold;
      } 

      .step {
        border: 1px solid silver;
        border-right: 0px;
        -moz-border-radius-topleft: 10px;
        -moz-border-radius-bottomleft: 10px;
        -webkit-border-top-right-radius: 10px;
        -webkit-border-bottom-right-radius: 10px;
        border-radius: 3px;
        position: absolute;
        top: 20px;
        left: -151px;
        width: 150px;
        background-color: #f2f2f2;
        margin-bottom: 15px;
      }
      
      h2.main {
      	font-size: 12px;
      	line-height:13px;
      	position: absolute;
      	top: 0px;
      	left: 35px;
      	right: 35px;
      	border-bottom: 1px dashed #ddd;
      	padding-bottom: 5px;
      	color: gray;
      }

      .breaker { clear: both }

    </style>
    <script type="text/javascript" src="inc/template/kryn/mootools-core.js"></script>
    <script type="text/javascript">
        window.addEvent('domready', function(){
            $$('input.text').addEvent('focus', function(){
                this.setStyles({
                    border: '1px solid gray',
                    'background-color': '#feffc0'
                });
            });
            $$('input.text').addEvent('blur', function(){
                this.setStyles({
                    border: '1px solid silver',
                    'background-color': 'white'
                });
            });
           $$('a.button').each(function(a){
               if( !a.getElement('span') )
                   new Element('span').inject(a); 
           });
        });
    </script>
    <link rel="SHORTCUT ICON" href="inc/template/admin/images/favicon.ico" />
  </head>
  <body>
    <div class="wrapper">
    <h2 class="main">Kryn.cms installation</h2>
<?php

require_once( 'inc/kryn/baseModule.class.php' );
require( 'inc/kryn/kryn.class.php' );
require( 'inc/modules/admin/module.class.php' );

$step = 1;
if( !empty($_REQUEST['step']) )
    $step = $_REQUEST['step'];
?>

<div class="step">
    <a href="javascript:;" <?php if( $step == 1 ) echo 'class="active"'; ?>>1. Start</a>
    <a href="javascript:;" <?php if( $step == 2 ) echo 'class="active"'; ?>>2. Filecheck</a>
    <a href="javascript:;" <?php if( $step == 3 ) echo 'class="active"'; ?>>3. Database</a>
    <a href="javascript:;" <?php if( $step == 4 ) echo 'class="active"'; ?>>4. Package</a>
    <a href="javascript:;" <?php if( $step == 5 ) echo 'class="active"'; ?>>5. Installation</a>
    <div class="breaker"></div>
</div>

<?php

switch( $step ){
case '5':
    step5();     
    break;
case '4':
    step4();     
    break;
case '3':
    step3();     
    break;
case '2':
    step2();
    break;
case '1':
    welcome();
}

function checkDb(){
	global $cfg;
	
	
	$type = $_REQUEST['type'];
	
	$cfg = array(
		"db_server"		=> $_REQUEST['server'],
	    "db_user"		=> $_REQUEST['username'],
	    "db_passwd"		=> $_REQUEST['passwd'],
	    "db_name"		=> $_REQUEST['db'],
	    "db_prefix"		=> $_REQUEST['prefix'],
	    "db_type"		=> $_REQUEST['type']
	);
	
	require_once( 'inc/kryn/baseModule.class.php' );
	require_once( 'inc/kryn/kryn.class.php' );
    require( 'inc/kryn/database.class.php' );
	$res = array('res' => true);
	
	$usePdo = ($_REQUEST['pdo'] == 1) ? true : false;
	$forceutf8 = ($_REQUEST['forceutf8'] == 1) ? true : false;
	
    $kdb = new database($cfg['db_type'], $cfg['db_server'], $cfg['db_user'], $cfg['db_passwd'], $cfg['db_name'], $usePdo, $forceutf8);
    
    if( !$kdb->connected() ){
        $res['error'] = $kdb->lastError();
        $res['res'] = false;
    }

    $path = dirname($_SERVER['REQUEST_URI']);
    if( substr($path, 0, -1) != '/' )
        $path .= '/';
    $path = str_replace("//", "/", $path);

    $timezone = @date_default_timezone_get();
    if( !$timezone )
        $timezone = 'Europe/Berlin';


    if( $res['res'] == true ){
        $config = '<?php $cfg = array(
    "db_server"		=> "'.$_REQUEST['server'].'",
    "db_user"		=> "'.$_REQUEST['username'].'",
    "db_passwd"		=> \''.$_REQUEST['passwd'].'\',
    "db_name"		=> "'.$_REQUEST['db'].'",
    "db_prefix"		=> "'.$_REQUEST['prefix'].'",
    "db_type"		=> "'.$_REQUEST['type'].'",
    "db_pdo"		=> "'.$_REQUEST['pdo'].'",
    "db_forceutf8"		=> "'.$_REQUEST['forceutf8'].'",
    "tpl_cpl"		=> "inc/compile",
    "caching_type"		=> "files",
    "files_path"	=> "inc/cache/",
    "template_cache" => "inc/tcache/",
    "display_errors" => "0",
    "log_errors" => "0",
    "systemtitle" => "Fresh install",
    "rewrite"   => false,
    "locale" => "de_DE.UTF-8",
    "path"			=> "'.$path.'", 
    "timezone" => "'.$timezone.'"

); ?>';
        $f = @fopen( 'inc/config.php', 'w+' );
        if( !$f ){
            $res['error'] = 'Can not open file inc/config.php - please change the permissions.';
            $res['res'] = false;
        } else {
            fwrite( $f, $config ); 
        }
    }
    die(json_encode($res));
}

function welcome(){
?>

<br />
<h2>Thank you for choosing Kryn.cms!</h2>
<br />
Your installation folder is <strong style="color: gray;"><?php echo getcwd(); ?></strong>
<br />
<br />
<b>Kryn.cms license</b><br />
<br />
<div style="height: 350px; background-color: white; padding: 5px; overflow: auto; white-space: pre;">
    <?php $f = fopen("LICENSE", "r"); if($f) while (!feof($f)) print fgets($f, 4096) ?>
</div>
<br /><br />
<a href="?step=2" class="button" >Start</a>

<?php
}

function step5(){
?>

<br />
<h2>Installation in progress:</h2>
<br />
<?php
    global $kdb, $cfg;

    $dir = opendir( "inc/modules/" );
    if(! $dir ) return;
    while (($file = readdir($dir)) !== false){
        if( $file != '..' && $file != '.' && $file != '.svn' && $file != 'admin' ){
            $modules[] = $file;
        }
    }
    $modules[] = "admin"; //because the install() of admin should be called as latest
    
    require( 'inc/config.php' );
    require( 'inc/modules/admin/db.class.php' );
    require( 'inc/kryn/database.class.php' );
    require_once( 'inc/kryn/baseModule.class.php' );
    
    if( !file_exists('inc/cache') )
        mkdir( 'inc/cache' );
    
    define('pfx', $cfg['db_prefix']);
    $kdb = new database(
                 $cfg['db_type'],
                 $cfg['db_server'],
                 $cfg['db_user'],
                 $cfg['db_passwd'],
                 $cfg['db_name'],
                 ($cfg['db_pdo']+0 == 1 || $cfg['db_pdo'] === '' )?true:false,
                 ($cfg['db_forceutf8']=='1')?true:false
    );
    foreach( $modules as $module ){
        if( $_REQUEST['modules'][$module] == '1' || $module == 'admin' || $module == 'users') {
            $config = module::loadInfo( $module );
            print "Install <b>$module</b>:<br />
            <div style='padding-left: 15px; margin-bottom: 4px; color: silver; white-space: pre;'>";
            print db::install( $config, true );
            print "</div>";
        }
    }
	database::readTables(true);

    dbDelete( 'system_domains' );

    $path = dirname($_SERVER['REQUEST_URI']);
    if( substr($path, 0, -1) != '/' )
        $path .= '/';
    $path = str_replace("//", "/", $path);

    dbInsert( 'system_domains', array(
        'domain' => $_SERVER['SERVER_NAME'], 'title_format' => '%title | Pagetitle', 'master' => 1, 'lang' => 'en',
        'startpage_rsn'=>1, 'resourcecompression' => 1, 'path' => $path,
        'search_index_key' => md5($_SERVER['SERVER_NAME'].'-'.@time().'-'.rand())
    ));
    
    
    dbDelete( 'system_modules' );
    foreach( $modules as $module ){
        if( $_REQUEST['modules'][$module] == '1' || $module == 'admin' || $module == 'users') {
            if( $module != "kryn" ){
                if( file_exists("inc/modules/$module/$module.class.php") ){
                    require_once( "inc/modules/$module/$module.class.php" );
                    $m = new $module();
                    $m->install();
                }
            }
            if( $module != '' ){
            	dbInsert( 'system_modules', array('name' => $module, 'activated' => 1) );
            }
        }
    }

    require( 'inc/modules/admin/pages.class.php' );
    
    admin::clearCache();

    @mkdir( 'inc/compile' );
    @mkdir( 'inc/template/trash' );
    @mkdir( 'inc/template/css' );
    @mkdir( 'inc/template/js' );
    @mkdir( 'inc/cache' );
    @mkdir( 'inc/tcache' );
    @copy( 'inc/template/trash/.htaccess', 'inc/cache/');
    @mkdir( 'inc/upload' );
    @mkdir( 'inc/upload/modules' );

    pages::updateUrlCache( 1 );
    pages::updateMenuCache( 1 );
    pages::updateDomainCache();

    
    if( !rename( 'install.php', 'install.php.'.rand(123,5123).rand(585,2319293).rand(9384394,313213133) ) ){
        print '<div style="margin: 25px; border: 2px solid red; padding: 10px; padding-left: 25px;">
        	Can not rename install.php - please remove or rename the file for security reasons!
        	</div>';
    }
?>
<br />
<div style="margin: 25px; border: 1px solid green; padding: 10px; padding-left: 25px;">
    <b>Installation successful.</b><br /><br />
    <b>Your login</b><br />
    Username: admin<br />
    Password: admin<br />
    <a href="./admin">Click here to go to Administration.</a><br />
</div>
<?php
}

function step4(){
?>

<br />
Your installation file contains following extensions.<br />
<br />
Dactivate the checkbox if you don't want to install some extensione.<br />
<br />
<form action="?step=5" method="post" id="form.modules">

<table style="width: 98%" class="modulelist" cellpadding="4">
<?php
    require_once( "inc/kryn/baseModule.class.php" );

    $systemModules = array('kryn','admin','users');
    buildModInfo( $systemModules );

    $dir = opendir( "inc/modules/" );
    $modules = array();
    if(! $dir ) return;
    while (($file = readdir($dir)) !== false){
        if( $file != '..' && $file != '.' && $file != '.svn' && (array_search($file, $systemModules) === false) ){
            $modules[] = $file;
        }
    }
    buildModInfo( $modules );
?>
</table>
</form>
<a href="?step=3" class="button" >Back</a>
<a href="javascript: $('form.modules').submit();" class="button" >Install!</a>
<?php
}

function buildModInfo( $modules ) {
    global $lang;
    foreach( $modules as $module ){
         $config = module::loadInfo( $module );
         $version = $config['version'];
         $title = $config['title'][$lang];
         $desc = $config['desc'][$lang];

         $checkbox = '<input name="modules['.$module.']" checked type="checkbox" value="1" />';
         if( $config['system'] == "1"){
             $checkbox = '<input name="modules['.$module.']" checked disabled type="checkbox" value="1" />';
         }
        ?>
        <tr>
        	<td valign="top" width="30"><?php print $checkbox ?></td>
        	<td valign="top" width="150"><b><?php print $title ?></b></td>
        	<td valign="top" width="90"><div style="color: gray; margin-bottom: 11px;">#<?php print $module ?></div></td>
        	<td valign="top" >
        	<?php print $desc ?>
        	</td>
        </tr>
        <?php
    }

}

function step2(){
?>

<br />
<h2>Checking file permissions</h2>
<br />
<br />
<?php

    $t = explode("-", PHP_VERSION);
    $v = ( $t[0] ) ? $t[0] : PHP_VERSION;

    if(! version_compare($v, "5.2.0", "ge") ){
        print "<b>PHP version tot old.</b><br />";
        print "You need PHP version 5.2.0 or greater.<br />";
        print "Installed version: $v (".PHP_VERSION.")<br/><br/>";
    } else {
        $versionOk = true;
    }

    $step2 = "";

    function checkFile( $pDir, $pFile ){
        global $step2;

        $file = $pDir.'/'.$pFile;
        if(! is_dir( $file ) ) {
            $fh = @fopen( $file, 'a+' );
            if( !$fh ){
                $step2 .= "#";
                $res .=  "<br />$file";
            }
        } elseif( opendir($file) === FALSE ) {
            $res .= "<br />$file";
        }
        if( is_dir($file) === TRUE ){
            $res .= checkDir( $file );
        }
        return $res;
    }

    function checkDir( $pDir ){
        $pDir .= "";
        $dir = opendir( $pDir );
        if(! $dir ) return;
        while (($file = readdir($dir)) !== false){
            if( substr($file, 0, 1 ) != '.' || $file == '.htaccess' ){
                $res .= checkFile($pDir, $file);
            }
        }
        return $res;
    }

    
    $files = checkDir( "." );
    if( $files != "" ){
        print 'Following files aren not writeable.<br />
               <br /><br />
               Please set the write permission to webserver or to anonymous:<br/>
               <div style="border: 1px solid silver;  font-family: monospace; background-color: white; padding: 5px; margin: 5px;">
               chown -R <i>WebserverOwner</i> '.getcwd().'; <b>or</b> <br />
               chmod -R 777 '.getcwd().'</div>';
        print '<div style="overflow: auto; font-family: monospace; height: 350px; overflow: auto;  background-color: white; margin: 5px;">'.$files.'</div>';
    } else {
        print '<b style="color: green;">OK</b>';
        $filesOk = true;
    }

    ?>
    <br />
    <a href="?step=1" class="button" >Back</a>
    <?php

    if( $filesOk && $versionOk ){
        print '<a href="?step=3" class="button" >Next</a>'; 
    } else {
        print '<a href="?step=2" class="button" >Re-Check</a>';
    }
    
    echo $step2;

}

function step3(){

    
    ?>

Please enter your MySQL database information.<br />
<script type="text/javascript">
    checkDBEntries = function(){
        var ok = true;
        
        if( $('db.server').value == '' ){ $('db.server').highlight(); ok = false; }
        if( $('db.prefix').value == '' ){ $('db.prefix').highlight(); ok = false; }
        if( ok ){
            $( 'status' ).set('html', '<span style="color:green;">Check data ...</span>');
            var req = {};
            req.type = $('db.type').value;
            req.server = $('db.server').value;
            req.db = $('db.db').value;
            req.prefix = $('db.prefix').value;
            req.username = $('db.username').value;
            req.passwd = $('db.passwd').value;
            req.pdo = ($('db.pdo').checked) ? 1 : 0;
            req.forceutf8 = ($('db.forceutf8').checked) ? 1 : 0;

            new Request.JSON({url: 'install.php?step=checkDb', onComplete: function(stat){
                if( stat != null && stat.res == true )
                   location = '?step=4';
                else if( stat != null )
                    $( 'status' ).set('html', '<span style="color:red;">Login failed:<br />'+stat.error+'</span>');
                else
                    $( 'status' ).set('html', '<span style="color:red;">Fatal Error. Please take a look in server logs.</span>');
            }}).post(req);
        }
    }
</script>
<form id="db.form">
<table style="width: 100%" cellpadding="3">
 	<tr>
        <td width="250">Database</td>
        <td><select name="db.type" id="db.type">
        	<option value="mysql">MySQL</option>
        	<option value="mysqli">MySQLi</option>
        	<option value="postgresql">PostgreSQL</option>
        	<option value="oracle">Oracle (experimental)</option> 
        	<option value="oracle">MSSql (experimental, no pdo)</option> 
        	<option value="sqlite">SQLite</option>
        </select></td>
    </tr>
    <tr>
        <td>Use PDO
        <div style="color: silver">
        (Experimental)
        </div></td>
        <td><input type="checkbox" name="pdo" id="db.pdo" value="1" /></td>
    </tr>
    <tr>
        <td>Force UTF-8</td>
        <td><input type="checkbox" name="forceutf8" id="db.forceutf8" value="1" /></td>
    </tr>
    <tr>
        <td>
        	Host
	        <div style="color: silver">
	        	For SQLite enter the path to the file. 
	        </div>
        </td>
        <td><input class="text" type="text" name="server" id="db.server" value="localhost" /></td>
    </tr>
    <tr>
        <td>Username</td>
        <td><input class="text" type="text" name="username" id="db.username" /></td>
    </tr>
    <tr>
        <td>Password</td>
        <td><input class="text" type="password" name="passwd" id="db.passwd" /></td>
    </tr>
    <tr>
        <td>
        	Database name
        </td>
        <td><input class="text" type="text" name="db" id="db.db" /></td>
    </tr>
    <tr>
        <td>Prefix
	        <div style="color: silver">
	        	Please use only a lowercase string.
	        </div></td>
        <td><input class="text" type="text" name="prefix" id="db.prefix" value="kryn_" /></td>
    </tr>
</table>
</form>
<div id="status" style="padding: 4px;"></div>
<br />
<br />
<a href="?step=2" class="button" >Back</a>
<a href="javascript: checkDBEntries();" class="button" >Next</a>

<?php
}

?>
    </div>
  </body>
</html>

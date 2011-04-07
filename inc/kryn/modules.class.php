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
 * 
 * Modules class
 * 
 * @package Kryn
 * @subpackage Core
 * @internal
 * @author Kryn.labs <info@krynlabs.com>
 */

class modules {

    var $currentModule;
    var $modules;	
    
    function modules(){
        # Load all available/activate modules
        $this->loadModules();
    }

    function current(){
        global $kryn, $lang, $debug, $cfg;
        
        if(isset($this->modules[$this->currentModule])){
            $result = $this->modules[$this->currentModule]->content();
        } else {
            $debug .= "ERROR: Module ".$this->currentModule." not found.\n";
            $kryn->message($lang['request_failed'], $cfg['path'], ERROR);
        }
        return $result;
    }
    
    function pluginIcon($pModul){
            global $modules;
            $temp = explode("::", $pModul);
            $moduleName = $temp[0];
            //$plugin = wordwrap($temp[1], 8, "\n");
            $plugins = $modules->modules[$moduleName]->getPlugins();
            $title = $modules->modules[$moduleName]->getTitle();
            $plugin = $plugins[$temp[1]][0];

            if($title == 'navigation'){
                if($plugin != 'history'){
                    $navi = dbExfetch("SELECT * FROM `".pfx."system_navigations` WHERE `rsn` = ".$temp['2']);
                    $plugin = $navi['name'];
                }
            }

            Header("Content-Type: image/png");
            $width = strlen($plugin)*8;
            $titleWidth = strlen($title)*8;
            if( $titleWidth > $width )
                $width = $titleWidth;

            $img = ImageCreate($width, 35);

            $black = ImageColorAllocate($img, 0, 0, 0);
            $white = ImageColorAllocate($img, 255, 255, 255);
            ImageFilledRectangle($img, 0, 0, $width, 34, $black);
            ImageFilledRectangle($img, 1, 1, $width-2, 32, $white);
            ImageFilledRectangle($img, 0, 15, $width, 15, $black);
            ImageString($img, 2, 2, 0, $title, $black);
            ImageString($img, 3, 2, 18, $plugin, $black);
            ImagePNG($img);
            exit;
    }

    function pluginSettings(){
        global $tpl;

        
        $info = explode("::", $_REQUEST['plugin']);
        $plugins = $this->modules[$info[0]]->getPlugins();

        $plugin = $plugins[$info[1]];
        $params = $plugin[1];
        if( count($params) > 0 )
            foreach($params as $param){
                if($param['type'] == 'select'){
    
    
                }
            }

        #$paramsGiven = explode("::", $_REQUEST['params']);
        $paramsGiven = $_REQUEST['params'];

        $tpl->assign('params', $params);
        $tpl->assign('paramsGiven', $paramsGiven);
        $tpl->assign('info', $info);
        print $tpl->fetch("admin/plugin.fckeditor.tpl");
        exit;
    }

    function loadModules(){
        global $lang, $cfg, $languages;
        $this->modules = array();
        $res = dbExec( 'SELECT * FROM %pfx%system_modules' );
        while($row = dbFetch($res)){

            try {
                if(! file_exists( "inc/modules/" . $row['name'] . "/" . $row['name'] . ".class.php" ))
                    continue;
    
                if(!class_exists($row['name']))
                    @include_once("inc/modules/" . $row['name'] . "/" . $row['name'] . ".class.php");
    
                $language = $languages[0];
                foreach($languages as $l)
                    if($_REQUEST['lang'] == $l) $language = $l;
    
                /*
                $langfile = "inc/modules/" . $row['name'] . "/lang/".$language.".php";
                if(file_exists($langfile)){
                    $langT = $lang;
                    include_once($langfile);
                    $langT[$row['name']] = $lang;
                    $lang = $langT;
                }
                */
    
                $this->modules[$row['name']] = new $row['name'];
            
            } catch( Exception $e ) {
            }
        }
        tAssign("lang", $lang);
        tAssign("css", $css);
    }
    
}


?>

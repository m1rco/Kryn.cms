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


class template {
    
    function index(){
        global $tpl;
        return template::edit();
        #return $tpl->fetch("admin/template.tpl");
    }
    
    function edit(){
        global $tpl, $kryn, $lang, $modules, $navigation;
            
        # plugin list
        foreach($modules->modules as $module){
            $tPlugins = $module->getPlugins();
            $myplugins = array();
            if( count($tPlugins) > 0 ){
                foreach($tPlugins as $key => $plugin){

                    if( count($plugin[1]) > 0){ // Hat parameter
                        $params = "";

                        if(is_array($plugin[1]))
                            foreach($plugin[1] as $param)
                                $params .= "::";
                        $plugin['params'] = $params;
                    }
                    $myplugins[$key] = $plugin;

                }
                $plugins[] = array($module->name, $myplugins);
            }
        }
        
        $tpl->assign("plugins", $plugins);			
        
        if($_REQUEST['menu'] == 'pages'){
            $kryn->addMenu("Seite bearbeiten");
            
            $templateFile = $_REQUEST['rsn']+0;
            if( !empty($_REQUEST['save']) ){
                $content = preg_replace('/<img(.*) src="(.*)admin\/menu=pluginIcon\/plugin=(.*)?\/"(.*)\/>/', '{krynplugin plugin="$3"}', $_REQUEST['templateContent']);
                $kryn->writeTempFile("pages/".$templateFile.".tpl", unesc($content));
                die("<script type='text/javascript'>parent.saveEvent('ok');</script>");
            }
            $page = dbExfetch("SELECT `title` FROM `".pfx."system_pages` WHERE `rsn` = ".$templateFile);
            $tpl->assign("pageTitle", $page['title']);
            if( file_exists("inc/template/".$kryn->cfg['template']."/pages/".$templateFile.".tpl") ){
                $content = $kryn->readTempFile("pages/".$templateFile.".tpl");
            }
        } else {
            $kryn->addMenu("Template bearbeiten");
            if( !empty($_REQUEST['save']) ){
                $content = preg_replace('/<img(.*) src="(.*)admin\/menu=pluginIcon\/plugin=(.*)?\/"(.*)\/>/U', '{krynplugin plugin="$3"}', $_REQUEST['templateContent']);
                $head= $kryn->readTempFile("templates/head.tpl");
                $file = ( empty($_REQUEST['file']) ) ? 'index.tpl' : $_REQUEST['file'].".tpl";
                $kryn->writeTempFile("templates/$file", $head.$content."</body></html>");
                die("<script type='text/javascript'>parent.saveEvent('ok');</script>");
            } else {
                $file = ( empty($_REQUEST['file']) ) ? 'index.tpl' : $_REQUEST['file'].".tpl";
                $content = $kryn->readTempFile("templates/$file");
                
                $tpl->assign("file", str_replace(".tpl", "", $file));
                $path = "inc/template/".$kryn->cfg['template']."/templates/";
                $h = opendir($path);
                while($datei = readdir($h)){
                    if(is_file($path.$datei) && $datei != 'head.tpl'){
                        $files[] = str_replace(".tpl", "", $datei);
                    }
                }
                $tpl->assign("files", $files);
            }
            $pos = strpos($content, "<body>")+6;
            $content = substr( $content, $pos, strpos($content, "</body>")-$pos );
        }
        

        $path = $kryn->cfg['path'];
        $content = preg_replace('/{krynplugin plugin="(.*)?"}/U', "<img src=\"${path}admin/menu=pluginIcon/plugin=$1/\" class='krynPluginIcon' />", $content);
        $tpl->assign("templateContent", $content);
        
        return $tpl->fetch("admin/template.tpl");
    }
}

?>

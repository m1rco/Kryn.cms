<?php

class module {

    public static function init(){
        global $kryn, $cfg;

        
        if( !$cfg['repoServer'] ){
        	$cfg['repoServer'] = 'http://download.kryn.org';
        }
        
        
        
        switch( getArgv(4) ){
            case 'deactivate':
                return module::deactivate($_REQUEST['name']);
            case 'activate':
                return module::activate($_REQUEST['name']);

            /* not in use
            case 'dev-install':
                return module::devInstall(getArgv(5));
            case 'dev-update':
                return module::devUpdate(getArgv(5));
            case 'dev-remove':
                return module::devRemove(getArgv(5));
            case 'new':
                return module::listTopModules();
            */

            case 'managerSearch':
                return module::managerSearch( getArgv('q') );
            case 'managerGetCategoryItems':
                return module::getCategoryItems( getArgv('category')+0, getArgv('lang') );
            case 'managerGetBox':
                return self::getBox(getArgv('code') );

            // for pluginchooser
            case 'getModules':
                return module::getModules();


            case 'check4updates':
                return module::check4updates();


            case 'getInstallInfo': #step 1
                return module::getInstallInfo( getArgv('name',2), getArgv('type') );
            case 'getPrepareInstall': #step 2
                return module::getPrepareInstall( getArgv('name',2), getArgv('type') );
                
            case 'getDependExtension':
                json(module::getDependExtension( getArgv('name', 2), getArgv('file'), getArgv('version')));
                
            case 'installModule':# step 3
                return json(module::installModule( getArgv('name',2), getArgv('type') ));

            case 'loadLocal':
                return module::loadLocal();
            case 'loadInstalled':
                return module::loadInstalled();

            case 'getPublishInfo':
                return module::getPublishInfo( getArgv('name',2) );
            case 'publish':
                json( module::publish( getArgv('pw'), getArgv('name',2), getArgv('message') ) );
            case 'getVersion':
                json( module::getVersion( getArgv('name',2) ) );
            case 'getPackage':
                json( module::getPackage( getArgv('name',2) ) );


            case 'getChangedFiles':
                json( module::getChangedFiles( getArgv('name',2) ) );
            case 'remove':
                json( module::removeModule( getArgv('name',2) ) );

            case 'dbInit':
                return module::dbInit( getArgv('name',2) );

            //edit module
            case 'extractLanguage':
                json( module::extractLanguage( getArgv('name',2) ) );
            case 'getLanguage':
                json( module::getLanguage( getArgv('name',2), getArgv('lang',2) ) );
            case 'saveLanguage':
                json( module::saveLanguage( getArgv('name',2), getArgv('lang',2), getArgv('langs') ) );

            case 'getConfig':
                json( module::loadInfo( getArgv('name',2) ) );

            case 'getForms':
                json( module::loadForms( getArgv('name',2) ) );
            case 'getHelp':
                json( module::getHelp( getArgv('name',2), getArgv('lang',2) ) );
            case 'saveHelp':
                json( module::saveHelp( getArgv('name',2), getArgv('lang',2), getArgv('help') ) );

            case 'saveLayouts':
                json( module::saveLayouts() );
            case 'saveGeneral':
                json( module::saveGeneral() );
            case 'saveLinks':
                json( module::saveLinks() );
            case 'saveDb':
                json( module::saveDb() );
                
            case 'saveDocu':
                json( module::saveDocu() );
            case 'getDocu':
                json( module::getDocu() );
                
            case 'savePlugins':
                json( module::savePlugins() );
            case 'getPlugins':
                json( module::getPlugins( getArgv('name',2) ) );

            case 'addCheckCode':
                json( module::addCheckCode(getArgv('name',2)) );
        }
    }

    public static function getDependExtension( $pName, $pFile, $pNeedVersion ){
        $res = array('ok' => false);
        
        
        $del = false;
        $del = (strpos($pNeedVersion, '>')===false)?$del:'>';
        $del = (strpos($pNeedVersion, '=')===false)?$del:'=';
        $del = (strpos($pNeedVersion, '=>')===false)?$del:'=>';
        $del = (strpos($pNeedVersion, '>=')===false)?$del:'>=';
        $del = (strpos($pNeedVersion, '<')===false)?$del:'<';
        $del = (strpos($pNeedVersion, '<=')===false)?$del:'<=';
        $del = (strpos($pNeedVersion, '=<')===false)?$del:'=<';
        
        $needVersion = str_replace($del, '', $pNeedVersion);

        $pFile = str_replace('..', '', $pFile);
        
        if( !file_exists($pFile) ){
            
            $info = self::loadInfo( $pName, $pFile );
            if( !$info['noConfig'] && $info['extensionCode'] == getArgv('name') ){
                
                if( kryn::compareVersion( $info['version'], $del, $needVersion) ){
                    
                     $res = array('ok' => true);
                     
                }
                
            }
                
        }
        
        return $res;
    }
    
    public static function getPlugins( $pName ){
        
        $config = module::loadConfig( $pName );
        
        return $config['plugins'];
    
    }

    public static function getCategoryItems( $pId, $pLang ){
    	global $cfg;
        $res = wget($cfg['repoServer']."/?exGetCategoryList=1&id=$pId&lang=".$pLang);
        print $res;
        exit;
    }

    public static function getBox( $pCode ){
    	global $cfg;
        $res = wget($cfg['repoServer']."/?exGetBox=1&code=$pCode");
        print $res;
        exit;
    }

    public static function managerSearch( $q ){
    	global $cfg;
        $res = wget($cfg['repoServer']."/?exSearch=$q");
        print $res;
        exit;
    }   

    function getHelp( $pName, $pLang ){
        $helpFile = "inc/modules/$pName/lang/help_$pLang.json";
        $res = array();
        if( !file_exists( $helpFile ) )
            json( $res );
        else {
            $json = kryn::fileRead( $helpFile );
            $help = json_decode( $json, 1 );
            json( $help );
        }
    }

    public static function saveHelp( $pName, $pLang, $pHelp ){
        $helpFile = "inc/modules/$pName/lang/help_$pLang.json";
        $json = json_format($pHelp);
        kryn::fileWrite( $helpFile, $json );
        json(1);
    }

    public static function getDocu(){
        $lang = getArgv('lang',2);
        $name = getArgv('name',2);
        $text = kryn::fileRead( "inc/modules/$name/docu/$lang.html" );
        json( $text );
    }

    public static function saveDocu(){
        $lang = getArgv('lang',2);
        $text = getArgv('text');
        $name = getArgv('name',2);
        if(! is_dir("inc/modules/$name/docu/") )
            mkdir( "inc/modules/$name/docu/" );
        kryn::fileWrite( "inc/modules/$name/docu/$lang.html", $text );
        json(1);
    }

    public static function loadForms( $pName ){

        if( !is_dir( "inc/modules/$pName/forms" ) ) return false;
        $h = opendir( "inc/modules/$pName/forms" );

        $res = array();
        while( $file = readdir($h) ){
            if( $file == '.' || $file == '..' || $file == '.svn' ) continue;
            $class = substr( $file, 0, -5); 
            $res[] = $class;
        }

        return $res;
    }

    public static function addCheckCode( $pName ){
        global $cfg;

        if( file_exists( 'inc/modules/'.$pName ) ){
            $res['status'] = 'exist';
        } else {
            $res = wget('http://www.kryn.org/rpc?t=checkExtensionCode&code='.$pName);
            $res = json_decode($res,1);
        }

        if( $res['status'] == 'ok' ){
            @mkdir("inc/modules/$pName");
            @mkdir("inc/template/$pName");
            $config = array(
                'version' => '0.0.1',
                'owner' => $cfg['communityId'],
                'community' => 0,
                'category' => 0,
            	'writableFiles' => 'inc/template/'.$pName.'/*',
                'title' => array(
                    'en' => 'Enter here a title for '.$pName
                ),
                'desc' => array(
                    'en' => 'Enter here a description about your extension'
                )
            );
            module::writeConfig( $pName, $config );
        }

        return $res;

    }
    
    public static function saveDb(){

        $name = getArgv('name',2);

        $config = module::loadConfig( $name );

        $db = json_decode(getArgv('tables'),true);
        $config['db'] = $db;

        module::writeConfig( $name, $config );
        json(1);
    }



    public static function saveLinks(){

        $name = getArgv('name',2);

        $config = module::loadConfig( $name );

        $admin = json_decode(getArgv('admin'),true);
        $config['admin'] = $admin;

        module::writeConfig( $name, $config );
        json(1);
    }

    public static function saveGeneral(){

        $name = getArgv('name',2);

        $config = module::loadConfig( $name );

        if( getArgv('owner') > 0 )
            $config['owner'] = getArgv('owner');

        $config['title'][ getArgv('lang') ] = getArgv('title');
        $config['desc'][ getArgv('lang') ] = getArgv('desc');
        $config['tags'][ getArgv('lang') ] = getArgv('tags');

        $config['version'] = getArgv('version');
        $config['community'] = getArgv('community');
        $config['writableFiles'] = getArgv('writableFiles');
        $config['category'] = getArgv('category');
        $config['depends'] = getArgv('depends');

        module::writeConfig( $name, $config );
        json(1);
    }



    public static function saveLayouts(){

        $themes = json_decode(getArgv('themes'),true);
        $name = getArgv('name',2);

        $config = module::loadConfig( $name );
        $config['themes'] = $themes;
        module::writeConfig( $name, $config );

        json(1);
    }

    public static function writeConfig( $pName, $pConfig ){
        $json = json_format(json_encode($pConfig));
        if( $pName == 'kryn' )
            kryn::fileWrite( "inc/kryn/config.json", $json );
        else
            kryn::fileWrite( "inc/modules/$pName/config.json", $json );
    }

    public static function getLanguage( $pModuleName, $pLang ){
        $json = kryn::fileRead( 'inc/modules/'.$pModuleName.'/lang/'.$pLang.'.json' );
        $res = json_decode($json,true);
        return $res;
    }

    public static function saveLanguage( $pModuleName, $pLang, $pLangs ){
        if( $pModuleName == 'kryn' ){
            kryn::fileWrite( 'inc/kryn/lang/'.$pLang.'.json', json_format($pLangs) );
        } else {
            @mkdir( 'inc/modules/'.$pModuleName.'/lang/' );
            kryn::fileWrite( 'inc/modules/'.$pModuleName.'/lang/'.$pLang.'.json', json_format($pLangs) );
        }
        kryn::clearLanguageCache( $pLang );
        return true;
    }

    public static function extractLanguage( $pModuleName ){
        $GLOBALS['moduleTempLangs'] = array();

        $mod = $pModuleName;

        if( $pModuleName == 'kryn' ){
            $config = kryn::fileRead( 'inc/kryn/config.json' );
            module::readDirectory( 'inc/kryn/' );
            module::readDirectory( 'inc/template/kryn' );
        } else {
            module::readDirectory( 'inc/modules/'.$mod );
            module::readDirectory( 'inc/template/'.$mod );
            $config = kryn::fileRead( 'inc/modules/'.$mod.'/config.json' );
        }

        $config = json_decode( $config, true );
        if( $config['admin'] ){
            module::extractAdmin( $config['admin'] );
        }
        if( $config['plugins'] ){
            foreach( $config['plugins'] as $plugin ){
                $GLOBALS['moduleTempLangs'][$plugin[0]] = $plugin[0];
                if( $plugin[1] && count( $plugin[1] ) > 0 ){
                    foreach( $plugin[1] as $property ){
                        $GLOBALS['moduleTempLangs'][$property['label']] = $property['label'];
                        $GLOBALS['moduleTempLangs'][$property['desc']] = $property['desc'];
                    }
                }
            }
        }
        
        if( $config['pageProperties'] ){
            foreach( $config['pageProperties'] as $property ){
                $GLOBALS['moduleTempLangs'][$property['label']] = $property['label'];
                $GLOBALS['moduleTempLangs'][$property['desc']] = $property['desc'];
            }
        }
        
    	if( $config['domainProperties'] ){
            foreach( $config['domainProperties'] as $property ){
                $GLOBALS['moduleTempLangs'][$property['label']] = $property['label'];
                $GLOBALS['moduleTempLangs'][$property['desc']] = $property['desc'];
            }
        }
        
        if( $config['widgets'] ){
            foreach( $config['widgets'] as $widget ){
                $GLOBALS['moduleTempLangs'][$widget['title']] = $widget['title'];
                if( $widget['columns'] && count( $widget['columns'] ) > 0 ){
                    foreach( $widget['columns'] as $column ){
                        $GLOBALS['moduleTempLangs'][$column[0]] = $column[0];
                    }
                }
            }
        }

        $classes = glob('inc/modules/'.$mod.'/*.class.php');
        if( count($classes) > 0 ){
            require_once('inc/kryn/windowEdit.class.php');
            require_once('inc/kryn/windowAdd.class.php');
            require_once('inc/kryn/windowList.class.php');
            foreach( $classes as $class ){
               //todo extract $fields usw 
                $classPlain = kryn::fileRead( $class );
                if( preg_match('/ extends window(Add|List|Edit)/', $classPlain )){
                    require_once( $class );
                    $className = str_replace( 'inc/modules/'.$mod.'/', '', $class );
                    $className = str_replace( '.class.php', '', $className );
                    $tempObj = new $className();
                    if( $tempObj->columns ){
                        self::extractFrameworkFields( $tempObj->columns );
                    }
                    if( $tempObj->fields ){
                        self::extractFrameworkFields( $tempObj->fields );
                    }
                    if( $tempObj->tabFields ){
                        foreach( $tempObj->tabFields as $key => $fields ){
                             $GLOBALS['moduleTempLangs'][$key] = $key;
                            self::extractFrameworkFields( $fields );
                        }
                    }
                }
            }
        }

        unset($GLOBALS['moduleTempLangs']['']);
        
        return $GLOBALS['moduleTempLangs'];
        /*
        $json = json_format( json_encode($GLOBALS['moduleTempLangs']) );
        @mkdir( 'inc/modules/'.$mod.'/lang/' );
        kryn::fileWrite( 'inc/modules/'.$mod.'/lang/en.json', $json );
        return true;
        */
    }

    public static function extractFrameworkFields( $pFields ){
        foreach( $pFields as $field ){
            $GLOBALS['moduleTempLangs'][$field['label']] = $field['label'];
            $GLOBALS['moduleTempLangs'][$field['desc']] = $field['desc'];
        }
    }

    public static function extractAdmin( $pAdmin ){
        if( is_array($pAdmin) ){
            foreach( $pAdmin as $key => $value ){
                if( $value['title'] )
                    $GLOBALS['moduleTempLangs'][$value['title']] = $value['title'];
                if( $value['type'] == 'add' || $value['type'] == 'edit' || $value['type'] == 'list' ){

                }
                if( is_array($value['childs']) ){
                    module::extractAdmin( $value['childs'] );
                }
            }
        }
    }

    public static function extractFile( $pFile ){
        $content = file_get_contents( $pFile );
        preg_replace_callback(
            "/_[l]?\('([^']*)'\)/",
            create_function(
                '$pP',
                '
                $GLOBALS[\'moduleTempLangs\'][$pP[1]] = $pP[1];
                '
            ),
            $content 
        );    
        preg_replace_callback(
            '/\[\[([^\]]*)\]\]/',
            create_function(
                '$pP',
                '
                $GLOBALS[\'moduleTempLangs\'][$pP[1]] = $pP[1];
                '
            ),
            $content 
        ); 
    }

    public static function readDirectory( $pPath ){
        $h = opendir( $pPath );
        while( $file = readdir($h) ){
            if( $file == '.' || $file == '..' ||$file == '.svn' ) continue;
            if( is_dir( $pPath.'/'.$file ) ){
                module::readDirectory($pPath.'/'.$file);
            } else {
                module::extractFile( $pPath.'/'.$file );
            }
        }
    }

    public static function removeModule( $pModuleName ){

        $files = json_decode( $_REQUEST['files'], true );
        $pModuleName = esc(str_replace("..","",$pModuleName));

        $h = fopen('inc/modules/'.$pModuleName.'/files.md5', 'r');
        mkdirr('inc/upload/modules/removeMod/');
        $id = time().$pModuleName;
        $folders = array();
        $copyBack = array();

        if( $h ) {;
            while($line = @fgets($h)) {
                $temp = explode(" ", $line);
                $md5 = substr($temp[1], 0, -1);
                $filename = $temp[0];

                $save = false;
                
                if( is_array($files) ){
                    foreach( $files as $file => $delete ){
                        //if not checked
                        if( $file == $filename && $delete != 1 )
                            $save = true;
                    }
                }


                if( $save ){
                    mkdirr("inc/upload/modules/removeMod/$id/".dirname($filename));
                    rename( $filename, "inc/upload/modules/removeMod/$id/".$filename);
                    $copyBack[] = $filename;
                } else {
                    unlink( $filename );
                }

                $folders[ dirname($filename) ] = 1;
            }
        }

        unlink( 'inc/modules/'.$pModuleName.'/files.md5' );
        
        foreach( $folders as $folder => $dummy ){
            @rmdir( $folder ); //only remove if empty folder
        }

        if( count($copyBack) > 0 )
            foreach( $copyBack as $file ){
                mkdirr( dirname($file) );
                rename( "inc/upload/modules/removeMod/$id/".$file, $file );
            }


        delDir("inc/upload/modules/removeMod/$id/");
        db::remove( $config );
        dbDelete('system_modules', "name = '$pModuleName'");

        kryn::clearLanguageCache();
        return true;
    }

    public static function getChangedFiles( $pModuleName ){

        $res = array();
        $res['modifiedFiles'] = array();

        $pModuleName = str_replace("..","",$pModuleName);
        $config = kryn::getModuleConfig( $pModuleName );
        $writableFiles = explode( "\n" , $config['writableFiles'] );

        if( is_array($writableFiles) ){
            
            $h = fopen('inc/modules/'.$pModuleName.'/files.md5', 'r');

            if( !$h ) return $res;
            $md5s = array();
            while($line = @fgets($h)) {
                $temp = explode(" ", $line);
                $temp[1] = substr($temp[1], 0, -1);
                $md5s[$temp[0]] = $temp[1];
            }

            foreach( $md5s as $file => $md5 ){
                foreach( $writableFiles as $path ){
                    if( $path != "" && preg_match('/'.str_replace('/','\/',$path).'/', $file) != 0 ){
                        if( file_exists($file) && $md5 != md5(kryn::fileRead($file)))
                            $res['modifiedFiles'][] = $file;
                    }
                }
            }
        }

        return $res;
    }

    public static function getVersion( $pName ){
    	global $cfg;
        return wget($cfg['repoServer'].'/?version='.$pName);
    }

    public static function getPackage( $pModuleName ){
        $res['file'] = module::createArchive( $pModuleName );
        json($res);
    }

    public static function publish( $pPw, $pModuleName, $pMessage ){
        global $cfg;
        $res = wget($cfg['repoServer'].'/?checkPw=1&id='.$cfg['communityId']."&pw=$pPw");
        if( $res != "1" )
            json(0);
        $file = module::createArchive( $pModuleName );
        $res = array();
        $status = wget('http://www.kryn.org/rpc?t=publish&id='.$cfg['communityId']."&pw=$pPw&message=".urlencode($pMessage), null, $file );
        $res['file'] = $file;
        $res['status'] = $status;
        json($res);
    }

    public static function createArchive( $pModuleName ){

        $config = module::loadInfo( $pModuleName );

        $temp = 'inc/upload/modules/createArchive_'.$pModuleName.'/';
        if( file_exists( $temp ) )
            delDir( $temp );
        mkdir( $temp );

        
        if( $pModuleName != 'kryn' ){
            mkdirr( $temp.'inc/modules/'.$pModuleName );
            copyr('inc/modules/'.$pModuleName, $temp.'inc/modules/'.$pModuleName);
        }

        $template = 'inc/template/'.$pModuleName;
        if( file_exists($template) ){
            mkdirr($temp.$template);
            copyr( $template, $temp.$template );
        }

        /* layouts have to stored in the module template older
         * if( $config['layouts'] ){
            mkdirr($temp.'inc/templates/css/');
            mkdirr($temp.'inc/templates/kryn/layouts/');
            foreach( $config['layouts'] as $theme ){
                foreach( $theme as $layoutFile ){
                    @copy( 'inc/template/kryn/layouts/'.$layoutFile.".tpl", $temp.'inc/template/kryn/layouts/'.$layoutFile.".tpl" );
                    @copy( 'inc/template/css/layout_'.$layoutFile.".css", $temp.'inc/template/css/layout_'.$layoutFile.".css" );
                    $themeConf .= "$layoutFile\n";
                }
            }
         }
         */

        if( $config['extraFiles'] ){
            foreach( $config['extraFiles'] as $item ){
                mkdirr( dirname($temp.$item) );
                copyr( $item, $temp.$item );
            }
        }

        include_once( 'File/Archive.php' );
        #generate md5 of each file
        
        chdir( $temp );
        $files = find('./*');
        chdir( '../../../../' );
        $md5s = "";

        if( $pModuleName == 'kryn' )
            $files[] = './.htaccess';

        $files2Compress = array();
        foreach( $files as $file ){
            if( is_dir($temp.$file) && is_dir( $temp.$file.'/.svn') ){
                delDir( $temp.$file.'/.svn' );
            } else if( !is_dir($temp.$file) && strpos($file,'files.md5') === false ) {
                $file = substr($file, 2);
                $md5s .= $file.' '.md5(kryn::fileRead($temp.$file))."\n";
                $reads[] = File_Archive::read($file, $file);
            }
        }

        if( $pModuleName == 'kryn' )
            $md5File = 'inc/kryn/files.md5';
        else
            $md5File = 'inc/modules/'.$pModuleName.'/files.md5';

        kryn::fileWrite($temp.$md5File, $md5s);

        $reads[] = File_Archive::read($temp.$md5File, $md5File);

        $archive = "inc/upload/modules/$pModuleName-".$config['version'].'_'.date("ymdhis").".zip";

        File_Archive::setOption('zipCompressionLevel', 9);
//        File_Archive::setOption('appendRemoveDuplicates', true);

        $source = File_Archive::readMulti(
            $reads
        );

        File_Archive::extract(
            $source,
            $archive
        );

        return $archive;
        
    }

    public static function dbInit( $pName ){
        $config = kryn::getModuleConfig( $pName );
        $res = db::install( $config );
        
        if( $config['extendConfig'] ){
            foreach( $config['extendConfig'] as $extendExt => $extendConfig ){
                if($extendConfig['db'] ){
                    $res .= "\n\nExtend: ".$extendExt."\n";
                    $res .= db::install( $extendConfig );
                }
            }
        }
        
        if( $config['depends'] ){
            $depends = explode(',', $config['depends']);
            foreach( $depends as $depend ){
                
                
                $del = false;
                $del = (strpos($depend, '>')===false)?$del:'>';
                $del = (strpos($depend, '=')===false)?$del:'=';
                $del = (strpos($depend, '=>')===false)?$del:'=>';
                $del = (strpos($depend, '>=')===false)?$del:'>=';
                $del = (strpos($depend, '<')===false)?$del:'<';
                $del = (strpos($depend, '<=')===false)?$del:'<=';
                $del = (strpos($depend, '=<')===false)?$del:'=<';
                
                $temp = explode($del, $depend);
                $depName = $temp[0];
                
                $depConfig = kryn::getModuleConfig( $depName );
                $res .= "\n\nDepend: ".$depName."\n";
                $res .= db::install( $depConfig );
            }
        }
        
        json($res);
    }

    public static function getPublishInfo( $pName ){
        $config = kryn::getModuleConfig( $pName );
        $res['config'] = $config;
        $res['serverVersion'] = module::getVersion( $pName );

        $files = array();
        if( count($config['extraFiles']) > 0 ){
            foreach( $config['extraFiles'] as $extraFile ){
                foreach( glob($extraFile) as $file ){
                    $files[$file] = is_dir($file)?readFolder($file):$file;
                }
            }
        }
        if( $pName != 'kryn' )
            $files['inc/modules/'.$pName.'/'] = readFolder('inc/modules/'.$pName.'/');

        $files['inc/template/'.$pName.'/'] = readFolder('inc/template/'.$pName.'/');

        $res['files'] = $files;
        json( $res );
    }

    public static function loadInstalled(){
        global $kryn, $cfg;

        $res = array();
        $mods = dbTableFetch("system_modules", -1);
        $installed = array('kryn', 'admin', 'users');
        foreach( $mods as $mod ){
            $installed[] = $mod['name'];
        }
        foreach( $installed as $mod ){
            $config = module::loadInfo( $mod );
            $res[ $mod ] = $config;
            $res[ $mod ]['activated'] = ($kryn->installedMods[$mod])?1:0;
            $res[ $mod ]['serverVersion'] =  wget($cfg['repoServer']."/?version=".$mod);
        }

        json( $res );
    }

    static public function loadLocal(){
        global $cfg, $kryn;

        $modules = kryn::readFolder( 'inc/modules' );
        $modules[] = 'kryn';
        $res = array();
        foreach( $modules as $module ){
            $config = module::loadInfo( $module );
            if( ($config['owner']+0 > 0 && $config['owner'] == $cfg['communityId'] ) || $config['owner'] == "" || !$config['owner'] ){
                $res[ $module ] = $config;
                $res[ $module ][ 'activated'] = ($kryn->installedMods[$module])?1:0;
            }
        }

        json( $res );

    }

    static public function loadConfig( $pModuleName ){
        if( $pModuleName == 'kryn' )
            $configFile = "inc/kryn/config.json";
        else
            $configFile = "inc/modules/$pModuleName/config.json";
        $json = kryn::fileRead( $configFile );
        $config = json_decode( $json, true );
        return $config;
    }

    static public function loadInfo( $pModuleName, $pType = false, $pExtract = false ){
        global $kryn, $cfg;
        
        /*
         * pType: false => load from local (dev) inc/module/$pModuleName
         * pType: path  => load from zip (module upload)
         * pType: true =>  load from inet
         */

        $pModuleName = str_replace(".", "", $pModuleName);
        $configFile = "inc/modules/$pModuleName/config.json";

        if( $pModuleName == 'kryn' )
            $configFile = "inc/kryn/config.json";

        $extract = false;

        // inet
        if( $pType === true || $pType == 1 ){
            
            $res = wget($cfg['repoServer']."/?install=$pModuleName");
            if( $res === false )
                return array('cannotConnect' => 1);
                
            $info = json_decode($res,1);
            
            if(! $info['rsn'] > 0){
                return array('notExist' => 1);
            }
            
            if( !@file_exists('inc/upload') )
                if( !@mkdir('inc/upload') )
                    klog('core', _l('FATAL ERROR: Can not create folder inc/upload.'));
                    
            if( !@file_exists('inc/upload/modules') )
                if( !@mkdir('inc/upload/modules') )
                    klog('core', _l('FATAL ERROR: Can not create folder inc/upload/modules.'));
            
            $configFile = "inc/upload/modules/$pModuleName.config.json";
            @unlink( $configFile );
            wget($cfg['repoServer']."/modules/$pModuleName/config.json", $configFile);
            if( $pExtract ){
                $extract = true;
                $zipFile = 'inc/upload/modules/'.$info['filename'];
                wget($cfg['repoServer']."/modules/$pModuleName/".$info['filename'], $zipFile);
            }
        }

        //local zip 
        if( ($pType !== false && $pType != "0") && ($pType !== true && $pType != "1") ){
            if( file_exists("inc/template/".$pType) ){
                $pType = 'inc/template/'.$pType;
            }
            $zipFile = $pType;
            $bname = basename($pType);
            $t = explode("-",$bname);
            $pModuleName = $t[0];
            $extract = true;
        }

        if( $extract ){
            @mkdir("inc/upload/modules/$pModuleName");
            include_once( 'File/Archive.php' );
            $toDir = "inc/upload/modules/$pModuleName/";
            $zipFile .= "/";
            $res = File_Archive::extract( $zipFile, $toDir );
            $configFile = "inc/upload/modules/$pModuleName/inc/modules/$pModuleName/config.json";
            if( $pModuleName == 'kryn' )
                $configFile = "inc/upload/modules/kryn/inc/kryn/config.json";
        }

        if( $configFile ){
            if(! file_exists( $configFile ) ){
                return array('noConfig' => 1);
            }
            $json = kryn::fileRead( $configFile );
            $config = json_decode( $json, true );

            if( !$pExtract ){
                @rmDir("inc/upload/modules/$pModuleName");
                @unlink($zipFile);
            }
            
            //if locale
            if( $pType == false ){
                if( is_dir("inc/template/$pModuleName/_screenshots") ) {
                    $config['screenshots'] = kryn::readFolder( "inc/template/$pModuleName/_screenshots" ); 
                }
            }

            $config['__path'] = dirname( $configFile );
            if( $kryn && is_array($kryn->installedMods) && array_key_exists( $pModuleName, $kryn->installedMods ) )
                $config['installed'] = true;
               
            $config['extensionCode'] = $pModuleName;
                
            if( $kryn->installedMods )
                foreach( $kryn->installedMods as $extender => &$modConfig ){
                    if( is_array($modConfig['extendConfig']) ){
                        foreach( $modConfig['extendConfig'] as $extendModule => $extendConfig ){
                            if( $extendModule == $pModuleName ){
                                $config['extendedFrom'][$extender] = $extendConfig;
                            }
                        }
                    }
                }
            
            return $config;
        }

    }
    
    public static function getChangedFilesForUpdate( $pConfig ){
        
        $writableFiles = explode( "\n", $pConfig['writableFiles'] );

        $modFiles = array();
        if( is_array($writableFiles) ){

            $filename = $pConfig['__path'].'/files.md5';

            $h = fopen($filename, 'r');
            $md5s = array();
            while($line = @fgets($h)) {
                $temp = explode( ' ', $line );
                $temp[1] = substr($temp[1], 0, -1);
                $md5s[ $temp[0] ] = $temp[1];
            }

            foreach( $md5s as $file => $md5 ){
                foreach( $writableFiles as $path ){
                    if( $path != "" && preg_match('/'.str_replace('/','\/',$path).'/', $file) != 0 ){
                        if( file_exists($file) && $md5 != md5(kryn::fileRead($file)))
                            $modFiles[] = $file;
                    }
                }
            }
        }
        return $modFiles;
    }

    public static function getPrepareInstall( $pModuleName, $pType ){
        global $kryn, $cfg;

        if( $pType != "0" && $pType != "1" ){
            $temp = explode("-", basename($pType));
            $pModuleName = preg_replace('/\W/', '', $temp[0]);
        }

        $info = self::loadInfo( $pModuleName, $pType, true );
        $res['module'] = $info;
        
        $modFiles = self::getChangedFilesForUpdate( $info );
        
        if( $info['depends'] ){
            $res['depends_ext'] = array();
            
            $depends = explode(',', str_replace(' ', '', $info['depends'])); 
            foreach( $depends as $depend ){
                
                
                $del = false;
                $del = (strpos($depend, '=')===false)?$del:'=';
                $del = (strpos($depend, '>')===false)?$del:'>';
                $del = (strpos($depend, '=>')===false)?$del:'=>';
                $del = (strpos($depend, '>=')===false)?$del:'>=';
                $del = (strpos($depend, '<')===false)?$del:'<';
                $del = (strpos($depend, '<=')===false)?$del:'<=';
                $del = (strpos($depend, '=<')===false)?$del:'=<';
                
                $dependInfo = explode($del, $depend);
                $dependKey = $dependInfo[0];
                
                $res['depends_ext'][ $dependKey ]['installed'] = false;
                $res['depends_ext'][ $dependKey ]['needVersion'] = $del.$dependInfo[1];
                
                if( !$kryn->installedMods[$dependInfo[0]] ){
                       
                    $res['needPackages'] = true;
                    
                } else {
                    
                    $dependConfig = $kryn->installedMods[$dependInfo[0]];
                    $res['depends_ext'][ $dependKey ]['installedVersion'] = $dependConfig['version'];
                    $res['depends_ext'][ $dependKey ]['toVersion'] = $dependInfo[1];
                    
                    if( kryn::compareVersion( $dependConfig['version'], $del, $dependInfo[1] ) ){
                        $res['depends_ext'][ $dependKey ]['installed'] = true;
                    } else {
                        $res['depends_ext'][ $dependKey ]['needUpdate'] = true;
                        
                        //todo here we need files.md5 ...
                        $res['depends_ext'][ $dependKey ]['modifiedFiles'] = self::getChangedFilesForUpdate( $dependKey );
                    }
                    
                }
                
                if( !$res['depends_ext'][ $dependKey ]['installed'] || $res['depends_ext'][ $dependKey ]['needUpdate'] ){
                    $res['needPackages'] = true;
                    
                    $res['depends_ext'][ $dependKey ]['server_version'] = false;
                    
                    
                    $serverRes = wget($cfg['repoServer'].'/?version='.$dependKey);
                    if( $serverRes && $serverRes != '' ){
                        $res['depends_ext'][ $dependKey ]['server_version'] = true;
                        if( !kryn::compareVersion( $serverRes, $del, $dependInfo[1] ) ){
                            $res['depends_ext'][ $dependKey ]['server_version_not_ok_version'] = $serverRes;
                            $res['depends_ext'][ $dependKey ]['server_version_not_ok'] = true;
                        }
                    }
                    
                    
                }
                
                
            }
        }
        
        $res['modifiedFiles'] = $modFiles;
        $res['newFiles'] = $newFiles;

        json( $res );
    }
    
    public static function getInstallInfo( $pModuleName, $pType ){
        global $kryn, $cfg;

        if( $pType != "0" && $pType != "1" ){
            $temp = explode("-", basename($pType));
            $pModuleName = preg_replace('/\W/', '', $temp[0]);
        }

        $info = self::loadInfo( $pModuleName, $pType );
        if( $info['cannotConnect'] ) 
            json( $info );
        

        $res = json_decode(wget($cfg['repoServer']."/?getAdditionalInfo=$pModuleName"), 1);
        
        $res['installed'] = false;
        
        //$serverVersion = wget("http://download.kryn.org/?version=$pModuleName");
        //$res['serverVersion'] = $serverVersion;

        $res['module'] = $info;
        
        if( $kryn->installedMods[$pModuleName] || $pModuleName == 'kryn-core' ){
            $res['installed'] = true;
            $res['installedModule'] = self::loadInfo( $pModuleName );//fetch local installed module infos
            $res[ 'activated'] = ($kryn->installedMods[$pModuleName])?1:0;
        } 
        json($res);
    }
    
    public static function installModule( $pModuleName, $pType ){
        global $cfg;
        if( $pType != "0" && $pType != "1" ){
            $temp = explode("-", basename($pType));
            $pModuleName = preg_replace('/\W/', '', $temp[0]);
        }

        $res = wget($cfg['repoServer']."/?install2=$pModuleName");
        $info = self::loadInfo( $pModuleName, $pType, true );

        $files = json_decode( $_REQUEST['files'], true );
        foreach( $files as $file => $delete ){
            if( $delete != 1 ){ //delete new file, so the old file won't overwrite
                unlink( "inc/upload/modules/$pModuleName/$file" );
            }
        }

        if( $pModuleName == 'kryn' )
            @unlink("inc/upload/modules/$pModuleName/install.php");

        $oldInfo = self::loadInfo( $pModuleName );

        # copy files
        copyr("inc/upload/modules/$pModuleName/.", ".");
        deldir("inc/upload/modules/$pModuleName");

        //update script
        $updateScript = 'inc/module/'.$pModuleName.'/update.php';
        if( file_exists( $updateScript ) ){
            $GLOBALS['oldVersion'][$pModuleName] = $oldInfo;
            include($updateScript);
        }

        @rename( 'install.php', 'install.php.'.rand(123,5123).rand(585,2319293).rand(9384394,313213133) );
        # db install
        if( $pModuleName != 'kryn' ){
            dbDelete('system_modules', "name = '$pModuleName'");
            dbExec("INSERT INTO %pfx%system_modules VALUES('".$pModuleName."', 1)");
            db::install( $info );
        }
        
        if( $info['extendConfig'] ){
            foreach( $info['extendConfig'] as $extendConfig ){
                if($extendConfig['db'] ){
                    db::install( $extendConfig );
                }
            }
        }
        
        require_once('inc/modules/admin/admin.class.php');
        admin::clearCache();

        return true;
    }

    //list all modules which have plugins -> for pluginChoooser
    public static function getModules(){
        global $kryn, $user;

        $lang = $user->user['settings']['adminLanguage']?$user->user['settings']['adminLanguage']:'en';

        foreach( $kryn->installedMods as $key => $config ){
            if( !$config['plugins'] ) continue;
            $config['title'] = $config['title'][$lang] ? $config['title'][$lang] : $config['title']['en'];
            $config['name'] = $key;

            $res[] = $config;
        }

        json( $res );
    }
    
    public static function check4updates(){
        global $kryn, $cfg;
        
        $res['found'] = false;
        
        # add kryn-core
        $tmodules = array_merge(array($kryn), $kryn->installedMods);
        
        foreach($tmodules as $key => $config){
            $version = '0';
            $name = $key;
            $version = wget($cfg['repoServer']."/?version=$name");
            if( $version && $version != $config['version'] && $version != ''){
                $res['found'] = true;
                $temp = array();
                $temp['newVersion'] = $version;
                $temp['name'] = $name;
                $res['modules'][] = $temp;
            }
        }
        
        json( $res );
    }

    /*
    function devRemove( $pModule ){
        dbExec( "DELETE FROM %pfx%system_modules WHERE name = '$pModule'" );
        db::remove( $pModule );
        return 'Ok';
    }

    function devUpdate( $pModule ){
        self::create2ndClass( $pModule );
        require( "inc/modules/$pModule/$pModule.class.php.new" );
        $module = new $pModule();
        $module->update();
        return 'ok';
    }

    function devInstall( $pModule ){
        dbExec( "INSERT INTO %pfx%system_modules VALUES('$pModule', 1)" );
        return '<pre>'.db::install( $pModule ).'</pre>';
    }
    */

    public static function deactivate($pName){
        dbUpdate('system_modules', array('name' => $pName), array('activated'=>0));
        kryn::clearLanguageCache();
        json(1);
    }
    
    public static function exists( $pModule ){
        global $kryn;
        if( $kryn->installedMods[ $pModule ] )
            return true;
        return false;
    }
    
    public static function activate($pName){
        $row = dbTableFetch('system_modules', 1, "name = '".esc($pName)."'");
        if( $row['name'] == '' )
            dbInsert('system_modules', array('name' => $pName, 'activated'=>1));
        else
            dbUpdate('system_modules', array('name' => $pName), array('activated'=>1));
        kryn::clearLanguageCache();
        json(1);
    }
    /*
    
    function deinstall($pName, $pLinks = array()){

        $info = self::loadInfo( $pName );
        $filename = $info['__path'].'/files.md5';

        $h = @fopen($filename, 'r');
        $md5s = array();
        while($line = @fgets($h)) {
            $temp = explode( '  ', $line );
            $temp[1] = substr( $temp[1], 0, -1);
            @unlink( $temp[1] );
        }

        dbDelete('system_modules',"`name` = '".strtolower($pName)."'");
        delDir("inc/modules/$pName/");
        delDir("inc/template/$pName/");
        json(1);
    }
         */
    
    public static function readDirRekursiv( $pDir ){
        global $step2;
        $res = array();

        $file = $pDir;
        if(! is_dir( $file ) ) {
            $res[] =  $file;
        }
        if( is_dir($file) === TRUE ){
            $dir = opendir( $file );
            while (($_file = readdir($dir)) !== false){
                if( $_file != '..' && $_file != '.' && $_file != '.svn' ){
                    $res = array_merge($res, self::readDirRekursiv( $file.'/'.$_file ) );
                }
            }
        }
        return $res;
    }

}

?>

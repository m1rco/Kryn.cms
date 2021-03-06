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




class window {

    public static function init(){
        
        switch( getArgv(4) ){
        case 'custom':
            return window::custom();
        case 'checkAccess':
            return window::checkAccess();
        case 'getInfo':
            json( window::getInfo( getArgv('module'), getArgv('code') ) );
        case 'loadClass': 
            return window::loadClass();
        case 'sessionbasedFileUpload': 
            return window::sessionbasedFileUpload();
        default: 
            json('window::init::no-param-4');
        }
    }

    public static function checkAccess( $pRes = false ){
        $url = getArgv('module').'/'.getArgv('code');

        if( getArgv('module') != 'admin' )
            $url = 'admin/'.$url;
        
        $res = kryn::checkUrlAccess( $url );

        if( $pRes )
            return $res;
        else
            json($res); 
    }

    public static function loadClass(){
        global $kryn;

        if(! self::checkAccess(true) ) json(false);

        require( 'inc/kryn/windowList.class.php' );
        require( 'inc/kryn/windowEdit.class.php' );
        require( 'inc/kryn/windowAdd.class.php' );
        $module = getArgv('module');
        $code = getArgv('code');

        $info = self::getInfo( $module, $code );
        $class = $info['values']['class'];

        
        $module2LoadClass = $module;
        
        if( strpos($class, '/') ){
            $t = explode('/', $class);
            $module2LoadClass = $t[0];
            $class = $t[1];
        }
        

        if( file_exists( "inc/modules/$module2LoadClass/$class.class.php" ) ){
            require( "inc/modules/$module2LoadClass/$class.class.php");
            $obj = new $class;
        } else {
            $form = kryn::fileRead( "inc/modules/$module2LoadClass/forms/$class.json" );
            $formObj = json_decode( $form, 1 );

            $type = $formObj['type'];

            $obj = new $type();

            foreach( $formObj as $optKey => $optVal )
                $obj->$optKey = $optVal;

            $obj->myconstruct();
        }
        $config = $kryn->installedMods[$module];


//        $dbFile = "inc/modules/$module/db.php";
//        if( file_exists($dbFile) )
//            require($dbFile);

        $obj->db = ($config['db'])?$config['db']:array();
        $obj->init();

        switch( getArgv(5) ){
        case 'getItems':
            $obj->params = json_decode( getArgv('params') );
            json( $obj->getItems(getArgv('page')) );
        case 'exportItems':
            $obj->params = json_decode( getArgv('params') );
            json( $obj->exportItems(getArgv('page')) );
        case 'getItem':
            json( $obj->getItem() );
        case 'saveItem':
            json( $obj->saveItem() );
        case 'deleteItem':
            json( $obj->deleteItem() );
        case 'removeSelected':
            json( $obj->removeSelected() );
        default:
            json( $obj->init() );
        }    

    }

    public static function getInfo( $pModule, $pCode ){
        global $kryn;

        $pModule = preg_replace('/\W/', '', $pModule);
        
        $url = $pModule.'/'.$pCode;
        
        $res = kryn::checkUrlAccess( $url );
        if(!$res){
            json(array('noAccess'=>1));
        }

        $codes = explode( '/', $pCode );
        $adminInfo = $kryn->installedMods[$pModule]['admin'];
        
        
        $_info = $adminInfo[$codes[0]];
        $count = count($codes);
        if( $count > 1 ){
            for($i=1;$i<=$count;$i++){
                if( $codes[$i] != "" )
                    $_info = $_info['childs'][$codes[$i]];
            }
        }
        if( !$_info ){
            json(array('pathNotFound' => 1));
        }
        
        
        $cssPath = str_replace( '/', '_', $pCode ); //this.code.replace(/\//g,'_');;
        if( $pModule == 'admin' ){
            $cssPath = 'inc/template/admin/css/'.$cssPath.'.css';
        } else {
            $cssPath = 'inc/template/'.$pModule.'/admin/css/'.$cssPath.'.css';
        }
        if( file_exists( $cssPath ) )
            $_info['cssmdate'] = filemtime( $cssPath );
        
        return array('values'=>$_info);
    }

    public static function custom(){
        if( getArgv(5) == 'js' ){
            $module = getArgv('module');
            $code = getArgv('code');
            if( $module == 'admin' )
               $file = "inc/template/admin/js/$code.js";
            else
                $file = "inc/template/$module/admin/js/$code.js";

            if(! file_exists($file) ){
                print "contentCantLoaded_".getArgv('onLoad')."('$file');\n";
            } else {
                readFile( $file );
                print "\n";
                print "contentLoaded_".getArgv('onLoad').'();'."\n";
            }
            die();
        }
    }
    
    public static function sessionbasedFileUpload() {
        //get session id
        $sessionId = getArgv('krynsessionid');        
        
        //path for session folder
        $path = 'inc/template' . getArgv( 'path' ) . $sessionId;
        $path = str_replace( "..", "", $path );
        
        //make folder if not exists
        if(!is_dir($path))
            mkdir( $path );

        //override path    
        $_REQUEST['path'] = $_POST['path'] = $_GET['path'] = getArgv( 'path' ) . $sessionId;
        
        
        //now upload the file
        return filemanager::uploadFile();
        
    }

}

?>

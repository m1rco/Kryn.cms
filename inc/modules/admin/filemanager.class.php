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




class filemanager {

    public static function init(){
/*
        kryn::addJs( 'admin/filemanager.js' );
        kryn::addJs( 'admin/swfupload.js' );
        kryn::addJs( 'admin/fuploader.js' );
        kryn::addCss( 'admin/filemanager.css' );
*/
        switch( getArgv(3) ) {
        case 'loadFolder':
            return filemanager::loadFolder( getArgv('path') );
        case 'getImages':
            return filemanager::getImages( getArgv('dir') );
        case 'loadModules':
            return filemanager::loadModules();
        case 'getFile':
            return filemanager::getFile( getArgv('path') );
        case 'getFileInfo':
            json( filemanager::getFileInfo( getArgv('path'), getArgv('withSize') != ''? true:false, true ) );
        case 'getVersions':
            json( filemanager::getVersions( "inc/template/".getArgv('path')) );
        case 'addVersion':
            json( filemanager::addVersion( "inc/template/".getArgv('path')) );
        case 'setAccess':
            json( filemanager::setAccess( "inc/template/".getArgv('path'), getArgv('access') ) );
        case 'recoverVersion':
            json( filemanager::recoverVersion( getArgv("rsn") ) );
         case 'newFile':
            return filemanager::newFile();
        case 'newFolder':
            return filemanager::newFolder();
        case 'saveFile':
            return filemanager::saveFile();
        case 'renameFile':
            return filemanager::renameFile();
        case 'duplicateFile':
            return filemanager::duplicateFile(getArgv('path'), getArgv('newname'));
        case 'cutFile':
            return filemanager::cutFile();
        case 'upload':
            return filemanager::uploadFile();
        case 'deleteFile':
            return filemanager::delFile();
        case 'setFilesystem':
            json( filemanager::setFilesystem( "inc/template/".getArgv('path'), getArgv('chmod'), getArgv('user'), getArgv('owner'), (getArgv('sub')==1)?true:false ) );
        case 'getOwnerNames':
           json( filemanager::getOwnerNames( getArgv('ownerid'), getArgv('groupid')) );
        case 'getOwnerIds':
           json( filemanager::getOwnerIds( getArgv('owner'), getArgv('group')) );
        case 'rotate':
            return json( filemanager::rotateFile( getArgv('file'), getArgv('position') ) );
        case 'recover':
            return json(filemanager::recover(getArgv('rsn')));
        case 'resize':
            return json(filemanager::resize(getArgv('file'), getArgv('width')+0, getArgv('height')+0));
        case 'paste':
            return filemanager::paste();
        case 'search':
            return json( filemanager::search( getArgv('q'), getArgv('path') ) );
        case 'setInternalAcl':
            return json( filemanager::setInternalAcl( getArgv('path'), getArgv('rules') ) );
        case 'diffFiles':
            filemanager::diffFiles(getArgv('from'), getArgv('to'));
        }
    }
    
    public static function diffFiles($pFrom, $pTo)
    {
        require_once('inc/modules/admin/FineDiff.class.php');
        
        $textFrom = filemanager::readFile($pFrom);
        $textTo = filemanager::readFile($pTo);
        
		$textFrom = str_replace("\r\n", "\n", $textFrom);
		$textTo = str_replace("\r\n", "\n", $textTo);
		
        $diff = FineDiff::getDiffOpcodes($textFrom, $textTo);
		
        //$htmlOutput = $diff->renderDiffToHTML();
        
        // Fix newlines and spaces
        //$htmlOutput = nl2br($htmlOutput);
        //$htmlOutput = str_replace(" ", "&nbsp;", $htmlOutput);
        
        json($diff);
    }
    
    private static function readFile($pPath)
    {
        $path = str_replace("..", "", $pPath);
        
        // Template file
        if( file_exists("inc/template/$path") )
        {
            $access = acl::checkAccess(3, '/'.$path, 'read', true);
            if(!$access)
                return 'no-access';
            // On access return file contents
            return kryn::fileRead("inc/template/$path");
        }
        // Normal file
        else if(file_exists($path))
            return kryn::fileRead($path);
        
        // File does not exist
        return '';
    }
    
    public static function renameVersion( $pFrom, $pTo ){
        
        //todo
    }
    
     public static function renameAcls( $pFrom, $pTo ){
        
        //todo
    }
    
    public static function setInternalAcl( $pFilePath, $pRules ){

        $pFilePath = esc( '/'.$pFilePath );
        
        dbDelete('system_acl', "type = 3 AND code LIKE '$pFilePath\[%'");
        
        //SELECT * FROM krynsvn7_system_acl WHERE code LIKE '/googleanalytics/\\%%'
        dbDelete('system_acl', "type = 3 AND code LIKE '$pFilePath\\\%%'");
        
        $row = dbExfetch('SELECT MAX(prio) as maxium FROM %pfx%system_acl');
        $prio = $row['maxium'];
        if( is_array($pRules) ){
            foreach( $pRules as $rule ){
                $prio++;
                $rule['prio'] = $prio;
                $rule['type'] = 3;
                $rule['code'] = str_replace('//', '/', $rule['code']);
                dbInsert('system_acl', $rule);
                
            }
        }
        
    }
    
    public static function setFilesystem( $pPath, $pChmod, $pOwner = false, $pGroup = false, $pWithSub = false ){
        
        
        $pPath = str_replace("..", '', $pPath);
        chmod( $pPath, octdec('0'.$pChmod) );
        chown( $pPath, $pOwner );
        chgrp( $pPath, $pGroup );
        
        if( $pWithSub ){
            
            if( is_dir($pPath) ){
                $h = opendir( $pPath );
                if( $h ){
                    while (($file = readdir($h)) !== false) {
                        if( $file == '.' || $file == '..' || $file == '.svn' ) continue;
                        self::setFilesystem( $pPath.'/'.$file, $pChmod, $pOwner, $pGroup, $pWithSub );
                    }
                }   
            }
        }
        return true;
    }
    
    
    public static function getOwnerIds( $pOwner, $pGroup ){
        
        $owner = posix_getpwnam( $pOwner );
        $group = posix_getgrnam( $pGroup );
        $res['owner'] = $owner['uid'];
        $res['group'] = $group['gid'];
        
        return $res;
    }
    
    public static function getOwnerNames( $pOwnerId, $pGroupId ){
        
        $owner = posix_getpwuid( $pOwnerId );
        $group = posix_getgrgid( $pGroupId );
        $res['owner'] = $owner['name'];
        $res['group'] = $group['name'];
        
        return $res;
    }
    
    public static function setAccess( $pPath, $pAccess ){
        
        if( is_dir($pPath) )
            $dir = substr($pPath, 0, -1);
        else
            $dir = dirname( $pPath );
            
        if( $pAccess != 'allow' && $pAccess != 'deny' && $pAccess != '' )
            return false;
        
        if( !file_exists( $dir ) ){
            return false;
        }
        
        $htaccess = $dir.'/.htaccess';
        if( !file_exists( $htaccess) && !touch($htaccess) ){
            klog('files', _('Can not set the file access, because the system can not create the .htaccess file'));
            return false;
        }
        
        $content = kryn::fileRead( $htaccess );
        
        if( !is_dir($pPath) ){
            $filename = '"'.basename( $pPath ).'"';
            $filenameesc = $filename;
        } else {
            $filename = "*";
            $filenameesc = '\*';
        }
        
        $content = preg_replace('/<Files '.$filenameesc.'>\W*(\w*) from all[^<]*<\/Files>/i', '', $content);

        if( $pAccess != '' ){
            
            $content .= "
<Files $filename>
$pAccess from all
</Files>";
            }
	
	    kryn::fileWrite( $htaccess, $content );
	    
	    return true;
        
    }
    
    public static function recoverVersion( $pRsn ){
        
        $pRsn = $pRsn+0;
        $version = dbTableFetch("system_files_versions", "rsn = ".$pRsn, 1);
        
        if( !file_exists($version['versionpath']) ){
            klog('files', str_replace('%s', $version['versionpath'], _l('Can not recover the version for file %s')) );
            return false;
        }
        
        self::addVersion( $version['path'] );
        
        copy( $version['versionpath'], $version['path'] );
        
        return true;
        
    }
    
    public static function getVersions( $pPath ){
        $pPath = str_replace("..", ".", esc($pPath));
        $pPath = str_replace("//", "/", $pPath);
        
        $versions = dbExfetch("
        	SELECT v.*, u.username
        	FROM %pfx%system_files_versions v, %pfx%system_user u
        	WHERE
        		u.rsn = v.user_rsn AND 
        		path = '".$pPath."'
        	ORDER BY v.rsn DESC
        ", -1);
        
        foreach( $versions as &$version ){
            $version['size'] = self::sizeFormat( filesize( $version['versionpath'] ) );
        }
        
        return $versions;
    }
    
    /**
     * Adds a new version in the files_versions table for given path
     */
    public static function addVersion( $pPath ){
        global $user;
        
        $pPath = str_replace("..", ".", $pPath);
        $pPath = str_replace("//", "/", $pPath);
        
        if( !file_exists( $pPath ) ) return false;
        
        if( !file_exists('inc/fileversions/') ){
            if( !mkdir('inc/fileversions/') ){
                klog('files', _l('Can not create the file versions folder inc/fileversions/, so the system can not create file versions.') );
                return;
            }
        }
        
        $versionpath = kryn::toModRewrite( $pPath );
        
        $rand = md5(filemtime($pPath). mt_rand(1,100). mt_rand(1,12200) . time());
        
        $versionpath = 'inc/fileversions/'.$rand.'.'.$versionpath.'.ver';
        
        copy($pPath, $versionpath);
        
        $insert = array(
            'user_rsn' => $user->user_rsn,
            'path' => $pPath,
            'created' => time(),
            'mtime' => filemtime( $pPath ),
            'versionpath' => $versionpath
        );
        
        dbInsert('system_files_versions', $insert);
        
        return true;
    }
    
    
    public static function resize( $pFile, $pWidth, $pHeight ){
        $pFile = 'inc/template/'.str_replace('..', '', $pFile);

        list( $oriWidth, $oriHeight, $type ) = getimagesize( $pFile );
        switch( $type ){
            case 1:
                $imagecreate = 'imagecreatefromgif';
                $imagesave = 'imagegif';
                break;
            case 2:
                $imagecreate = 'imagecreatefromjpeg';
                $imagesave = 'imagejpeg';
                break;
            case 3:
                $imagecreate = 'imagecreatefrompng';
                $imagesave = 'imagepng';
                break;
        }


        $imageNew = imagecreatetruecolor($pWidth, $pHeight);
        $image = $imagecreate($pFile);

        imagecopyresampled($imageNew, $image, 0, 0, 0, 0, $pWidth, $pHeight, $oriWidth, $oriHeight);
        
        self::addVersion( $pFile );
        $imagesave( $imageNew, $pFile );
        
        return filemtime( $pFile );
    }
    
    
    public static function rotateImage($image) {
      $width = imagesx($image);
      $height = imagesy($image);
      $newImage= imagecreatetruecolor($height, $width);
      imagealphablending($newImage, false);
      imagesavealpha($newImage, true);
      for($w=0; $w<$width; $w++)
          for($h=0; $h<$height; $h++) {
              $ref = imagecolorat($image, $w, $h);
              imagesetpixel($newImage, $h, ($width-1)-$w, $ref);
          }
      return $newImage;
    }
    
    
    public static function rotateFile( $pFile, $pPosition ){
        global $user;

        $pFile = 'inc/template/'.str_replace('..', '', $pFile);

        list( $oriWidth, $oriHeight, $type ) = getimagesize( $pFile );
        switch( $type ){
            case 1:
                $imagecreate = 'imagecreatefromgif';
                $imagesave = 'imagegif';
                break;
            case 2:
                $imagecreate = 'imagecreatefromjpeg';
                $imagesave = 'imagejpeg';
                break;
            case 3:
                $imagecreate = 'imagecreatefrompng';
                $imagesave = 'imagepng';
                break;
        }

        $source = $imagecreate($pFile);

        $degrees = 90;
        if( $pPosition == 'left' )
            $degrees *= -1;
        
        if( function_exists("imagerotate") ){
            $rotate = imagerotate($source, $degrees, 0);
        } else {
            if( $pPosition == 'left' ){
                $rotate = self::rotateImage($source);
            } else {
                $rotate = self::rotateImage($source);
                $rotate = self::rotateImage($rotate);
                $rotate = self::rotateImage($rotate);
            }
        }
        
        
        self::addVersion( $pFile );
        
        $imagesave( $rotate, $pFile );

        return filemtime($pFile);
    }
    
    

    public static function getImages( $pDir ){

        if( $pDir == '' )
            $pDir == '/';

        $pDir = str_replace('//', '', $pDir);
        //$pDir = dirname( $pDir );
        
        if( substr( $pDir, -1 ) != '/' )
            $pDir .= '/';
            
        
        //if( $pDir == './' )
        //    $pDir = '';
        
            
            
        $access = acl::checkAccess( 3, '/'.$pDir, 'read', true );
        if( !$access ) json('no-access');

        $dh = opendir( 'inc/template/'.$pDir );
        while( $file = readdir($dh) ){
            if( $file == '.svn' || $file == '.' || $file == '..' ) continue;
            
            $ext = "";
            $pos = strrpos($file, '.');
            if( $pos > 0 )
                $ext = strtolower(substr( $file, $pos+1, strlen($file) ));

            if( $ext == 'jpg' || $ext == 'png' || $ext == 'bmp' || $ext == 'gif' ){
                $items[] = $pDir . $file;
            }
        }

        json( $items );
    }

    public static function imageThump( $pPath ){
        $path = str_replace("..", "", $pPath );
        $path = preg_replace('/\\\\+/', "/", $path);
        $path = utf8_encode( $path );
        if( substr( $path, 0, 1 ) != '/' )
            $path = '/'.$path;
        $cfile = $path;
        $file = 'inc/template'.$path;
        $path = preg_replace('/\/\/+/', "/", $path);
        
        $file = resizeImageCached( $path, '120x70', true );
        
        $access = acl::checkAccess( 3, '/'.$cfile, 'read', true );
        if( !$access ) json('no-access');

        list( $oriWidth, $oriHeight, $type ) = getimagesize( $file );
        switch( $type ){
            case 1:
                $imagecreate = 'imagecreatefromgif';
                $imagesave = 'imagegif';
                $mime = "image/gif";
                break;
            case 2:
                $imagecreate = 'imagecreatefromjpeg';
                $imagesave = 'imagejpeg';
                $mime = "image/jpeg";
                break;
            case 3:
                $imagecreate = 'imagecreatefrompng';
                $imagesave = 'imagepng';
                $mime = "image/png";
                break;
        }
        if(! $imagecreate )
            return;
            
        $img = $imagecreate( $file );
        header("Content-Type: ".$mime.";");

        //$thumpHeight = 70;
        //$thumpWidth = 120;
        //$tempImg = imagecreatetruecolor( $thumpWidth, $thumpHeight );
        //imagecopyresampled( $tempImg, $img, 0, 0, 0, 0, $thumpWidth, $thumpHeight, $oriWidth, $oriHeight);
        $imagesave($img);
        die(); 
    }
    
    public static function loadModules(){
        global $kryn;
        
        $h = opendir( 'inc/template/' );
        $mfiles = array();
        while( $file = readdir($h) ){
            if( $file != '.' && $file != '..' && $file != '.svn' &&
                $file != 'admin' && $file != 'css' && $file != 'images' && $file != 'js' && $file != 'kryn' ){
                if( $kryn->installedMods[ $file ] ){
                    $mfiles[] = '/'.$file; 
                }
            }
        }
        json($mfiles);
    }

    public static function uploadFile(){

        $name = $_FILES['file']['name'];
        $path = getArgv('path');
        if( substr( $path, -1 ) != '/' )
            $path = $path . '/';


        $newPath = 'inc/template' . $path . '/' . $name;
        $newPath = str_replace( "..", "", $newPath );
        if( getArgv('overwrite') != "1" ){
            $exist = file_exists( $newPath );
            $_id = 0;
            while( $exist ){
                $extPos = strrpos($name,'.');
                $ext = substr($name, (strlen($name)-$extPos)*-1 );
                $tName = substr($name, 0, $extPos );
                $_id++;
                $newName = $tName.'-'.$_id.$ext;
                $newPath = 'inc/template' . $path . $newName;
                $exist = file_exists( $newPath );
            }
        } else {

        }
        
        
        $toDir = dirname($newPath);
        $access = acl::checkAccess( 3, '/'.$newFilePath, 'write', true );
        if( !$access ) json('no-access');
        
        move_uploaded_file($_FILES["file"]["tmp_name"], $newPath );
        $res = substr( $newPath, 12 );
        if( getArgv('output') == 'html' )
            die($res);
        else
            json($res);
    }
    
    public static function duplicateFile( $pOriFile, $pToFileName ){
        
        $pOriFile = str_replace( "..", "", $pOriFile );
        $pToFileName = str_replace( "..", "", $pToFileName );
        $pToFileName = str_replace( "/", "", $pToFileName );
       
        $folder = str_replace( "\\", "/", dirname($pOriFile) );
        
        $newFilePath = $pToFileName;
        
        if( $folder != '.' )
            $newFilePath = $folder.'/'.$newFilePath;
            
        $newFilePath = str_replace( "//", "/", $newFilePath);
        
        
        $toDir = dirname($path);
        $access = acl::checkAccess( 3, '/'.$newFilePath, 'write', true );
        if( !$access ) json('no-access');
        
        $access = acl::checkAccess( 3, '/'.$pOriFile, 'read', true );
        if( !$access ) json('no-access');
        
        copyr( "inc/template/".$pOriFile, "inc/template/".$newFilePath);
        json(true);
    }

    public static function newFolder(){
        $path = 'inc/template' . getArgv( 'path' ) . '/' . getArgv( 'name' );
        $path = str_replace( "..", "", $path );
        
        
        $toDir = str_replace('..', '', getArgv( 'path' ));
        $access = acl::checkAccess( 3, $toDir, 'write', true );
        if( !$access ) json('no-access');
        
        mkdir( $path );
        json(true);
    }

    public static function newFile(){
        $path = getArgv( 'path' ) . '/' . getArgv( 'name' );
        $path = str_replace( "..", "", $path );
        
        $toDir = str_replace('..', '', getArgv( 'path' ));
        $access = acl::checkAccess( 3, $toDir, 'write', true );
        if( !$access ) json('no-access');
        
        
        kryn::writeTempFile( $path, '' );
        json(true);
    }

    public static function saveFile(){
        $path = getArgv( 'path' );
        $path = str_replace( "..", "", $path );
        
        $dir = dirname( $path );
        
        if( substr($dir, 0, 1 ) != '/' )
          $dir = "/$dir";
          
        $dir = "inc/template/$dir";
        
        if( !is_dir($dir) && !is_file($dir) ){
            @mkdirr($dir );
        }
        
        $access = acl::checkAccess( 3, '/'.$path, 'write', true );
        
        if( $access ){
            self::addVersion( "inc/template/".$path );
            kryn::writeTempFile( $path, $_POST['content'] );
            json(true);
        } else {
            json('no-access');
        }
        
    }

    public static function renameFile(){
        $path = getArgv( 'path' ) . getArgv( 'name' );
        $newpath = getArgv( 'path' ) . getArgv( 'newname' );
        $path = str_replace( "..", "", $path );
        $newpath = str_replace( "..", "", $newpath );
        
        
        $toDir = dirname( $newpath );
        
        $access = acl::checkAccess( 3, '/'.$path, 'read', true );
        if( !$access ) json('no-access');
        
        $access = acl::checkAccess( 3, '/'.$toDir, 'write', true );
        if( !$access ) json('no-access');
        
        if( file_exists('inc/template/'.$newpath) )
            json(false);
        
        rename( 'inc/template/'.$path, 'inc/template/'.$newpath );
        
        self::renameVersion( 'inc/template/'.$path, 'inc/template/'.$newpath );
        self::renameAcls( $path, $newpath );
        
        json(true);
    }

    public static function getFile( $pPath ){
        json( filemanager::readFile($pPath) );
    }
    
    public static function recover( $pRsn ){
        
        $item = dbTableFetch('system_files_log', 1, "rsn = ".($pRsn+0));
        if( $item['rsn'] > 0 ){
        
            $nPath = str_replace('inc/template', '', $item['path']);
            $toDir = dirname($nPath);
            
            $access = acl::checkAccess( 3, '/'.$toDir, 'write', true );
            if( !$access ) json('no-access');
            
            $access = acl::checkAccess( 3, '/'.$nPath, 'write', true );
            if( !$access ) json('no-access');
            
            if( file_exists($item['path']) ){
                self::addVersion( $item['path'] );
            }
        
            rename( "inc/template/trash/".$item['rsn'], $item['path'] );
            
            dbDelete('system_files_log', "rsn = ".$item['rsn']);
        }
        return true;
        
    }

    public static function delFile(){
        
        $path = 'inc/template' . getArgv( 'path' ) . getArgv( 'name' );
        $path = str_replace( "..", "", $path );
        
        $trash = 'inc/template/trash/';
        
        if( getArgv('path') == '/trash/' ){
            
            $trashItem = dbTableFetch('system_files_log', 1, "rsn = ".(getArgv( 'name', 1 )+0));
            dbDelete('system_files_log', "rsn = ".$trashItem['rsn']);
            if(is_dir( $path )) {
                delDir($path);
            } else {
                unlink($path);
            }
            
        } else {
        
            if( !file_exists($path) ) return false;
            
            $nPath = str_replace('inc/template', '', $path);
            
            $access = acl::checkAccess( 3, $nPath, 'write', true );
            if( !$access ) json('no-access');
            
            $newTrashId = dbInsert('system_files_log', array(
                'path' => $path,
                'modified' => filemtime( $path ),
                'created' => time(),
                'type' => (is_dir($path)) ? 1:0
            ));
            
            $target = $trash.$newTrashId;
            
            if(is_dir( $path )) {
                filemanager::copyDir($path, $target);
                delDir( $path );
            } else {
                copy( $path, $target );
                unlink( $path );
            }
        } 
        
        json(true);
    } 

    public static function copyDir($src, $dst){ 
        $src = str_replace( "..", "", $src );
        $dir = opendir( $src );
        mkdir( $dst ); 
            while( false !== ( $file = readdir( $dir )) ) { 
            if (( $file != '.' ) && ( $file != '..' )) { 
                if ( is_dir( $src .'/'.$file ) ) { 
                    filemanager::copyDir( $src.'/'.$file, $dst.'/'.$file ); 
                } 
                else { 
                    copy( $src.'/'.$file, $dst.'/'.$file ); 
                } 
            } 
        } 
        closedir($dir);
    }

    public static function paste(){
        
        $from = getArgv('from');
        $move = (getArgv('move') == 1)?true:false;

        $to = str_replace(".", "", getArgv('to'));
        
        if( substr($to, -1, 1) != '/' ) //need last /
            $to .= '/';

        if( substr($to, 0, 1) != '/' ) //need first /
            $to = '/'.$to;
            
            
        $access = acl::checkAccess( 3, $to, 'write', true );
        if( !$access ) json('no-access');

        $to = "inc/template$to";

        $exist = false;
        if( is_array($from) ){
            foreach( $from as $file ){
                if( file_exists( $to . basename($file) ) )
                    $exist = true;
            }
        }

        if( getArgv('overwrite') != "true" && $exist ){
            return json(array('exist'=>true));
        }

        if( is_array($from) ){
            foreach( $from as $file ){
                $file = str_replace("..", "", $file);
                
                $access = acl::checkAccess( 3, '/'.$file, 'read', true );
                if( $access ){
                    if( $move )
                        rename( "inc/template/$file", $to.basename($file) );
                    else
                        copyr( "inc/template/$file", $to.basename($file) );
                }
            }
        }

        json(1);
    }

    /*
   public static function copyFile(){
        $srcPath = 'inc/template'.getArgv( 'srcPath' );
        $dstPath = 'inc/template'.getArgv( 'dstPath' );
        $srcPath = str_replace( "..", "", $srcPath );
        $dstPath = str_replace( "..", "", $dstPath );
        
        if(is_dir( $srcPath )) {
            filemanager::copyDir($srcPath, $dstPath);
        } else {
            copy( $srcPath, $dstPath );
        }

        json(true);
   }

   public static function cutFile(){
        $srcPath = 'inc/template'.getArgv( 'srcPath' );
        $dstPath = 'inc/template'.getArgv( 'dstPath' );
        $srcPath = str_replace( "..", "", $srcPath );
        $dstPath = str_replace( "..", "", $dstPath );
        
        if(is_dir( $srcPath )) {
            filemanager::copyDir($srcPath, $dstPath);
            delDir( $srcPath );
        } else {
            copy( $srcPath, $dstPath );
            unlink( $srcPath );
        }

        json(true);
    }
    */
    
    public static function search( $pQuery, $pPath = '', $pMax = 20 ){
    
        $pPath = 'inc/template/'.str_replace('..', '', $pPath);
        
        $pPath = str_replace('//', '/', $pPath).'*';
        $items = find( $pPath );
        $result = array();
        
        $found = 0;
        $maxFileSize4ContentSearch = 1024*1024*8; //
        $pQuery = str_replace( '*', '.*', $pQuery );
        foreach( $items as &$item ){
            
            
            $access = acl::checkAccess( 3, str_replace('inc/template', '', $file), 'read', true );
            if( $access ){
                if( substr($item, 0, 7) == '/trash/'){
                    continue;
                }
                
                if( $found >= $pMax ){
                    break;
                }
                if( preg_match( '/'.$pQuery.'.*/', basename($item) ) ){
                    $result[] = self::getFileInfo( $item );
                    $found++;
                    continue;
                }
                
                if( filesize($item) < $maxFileSize4ContentSearch ){
                    $content = kryn::fileRead( $item );
                    if( preg_match( '/'.$pQuery.'/', $content ) || strpos( $content, $pQuery ) !== false ){
                        $result[] = self::getFileInfo( $item );
                        $found++;
                    }
                    unset( $content );
                    
                    continue;
                }
            }
            
        }
        
        return $result;
    
    }
    
    public static function getFileInfo( $pPath, $pWithSize, $pWithAccess ){
        
        $path = str_replace('..', '', $pPath); 
        $path = str_replace('//', '/', $path);
        $path = str_replace('//', '/', $path);
        $path = str_replace('//', '/', $path);
        
        
        if( strpos($path, 'inc/template') === false )
        	$path = str_replace( '//', '/', 'inc/template/'.$path);

        if( !file_exists($path) ){
        	return false;
        }
        	
       	$res['location'] = getcwd().'/'.$path;
        $res['path'] = str_replace( '//', '/', str_replace( 'inc/template/', '', $path ));
        
        if( substr($res['path'], 0, 1) == '/' ){
            $res['path'] = substr($res['path'], 1);
        }
        $res['type'] = (is_dir($path)) ? 'dir':'file';
        $res['ext'] = '';
        
        if( substr($res['path'], -1, 1) != '/' && $res['type'] == 'dir' ){
            $res['path'] .= '/';
        } else {
            //$res['path'] = dirname( $res['path'] );
            //if( $res['path'] == '.' )
            //   $res['path'] = '/';
        }


        $checkpath = str_replace('inc/template', '', $path);
        
        
        if( $res['type'] == 'dir' )
            $checkpath .= '/'; //substr($checkpath, 0, -1);
        
        if( substr($checkpath, 0, 1) != '/' ) $checkpath = '/'.$checkpath;
        $access = acl::checkAccess( 3, $checkpath, 'read', true );
        if( !$access ) return false;
        
        
        $res['writeaccess'] = acl::checkAccess( 3, $checkpath, 'write', true );
        
        
        if( strpos($path, 'inc/template/trash/') !== false ){
        
            $item = dbTableFetch( 'system_files_log', 1, 'rsn = '.basename($res['path']) );
            
            $res['name'] = basename($item['path']);
            $res['original_rsn'] = $item['rsn'];
            $res['original_path'] = $item['path'];
            $res['lastModified'] = $item['modified'];
            $res['mtime'] = $item['modified'];
            $res['type'] = ($item['type']==1)?'dir':'file';
            $path = $item['path'];

        } else {
        
            $res['name'] = basename($path);
            $res['mtime'] = filemtime( $path );
            $res['ctime'] = filectime( $path );
            
            if( $pWithAccess ){
                if( $res['type'] == 'file' ){
                    $htaccess = dirname($path).'/'.'.htaccess';
                } else {
                    $htaccess = $path.'/'.'.htaccess';
                }
                
                if( @file_exists($htaccess) ){
                    
                    $content = kryn::fileRead( $htaccess );
                    @preg_match_all('/<Files ([^>]*)>\W*(\w*) from all[^<]*<\/Files>/smi', $content, $matches, PREG_SET_ORDER);
                    if( count($matches) > 0 ){
                        foreach($matches as $match){
                            $match[1] = str_replace('"', '', $match[1]);
                            if( $res['type'] == 'dir' ){
                                $res['htaccess'][] = array(
                                    'file' => $match[1],
                                    'access' => $match[2]
                                );
                            }
                            
                            if( $res['name'] == $match[1] || ( $res['type'] == 'dir' && $match[1] == "*") ){
                                $res['thishtaccess']= array(
                                    'file' => $match[1],
                                    'access' => $match[2]
                                );
                            }
                        }
                    }
                }
                
                $filepath = str_replace('inc/template', '', $path);
                $internAcls = dbTableFetch('system_acl', "type = 3 AND (code LIKE '$filepath\\\%%' OR code LIKE '$filepath\[%')", -1);
                $res['internalacls'] = $internAcls;
            }
        }
        
        $res['ext'] = '';
        
        	
        if( !is_dir($path) ){
            $pos = strrpos($path, '.');
            if( $pos > 0 )
                $res['ext'] = substr( $path, $pos+1, strlen($path) );
            else
                $res['ext'] = 'file';
            
           	$res['size'] = self::sizeFormat( filesize( $path ) );
        } else {
            $res['isDir'] = true;
            if( $pWithSize ){
	        	$dummy = self::getDirectorySize( $path );
	        	$res['size'] = $dummy['size'];
	        	$res['sizeFormat'] = self::sizeFormat($dummy['size']);
	        	$res['files'] = $dummy['count'];
	        	$res['dirs'] = $dummy['dircount'];
            }
        }
        
        $perms = fileperms( $path );// Owner
        
        $info = ($res['type']=="dir")?'d':'-';
        
        $info .= (($perms & 0x0100) ? 'r' : '-');
        $info .= (($perms & 0x0080) ? 'w' : '-');
        $info .= (($perms & 0x0040) ?
                    (($perms & 0x0800) ? 's' : 'x' ) :
                    (($perms & 0x0800) ? 'S' : '-'));

        $info .= (($perms & 0x0020) ? 'r' : '-');
        $info .= (($perms & 0x0010) ? 'w' : '-');
        $info .= (($perms & 0x0008) ?
                    (($perms & 0x0400) ? 's' : 'x' ) :
                    (($perms & 0x0400) ? 'S' : '-'));
        

        $info .= (($perms & 0x0004) ? 'r' : '-');
        $info .= (($perms & 0x0002) ? 'w' : '-');
        $info .= (($perms & 0x0001) ?
            (($perms & 0x0200) ? 't' : 'x' ) :
            (($perms & 0x0200) ? 'T' : '-'));
    
        $res['perms'] = $info;
        
        $res['owner'] = fileowner( $path );
        $res['group'] = filegroup( $path );
        
        return $res;
    }

    public static function loadFolder( $pPath ){
        $rPath = $pPath;
        
        if( $pPath == '/' ){
            if( !file_exists("inc/template/trash") )
                mkdir("inc/template/trash");
        }
        
        $access = acl::checkAccess( 3, $pPath, 'read', true );
        if( !$access ) return false;
        
        $pPath = 'inc/template/'.substr( $pPath, 0, strlen($pPath) );
        $pPath = str_replace( "..", "", $pPath );

        if(! file_exists($pPath) )
            json( false );
            
        $res['type'] = (is_dir($pPath)) ? 'dir':'file';

        if( $res['type'] == 'dir' ){
            $h = opendir( $pPath );            
            
            if( substr($rPath, strlen($rPath)-1, 1) != '/' )
                $rPath .= '/';

            $res['folderFile'] = self::getFileInfo($rPath);
            //$res['folderFile']['path'] = $rPath;
            //$res['folderFile']['type'] = 'dir';
            //$res['folderFile']['name'] = '';

            $myfiles = array();
            while( $file = readdir($h) ){
                if( $file == '.svn' || $file == '.' || $file == '..' ) continue;
                $myfiles[] = $file;
            }
            natcasesort( $myfiles );

            $items = array();
            foreach( $myfiles as $file ){
                $path = $pPath.'/'.$file;
                $item = array();
                
                $checkpath = str_replace('inc/template', '', $path);
                $checkpath = str_replace('//', '/', $checkpath);
                
                //print "access: $checkpath ".($access+0);
                
                $item = self::getFileInfo( $path );
                    
                if( $item )
                    $items[$file] = $item; 
            }
            $res['items'] = $items;
        } else {
            //file
            $res['name'] = basename($rPath);
            $res['path'] = $rPath;
            $pos = strrpos($rPath, '.');
            $res['ext'] = substr( $rPath, $pos+1, strlen($rPath) );
        }
        json( $res );
    }
    
    public static function getDirectorySize( $pPath ){
	  $totalsize = 0;
	  $totalcount = 0;
	  $dircount = 0;
	  if ($handle = opendir ($pPath)){
	    while (false !== ($file = readdir($handle))){
	      $nextpath = $pPath . '/' . $file;
	      if ($file != '.' && $file != '..' && !is_link ($nextpath)){
	        if (is_dir ($nextpath)){
	          $dircount++;
	          $result = self::getDirectorySize($nextpath);
	          $totalsize += $result['size'];
	          $totalcount += $result['count'];
	          $dircount += $result['dircount'];
	        }
	        else if (is_file ($nextpath)) {
	          $totalsize += filesize ($nextpath);
	          $totalcount++;
	        }
	      }
	    }
	  }
	  closedir ($handle);
	  $total['size'] = $totalsize;
	  $total['count'] = $totalcount;
	  $total['dircount'] = $dircount;
	  return $total;
	}
	
	public static function sizeFormat( $pSize ){
	    if($pSize<1024)
	    {
	        return $pSize." bytes";
	    }
	    else if($pSize<(1024*1024))
	    {
	        $pSize=round($pSize/1024,1);
	        return $pSize." KB";
	    }
	    else if($pSize<(1024*1024*1024))
	    {
	        $pSize=round($pSize/(1024*1024),1);
	        return $pSize." MB";
	    }
	    else
	    {
	        $pSize=round($pSize/(1024*1024*1024),1);
	        return $pSize." GB";
	    }
	
	}
    
    
    
    
}

?>

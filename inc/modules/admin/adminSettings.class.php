<?php

class adminSettings {

    public static function init(){
        switch( getArgv(4) ){
            case 'saveSettings':
                return adminSettings::saveSettings();
            case 'loadSettings':
                return adminSettings::loadSettings();
            case 'saveCommunity':
                return adminSettings::saveCommunity();
            case 'preload':
                return adminSettings::preload();
        } 
    }

    public static function preload(){
        $res['langs'] = dbTableFetch( 'system_langs', DB_FETCH_ALL, "1=1 ORDER BY title" );
        $res['timezones'] = timezone_identifiers_list();
        json($res);
    }

    public static function loadSettings(){
        global $cfg;
        
        $settings = admin::getSettings();
        
        include('inc/config.php');
        
        $settings['system'] = array_merge($settings['system'], $cfg);

        json( $settings );
    }

    public static function saveSettings(){
        global $cfg;

        $settings = admin::getSettings();
        $res = array();

        if( $settings['system']['communityEmail'] != getArgv('communityEmail') 
            && getArgv('communityEmail') != '')
            $res['needPw'] = true;

        if( getArgv('communityEmail') == '' ){
            admin::setSetting( 'communityEmail', '' );
            admin::setSetting( 'communityId', '' );
        }
        
        include('inc/config.php');
        $values = array('db_forceutf8', 'systemtitle', 'display_errors', 'log_errors',
        'log_errors_file', 'timezone', 'db_server', 'db_user', 'db_passwd',
        'db_name', 'db_prefix', 'db_type', 'caching_type', 'memcache_server', 'memcache_port',
        'files_path', 'template_cache');
        foreach( $values as $value )
            $cfg[ $value ] = getArgv( $value );
        
        kryn::fileWrite('inc/config.php', "<?php \n\$cfg = ".var_export($cfg,true)."\n?>");
        

        dbUpdate('system_langs', array('visible'=>1), array('visible'=>0));
        $langs = getArgv('languages');
        foreach( $langs as $l )
            dbUpdate('system_langs', array('rsn'=>$l), array('visible'=>1));

        admin::setSetting( 'sessiontime', getArgv('sessiontime')+0 );

        json( $res );
    }

    public static function saveCommunity(){
    
        $pw = md5(getArgv('passwd'));
        $email = getArgv('email',1);
        $json = wget("http://www.kryn.org/rpc?t=checkLogin&email=$email&pw=$pw");
        if( $json === false )
            json(2);
        $res = json_decode($json,true);
        if( $res['status'] >= 1 ){
            admin::setSetting( 'communityEmail', $email );
            admin::setSetting( 'communityId', $res['id'] );
            json(1);
        }

        json(0);
    }



}

?>

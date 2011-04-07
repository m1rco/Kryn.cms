<?php


class usersAdminSelfEdit extends windowEdit {

    public $table = 'system_user';
    public $checkUsage = true; //default on

    public $primary = array('rsn');

    function __construct(){
        global $user;
        $_REQUEST['rsn'] = $user->user_rsn;

        if(!kryn::checkUrlAccess('admin/users/users/editMe/')){
            
        }
    }

    public $fields = array(
        'username' => array(
            'label' => 'Username',
            'desc' => 'Also the administration login',
            'needAccess' => 'admin/users/users/editMe/username',
            'type' => 'text',
            'empty' => false
        ),
        'email' => array(
            'label' => 'Email',
            'type' => 'text',
            'empty' => false
        ),
        'passwd' => array(
            'label' => 'Password',
            'desc' => 'Let it empty to change nothing',
            'type' => 'password',
            'startempty' => true,
            'onlyIfFilled' => true,
            'modifier' => 'toPasswd'
        ),
        'adminLanguage' => array(
            'label' => 'Admin Language',
            'type' => 'select',
            'sql' => 'SELECT * FROM %pfx%system_langs',
            'table_key' => 'code',
            'table_label' => 'title',
            'customSave' => 'saveLanguage',
            'customValue' => 'getLanguage',
        ),
        'userBg' => array(
           'label' => 'Desktop background image',
            'type' => 'fileChooser',
            'customSave' => 'saveUserBg',
            'customValue' => 'userBgValue',
        ),
        'groups' => array(
            'label' => 'Groups',
            'type' => 'select',
            'needAccess' => 'admin/users/users/editMe/groups',
            'table' => 'system_groupaccess',
             //TODO geht so nicht,aber so vllt:
            'relation' => 'n-n',
            'n-n' => array(
                'right' => 'system_groups',
                'right_key' => 'rsn',
                'right_label' => 'name',
                'middle' => 'system_groupaccess',
                'middle_keyright' => 'group_rsn',
                'middle_keyleft' => 'user_rsn',
                'left_key' => 'rsn'
            ),
            'size' => 6,
            'multiple' => 1,
            'fake' => true //'group' will not be used in update sql
        )
    );

    public function userBgValue($pPrimary, $pItem){
        $rsn = $pPrimary['rsn'];
        $user = dbTableFetch('system_user', 1, "rsn = $rsn");
        $settings = unserialize($user['settings']);
        return $settings['userBg'];
    }

    public function saveUserBg(){
        global $user;

        $cacheCode = "user_".(getArgv('rsn')+0);
        kryn::removePhpCache($cacheCode);

        $user = dbTableFetch('system_user', 1, "rsn = ".(getArgv('rsn')+0));
        $settings = unserialize( $user['settings'] );
        $settings['userBg'] = getArgv('userBg', 1);
        $settings = serialize( $settings );

        dbUpdate( 'system_user', array('rsn' => getArgv('rsn')+0), array('settings' => $settings) );
    }

    public function saveLanguage(){

        $user = dbTableFetch('system_user', 1, "rsn = ".(getArgv('rsn')+0));
        $settings = unserialize( $user['settings'] );
        $settings['adminLanguage'] = getArgv('adminLanguage');
        $settings = serialize( $settings );

        dbUpdate( 'system_user', array('rsn' => getArgv('rsn')+0), array('settings' => $settings) );
    }

    public function getLanguage( $pPrimary, $pItem ){
        $rsn = $pPrimary['rsn'];
        $user = dbTableFetch('system_user', 1, "rsn = $rsn");
        $settings = unserialize($user['settings']);
        return $settings['adminLanguage'];
    }

    public function toPasswd( $pPw ){
        return md5($pPw);
    }

}

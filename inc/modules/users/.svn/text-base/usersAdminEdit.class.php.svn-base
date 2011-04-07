<?php


class usersAdminEdit extends windowEdit {

    public $table = 'system_user';
    public $checkUsage = true; //default on

    public $primary = array('rsn');

    function __construct(){
        $rsn = getArgv('rsn')+0;


        if(!kryn::checkUrlAccess('admin/users/users/editMe/')){
            
        }
    }

    public $tabLayouts = array(
        'General' => '<table width="100%"><tr>
        	<td width="110">
        		 <div style="height: 100px; margin:5px" id="picture"></div>
        	</td>
        	<td>
        		<div id="name"></div>
        		<div style="clear: both"></div>
        		<div id="lastname"></div>
        		<div style="clear: both"></div>
        	</td>
        </tr><tr>
        	<td colspan="2" style="padding: 10px;">
        		<table width="100%">
        			<tbody id="default"></tbody>
        		</table>
        	</td>
        </tr></table>'
    );

    public $tabFields = array(
        'General' => array(
            'picture' => array(
                'onlycontent' => 1,
                'target' => 'picture',
                'type' => 'custom',
                'class' => 'users_field_picture'
            ),
            'first_name' => array(
                'label' => 'First name',
                'target' => 'name',
                'small' => 1,
                'type' => 'text'
            ),
        	'last_name' => array(
                'label' => 'Last name',
                'target' => 'lastname',
                'small' => 1,
                'type' => 'text'
            ),
            'company' => array(
                'label' => 'Company',
                'tableitem' => true,
                'type' => 'text'
            ),
            'street' => array(
                'label' => 'Street',
                'tableitem' => true,
                'type' => 'text'
            ),
            'city' => array(
                'label' => 'City',
                'tableitem' => true,
                'type' => 'text'
            ),
            'zip' => array(
                'label' => 'Zipcode',
                'tableitem' => true,
                'type' => 'number',
                'length' => 10
            ),
            'country' => array(
                'label' => 'Country',
                'tableitem' => true,
                'type' => 'text'
            ),
            'phone' => array(
                'label' => 'Phone',
                'tableitem' => true,
                'type' => 'text'
            ),
            'fax' => array(
                'label' => 'Fax',
                'tableitem' => true,
                'type' => 'text'
            ),
            
        ),
        'Account' => array(
            'username' => array(
                'label' => 'Username',
                'desc' => '(and the administration login)',
                'type' => 'text',
                'empty' => false
            ),
            'passwd' => array(
                'label' => 'Password',
                'type' => 'password',
                'startempty' => true,
                'onlyIfFilled' => true,
                'modifier' => 'toPasswd'
            ),
            'email' => array(
                'label' => 'Email',
                'type' => 'text',
                'empty' => false
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
                'fake' => true //'group' will not be used in update
            )
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

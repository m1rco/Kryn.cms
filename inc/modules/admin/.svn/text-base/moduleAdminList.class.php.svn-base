<?php

class moduleAdminList extends windowList {

    public $table = '_';
    public $itemsPerPage = 20;
    public $orderBy = 'title';

    public $filter = array('title', 'desc');

    public $columns = array(
        'id' => array(
            'label' => 'ID',
            'width' => '140',
            'type' => 'text',
            'width' => 100
        ),
        'title' => array(
            'label' => 'Titel',
            'width' => '140',
            'type' => 'text',
            'width' => 130
        ),
        'version' => array(
            'label' => 'Version',
            'type' => 'text',
            'width' => 75
        ),
        'newversion' => array(
            'label' => 'Neue Version',
            'type' => 'html'
        ),
        'owner' => array(
            'label' => 'Herausgeber',
            'type' => 'text',
            'width' => 100
        )
    );

    function getItems(){
        global $modules, $tpl, $kryn, $db, $user;
        
        
        $results['page'] = getArgv('page');
        $results['maxPages'] = 1;


        $lang = $user->user['settings']['adminLanguage'];
        
        $tmodules = $kryn->installedMods;

        # add kryn-core
        $tmodules = array_merge(array("kryn-core" =>$kryn), $modules->modules);
        
        foreach($tmodules as $key => $config){
            $version = '0';
            $name = $key;
            $row = dbExec("SELECT * FROM `".pfx."system_modules` WHERE `name` = '".$name."'");
            
            // $shandle = @fopen("http://download.kryn.org/?version=$name", "r");
            // $version = @fgets($shandle, 1000);
            $version = wget( "http://download.kryn.org/?version=$name" );
            

            $serverVersion = $version;
            $installedModules[$name]['name'] = $key;
            $installedModules[$name]['title'] = $config['title'][$lang]?$config['title'][$lang]:$config['title']['en'];
            $installedModules[$name]['version'] = $module->version;
            $installedModules[$name]['owner'] = $module->owner;

            if($name == 'kryn-core')
                $installedModules[$name]['activated'] = true;
            else
                $installedModules[$name]['activated'] = $kryn->isActivated($name);

            $installedModules[$name]['serverVersion'] = $serverVersion;
            $installedModules[$name]['systemmodul'] = $module->systemmodul;

            if( $version && $version != '' && $serverVersion != $module->version ){
                $installedModules[$name]['newversion'] = "<span style=\"color: green;\">Mit Doppelklick auf $serverVersion updaten</span>";
                $installedModules[$name]['update'] = true;
            } elseif( !$version || $version == "" ){
                $installedModules[$name]['newversion'] = 'Lokale Version.';
            } else {
                $installedModules[$name]['newversion'] = 'Aktuellste Version installiert.';
            }
        }

        foreach( $installedModules as $item ) {
            $results['items'][] = array(
            'open' => array('admin', 'system/module/view'),
            'values' => array(
                'id' => $item['name'],
                'title' => _l($item['name']),
                'desc' => $item['desc'],
                'version' => $item['version'],
                'newversion' => $item['newversion'],
                'owner' => $item['owner']
            ));
        }

        return $results;
    }
    
    function acl( $pItem ){
        $res = parent::acl( $pItem );

        if( $pItem['rsn'] == '1' )
            $res['delete'] = false;

        return $res;
    }

}

?>

<?php

class moduleAdminInstallList extends windowList {

    public $table = '_';
    public $itemsPerPage = 20;
    public $orderBy = 'title';

    public $filter = array('title', 'desc');

    public $columns = array(
        'id' => array(
            'label' => 'ID',
            'width' => '140',
            'type' => 'text',
            'width' => 80
        ),
        'title' => array(
            'label' => 'Titel',
            'type' => 'text',
            'width' => 130
        ),
        'desc' => array(
            'label' => 'Beschreibung',
            'type' => 'text'
        ),
        'version' => array(
            'label' => 'Version',
            'type' => 'text',
            'width' => 75
        ),
        'owner' => array(
            'label' => 'Herausgeber',
            'type' => 'text',
            'width' => 100
        )
    );

    function getItems(){
        global $modules, $tpl, $kryn, $db;
        
        
        $results['page'] = getArgv('page');
        $results['maxPages'] = 1;
        
        
        $modules->loadModules();
        $tmodules = $modules->modules;

        # add kryn-core
        $tmodules = array_merge(array($kryn), $modules->modules);
        
        /*$shandle = @fopen("http://download.kryn.org/?list=1", "r");
        while( $buffer = @fgets($shandle, 1000) ){
            $json .= $buffer;
        }
        */
        $json = wget( "http://download.kryn.org/?list=1" );
        
        $mymodules = json_decode( $json, true );
        foreach( $mymodules as $item ){
            if($item[0] != ''){
                if( $tmodules[ $item['name'] ]  || $item['name'] == 'admin' ) continue;
                
                $results['items'][] = array(
                    'open' => array('admin', 'system/module/view'),
                    'values' => array(
                        'id' => $item['name'],
                        'title' => _l($item['name']),
                        'desc' => $item['desc'],
                        'version' => $item['version'],
                        'owner' => $item['owner']
                    ));
            }
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

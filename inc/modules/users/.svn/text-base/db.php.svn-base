<?php

$db[ 'users_log' ] = array(
    'rsn'    => array('int', null, DB_PRIMARY, true),
    'title'  => array('varchar', 255),
    'created'  => array('int'),
);

$db[ 'system_groups' ] = array(
    'rsn'     => array('int', null, DB_PRIMARY, true),
//    'name'    => array('varchar', 255, DB_PRIMARY),
    'close'   => array('int', 1),
    'name'    => array('varchar', 255),
    'desc'    => array('text'),
);

$db[ 'system_groupaccess' ] = array(
    'group_rsn'  => array('int', null, DB_PRIMARY),
    'user_rsn'    => array('int', null, DB_PRIMARY),
);

$db[ 'users_fieldextensions' ] = array(
    'name'    => array('varchar', 255, DB_PRIMARY),
    'fullname'=> array('varchar', 255),
    'desc'    => array('varchar', 255),
    'type'    => array('varchar', 8),
    'length'  => array('int'),
);

$db[ 'users_extensions' ] = array(
    'rsn'    => array('int', null, DB_PRIMARY),
    'key'    => array('varchar', 32, DB_PRIMARY),
    'value'  => array('text'),
);

$db[ 'system_user' ] = array(
    'rsn'    => array('int', null, DB_PRIMARY, true),
    'username'  => array('varchar', 255),
    'passwd'    => array('varchar', 32),
    'activationkey' => array('varchar', 32),
    'email'  => array('varchar', 255),
    'desktop'  => array('text'),
    'settings'  => array('text'),
    'created'  => array('int'),
    'modified'  => array('int'),
    'activate'  => array('int', 1),
);

$db[ 'system_sessions' ] = array(
    'rsn'     => array('int', null, DB_PRIMARY, true),
    'id'      => array('varchar', 32, DB_INDEX),
    'user_rsn' => array('int', null, DB_INDEX),
    'time'    => array('int'),
    'ip'      => array('varchar', 25),
    'page'    => array('varchar', 255),
    'useragent' => array('varchar', 255),
);

$db[ 'system_acl' ] = array(
    'rsn'         => array('int', null, DB_PRIMARY, true),
    'type'        => array('int', 3, DB_INDEX),
    'target_type' => array('int', 11, DB_INDEX),
    'target_rsn' => array('int', null, DB_INDEX),
    'code' => array('varchar', 255, DB_INDEX),
    'access' => array('enum', "'0', '1'", DB_INDEX),
    'prio' => array('int'),
);

$db['system_lock'] = array(
    'rsn'         => array('int', null, DB_PRIMARY, true),
    'type'         => array('varchar', 64, DB_INDEX),
    'key'         => array('varchar', 255, DB_INDEX),
    'user_rsn'    => array('int', null, DB_INDEX),
    'time'        => array('int'),
);

?>

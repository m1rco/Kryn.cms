<?php

class usersAdminGroupAdd extends windowAdd {

    public $table = 'system_groups';

    public $fields = array(
        'name' => array(
            'label' => 'Name',
            'type' => 'text',
            'empty' => false,
        ),
        'description' => array(
            'label' => 'Description',
            'type' => 'text',
        ),
    );

}

?>

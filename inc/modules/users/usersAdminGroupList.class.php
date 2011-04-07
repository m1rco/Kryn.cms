<?php

class usersAdminGroupList extends windowList {

    public $table = 'system_groups';
    public $itemsPerPage = 20;
    public $orderBy = 'name';

    public $iconAdd = 'group_add.png';
    public $iconEdit = 'group_edit.png';
    public $iconDelete = 'group_delete.png';

    public $filter = array('name');

    public $primary = array('rsn');

    public $add = true;
    public $edit = true;
    public $remove = true;

    public $columns = array(
        'name' => array(
            'label' => 'Name',
            'type' => 'text',
            'width' => '250',
        ),
        'description' => array(
            'label' => 'Description',
            'type' => 'text',
        ),
    );

    function acl( $pItem ){
        $res = parent::acl( $pItem );

        if( $pItem['rsn'] == 1 ){
            $res['remove'] = false;
            $res['edit'] = false;
        }

        return $res;
    }

}

?>

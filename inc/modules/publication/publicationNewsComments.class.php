<?php

class publicationNewsComments extends windowList {

    public $table = 'publication_comments';

    public $itemsPerPage = 20;
    public $orderBy = 'created';

//    public $filter = array('name', 'email');

    public $add = false;
    public $edit = false;
    public $remove = true;

    public $primary = array('rsn');

    public $columns = array(
        'owner_username' => array(
            'label' => 'Name',
            'type' => 'text'
        ),
        'email' => array(
            'label' => 'E-Mail',
            'type' => 'text'
        ),
        'ip' => array(
            'label' => 'IP',
            'type' => 'text'
        ),
        'created' => array(
            'label' => 'Created',
            'type' => 'datetime'
        )
    );
    
    function deleteItem(){
        
        $rsn = $_POST['item']['rsn']+0;
        
        $comment = dbExfetch('SELECT * FROM %pfx%publication_comments WHERE rsn = '.$rsn );
        
        parent::deleteItem();
        
        $comments = dbExfetch('SELECT count(*) as comcount FROM %pfx%publication_comments WHERE parent_rsn = '.$comment['parent_rsn'] );
        dbUpdate('publication_news', array('rsn' => $comment['parent_rsn']), array('commentscount' => $comments['comcount']) );
    }
}

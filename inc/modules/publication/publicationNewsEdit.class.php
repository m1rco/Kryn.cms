<?php

class publicationNewsEdit extends windowEdit {

    public $table = 'publication_news';

    public $primary = array('rsn');
    public $multiLanguage = true;

    public $tabFields = array(
        'General' => array(
            'title' => array(
                'label' => 'Title',
                'type' => 'text',
                'empty' => false
            ),
            'category_rsn' => array(
                'label' => 'Category',
                'type' => 'select',
                'multiLanguage' => true,
            	'empty' => false,
                'table' => 'publication_news_category',
                'table_label' => 'title',
                'table_key' => 'rsn'
            ),
            'tags' => array(
                'label' => 'Tags',
                'type' => 'text'
            ),
            'releaseat' => array(
                'label' => 'Release at',
                'desc' => 'If you want to release the news now, let it empty',
                'type' => 'datetime',
            ),
            'releasedate' => array(
                'label' => 'News date',
                'type' => 'datetime',
                'empty' => false
            ),
            'deactivate' => array(
                'label' => 'Deactivate',
                'type' => 'checkbox'
            ),
            'deactivatecomments' => array(
                'label' => 'Deactivate comments (override plugin properties)',
                'type' => 'checkbox'
            )
        ),
        'List images' => array(
            'introimage' => array(
                'label' => 'Intro image',
                'type' => 'fileChooser'
            ),
            'introimage2' => array(
                'label' => 'Intro image 2',
                'type' => 'fileChooser'
            ),
        ),
        'Intro' => array(
            'intro' => array(
                'label' => 'Intro',
                'type' => 'layoutelement'
            )
        ),
        'Content' => array(
            'content' => array(
                'label' => 'Content',
                'type' => 'layoutelement'
            )
        ),
        'Files' => array(
            'files' => array(
                'label' => 'Files',
                'type' => 'fileList',
                'size' => 10,
                'width' => 500
            )
        )
    );
}

?>

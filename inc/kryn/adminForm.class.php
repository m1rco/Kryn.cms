<?php

/*
 * This file is part of Kryn.cms.
 *
 * (c) Kryn.labs, MArc Schmidt <marc@kryn.org>
 *
 * To get the full copyright and license informations, please view the
 * LICENSE file, that was distributed with this source code.
 *
 */


/**
 * Defines an old way to create framework forms.
 * 
 * @package Kryn
 * @deprecated
 * @access private
 * @internal
 */

class adminForm {

    public $fields = '';
    public $primary = '';


    function formHandler( $pOptions ){
        $this->fhType = $pOptions[0];
        $this->fhName = $pOptions[1];
        $this->fhArgv = $pOptions[2];
        $this->fhTable = $pOptions[3];
        $this->fhMenus = $pOptions[4];
        $this->fhListFields = $pOptions['list'];
        $this->fhAddFields = $pOptions['add'];
        $this->fhLang = $pOptions['lang'];
        $this->fhListWhere = $pOptions['listWhere'];

        foreach( $this->fhAddFields as $key=>$field )
            $this->updateItems[] = $key;

        $handleNumber = $this->loadPath();
        tAssign( 'menus', $this->fhMenus );

        if( $this->fhLang ){
            $this->updateItems[] = 'lang';
            admin::activateLL();
        }


        switch( getArgv($handleNumber) ){
        case 'add':
            return $this->formAdd();
        case 'edit':
            return $this->formEdit();
        case 'delete':
            return $this->formDelete();
        default:
            return $this->formList();
        }
    }

    function formAdd(){
        if( getArgv('save') == '1' ){
            dbInsert( $this->fhTable, $this->updateItems );
            kryn::redirect( $this->path );
        }
        tAssign( 'add', $this->fhAddFields );
        return tFetch( 'kryn/formHandler/add.tpl' );
    }

    function formDelete(){
        $rsn = getArgv('rsn')+0;
        dbDelete( $this->fhTable, "rsn=$rsn" );
        kryn::redirect( $this->path );
    }

    function formEdit(){
        $rsn = getArgv('rsn')+0;
        if( getArgv('save') == '1' ){
            dbUpdate( $this->fhTable, array('rsn' =>$rsn), $this->updateItems );
            kryn::redirect( $this->path );
        }
        tAssign( 'item', dbTableFetch( $this->fhTable, 1, "rsn=$rsn" ) );
        tAssign( 'edit', $this->fhAddFields );
        return tFetch( 'kryn/formHandler/edit.tpl' );
    }

    function formList(){
        if( $this->fhLang ){
            $lang = getArgv('lang');
            $where = "lang='$lang'";
        }

        if( $this->fhListWhere ){
            if( $where )
                $where .= ' AND ';
            $where .= $this->fhListWhere;
        }
        tAssign( 'items', dbTableFetch( $this->fhTable, DB_FETCH_ALL, $where) );
        tAssign( 'list', $this->fhListFields );
        return tFetch( 'kryn/formHandler/list.tpl' );
    }

    function loadPath(){
        $c = 1;
        $found = false;
        while(!$found){
            $v = getArgv($c);
            if( $v == '' || $v == 'edit' || $v == 'add' || $v == 'delete' ){
                $found = true;
                continue;
            };
            $this->path .= $v.'/';
            $c++;
        }
        tAssign( 'afPath', $this->path );
        return $c;
    }

    function loadLanguage(){
        global $lang, $language;
        $oriLang = $lang;
        $aName = explode( '_', __CLASS__ );
        $formModule = $aName[0];
        $formName = str_replace( $formModule.'_', '', __CLASS__ );
        $file = 'inc/modules/'.$formModule.'/lang/'.$formName.'.'.$language.'.php';
        if( file_exists( $file) ){
            require_once( $file );
            $lang = array_merge( $oriLang, $lang );
        }
    }


}

?>

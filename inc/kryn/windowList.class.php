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
 * This class need to be the motherclass in your framework classes, which
 * are defined via the window links in your extension.
 * 
 * @author Kryn.labs <info@krynlabs.com>
 * @package Kryn
 * @subpackage FrameworkWindow
 * 
 */


class windowList {
	/**
	 * Defines the table which should be accessed.
	 *
	 * This variable has to be set by any subclass.
	 * @var string table name
	 * @abstract
	 */
    public $table = '';
    
    /**
     * Defines your primary fiels as a array.
     * Example: $primary = array('rsn');
     * Example: $primary = array('id', 'name');
     * @abstract
     * @var array
     */
    public $primary = array();
    /**
     * Defines the columns of your table which should be displayed.
     * @abstract
     * @var array
     */
    public $columns = array();
    /**
     * Defines how many rows should be displayed per page.
     * @var integer number of rows per page
     */
    public $itemsPerPage = 10;
    
    public $orderBy = '';
    public $orderByDirection = 'ASC';
    
	/**
	 * Defines the icon for the add button
	 * @var string name of image
	 */
    public $iconAdd = 'add.png';
    /**
     * Defines the icon for the edit button
     * @var string name of image
     */
    public $iconEdit = 'page_white_edit.png';
    /**
     * Defines the icon for the remove/delete button
     * @var string name of image
     */
    public $iconDelete = 'delete.png';
	/**
	 * Defines whether the add button should be displayed
	 * @var boolean
	 */
    public $add = false;
    /**
     * Defines whether the remove/delete button should be displayed
     * Also on each row the Delete-Button and the checkboxes.
     * @var boolean
     */
    public $remove = false;
    /**
     * Defines whether the edit button should be displayed
     * @var boolean
     */
    public $edit = false;
    /**
     * TBD
     * @var boolean
     */
    public $navigation = false;
    
    /**
     * 
     * Defines whether the list windows should display the language select box.
     * Note: Your table need a field 'lang' varchar(2). The windowList class filter by this.
     * @var bool
     */
    public $multiLanguage = false;

	/**
	 * TBD
	 * @return object this object
	 */
    function init(){

        //store this in the acl-table in the future
        #$this->add = true;

        return $this;
    }

	/**
	 * Constructor
	 */
    function __construct(){
        
        
        if( !$this->orderBy )
            $this->orderBy = $this->primary[0];
        
        if( getArgv('orderBy') != '' )
            $this->orderBy = getArgv('orderBy',1);

        if( getArgv('orderByDirection') != '' )
            $this->orderByDirection = (strtolower(getArgv('orderByDirection'))=='asc')?'ASC':'DESC';
            
        $this->_fields = array();
        $this->filterFields = array();
        if( $this->filter ){
            foreach( $this->filter as $key => $val ){
                
                if( is_numeric($key) ){
                    //no special definition
                    $fieldKey = $val;
                    $field = $this->columns[ $val ];
                } else {
                    $field = $val;
                    $fieldKey = $key;
                }
                
                
                $this->prepareFieldItem( $field );
                $this->filterFields[ $fieldKey ] = $field;
            }
            
            $this->prepareFieldItem( $this->fields );
        }
        if( $this->tabFields ){
            foreach( $this->tabFields as &$field )
                $this->prepareFieldItem( $field );
        }
            
    }
    
    /**
     * Prepare fields. Loading tableItems by select and file fields.
     * @param array $pFields
     * @param bool $pKey
     */
    function prepareFieldItem( &$pFields, $pKey = false ){
        if( is_array( $pFields ) && $pFields['type'] == '' ){
            foreach( $pFields as $key => &$field ){
                if( $field['type'] != '' && is_array($field) ){
                    $this->prepareFieldItem( $field, $key );
                }
            }
        } else {
            if( $pFields['needAccess'] && !kryn::checkUrlAccess($pFields['needAccess']) ){
                $pFields = null;
                return;
            }
            $this->_fields[ $pKey ] = $pFields;
            
            switch( $pFields['type'] ){
                case 'select':
                	
                    if( !empty($field['eval']) )
                        $pFields['tableItems'] = eval($field['eval']);
                    elseif( $pFields['relation'] == 'n-n')
                        $pFields['tableItems'] = dbTableFetch( $pFields['n-n']['right'], DB_FETCH_ALL);
                    else if( $pFields['table'] )
                        $pFields['tableItems'] = dbTableFetch( $pFields['table'], DB_FETCH_ALL);
                    else if( $pFields['sql'] )
                        $pFields['tableItems'] = dbExFetch( $pFields['sql'], DB_FETCH_ALL);
                    else if( $pFields['method'] ){
                        $nam = $pFields['method'];
                        if( method_exists( $this, $nam) )
                            $pFields['tableItems'] = $this->$nam( $pFields );
                    }
                        
                    if($pFields['modifier'] && !empty($pFields['modifier']) && method_exists( $this, $pFields['modifier'] ))                   
                        $pFields['tableItems'] = $this->$pFields['modifier']( $pFields['tableItems'] );

                        
                    break;
                 case 'files':
                     
                    $files = kryn::readFolder( $pFields['directory'], $pFields['withExtension'] );
                    if( count($files)>0 ){
                        foreach( $files as $file ){
                            $pFields['tableItems'][] = array('id' =>$file, 'label' => $file);
                        }
                    } else {
                        $pFields['tableItems'] = array();
                    }
                    $pFields['table_key'] = 'id';
                    $pFields['table_label'] = 'label';
                    $pFields['type'] = 'select';
                
                    break;
            }
            if( is_array( $pFields['depends'] ) ){
                $this->prepareFieldItem( $pFields['depends'] );
            }
        }
    }

    /**
     * Loads all entries from {@link $table}
     */
    function load(){
        $items = dbTableFetch( $this->table, DB_FETCH_ALL );
    }

	/**
	 * Deletes the Item from the database which is specified in the request
	 * @return bool
	 */
    function deleteItem(){

        foreach( $this->primary as $primary ){
            if( $tableInfo[$primary][0] == 'int' )
                $val = $_POST['item'][$primary]+0;
            else
                $val = "'".esc($_POST['item'][$primary])."'";
            $where = " AND $primary = $val";
        }

        $this->_removeN2N( $_POST['item'] );

        $sql = "DELETE FROM %pfx%".$this->table." WHERE 1=1 $where";
        dbExec( $sql );

        return true;
    }

	/**
	 * Removes selected files from database.
	 * @return boolean
	 */
    function removeSelected(){
        
        $selected = json_decode( getArgv('selected'), 1 );
        $where = '';
        foreach( $selected as $select ){

            $where .= ' OR (';
            //TODO check ACL before remove
            foreach( $this->primary as $primary ){
                $where .= " $primary = '".$select[$primary]."' AND ";
            }
            $where = substr( $where, 0, -4 ).' )';

            $this->_removeN2N( $select );
        }


        $sql = "DELETE FROM %pfx%".$this->table." WHERE 1=0 $where";
        dbExec( $sql );
        return true;
    }

	/**
	 * Remove all related database entries from selected item.
	 * @param datatype $pVal
	 */
    function _removeN2N( $pVal ){
        foreach( $this->columns as $key => $column ){
            if( $column['type'] == 'select' && $column['relation'] == 'n-n' ){
                $sql = "DELETE FROM %pfx%".$column['n-n']['middle']." WHERE ".$column['n-n']['middle_keyleft']." = ".$pVal[ $column['n-n']['left_key'] ];
                dbExec( $sql );
            }
        }
    }

	/**
	 * Build a WHERE clause for search functionality.
	 * @return datatype
	 */
    function filterSql(){

        $table = pfx.$this->table;
        
        
        if( getArgv('filter') == 1 ){
            if(! count( $this->filter ) > 0 )
                return '';
            $res = '';

            $filterVals = json_decode( getArgv('filterVals'), true );

            foreach( $this->filterFields as $key => $filter ){
                
                
                
                if( $filterVals[$key] != '' ){
                    
                    switch( $filter['type'] ){
                        case 'select':
                            
                            if( $filterVals[$key]+0 > 0 ){
                                $value = $filterVals[$key] + 0; 
                                $res = "AND $table.$key = $value ";
                            } else {
                                
                                $value = esc($filterVals[$key]); 
                                $res = "AND $table.$key = '$value' ";
                            }
                            $value = $filterVals[$key] + 0; 
                            $res = "AND $table.$key = $value ";
                            
                            break;
                        case 'integer':
                            $value = $filterVals[$key] + 0; 
                            $res = "AND $table.$key = $value ";
                            breal;
                        default:
                            $value = esc(str_replace("*", "%", $filterVals[ $key] )); 
                            $res = "AND $table.$key LIKE '$value' ";
                            
                    }
                }
            }
            return $res;
        }
        return '';
    }

	/**
	 * Defines a extra filter in WHERE. Starting with "AND "
	 * @return string
	 */
    function where(){
        return '';
    }

	/**
	 * Builds the complete SQL for all items.
	 * @param bool $pCountSql Defines whether the SQL is used for counting or not
	 * @return string
	 */
    function sql( $pCountSql = false ){
        global $kdb;
        
        $extraFields = array();
        $joins = "";

        $filter = "WHERE 1=1 ".$this->filterSql();
        $extraWhere = " ".$this->where();

        
        $table = "%pfx%".$this->table;
        
        if( $this->multiLanguage ){
        	$curLang = getArgv('language',2);
        	$filter .= " AND ( $table.lang = '$curLang' OR $table.lang is NULL OR $table.lang = '' )";
        }
        
        $fields = "";


        foreach( $this->columns as $key => $column ){
            if( $pCountSql == false ){
                if( $column['type'] == 'select' && $column['relation'] != 'n-n' ){
                    $exTable = "%pfx%".$column['table'];
                    $extraFields[] = $exTable.".".$column['table_label']." AS $key"."__label, $key";
                    //get all fields from joined table if modifier is active
                    $mod = $this->modifier;
                    if( !empty($mod) && method_exists( $this, $mod ) )
                        $extraFields[] = $exTable.".*";
                    
                    
                    $joins .= "LEFT OUTER JOIN ".$exTable." ON ".$exTable.".".$column['table_key']." = $table.$key\n";
                }
                if( $kdb->type != 'postgresql' && $column['type'] == 'select' && $column['relation'] == 'n-n' ){
                        $extraFields[] = ' group_concat( %pfx%'.$column['n-n']['right'].'.'.$column['n-n']['right_label'].', \', \') AS '.$key.'__label';
                        $joins .= " 
                            LEFT OUTER JOIN %pfx%".$column['n-n']['middle']." ON(
                                %pfx%".$column['n-n']['middle'].".".$column['n-n']['middle_keyleft']."= %pfx%".$this->table.".".$column['n-n']['left_key']." )

                            LEFT OUTER JOIN %pfx%".$column['n-n']['right']." ON (
                                %pfx%".$column['n-n']['right'].".".$column['n-n']['right_key']." = %pfx%".$column['n-n']['middle'].".".$column['n-n']['middle_keyright']." ) ";
                        
                        $filter .= " GROUP BY %pfx%".$this->table.".".$this->primary[0]." \n";
                }
            }
        }
        

        if( count($extraFields) > 0 )
            $fields .= ", " . implode(",", $extraFields);
            
        

        if( $pCountSql == false ){
            $sql = "
                SELECT $table.* $fields
                FROM $table
                $joins
                $filter
                $extraWhere
                ";
        } else {
            $sql = "
                SELECT $table.* $fields
                FROM $table
                $filter
                $extraWhere";
        }
        return $sql;
    }

	/**
	 * Returns the SQL for counting all items.
	 * @return string SQL
	 */
    function countSql(){
        return preg_replace('/SELECT(.*)FROM/mi', 'SELECT count(*) as ctn FROM', str_replace("\n", " ", $this->sql(true)) );
    }

	/**
	 * Gets all Items for getArvg('page')
	 * @return array
	 */
    function getItems(){
        global $kdb;
        
        $pPage = getArgv('page');
        $results['page'] = $pPage;

        $start = ($pPage*$this->itemsPerPage)-$this->itemsPerPage;
        $end = $this->itemsPerPage;

        $this->listSql = $this->sql();

        /* count sql */
        $countSql = $this->countSql();
        $temp = dbExfetch( $countSql );
        $results['maxItems'] = $temp['ctn'];
        if( $temp['ctn'] > 0 )
            $results['maxPages'] = ceil($temp['ctn']/$this->itemsPerPage);
        else
            $results['maxPages'] = 0;

        /* list sql */
        $listSql = "
            ".$this->listSql."
            
            
            ORDER BY %pfx%".$this->table.".".$this->orderBy." ".$this->orderByDirection."
            LIMIT $end OFFSET $start
            ";
        
        $res = dbExec( $listSql );

        while( $item = dbFetch( $res )){
            foreach( $this->columns as $key => $column ){
                if( $kdb->type == 'postgresql' ){
                    if( $column['type'] == 'select' && $column['relation'] == 'n-n' ){
                        $tempRow = dbExfetch("
                            SELECT group_concat(%pfx%".$column['n-n']['right'].".".$column['n-n']['right_label'].") AS ".$key."__label
                            FROM %pfx%".$column['n-n']['right'].", %pfx%".$column['n-n']['middle']."
                            WHERE
                            %pfx%".$column['n-n']['right'].".".$column['n-n']['right_key']." = %pfx%".$column['n-n']['middle'].".".$column['n-n']['middle_keyright']." AND
                            %pfx%".$column['n-n']['middle'].".".$column['n-n']['middle_keyleft']." = ".$item[ $column['n-n']['left_key'] ], 1);
                        $item[$key.'__label'] = $tempRow[$key.'__label'];
                        
                    }
                }   
            }
            $_res = $this->acl( $item );
               
            $mod = $this->modifier;
            if( !empty($mod) && method_exists( $this, $mod ) )
                $_res = $this->$mod( $_res );
                
                
            if( $res != null )
                $results['items'][] = $_res;
                
        }
        return $results;
    }

	/**
	 * Build and send the items via specified exportType to the client.
	 */
    function exportItems(){

        $this->listSql = $this->sql();
        $listSql = "
            ".$this->listSql."
            ORDER BY %pfx%".$this->table.".".$this->orderBy." ".$this->orderByDirection;
        $sres = dbExec( $listSql );
        
        $exportType = getArgv('exportType',2);
        $fields = $this->export[ $exportType ];

        $res = '"'.implode( '";"', $fields )."\"\r\n";
        while( $item = dbFetch( $sres )){
            $_res = $this->acl( $item );
            if( $res != null ){
                $items[] = $_res;

                foreach( $fields as $field ){
                    if( $exportType == 'csv' ){
                        $res .= '"'.esc($item[ $field ]).'";';
                    }
                }
                $res = substr($res, 0, -1)."\r\n";
            }
        }

        if( $exportType == 'csv' )
            header('Content-Type: text/csv');

        $filename = 'export_'.date('ymd-his').'.'.$exportType;
        header('Content-Disposition: attachment; filename="'.$filename.'"');
        
        print $res;

        exit;
    }

	/**
	 * Each item go through this function in getItems(). Defines whether a item is editable or deleteable.
	 * @param array $pItem
	 * @return array
	 */
    function acl( $pItem ){

        //store this in the acl-table in the future
        $visible = true;
        $editable = $this->edit;
        $deleteable = $this->remove;

        $res = null;
        if( $visible ){
            $res = array();
            $res['values'] = $pItem;
            $res['edit'] = $editable;
            $res['remove'] = $deleteable;
        }
        return $res;
    }

}

?>

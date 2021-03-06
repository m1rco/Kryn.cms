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
 * This class have to be used as motherclass in your framework classes, which
 * are defined from the links in your extension.
 * 
 * @author Kryn.labs <info@krynlabs.com>
 * @package Kryn
 * @subpackage FrameworkWindow
 * 
 */

class windowAdd extends windowEdit {

    public $versioning = false;
    
    function saveItem(){
        $tableInfo = $this->db[$this->table];

        $sql = 'INSERT INTO %pfx%'.$this->table.' ';
        foreach( $this->_fields as $key => $field ){
            
            if( $field['fake'] == true ) continue;

            $val = getArgv($key);
            print $key." => ".$val."<br/>";

            $mod = ($field['add']['modifier'])?$field['add']['modifier']:$field['modifier'];
            if( $mod ){
                $val = $this->$mod($val);
            }

            if( !empty($field['customSave']) ){
                continue;
            }

            if( $field['type'] == 'fileList' ){
                $val = json_encode( $val );
            }else if($field['type'] == 'select' && $field['multi'] && !$field['relation']) {
                $val = json_encode( $val);
            }

            if( $tableInfo[$key][0] == 'int' || $field['update']['type'] == 'int' )
                $val = $val+0;
            else
                $val = "'".esc($val)."'";

            $values .= "$val,";
            $fields .= "$key,";
        }
        
        if( $this->multiLanguage ){
        	$curLang = getArgv('lang', 2);
        	$fields .= "lang,";
        	$values .= "'$curLang',";
        }
        
        $values = substr($values, 0, -1);
        $fields = substr($fields, 0, -1);
        $sql .= " ($fields) VALUES ($values) ";

#       error_log( $sql );

        dbExec( $sql );
        $this->last = database::last_id();
        $_REQUEST[$this->primary[0]] = $this->last;

        //custom saves
        
        foreach( $this->_fields as $key => $field ){
            if( !empty($field['customSave']) ){
                $func = $field['customSave'];
                $this->$func();
            }
        }
        
        //relations
        foreach( $this->_fields as $key => $field ){
            if( $field['relation'] == 'n-n' ){
                $values = json_decode( getArgv($key) );
                foreach( $values as $value ){
                    $sqlInsert = "
                        INSERT INTO %pfx%".$field['n-n']['middle']."
                        ( ".$field['n-n']['middle_keyleft'].", ".$field['n-n']['middle_keyright']." )
                        VALUES ( '".getArgv($field['n-n']['left_key'])."', '$value' );";
                    dbExec( $sqlInsert );
                }
            }
        }
        
        return true;
    }
}

?>

<?php

/*
* This file is part of Kryn.cms.
*
* (c) Kryn.labs, MArc Schmidt <marc@kryn.org>
*
* To get the full copyright and license informations, please view the
* LICENSE file, that was distributed with this source code.
*/


/**
 * Database class
 * 
 * @package Kryn
 * @subpackage Database
 * @internal
 * @author Kryn.labs <info@krynlabs.com>
 */

define("DB_FETCH_ALL", -1);

class database {
    
        public $results;
        public $type;
        public $querycount = 0;
        public $pdo;
        
        public $connection;
        public $lastError;
        public $lastInsertTable;
        
        public static $fetchmode = PDO::FETCH_ASSOC;
        
        public static $hideSql = false;
        
        public static $needToInt = array('int*', 'tinyint*', 'bit*', 'timestamp', 'double', 'float', 'bigint*');
        public static $alreadyLoaded = false;
        public static $tables;
        
        public $usePdo = false;
        public $databaseName = '';
        public $user = '';
        
        public function __construct( $pDatabaseType = false, $pHost = false, $pUser = false,
                $pPassword = false, $pDatabaseName = false, $pUsePdo = true, $pForceUtf8 = false ) {
            
            if( $pDatabaseType )
                $this->type = $pDatabaseType;
            
            if( $pUsePdo )
                $this->usePdo = true;
                
            $this->databaseName = $pDatabaseName;
            $this->user = $pUser;
            
            if( $pDatabaseType && $pHost ){
                $this->login( $pHost, $pUser, $pPassword, $pDatabaseName, $pForceUtf8 );
            }
            
            self::$tables = kryn::getCache('tables');
        }
        
        public static function readTables( $pForceAll = false ){
            global $kdb, $cfg;
            
            //$mtables = dbExfetch('SHOW TABLES', -1);
            //self::$tables = array();
			
            if( pForceAll == true || !is_array(self::$tables) || count(self::$tables) == 0){// !is_array($kdb->tableInfos) ){
                //if cache is clear, read all tables in the database
                $tables = self::getAllTables();
                foreach( $tables as $table ){
					if( !$kdb->tableInfos[ $table ] )
						$kdb->tableInfos[ $table ] = self::getColumns( $table );
                }
            }
            self::$tables = array();
            
            if( is_array($kdb->tableInfos) ){
                foreach( $kdb->tableInfos as $table => $columns ){
                    
                    //$table = $tableInfo['Tables_in_'.$cfg['db_name']];
                    
                    /*$tableWithoutPrefix = substr($table, strlen(pfx));
                    if( $kdb->tableInfos[$tableWithoutPrefix] ){
                        $columns = $kdb->tableInfos[$tableWithoutPrefix];
                        $table = $tableWithoutPrefix;
                    } else { 
                        $columns = dbExfetch("SHOW COLUMNS FROM $table", -1);
                    }*/
                	
    
                    foreach( $columns as $key => $column ){
                    
                        $column['escape'] = 'text';
                        if( self::isIntEscape($column['Type']) || self::isIntEscape($column['type']) || self::isIntEscape($column[0]) ){
                            $column['escape'] = 'int';
                        }
                        
                        $column['auto_increment'] = ($column['Extras'] == 'auto_increment') ? true : false;
                        if( $column[3] === true )
                            $column['auto_increment'] = true;
                        
                        $fieldname = $column['Field'] ? $column['Field'] : $key;
                        
                        self::$tables[ $table ][ $fieldname ] = $column;
                    }
                
                }
            }
            kryn::setCache('tables', self::$tables);
        }
        
        public static function isIntEscape( $pType ){
			if( !$pType ) return false;
            foreach( self::$needToInt as $type ) {
                if( preg_match("/^$type/", $pType ) )
                    return true;
            }
        }
        
        
        
        //checks whether a table exists in prefix form or without. update cache if not found
        public static function getTable( $pTable ){
        
            if(! is_array(self::$tables) ){
				return pfx.$pTable;
			}
			if( self::$tables[ $pTable ] )
                return $pTable;
				
			if( self::$tables[ pfx.$pTable ] )
                return pfx.$pTable;
            
			/*
            foreach( self::$tables as $table => $columns ){
                if( $table == pfx.$pTable )
                    return pfx.$pTable;
                    
                if( $table == $pTable )
                    return $table;
            }*/
            
            //no table found, delete cache, read tables and try one time again
            if( self::$alreadyLoaded == false ){
                //kryn::removePhpCache('tables');
                //self::readTables();
                self::$alreadyLoaded = true;
                return self::getTable( $pTable );
            }
            return $pTable;
        }
        
        public static function getAllTables(){
        	global $cfg, $kdb;
        	
        	$res = array();
        	
        	switch( $kdb->type ){
        		case 'sqlite':
        			$ttemp = dbExfetch( "SELECT * FROM sqlite_master WHERE type = 'table'", -1 );
        			if( count($ttemp) > 0 ){
                        foreach( $ttemp as $t ){
                        	$res[] = $t['name'];
                        }
        			}
        			break;
        			
        		case 'postgresql':
                    $ttemp = dbExfetch( "SELECT tablename FROM pg_tables WHERE tableowner = '".$kdb->user."'", -1 );
                    if( count($ttemp) > 0 ){
                        foreach( $ttemp as $t ){
                            $res[] = $t['tablename'];
                        }
                    }
                    break;
        			
        		case 'mysql':
        		case 'mysqli':
        		    $ttemp = dbExfetch( 'SHOW TABLES', -1 );
                    if( count($ttemp) > 0 ){
                        foreach( $ttemp as $t ){
                            $res[] = $t['Tables_in_'.$kdb->databaseName];
                        }
                    }
                    break;
               
        	}
        	return $res;
        }

        public static function getColumns( $pTable ){
            global $kdb;
            
            $res = array();
            
            switch( $kdb->type ){
                case 'sqlite':
                    $ttemp = dbExfetch( "PRAGMA table_info($pTable)", -1 );
                    if( count($ttemp) > 0 ){
                    foreach( $ttemp as $t ){
                            $res[$t['name']] = array(
                                'type' => $t['type']
                            );
                        }
                    }
                    break;
                    
                case 'postgresql':
                    $ttemp = dbExfetch( "SELECT * FROM information_schema.columns WHERE table_name = '$pTable';", -1 );
                    if( count($ttemp) > 0 ){
                    foreach( $ttemp as $t ){
                            $res[$t['column_name']] = array(
                                'type' => $t['data_type']
                            );
                        }
                    }
                    break;
                    
                case 'mysql';
                    $ttemp = dbExfetch( 'SHOW COLUMNS FROM '.$pTable, -1 );
                    if( is_array($ttemp) && count($ttemp) > 0 ){
                        foreach( $ttemp as $t ){
                            $res[$t['Field']] = array(
                                'type' => $t['Type']
                            );
                        }
                    }
                    break;
            }
            
            return $res;
        }
        
        
        public function login( $host, $user = '', $pw = '', $kdb = NULL, $pForceUtf8 = false ){
        	
            $t = explode(":", $host);
        	if( is_array($t) && $t[1] != "" )
        		$port = $t[1];
				
				
            $this->databaseName = $kdb;
            $this->user = $user;
            
            if( !$this->usePdo ){
                try {
                    switch( $this->type ){
                        case 'sqlite':
                            $this->connection = sqlite_open( $host );
                            break;
                        case 'mysql':
                            $this->connection = mysql_pconnect( $host, $user, $pw  );
                            @mysql_select_db( $kdb, $this->connection );
                            if( $pForceUtf8 )
                                mysql_query("SET NAMES 'utf8'", $this->connection);
                            break;
                        case 'mysqli':
                            $this->connection = mysqli_pconnect( $host, $user, $pw  );
                            @mysqli_select_db( $this->connection, $kdb );
                            if( $pForceUtf8 )
                                mysqli_query("SET NAMES 'utf8'", $this->connection);
                            break;
                        case 'mssql':
                            $this->connection = mssql_connect( $host, $user, $pw );
                            @mssql_select_db( $kdb, $this->connection );
                            break;
                        case 'oracle':
                            $this->connection = oci_pconnect( $user, $pw, $host."/".$kdb );
                            break;
                        case 'postgresql':
                            if( !$port ){
                                $port = 5432;
                            }
                            if( $user != '' && $user ){
                                $connect_string = "host=$host port=$port dbname=$kdb user=$user password=$pw";
                            } else {
                                $connect_string = "host=$host port=$port dbname=$kdb";
                            }
                            if( $pForceUtf8 ){
                                $connect_string .+ " options='--client_encoding=UTF8'";
                            }
                            $this->connection = pg_pconnect( $connect_string );
                            break;
                    }
                } catch( Exception $e ){
                    die('ERROR');
                    $this->lastError = $e;
                    return false;
                }
                return $this->connection;
                
            } else {
        	        	
                switch($this->type) {
                    case 'mysql':
                    case 'mysqli':
                    	$pdoString = "mysql:host=$host;dbname=$kdb";
                    	break;
    				case 'postgresql':
    					$pdoString = "pgsql:dbname=$kdb;host=$host";
    					break;
    				case 'sqlite':
    					$pdoString = "sqlite:$host";
    					break;
    				case 'oracle':
    					if( !$port )
    						$port = 1521;
    					$tns = " 
    						(DESCRIPTION =
    						    (ADDRESS_LIST =
    						      (ADDRESS = (PROTOCOL = TCP)(HOST = $host)(PORT = $port))
    						    )
    						  )
    						       ";
    					$pdoString = "oci:dbname=$tns";
    					break;
    				case 'firebird':
    					$pdoString = "firebird:dbname=$host:$kdb";
    					break;
                }
              
                try {
                    $opts = null;
                    if( $this->type != 'postgresql' ){
                        $opts = array(
                            PDO::ATTR_PERSISTENT => true
                        );
                    }
                    
                    $this->pdo = new PDO( $pdoString, $user, $pw, $opts);
                } catch (PDOException $e) {
                    $this->lastError = $e->getMessage();
                    return false;
                }
    
                //check if we need to force utf8 for mysql
                if( ($this->type == 'mysql' || $this->type == 'mysqli') )
                	$this->pdo->query("SET NAMES 'utf8'");
                
                if( $pForceUtf8 && ($this->type == 'mysql' || $this->type == 'mysqli') )
                    $this->pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
                
                return $this->pdo;
            }
        }
        
        public static function lastError(){
        	global $kdb;
        	if( $this )
            	return $this->lastError;
            else
            	return $kdb->lastError;
        }
        
        public function connected(){
            if( $this->pdo || $this->connection )
                return true;
            return false;
        }
        
        public function fetch( $pStatement, $pRows = 1, $pMode = false ){
            if( !$this->usePdo ){
                
                if ( $pRows == 1 ){
                    switch( $this->type ){
                        case 'sqlite':
                            $res = sqlite_fetch_array( $pStatement, SQLITE_ASSOC  );
                            break;
                        case 'mysql':
                            $res = mysql_fetch_assoc( $pStatement );
                            break;
                        case 'mysqli':
                            $res = mysqli_fetch_assoc( $pStatement );
                            break;
                        case 'mssql':
                            $res = mssql_fetch_assoc( $pStatement );
                            break;
                        case 'postgresql':
                            $res = pg_fetch_assoc ( $pStatement );
                            break;
                    }
                } else {
                    $res = array();
                    switch( $this->type ){
                        case 'sqlite':
                            while( $row = sqlite_fetch_array( $pStatement, SQLITE_ASSOC ) )
                                $res[] = $row;
                            break;
                        case 'mysql':
                            while( $row = mysql_fetch_assoc( $pStatement ) )
                                $res[] = $row;
                            break;
                        case 'mssql':
                            while( $row = mssql_fetch_assoc( $pStatement ) )
                                $res[] = $row;
                            break;
                        case 'mysqli':
                            while( $row = mysqli_fetch_assoc( $pStatement ) )
                                $res[] = $row;
                            break;
                        case 'postgresql':
                            while( $row = pg_fetch_assoc( $pStatement ) )
                                $res[] = $row;
                            break;
                    }
                }
            } else {
                if( $pMode == false ) $pMode = database::$fetchmode;
                
                if( gettype($result_id) == 'boolean' ) return false;
                if( !$pStatement ) return false;
                
            	if ( $pRows == 1 )
                  $res = $pStatement->fetch($pMode);
                else
                  $res = $pStatement->fetchAll($pMode);
            }
            
            if( $res && is_array($res) ){
                foreach( $res as $index => &$row )


                    if( $index !== 0 && $index+0 == 0 ){
                        if( $index != strtolower( $index ) )
                            $res[strtolower($index)] = $row;
                    } else {

                        if( $row && is_array($row) ){
                            foreach( $row as $key => $val )
                                $row[ strtolower($key) ] = $val;
                        }
                    }
            }
            return $res;
        }		

        public static function getOptions( $pTable ){
        	return self::$tables[ $pTable ];
        }
        
        public static function last_id(){
        	global $kdb;
            $seqName = null;
    	    if( $kdb->type == 'postgresql' ){
    	        $tableDefinition = self::$tables[$kdb->lastInsertTable];
    	        if( is_array($tableDefinition) ){
    	            foreach( $tableDefinition as $fKey => $field ){
        	            if( $field['auto_increment'] == 1 ){
        	                $seqName = 'kryn_'.$kdb->lastInsertTable.'_seq';
        	            }
    	            }
    	        }
    	    }
        	if( $kdb->usePdo ){
        	    return $kdb->pdo->lastInsertId( $seqName )+0;
        	}
        	    
        	if( !$kdb->usePdo ){
        	    switch( $kdb->type ){
                    case 'sqlite':
                        return sqlite_last_insert_rowid( $kdb->connection );
                    case 'mysql':
                        return mysql_insert_id( $kdb->connection );
                    case 'mysqli':
                        return mysqli_insert_id( $kdb->connection );
                    case 'postgresql':
                        $row = $kdb->exfetch("SELECT currval('".$seqName."') as lastid");
                        return $row['lastid'];
                }
        	}
        }
        

    
        public static function updateSequences( $pDb = false ){
            global $kdb;
                
            if( $pDb && is_array( $pDb ) ){
                foreach( $pDb as $key => $val ){
                    $kdb->tableInfos[ pfx.$key ] = $val;
                }
                self::readTables();
            }
            
            foreach( self::$tables as $table => $fields ){
                foreach( $fields as $fieldKey => $field ){
                    if( $field['auto_increment'] == 1 ){
                        $row = dbExfetch('SELECT MAX('.$fieldKey.') as mmax FROM '.$table, 1);
        	            $sql = 'ALTER SEQUENCE kryn_'.$table.'_seq RESTART WITH '.($row['mmax']+1);
        	            dbExec( $sql );
                    }
                }
            }
        }
        
        
        public static function isActive(){
            global $kdb;
            if( $kdb->type == 'mssql' ){
                if( !$kdb->connection ) return false;
            }
            
            if( !$kdb ) return false;
            if( !$kdb->pdo ) return false;
            return true;
        }

        public function exec( $pQuery ){
            
            if( $pQuery == "" )
                return false;
                
    	    if( !database::$hideSql )
            	$this->lastError = null;
            
               
            $queries = explode(';', $pQuery);
            foreach( $queries as $query ){
                if( preg_match('/[\s\n\t]*INSERT[\t\n ]+INTO[\t\n ]+([a-z0-9\_\-]+)/is', $query, $matches) ){
                    $this->lastInsertTable = $matches[1];
                }
            }
                
            $table = preg_match('//', $pQuery, $matches);
                
                
            if( !$this->usePdo ){
                try {
                    switch( $this->type ){
                        case 'sqlite':
                            $res = sqlite_query( $this->connection, $pQuery );
                            break;
                        case 'mysql':
                            $res = mysql_query( $pQuery, $this->connection );
                            break;
                        case 'mysqli':
                            $res = mysqli_query( $this->connection, $pQuery );
                            break;
                        case 'mssql':
                            $res = mssql_query( $pQuery, $this->connection );
                            break;
                        case 'postgresql':
                            $res = pg_query( $this->connection, $pQuery );
                            break;
                    }
                } catch( Exception $e ){
                    $this->lastError = $e;
                    return false;
                }
                if( !$res ){
                    $this->lastError = $this->_last_error();
                    return false;
                }
                return $res;
            } else {
            
            
            	try {
    	        	$res = $this->pdo->prepare( $pQuery );
    	        	if( method_exists($res, 'execute') )
    	               $state = $res->execute();
            	} catch (PDOException $err) {
    	        	if( !database::$hideSql )
    	        		klog('database', "pdo exec exception: " . $err->getMessage() );
    	        	$this->lastError = $err->getMessage();
    	        	return false;
    	        }
    	        
    	        if( !$state && !database::$hideSql && $res ){
    	        	$err = $res->errorInfo();
    	        	$this->lastError = $err[2];
    	        	if( $err[2] )
    	        		klog('database', "pdo exec error: " . $err[2].", SQL: $pQuery" );
    	        	return false;
    	        }
    	        
    	       	if( !$res ){
    	       		
    	        	if( !database::$hideSql )
    	       			klog('database',  "Query failed: $pQuery<br>");
    	       			
    	       		$err = $this->pdo->errorInfo();
    	       		$this->lastError = $err[2];
    	       		klog('database', "err: ".$err[2]);
    	       		return false;
    	       	}
	  
            }	
            $this->querycount++;
            
            
            if( $state === false )
            	return false;
            elseif( is_numeric($state) )
            	return $state;
            
            return $res;
        }
        
        public function _last_error(){
            switch( $this->type ){
                case 'sqlite':
                   $res = sqlite_last_error ();
                   break;
                case 'mysql':
                   $res = mysql_error();
                   break;
                case 'mysqli':
                   $res = mysqli_error();
                   break;
                case 'postgresql':
                   $res = pg_last_error();
                   break;
            }
            return $res;
        }
        
        public function close(){
            if( !$this->usePdo ){
                switch( $this->type ){
                    case 'sqlite':
                        $this->connection = sqlite_open( $host );
                        break;
                    case 'mysql':
                        $this->connection = mysql_connect( $host, $user, $pw  );
                        mysql_select_db( $kdb, $this->connection );
                        break;
                    case 'mysqli':
                        $this->connection = mysqli_connect( $host, $user, $pw  );
                        mysqli_select_db( $this->connection, $kdb );
                        break;
                    case 'mssql':
                        $this->connection = mssql_connect( $host, $user, $pw  );
                        mssql_select_db( $this->connection, $kdb );
                        break;
                    case 'postgresql':
                }       
            } else {
                
            }      
        }
        
        public function rowcount( $pStatement ){
        	return $pStatement->rowCount();
        }
        
        public function exfetch( $pQuery, $pRowcount = 1, $pMode = PDO::FETCH_ASSOC ){
            return $this->fetch($this->exec($pQuery), $pRowcount, $pMode);
        }
        
        public function rowExist( $pQuery ){
            $row = $this->exfetch($pQuery);
            return ($row == false) ? false:true;
        }
}

?>
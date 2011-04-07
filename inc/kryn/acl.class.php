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


class acl {
    
    
    
    public static $cache = array();

    
    public static $acls = array();
    
    
    public static function &readAcls( $pType, $pForce = false ){
        global $user;
        
        if( self::$acls[$pType] && $pForce == false )
            return self::$acls[$pType];
            
        $userRsn = $user->user_rsn;
        $inGroups = '';
 		if( count($user->groups) > 0 )
            foreach( $user->groups as $group ) {
                $inGroups .= $group['group_rsn'].",";
            }
        $inGroups .= "0";
        
        $pType = $pType+0;
        
    	self::$acls[$pType] = dbExfetch("
                SELECT code, access FROM %pfx%system_acl
                WHERE
                type = $pType AND
                (
                    ( target_type = 1 AND target_rsn IN ($inGroups))
                    OR
                    ( target_type = 2 AND target_rsn IN ($userRsn))
                )
                ORDER BY code DESC
        ", DB_FETCH_ALL);

    	return self::$acls[$pType];
    }
    
    
    /*
     * Checks the access to a ACL
     * @param integer $pCode
     * @param string $pAction which action should be checked?
     * @return bool
     * @internal
     */
    public static function checkAccess( $pType, $pCode, $pAction, $pRootHasAccess = false ){
        
        self::normalizeCode( $pCode );
        $acls =& self::readAcls($pType);
        
    	if( count($acls) == 0 ) return true;
        //print "<br/> -".$pCode."- <br />";
    	
    	if( self::$cache[ 'checkAckl_'.$pType.'_'.$pCode.'__'.$pAction] )
    	    return self::$cache[ 'checkAckl_'.$pType.'_'.$pCode.'__'.$pAction];

    	
		$access = false;
		
		$current_code = $pCode;
		    
		$not_found = true;
		$parent_acl = false;
		
		$codes = array();
		
		$i = 0;
		while( $not_found ){
		    $i++;

		    //print 'c: '.$current_code."<br/>";
		    if( $i > 10 ){
		        $not_found = false;
		        break;
		    }
		    
			$acl = self::getAcl( $pType, $current_code );
			
			if( $acl && $acl['code'] ){
				
				$code = str_replace(']', '', $acl['code']);
				$t = explode('[', $code);
				$codes = explode(",", $t[1]);
				
				if( in_array( $pAction, $codes) ){
					if ( 
							($parent_acl == false) || //i'am not a parent
							($parent_acl == true && strpos($acl['code'], '%') !== false) //i'am a parent
					    ){
						$access = ($acl['access'] == 1) ? true : false;
						$not_found = false; //done
						continue;
					}
				}
			}
			
			if( $current_code == '/' ){
			    //we are at the top. no parents left
			    if( $pRootHasAccess )
			        $access = true;
			    $not_found = false; //go out
			}
			
			//go to parent
			if( $not_found == true && $current_code != '/' ){
				//search and set parent
				if( substr($current_code, -1, 1) == '/' ){
			        $pos = strrpos(substr($current_code, 0, -1), '/');
    			    $current_code = substr( $current_code, 0, $pos );
				} else {
			        $pos = strrpos($current_code, '/');
    			    $current_code = substr( $current_code, 0, $pos+1 );
				}
				if( $current_code == '' )
				    $current_code = '/';
			    
				$parent_acl = true;
			}
		}
		
		self::$cache[ 'checkAckl_'.$pCode.'__'.$pAction] = $access;
		return $access;
    }
    

    /**
     * 
     * Returns the acl infos for the specified id
     * @param string $pType
     * @param integer $pCode
     * @return array
     * @internal
     */
    public static function &getAcl( $pType, $pCode ){
    	$acl = false;
    	
        self::normalizeCode( $pCode );
	    $acls =& self::readAcls($pType);
	    
	    foreach( $acls as &$item ){
			$code = str_replace('%', '', $item['code']);
			$t = explode('[', $code);
			$code = $t[0];
			if( $code == $pCode ){
				$acl =& $item;
			}
	    }
	    
	    return $acl;
    }
    
    
    public static function setAcl( $pType, $pTargetType, $pTargetId, $pCode, $pActions, $pWithSub ){

        self::normalizeCode( $pCode );
        $pType += 0;
        $pTargetType += $pTargetType;
        $pTargetId += $pTargetId;
        $pCode = esc($pCode);
        
        self::removeAcl( $pType, $pTargetType, $pTargetId, $pCode );
        
        if( $pWithSub )
            $pCode .= '%';
            
        $pCode = '['.implode(',', $pActions).']';
        
        $last_id = dbInsert('system_acl', array(
            'type' => $pType,
            'target_type' => $pTargetType,
        	'target_rsn' => $pTargetRsn,
            'code' => $pCode
        ));
        
        self::readAcls( $pType, true );
        
        return $last_id;
    }
    
    public static function removeAcl(  $pType, $pTargetType, $pTargetId, $pCode ) {
        
        self::normalizeCode( $pCode );
        
        $pType += 0;
        $pTargetType += $pTargetType;
        $pTargetId += $pTargetId;
        $pCode = esc($pCode);
        
        dbDelete('system_acl', "1=1 
         AND type = $pType
         AND target_type = $pTargetType
         AND target_rsn = $pTargetId
         AND code LIKE '$pCode%'");
        
    }
    
    public static function normalizeCode( &$pCode ){
        
        $pCode = str_replace('//', '/', $pCode);
        
        if( substr($pCode, 0, 1) != '/' )
            $pCode = '/'.$pCode;
            
        
    }
    
}

?>
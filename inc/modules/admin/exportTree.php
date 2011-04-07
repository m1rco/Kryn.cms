<?php
function exportTree( $pParentRsn, $pDomain ){

    $pParentRsn += 0;
    $pDomain += 0;
    
    $result['pages'] = _exportTree( array('rsn' => $pParentRsn, 'domain_rsn' => $pDomain) ); 
    
    return $result;
}

function _exportTree( $pPage ){
	
	$pParentRsn = $pPage['rsn']+0;
	$pDomain = $pPage['domain_rsn']+0;
    $pagesRes = dbExec("SELECT * FROM %pfx%system_pages WHERE prsn = $pParentRsn AND domain_rsn = $pDomain ");
    
    $childs = array();
    while( $row = dbFetch($pagesRes) ){
	     
    	$contentRes = dbExec("SELECT c.* FROM %pfx%system_contents c, %pfx%system_pagesversions v
                WHERE 
                c.page_rsn = ".$row['rsn']."
                AND v.active = 1
                AND c.version_rsn = v.rsn");
        
        while( $contentRow = dbFetch($contentRes) ){
            
            unset($contentRow['rsn']);
            unset($contentRow['page_rsn']);
            $row['contents'][] = $contentRow;
            
        }
        
        
        $row['childs'] = _exportTree($row);
        
        unset($row['rsn']);
        unset($row['domain_rsn']);
        unset($row['prsn']);
        
        $childs[] = $row;
    }
    
    return $childs;
	
}

function importTree( $pJson, $pParentRsn, $pDomain ){
	
	$obj = json_decode( $pJson, true );
	
	_importTree( $obj['pages'], $pParentRsn, $pDomain );
}

function _importTree( $pChilds, $pParent, $pDomain ){
	global $user;
	
	if( !is_array($pChilds) || count($pChilds) == 08 ) return;
	
	foreach( $pChilds as $page ){
		$page['prsn'] = $pParent;
		$page['domain_rsn'] = $pDomain;
		
		print "Adding page: ".$page['title']."\n";
		$lastRsn = dbInsert('system_pages', $page);
		if( $page['contents'] ){
			
			$newVersion = dbInsert('system_pagesversions', array(
				'created' => time(),
				'modified'=>time(),
				'owner_rsn' => $user->user_rsn,
				'page_rsn' => $lastRsn,
				'active' => 1
			));
			
			foreach( $page['contents'] as $content ){
				
				$content['page_rsn'] = $lastRsn;
				$content['version_rsn'] = $newVersion;
				$content['cdate'] = time();
				dbInsert( 'system_contents', $content );
				
			}
		}
		
		_importTree( $page['childs'], $lastRsn, $pDomain );
	}	
	
}

//$result = exportTree(0, 2);
//json( $result );

//$json = file_get_contents("inc/template/exportTree.php");

//print $json;

//print "<pre>";
//json( $result );
//$json = json_encode($result);
//importTree( $json, 6, 1);

?>
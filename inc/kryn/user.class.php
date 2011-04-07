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
 * User class
 * 
 * @package Kryn
 * @subpackage Core
 * @author Kryn.labs <info@krynlabs.com>
 * 
 */


define('GUEST', 0);

class user {

    public $user_rsn = 0;
    public $sessionid;
    public $user = array('username' => 'Guest', 'rsn' => 0);
    public $session;
    public $loggedIn = false;
    public $groups;

    function init(){
        global $kryn, $lang;

        # Delete expired sessions

#       $this->sessionid = esc(($_REQUEST['_sessionid']) ? $_REQUEST['_sessionid']: $_REQUEST['krynsessionid'] );
        $this->sessionid = ($_REQUEST['krynsessionid']!='')?esc($_REQUEST['krynsessionid']):esc($_COOKIE['krynsessionid']);

        if($this->sessionid != ""){
            $row = dbExfetch("SELECT * FROM " . pfx . "system_sessions WHERE id = '$this->sessionid'");
            $this->sessionrow = $row;
            if($row['rsn'] > 0){
                $this->user_rsn = $row['user_rsn'];
                $this->session = $row;
            } else if( $row['rsn'] === 0 ) {
                $this->user_rsn = GUEST;
            } else {
                # Session doesn't exist in table. Down to guest.
                $this->user_rsn = GUEST;
                $this->newSession($this->user_rsn);
            }
        } else {
            # Client doenst have a sessionid. Down to guest.
            $this->user_rsn = GUEST;
            $this->newSession($this->user_rsn);
        }

        switch($_REQUEST['user']){
            case 'login':
                $this->login();
                if($this->user_rsn > 0){
                    dbExec( 'UPDATE %pfx%system_user SET logins = '.($this->user['logins']+1).' WHERE rsn = '.$this->user_rsn );
                    $this->newSession($this->user_rsn);
                }
                if( getArgv(1) == 'admin' ){
                    if( $this->user_rsn > 0 ){
                        $this->loadUser();
                        if( !kryn::checkUrlAccess('admin/backend/', $this) ) json(0);
                        $this->newSession($this->user_rsn);
                        
                        
                        klog('authentication', 'Login success');
                        
                        if($this->user_rsn > 0){
                            dbExec( 'UPDATE %pfx%system_user SET lastlogin = '.(time()).' WHERE rsn = '.$this->user_rsn );
                            
                            $this->clearCache();
                        }
                        json(array('user_rsn' => $this->user_rsn, 'sessionid' => $this->sessionid, 
                            'username' => $_REQUEST['username'],  'lastlogin' => $this->user['lastlogin'],
                            'lang' => $this->user['settings']['adminLanguage']));
                    } else {
                        klog('authentication', str_replace("%s", $_REQUEST['username'], "SECURITY Login failed for '%s' to administration"));
                        json(0);
                    }
                }
                if($this->user_rsn > 0){
                    dbExec( 'UPDATE %pfx%system_user SET lastlogin = '.(time()).' WHERE rsn = '.$this->user_rsn );
                }
                
            case 'logout':
                $this->logout();
                if( getArgv(1) == 'admin' ){
                    json(1);
                }
                //header("Location: ".$kryn->cfg['path']);
                break;
            default:
                $this->refresh();
        }

        $this->loadUser();
        if( $this->user_rsn > 0 )
            $this->loggedIn = true;
        $this->user['loggedIn'] = $this->loggedIn;
    }
    
    public function getSessionLanguage(){
        return $this->session['language'] ? $this->session['language'] : 'en';
    }
    
    public function setSessionLanguage( $pLang ){
        $pLang = esc( $pLang );
        dbExfetch("UPDATE " . pfx . "system_sessions SET language = '$pLang' WHERE id = '$this->sessionid'");
        $this->session['language'] = $pLang;
    }
    
    function clearCache(){
        $cacheCode = "user_".$this->user_rsn;
        kryn::removePhpCache($cacheCode);
    }

    function loadGroups(){
        if( $this->user_rsn > 0 )
            return dbTableFetch( 'system_groupaccess', 'user_rsn = '.$this->user_rsn, -1);
        else
            return array();
    }

    function inGroup( $pGroup ){
        foreach( $this->groups as $group ){
            if( $pGroup == $group['group_rsn'] )
                return true;
        }
        return false;
    }
    
    function loadUser($pRsn = 0){

        if( $pRsn > 0 ) $this->user_rsn = $pRsn;

        $cacheCode = "user_".$this->user_rsn;

        $user = kryn::getPhpCache($cacheCode);
        if( $user == false ){
            $user = dbExfetch("SELECT * FROM " . pfx . "system_user WHERE rsn = " . $this->user_rsn);
            $user['settings'] = unserialize($user['settings']);
            if( $user['settings']['userBg'] == '' )
                $user['settings']['userBg'] = '/admin/images/userBgs/defaultImages/1.jpg';
            $user['sessiontime'] = $this->session['time'];

            $user['groups'] = $this->loadGroups();
            $user['inGroups'] = '';
            if( count( $user['groups'] ) >  0)
                foreach( $user['groups'] as $group )
                    $user['inGroups'] .= ','.$group['rsn'];
            $user['inGroups'] .= '0';
            kryn::setCache( $cacheCode, $user );
        }
        
        
        
        $this->groups = $user['groups'];
        $user['sessionid'] = $this->sessionid;
        $user['session'] = $this->sessionrow;
        $user['ip'] = $_SERVER['REMOTE_ADDR'];
        $this->user = $user;
        tAssign("user", $user);
        return $user;
    }
    
    function login(){
        global $kryn, $lang;
        
        $query = "SELECT * FROM " . pfx . "system_user
                    WHERE
                        username = '" . esc($_REQUEST['username']) . "'
                        AND passwd = '" . md5($_REQUEST['passwd']) . "'
                        AND rsn > 0";
        if($row = dbExfetch($query)){
            $this->user_rsn = $row['rsn'];
            $row['passwd'] = '';
            $this->user = $row;
        } else {
            $this->user_rsn = 0;
        }
        return $this->user_rsn;
    }
    
    function newSession($pUser_rsn){
        global $kryn;
        srand(microtime()*1000000);
        $id = md5(rand(1,1000000000));
        if( $pUser_rsn > 0 )
            $this->user_rsn = $pUser_rsn;
        
        # if sessionid already in table, delete'm.
        if($this->sessionid != ""){
            dbExec("DELETE FROM " . pfx . "system_sessions WHERE id = '".$this->sessionid."'");
        }
        
        # check if id already exist
        $found = true;
        while($found == true){
            $row = dbExfetch("SELECT * FROM " . pfx . "system_sessions WHERE id = '$id'");
            if($row['rsn'] == ''){
                $found = false;
            } else {
                $id = md5(rand(1,1000000000));
            }
        }


        # Save
        $t = time();
        $ip = $_SERVER['REMOTE_ADDR'];
        $useragent = esc($_SERVER['HTTP_USER_AGENT']);
        $page = esc(kryn::$baseUrl.$_REQUEST['_kurl']);
        
        $session = array(
            'id' => $id, 'user_rsn' => $this->user_rsn, 'time' => $t, 'ip' => $ip, 'page' => $page,
            'useragent' => $useragent
        );
        
        if( $kryn->installedMods['users']['db']['system_sessions']['refreshed'] )
            $session['refreshed'] = 0;
        
        if( $kryn->installedMods['users']['db']['system_sessions']['created'] )
            $session['created'] = time();
        
        $res = dbInsert('system_sessions', $session);
        
        if( !$res ){
            unset($session['refreshed']);
            unset($session['created']);
            dbInsert('system_sessions', $session);
        }
        
        $this->sessionrow = $session;
        $this->sessionid = $id;
        setCookie("krynsessionid", '', time()-3600*24*700, "/"); 
        setCookie("krynsessionid", '', time()-3600*24*700, "/admin");
        setCookie("krynsessionid", '', time()-3600*24*700, "/admin/");
        setCookie("krynsessionid", $id, time()+3600*24*7, "/"); # 7 Days
        return true;
    }
    
    function logout(){
        dbExec("DELETE FROM " . pfx . "system_sessions WHERE id = '".$this->sessionid."'");
        $this->user_rsn = GUEST;
        $this->newSession($this->user_rsn);
    }
    
    function refresh(){
        global $cfg, $kryn;
        
        $useragent = esc($_SERVER['HTTP_USER_AGENT']);
        $page = esc(kryn::$baseUrl.$_REQUEST['_kurl']);
        $ip = $_SERVER['REMOTE_ADDR'];
        
        $withRefresh = "";
        if( $kryn->installedMods['users']['db']['system_sessions']['refreshed'] )
            $withRefresh = ", refreshed = refreshed+1";
        
        dbExec("UPDATE " . pfx . "system_sessions SET 
                time = " . time() . ",
                ip = '$ip',
                page = '$page',
                useragent = '$useragent'
                $withRefresh
                
                WHERE id = '$this->sessionid'");
        $time = (time()-60*$cfg['sessiontime']);
        dbExec("DELETE FROM ".pfx."system_sessions WHERE time < ".$time );
    }
    
    function getGroups4User($pRsn){
        return dbExfetch("SELECT group_name FROM ".pfx."system_groupaccess WHERE user_rsn = ".$pRsn, DB_FETCH_ALL);
    }
}

?>
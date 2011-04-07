<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de" dir="ltr">
    <head>
        <title>{if $cfg.systemtitle}{$cfg.systemtitle} | {/if}kryn.cms administration</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <script type="text/javascript" src="{$cfg.path}admin/js=global.js/?noCache={$time}" ></script>
        <script type="text/javascript" src="{$cfg.path}admin/getPossibleLangs:1/?noCache={$time}" ></script>
        <script type="text/javascript" src="{$cfg.path}admin/getLanguage:{$adminLanguage}/js:1/" ></script>
        <script type="text/javascript" src="{$cfg.templatepath}/kryn/mootools-core.js" ></script>
        <script type="text/javascript" src="{$cfg.templatepath}/kryn/mootools-more.js" ></script>
        <script type="text/javascript" src="{$cfg.path}inc/tinymce/jscripts/tiny_mce/tiny_mce.js"></script>
        <script type="text/javascript" src="{$cfg.path}inc/codemirror/js/codemirror.js"></script>

        <script type="text/javascript" src="{$path}inc/template/admin/js/ka.ai.js?nc={$time}" ></script>
        <script type="text/javascript" src="{$path}inc/template/admin/js/ka.js" ></script>
        <script type="text/javascript" src="{$path}inc/template/admin/js/ka.Button.js" ></script>
		
        <link rel="stylesheet" type="text/css" href="{$cfg.templatepath}/admin/css/ka.ai.css" />

        <script type="text/javascript" >
            window._session = new Hash();
            window._session.user_rsn = {$user.rsn+0};
            window._session.username = '{$user.username}';
            window._session.sessionid = '{$user.sessionid}';
            window._session.lang = '{$adminLanguage}';
            window._session.lastlogin = '{$user.lastlogin}';
            window._session.forceLang = '{$request.setLang}';
        </script>
        <link rel="stylesheet" type="text/css" href="{$cfg.templatepath}/admin/css/ka.login.css" />
        <link rel="stylesheet" type="text/css" href="{$cfg.templatepath}/admin/css/ka.Button.css" />
        <link rel="SHORTCUT ICON" href="{$cfg.templatepath}/admin/images/favicon.ico" />
    </head>
    <body>
        <div class="border" id="border">
            <div class="header" id="header">
                <div class="header-left"></div>
                <div class="headRight">
                    <a style="padding-right: 2px;" class="lastItem" href="javascript: ka.openFrontend();" title="[[Frontend]]"><img src="{$path}inc/template/admin/images/icons/eye_bw.png" /></a>
                    <div class="ka-search">
                        <a class="ka-search-icon" title="[[Search]]"></a>
                        <input type="text" class="text" id="ka-search-query" />
                        <a href="javascript:;" onclick="ka.wm.open('admin/help');" class="ka-help-icon" title="[[Help]]"></a>
                        <a href="javascript:;" onclick="ka.clearCache();" id="ka-btn-clear-cache" class="ka-cache-icon" title="[[Clear cache]]"></a>
						<a href="javascript:;" onclick="ka.openSearchContext();" id="ka-btn-create-search-index" class="ka-create-search-index-icon" title="[[Searchengine options]]"></a>
                    </div>
                    <div class="breaker"></div>
                </div>
                <div style="clear: both"></div>
                <div class="mainlinks" id="mainLinks"></div>
                <div class="header-right"></div>
            </div>	
			
            <div class="userInfo">
                [[Welcome]] <span style="font-weight: bold; text-decoration: none; cursor: pointer;" id="user.username"></span>
                  <span style="font-size: 10px;">(<a style="text-decoration: none; color: #eee;" href="javascript: ka.ai.logout();">logout</a>)</span>
            </div>
			
            <div class="middle" id="middle">
                <div class="content ka-desktop" id="desktop">
                </div>
            </div>
            <div class="windowList" id="windowList"></div>
            <div class="iconbar" id="iconbar">
            	<div class="iconbar-item" id="serverTime"></div>
            </div>
        </div>
    </body>
 </html>

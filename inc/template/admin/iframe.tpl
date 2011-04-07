<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de" dir="ltr">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

        <script type="text/javascript" src="{$cfg.path}inc/tinymce/jscripts/tiny_mce/tiny_mce.js"></script>

        <script type="text/javascript" src="{$cfg.templatepath}/kryn/mootools-core.js" ></script>
        <script type="text/javascript" src="{$cfg.templatepath}/kryn/mootools-more.js" ></script>
        <link rel="stylesheet" type="text/css" href="{$cfg.templatepath}/admin/content.css" />
        <script type="text/javascript" src="{$cfg.path}admin/js=global.js/" ></script>
        <script type="text/javascript" src="{$cfg.templatepath}/admin/admin.js" ></script>
        <script type="text/javascript" src="{$cfg.templatepath}/admin/iframe.js" ></script>
        
        <link rel="stylesheet" type="text/css" href="{$cfg.templatepath}/admin/filebrowser.css" />
        <script type="text/javascript" src="{$cfg.templatepath}/admin/filebrowser.js" ></script>

        <link rel="stylesheet" type="text/css" href="{$cfg.templatepath}/admin/dialog.css" />
        <script type="text/javascript" src="{$cfg.templatepath}/admin/dialog.js" ></script>


        <link rel="stylesheet" type="text/css" href="{$cfg.templatepath}/admin/css/DatePicker.css" />
        <script type="text/javascript" src="{$cfg.templatepath}/admin/js/DatePicker.js" ></script>

        <script type="text/javascript" src="{$cfg.templatepath}/admin/js/ka.Button.js" ></script>
        <script type="text/javascript" src="{$cfg.templatepath}/admin/js/ka.fp.js" ></script>

        {kryn module="template" get="head"}

        <script type="text/javascript">{literal}
            window.addEvent( 'click', function(){
                //parent.ka._closeMenus();
            });{/literal}
        </script>
    </head>
    <body style="background-color: white">
    {if $activateLL}
        <div class="activateLL">
            <form method="get" style="padding: 0px; margin:0px;">
            <img src="{$path}inc/template/admin/images/icons/help.png" align="left" style="margin-top:3px" class="tips"
            title="<h1>Mehrsprachigkeit</h1><p>Diese Seite speichert/nutzt mehrere Sprachen.<br />Waehlen Sie hier eine aus,<br/>um diese Seite neuzuladen.</p>"/>
            <select onchange="this.getParent().submit()" name="setActivateLLlang" >
            <img src="{$path}inc/template/admin/images/icons/help.png" align="left" />
                <option value="" >-- Sprache --</option>
            {foreach from=$languages item=lang}
                <option value="{$lang.code}" {if $activateLLlang eq $lang.code}selected{/if}>{$lang.title} ({$lang.code})</option>
            {/foreach}
            </select>
            </form>
        </div>
    {/if}
        {$content}
    </body>
</html>

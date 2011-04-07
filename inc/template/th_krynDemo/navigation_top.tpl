{foreach from=$navi.links item=link}
    <a class="{if $link|@active} active{/if}" title="{$link.title}" href="{$link|@realUrl}">{$link.title}</a>
{/foreach}

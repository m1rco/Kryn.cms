{foreach from=$navi.links item=link name="subnavi"}
    <a class="{if $link|@active} active{/if}" title="{$link.title}" href="{$link|@realUrl}">{$link.title}</a>
    {if !$smarty.foreach.subnavi.last}|{/if}
{/foreach}

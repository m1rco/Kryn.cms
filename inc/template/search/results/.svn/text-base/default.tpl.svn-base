<h3>[[Results for]] <i>{$request.q|escape:"html"}</i></h3>

<div style="padding: 5px;">
{if $results|@count > 0 }
    {foreach from=$results item="page"}
        <a href="{$path}{$langSuffix}{$page.url}" style="font-weight: bold;">{$page.matching_title}</a><br />		
        <div style="padding: 5px 0; color: gray;">         
			{$page.matching_content}
        </div>
        <div style="color: silver; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
            <a style="text-decoration:none" href="{$path}{$langSuffix}{$page.url}">{$_domain.domain}{$path}{$langSuffix}{$page.matching_url}</a>
        </div>		
    {/foreach}
{else}
    <div style="text-align: center; color: gray; font-weight: bold">[[No results]]</div>
{/if}
</div>

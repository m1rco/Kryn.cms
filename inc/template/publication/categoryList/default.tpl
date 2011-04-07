<div class="publicationCategoryList">

    <div>
        <a {if $request.publication_filter eq ""}class="active"{/if} href="{$pConf.listPage|realUrl}/">&raquo; [[All entries]]</a>
    </div>
    {foreach from=$categories item=category}
        <div>
            <a {if $request.publication_filter == $category.rsn}class="active"{/if} href="{$pConf.listPage|realUrl}/publication_filter:{$category.rsn}">&raquo; {$category.title} ({$category.count})</a>
        </div>
    {/foreach}

</div>
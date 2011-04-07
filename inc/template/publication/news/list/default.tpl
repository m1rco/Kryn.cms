
{capture name=publicationNavi}
    {if $pages > 1 }
    <div class="publicationNewsListDefaultNavi">
        {section name=newspage start=1 loop=$pages+1 max=$pConf.maxPages}
            {if $currentNewsPage == $smarty.section.newspage.index }
                <span>{$smarty.section.newspage.index}</span>
            {else}
                <a href="{$page|@realUrl}/{if $request.publication_filter}publication_filter:{$request.publication_filter}/{/if}{$smarty.section.newspage.index}/">{$smarty.section.newspage.index}</a>
            {/if}
        {/section}
    </div>
    {/if}
{/capture}

{$smarty.capture.publicationNavi}


<div class="publicationNewsListDefault">
{foreach from=$items item=item name="newsloop"}

    <div class="publicationNewsListDefaultItem" {if $smarty.foreach.newsloop.last}style="border: 0px;"{/if}>
    
        
        <h2><a class="publicationNewsListDefaultItemLink" href="{$pConf.detailPage|realUrl}/{$item.title|escape:"rewrite"}/{$item.rsn}/" >{$item.title}</a></h2>
        
        <div class="publicationNewsListDefaultItemIntro">
            {if $item.introImage ne ""}
                <img src="{$item.introImage}" class="publicationNewsListDefaultItemIntroImage" align="left" />
            {/if}
            {$item.intro}
            <div style="clear: both;"></div>
        </div>
        
        <div class="publicationNewsListDefaultItemBottom">
            {if $item.deactivatecomments ne 1}
                {$item.commentscount+0} [[comments]],
            {/if}
            {$item.categorytitle} - <span class="publicationNewsListDefaultItemBottomDate">{$item.releasedate|date_format:"%d.%m.%Y %H:%M"}</span>
            
            <a style="float: right;" href="{$pConf.detailPage|realUrl}/{$item.title|escape:"rewrite"}/{$item.rsn}/">[[read more]]</a>
            
        </div>
    </div>
    
{/foreach}
</div>

{$smarty.capture.publicationNavi}


{if $pConf.enableRss == 1}
{unsearchable}
<div class="publicationNewsListDefaultRss">
     <a href="{$page|@realUrl}/publication_rss:1" class="publicationNewsListDefaultRssLink">[[RSS-Feed]]</a>
</div>
{/unsearchable}
{/if}

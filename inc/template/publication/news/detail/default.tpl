

<a href="javascript: history.go(-1);">« [[back]]</a><br />
<div class="publicationNewsListDefaultItem">
    <h2>{$news.title}</h2>
    <div class="publicationNewsListDefaultItemIntro">
        {if $news.introImage ne ""}
            <img src="{$news.introImage}" class="publicationNewsListDefaultItemIntroImage" align="left" />
        {/if}
        {$news.intro}
        <div style="clear: both;"></div>
    <br />
    {$news.content}
    </div>
    
            
    <div class="publicationNewsListDefaultItemBottom">
        {if $news.deactivatecomments ne 1}
            {$news.commentscount+0} [[comments]],
        {/if}
        {$news.categorytitle} - <span class="publicationNewsListDefaultItemBottomDate">{$news.releasedate|date_format:"%d.%m.%Y %H:%M"}</span>
        
        
    </div>
    
</div>












{if $pConf.allowComments eq 1 && $news.deactivateComments ne 1}
<div class="publication-news-detail-comments">

    {capture name=publicationCommentNavi}
        {if $pages > 1 }
        <div class="publicationNewsDetaultCommentDefaultNavi">
            {section name=commentpage start=1 loop=$pages+1 max=$pConf.maxPages}
                {if $currentCommentsPage == $smarty.section.commentpage.index }
                    <span>{$smarty.section.commentpage.index}</span>
                {else}
                    <a href="{$page|@realUrl}/{$news.title|escape:"rewrite"}/{$news.rsn}/{$smarty.section.commentpage.index}/">{$smarty.section.commentpage.index}</a>
                {/if}
            {/section}
        </div>
        {/if}
    {/capture}

    {$smarty.capture.publicationCommentNavi}

    
    <div class="publication-news-detail-comments-items">
    {foreach from=$comments item=comment name="comments"}
        <div class="publication-news-detail-comments-item publication-news-detail-comments-item-{$smarty.foreach.comments.index%2}">
            <div style="font-weight: bold;">
                <u>{$comment.owner_username}</u> {if $comment.website} <span style="font-weight: normal;">([[from]] <a href="http://{$comment.website}">{$comment.website}</a>) </span>{/if} [[says]]:<br />
                {$comment.created|date_format:"%d.%m.%Y %H:%M"}
            </div>
            <div class="publication-news-detail-comments-item-message" >{$comment.message|wordwrap:100:"\n":true}</div>
        </div>
    {/foreach}
    </div>
    
    
    {$smarty.capture.publicationCommentNavi}

    <form method="post">
    <input type="hidden" name="publication-add-comment" value="1" />
    <div class="publication-news-detail-comments-newentry">
        <h2 class="publication-news-detail-answer">ANSWER</h2>
        <div class="publication-news-detail-answer-bg">
            <table width="100%">
            
                <tr>
                    <td><b>[[Name]]</b> *</td>
                    <td><b>[[Email]]</b></td>
                    <td><b>[[Website]]</b></td>
                </tr>
                
                <tr>
                    <td>
                        {if $user.rsn > 0 }
                            <input type="text" class="text" style="width: 190px;" name="name" value="{$user.username}" disabled="disabled"/>
                        {else}
                            <input type="text" style="width: 190px;" class="text" name="name" />
                        {/if}
                    </td>
                    <td><input type="text" style="width: 190px;" class="text" name="email" /></td>
                    <td><input type="text" style="width: 190px;" class="text" name="website" /></td>
                </tr>
                
                <tr>
                    <td colspan="3">
                        <div style=" margin-right: 14px;">
                            <textarea style="width: 100%" name="message" ></textarea>
                        </div>
                    </td>
                </tr>
            <tr>
                <td  colspan="3" align="right" style="padding-right: 10px;">
                    <input type="submit" value="[[Send]]" />
                </td>
            </tr>
            </table>
        </div>
    </div>
    </form>
</div>
{/if}

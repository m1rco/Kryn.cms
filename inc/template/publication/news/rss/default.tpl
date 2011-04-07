<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel> 
    <atom:link href="http://{$smarty.server.SERVER_NAME}/{$page.realUrl}" rel="self" type="application/rss+xml" />
    <title>{$page.page_title}</title>   
    <link>http://{$smarty.server.SERVER_NAME}{$page.realUrl}</link>
    <description>{$page.page_title} - {$page.title}</description>
    <language>de-de</language>
    <pubDate>{$smarty.now|date_format:"%a, %d %b %Y %H:%M:%S"} GMT</pubDate>
    <lastBuildDate>{$smarty.now|date_format:"%a, %d %b %Y %H:%M:%S"} GMT</lastBuildDate>
    <docs>http://{$smarty.server.SERVER_NAME}/{$page.realUrl}</docs>
    <generator>Kryn CMS</generator> 
    
{foreach from=$items item=item} 
    <item>
        <title>{$item.title}</title>
        <link>http://{$smarty.server.SERVER_NAME}/{$pConf.detailPage|realUrl}/{$item.title|escape:"rewrite"}/{$item.rsn}/</link>
        <description>{$item.intro}</description>
        <pubDate>{$item.releaseDate|date_format:"%a, %d %b %Y %H:%M:%S"} GMT</pubDate>
        <guid>http://{$smarty.server.SERVER_NAME}/{$pConf.detailPage|realUrl}/{$item.title|escape:"rewrite"}/{$item.rsn}/</guid>
    </item>   
{/foreach}

</channel>
</rss>

{addCss file="th_krynDemo/base.css"}


<div class="header">
    <div class="wrapper">
        <div class="header-top">
            {navigation level="1" template="th_krynDemo/navigation_top.tpl"}
        </div>
        
        <div class="header-logo">
            <a href="{$path}">
                <img src="{resizeImage file=$publicProperties.logo dimension="90x90"}" align="left" />
                <span class="header-logo-title">{$publicProperties.title}</span><br />
                <span class="header-logo-slogan">{$publicProperties.slogan}</span>
            </a>
        </div>
        
        <div class="header-subnavi">
            {navigation level="2" template="th_krynDemo/navigation_subnavi.tpl"}
        </div>
        
        <div class="header-search">
            <form action="{$publicProperties.search_page|realUrl}" method="get">
                <input type="text" name="q" value="[[Keyword ...]]" onfocus="if(this.value == '[[Keyword ...]]')this.value=''" onblur="if(this.value=='')this.value='[[Keyword ...]]'"/>
                <input type="submit" class="submit" value="[[Search]]" />
                <input type="hidden" name="searchDo" value="1" />
            </form>
        </div>
    </div>
</div>

<div class="content">
    <div class="wrapper">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td valign="top">
                    <div class="content-main">
                        <div class="content-main-padding">
                            {slot id="1" name="[[Main content]]" picturedimension="640x1000"}
                        </div>
                    </div>
                </td>
                <td valign="top">
                    {if $admin}
                        <div class="content-sidebar">
                            {slot id="2" name="[[Sidebar]]" assign="sidebar"}
                        </div>
                    {else}
                        {slot id="2" name="[[Sidebar]]" assign="sidebar"}
                        {if $sidebar ne ""}
                            <div class="content-sidebar">
                                {$sidebar}
                            </div>
                        {/if}
                    {/if}
                </td>
            </tr>
        </table>
    
    </div>
</div>


<div class="footer">
    <div class="wrapper">footer-box
        <div class="footer-box">
            <div class="footer-box-padding">
                <table width="100%">
                    <tr>
                        <td valign="top">
                            {if $publicProperties.footer_deposit eq ""}
                                [[Please set "Footer deposit" under Domain » Theme » Kryn Demo]]
                            {else}
                                {page id=$publicProperties.footer_deposit}
                            {/if}
                        </td>
                        <td align="right" valign="top">
                            {navigation id=$publicProperties.footer_navi template="th_krynDemo/navigation_footer.tpl"}
                        </td>
                    </tr>
                </table>
                
            </div>
        </div>
    </div>
</div>
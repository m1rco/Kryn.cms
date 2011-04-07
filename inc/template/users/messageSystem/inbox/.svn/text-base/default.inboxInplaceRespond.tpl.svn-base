{addJs file="kryn/mootools-core.js"}
{addJs file="kryn/mootools-more.js"}

{addCss file=users/messageSystem/css/`$pConf.template`.css}
{addJs file=users/messageSystem/js/`$pConf.template`.js}


Template: {$pConf.template}

<div class="user-message-system-ibox">          
    {if $messages|@count > 0}       
    <form method="post" action="{$page|@realUrl}" id="msg-action-form">
        <input type="hidden" name="action" value="true" />              
        <table>
            <tr class="user-message-system-ibox-table-head">
                <td class="user-message-system-one-message-td-action-select">
                    <input type="checkbox" id="user-message-system-toggle-all-checks">
                </td>
                <td colspan="2">
                    <select name="action_select" id="msg-action-select">                                
                        <option value="none">[[selected...]]</option>
                        <option value="delete">[[delete]]</option>
                        <option value="flagRead">[[flag as read]]</option>
                        <option value="flagUnRead">[[flag as not read]]</option>
                    </select>                           
                    [[You have {$count} message(s)]]
                </td>                                               
            </tr>   
            
        {foreach from=$messages item=oneMessage name=messageLoop}
            <tr class="user-message-system-ibox-table-one-message
             {if ($smarty.foreach.messageLoop.index) % 2 == 1}
                 user-message-system-ibox-table-one-message-darker
            {/if}
            " id="one-message-pre-{$oneMessage.rsn}">                       
                <td rowspan="2" class="user-message-system-one-message-td-action-select">
                    <input type="checkbox" name="one-message-action[]" value="{$oneMessage.rsn}" class="user-message-system-one-message-action-select">
                </td>
                <td class="one-message-left">
                    <div class="user-message-system-one-message-date">
                        {$oneMessage.send_tstamp|date_format:"%d.%m.%Y um %H:%I"}
                    </div>
                    <div id="openMessageBtn{$oneMessage.rsn}" onclick="openMessage($('openMessageBtn{$oneMessage.rsn}'), '{$oneMessage.rsn}')" class="user-message-system-one-message-subject one-message-subject-{$oneMessage.message_state}" title="[[show / hide this message]]">
                        {$oneMessage.message_subject}
                    </div>
                    <div class="user-message-system-one-message-from">
                        <b>Sender:</b> {$oneMessage.user_name_from}
                    </div>                                                  
                </td>                       
                <td>
                    <div class="user-message-system-one-message-panel">
                        
                        <div class="panel-item">
                            <a onclick="openRespondPanel({$oneMessage.rsn}); return false;" href="{$newMessagePage|@realUrl}?oldMessageRsn={$oneMessage.rsn}" class="user-message-system-one-message-respond">
                                [[respond]]
                            </a>
                        </div>
                        {if $newMessagePage}
                        <div class="panel-item">                                    
                            <a href="{$newMessagePage|@realUrl}?oldMessageRsn={$oneMessage.rsn}&amp;type=fwd" class="user-message-system-one-message-forward">                                      
                                [[forward]]
                            </a>
                        </div>  
                        {/if}                           
                        <div class="panel-item no-border">                                  
                            <a id="delMsgBtn{$oneMessage.rsn}" onclick="askDelete($('delMsgBtn{$oneMessage.rsn}')); return false;" href="{$page|@realUrl}?action_select=delete&amp;one-message-action[]={$oneMessage.rsn}" class="user-message-system-one-message-forward">
                                [[delete]]
                            </a>
                        </div>
                        
                    </div>
                </td>
            </tr>
            <tr class="user-message-system-ibox-table-one-message
             {if ($smarty.foreach.messageLoop.index) % 2 == 1}
                 user-message-system-ibox-table-one-message-darker
            {/if}
              no-border">                       
                <td colspan="2">
                    <div id="one-message-text-{$oneMessage.rsn}" style="display:none;">
                        <div class="user-message-system-one-message-text" class="one-message-message-text">                 
                            {$oneMessage.message_text|nl2br}                                                            
                        </div>
                        <b>[[Respond]]</b>
                        <textarea id="one-message-response-textarea-{$oneMessage.rsn}" class="user-message-system-one-message-textarea"></textarea>
                        <div id="sendMsgBtn{$oneMessage.rsn}" class="user-message-system-one-message-send-btn" onclick="sendAjReMessage({$oneMessage.rsn}, $('sendMsgBtn{$oneMessage.rsn}'))">
                            [[Send]]                                    
                        </div>
                        <div class="user-message-system-one-message-send-btn" style="display:none;cursor:default;">
                            [[Sending message... please wait]]
                        </div>                                  
                        <div class="user-message-system-one-message-send-btn" style="display:none;cursor:default;">
                            [[Your message has been sent.]] 
                        </div>                                  
                        <div class="user-message-system-one-message-send-btn" style="display:none;cursor:default;">
                            [[Error! Could not send message.]] 
                        </div>                                  
                    </div>
                </td>
            </tr>                       

        {/foreach}              
        </table>                
    {if $pages > 1 }
    <div class="user-message-system-ibox-pages">[[Page]]: 
        {section name=messagePage start=1 loop=$pages+1}
            {if $currentMessagePage == $smarty.section.messagePage.index }
                <span class="user-message-system-ibox-cur-page">{$smarty.section.messagePage.index}</span>
            {else}
                <a href="{$page|@realUrl}/{$smarty.section.messagePage.index}/" class="user-message-system-ibox-one-page">{$smarty.section.messagePage.index}</a>
            {/if}
        {/section}
    </div>
    {/if}   
    
</form>
{else}
    <h2 class="user-message-system-ibox-no-messages-msg">[[You do not have any message in your inbox.]]</h2>
{/if}               
</div>
<h1> Messages Outbox</h1>

<div class="user-message-system-obox">

{if $messages|@count > 0}
<div class="user-message-system-one-message-count">[[There are {$count} message(s) in your outbox]]</div>
	<table>
		<tr class="user-message-system-ibox-table-head">			
			<td>[[to]]</td>			
			<td>[[message]]</td>
			{if $showMessageState == 1}
				<td>[[state]]</td>
			{/if}
			<td>[[sent]]</td>
			
		</tr>	
	{foreach from=$messages item=oneMessage}
		<tr class="user-message-system-obox-table-one-message">			
			<td>
				{$oneMessage.user_name_to}
			</td>
			
			<td>
				<div class="user-message-system-outbox-one-message-subject" title="[[show / hide this message]]">{$oneMessage.message_subject}</div>
				<div class="user-message-system-one-message-text" style="display:none;">					
					{$oneMessage.message_text|nl2br}					
				</div>
			</td>
			
			{if $showMessageState == 1}
				<td>
					{if $oneMessage.message_state == 0}
						[[unread]]
					{elseif $oneMessage.message_state == 1}
						[[read]]
					{else}
						[[deleted]]
					{/if}
				</td>
			{/if}
			
			<td>
				<div class="user-message-system-one-message-date">
					{$oneMessage.send_tstamp|date_format:"%d.%m.%Y %H:%I"}
				</div>
			</td>
			
		</tr>	
	{/foreach}		
	</table>
	{if $pages > 1 }
    <div class="user-message-system-obox-pages">[[Page]]: 
        {section name=messagePage start=1 loop=$pages+1}
            {if $currentMessagePage == $smarty.section.messagePage.index }
                <span class="user-message-system-obox-cur-page">{$smarty.section.messagePage.index}</span>
            {else}
                <a href="{$page|@realUrl}/{$smarty.section.messagePage.index}/" class="user-message-system-obox-one-page">{$smarty.section.messagePage.index}</a>
            {/if}
        {/section}
    </div>
    {/if}
{else}
	<h4 class="user-message-system-ibox-no-messages-msg">[[No messages in your outbox.]]</h4>
{/if}
</div> 
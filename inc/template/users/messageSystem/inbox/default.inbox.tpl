{addJs file="kryn/mootools-core.js"}
{addJs file="kryn/mootools-more.js"}

<h1> Messages Inbox</h1> 

<div class="user-message-system-ibox">

{if $messages|@count > 0}
<div class="user-message-system-one-message-count">[[There are {$count} message(s) in your inbox]]</div>
<form method="post" action="{$page|@realUrl}" id="users-login">
	<table>
		<tr class="user-message-system-ibox-table-head">
			<td><input type="checkbox" id="user-message-system-toggle-all-checks"></td>
			<td>[[from]]</td>			
			<td>[[message]]</td>
			<td>[[recieved]]</td>
		</tr>	
	{foreach from=$messages item=oneMessage}
		<tr class="user-message-system-ibox-table-one-message">
			<td>
				<input type="checkbox" name="one-message-action[]" value="{$oneMessage.rsn}" class="user-message-system-one-message-action-select">
			</td>
			
			<td>
				{$oneMessage.user_name_from}
			</td>
			
			<td>
				<div onclick="openMessage(this, '{$oneMessage.rsn}')" class="user-message-system-one-message-subject one-message-subject-{$oneMessage.message_state}" title="[[show / hide this message]]">{$oneMessage.message_subject}</div>
				<div class="user-message-system-one-message-text" style="display:none;">					
					{$oneMessage.message_text|nl2br}
					<div class="user-message-system-one-message-panel">
						{if $newMessagePage}
						<a href="{$newMessagePage|@realUrl}?oldMessageRsn={$oneMessage.rsn}"  class="user-message-system-one-message-respond">[[Respond to]]</a>
						<a href="{$newMessagePage|@realUrl}?oldMessageRsn={$oneMessage.rsn}&amp;type=fwd" class="user-message-system-one-message-forward">[[Forward to]]</a>
						{/if}
					</div>
				</div>
			</td>
			
			<td>
				<div class="user-message-system-one-message-date">
					{$oneMessage.send_tstamp|date_format:"%d.%m.%Y %H:%I"}
				</div>
			</td>
		</tr>	
	{/foreach}	
		<tr class="user-message-system-table-footer">		
			<td colspan="2">
				<select name="action_select">
					<option value="delete">[[delete]]</option>
					<option value="flagRead">[[mark as read]]</option>
					<option value="flagUnRead">[[mark as unread]]</option>
				</select>
			</td>
			<td>[[all selected messages]]</td>
			<td><input type="submit" name="action" value="[[action]]"  class="user-message-system-one-message-action-btn"/>
		</tr>
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
	<h4 class="user-message-system-ibox-no-messages-msg">[[No messages in your inbox.]]</h4>
{/if}

</div>
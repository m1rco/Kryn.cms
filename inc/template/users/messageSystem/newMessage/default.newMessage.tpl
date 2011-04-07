{addJs file="kryn/mootools-core.js"}
{addJs file="kryn/mootools-more.js"}

<h1>New Message</h1>

<div class="user-message-system-new-message">
	{if $msg_message_sent}
		<div class="user-message-system-new-message-msg-suc">
			<h2>[[Your message has been sent]]</h2>
		</div>
	{/if}
	
	
	{if $msg_unknown_user}
		<div class="user-message-system-new-message-msg-error">
			<h2>[[Error! User unknown. ]]</h2>
		</div>
	{/if}
	
<form method="post" action="{$page|@realUrl}" id="user-message-system-new-message-form">
	<input type="hidden" name="sendNewMessage" value="true" />
	<div class="user-message-system-new-message-label">[[recipient]] [[enter the user-id, email-address or the user name]]</div>		
	<div><input type="text" name="to_user_id" value="{$smarty.request.to_user_id}" class="user-message-system-new-message-input"/></div>
	
	<div class="user-message-system-new-message-label">[[Message subject]] </div>		
	<div><input type="text" name="message_subject" value="{$smarty.request.message_subject}" maxlength="255"  class="user-message-system-new-message-input"/></div>
	
	<div class="user-message-system-new-message-label">[[Message text]] </div>		
	<div>
		<textarea rows="6" cols="70" name="message_text" class="user-message-system-new-message-textarea">{$smarty.request.message_text}</textarea>
	</div>
	
	<div id="sendNewMessage" class="user-message-system-btn" onclick="umsNewMessageCheckForm();">
		[[send]]
	</div>	
</form>
</div>
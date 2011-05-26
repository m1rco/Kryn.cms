<form action="" method="post">
    <dl id="registrationform">
    {if $errors}
        <dt id="errorHead">[[Registration failed]]</dt>
        <dd id="errorBody">
            <ul>
            {foreach from=$errors item=$error}
                <li>{$error}</li>
            {/foreach}
            </ul>
        </dd>
    {/if}
        
        <dt>[[Username]]</dt>
        <dd><input type="text" name="username" value="{$REQ.username}" /></dd>
        
        <dt>[[First name]]</dt>
        <dd><input type="text" name="firstname" value="{$REQ.lastname}" /></dd>
        
        <dt>[[Last name]]</dt>
        <dd><input type="text" name="lastname" value="{$REQ.lastname}" /></dd>
    
    </dl>
</form>
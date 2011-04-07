<form method="post" action="{$page|@realUrl}" id="users-login">
    <input type="hidden" name="users-login" value="1" />
    E-Mail<br />
    <input type="text" class="text" id="users-email" name="users-email" /><br />

    Password<br />
    <input type="password" name="users-passwd" class="text" /><br />

    {if $loginFailed}
        <div style="padding: 5px; color: red; font-weight: bold;">
            Login fehlgeschlagen.
        </div>
    {/if}

    <a class="button" href="javascript: document.getElementById('users-login').submit();">Login</a>
    <div style="overflow: hidde; height: 1px; visibility: hidden;"><input type="submit" /></div>

</form>
<script type="text/javascript">$('users-email').focus()</script>

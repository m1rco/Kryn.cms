<form action="" method="post">
    <dl id="registrationform">
    {if $errors}
        <dt id="errorHead">[[Registration failed]]</dt>
        <dd id="errorBody">
            <ul>
            {foreach from=$errors item=error}
                <li>{$error}</li>
            {/foreach}
            </ul>
        </dd>
    {/if}
        <dd>Fields in <strong>bold</strong> are required for registration</dd>
        
        <dt class="req">[[Username]]</dt>
        <dd><input type="text" name="username" id="reg_username" /></dd>
        
        <dt class="req">[[Password]]</dt>
        <dd><input type="password" name="password" id="reg_password" /></dd>
        
        <dt class="req">[[Email address]]</dt>
        <dd><input type="email" name="email" id="reg_email" />
        
    {if not $hidden.firstname}
        <dt{if $required.firstname} class="req"{/if}>[[First name]]</dt>
        <dd><input type="text" name="firstname" id="reg_firstname" /></dd>
    {/if}
        
    {if not $hidden.lastname}
        <dt{if $required.lastname} class="req"{/if}>[[Last name]]</dt>
        <dd><input type="text" name="lastname" id="reg_lastname" /></dd>
    {/if}
        
    {if not $hidden.street}
        <dt{if $required.street} class="req"{/if}>[[Street]]</dt>
        <dd><input type="text" name="street" id="reg_street" /></dd>
    {/if}
        
    {if not $hidden.city}
        <dt{if $required.city} class="req"{/if}>[[City]]</dt>
        <dd><input type="text" name="city" id="reg_city" /></dd>
    {/if}
        
    {if not $hidden.zipcode}
        <dt{if $required.zipcode} class="req"{/if}>[[Zipcode]]</dt>
        <dd><input type="text" name="zipcode" id="reg_zipcode" /></dd>
    {/if}
        
    {if not $hidden.country}
        <dt{if $required.country} class="req"{/if}>[[Country]]</dt>
        <dd><input type="text" name="country" id="reg_country" /></dd>
    {/if}
        
    {if not $hidden.phone}
        <dt{if $required.phone} class="req"{/if}>[[Phone]]</dt>
        <dd><input type="text" name="phone" id="reg_phone" /></dd>
    {/if}
        
    {if not $hidden.fax}
        <dt{if $required.fax} class="req"{/if}>[[Fax]]</dt>
        <dd><input type="text" name="fax" id="reg_fax" /></dd>
    {/if}
        
    {if not $hidden.company}
        <dt{if $required.company} class="req"{/if}>[[Company]]</dt>
        <dd><input type="text" name="company" id="reg_company" /></dd>
    {/if}
    
    </dl>
</form>
<pre>{$debug}</pre>
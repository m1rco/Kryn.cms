<div id="registrationform">
    <dl>
        <dt>Fields in <strong>bold</strong> are required for registration</dt>
        
        <dt class="req">[[Email address]]</dt>
        <dd><input type="text" name="email" id="reg_email" />
        
        <dt class="req">[[Password]]</dt>
        <dd><input type="password" name="password" id="reg_password" /></dd>
        
    {if not $hidden.username}
        <dt{if $required.username} class="req"{/if}>[[Username]]</dt>
        <dd><input type="text" name="username" id="reg_username" /></dd>
    {/if}
        
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
    
        <dd><input type="button" id="register" value="[[Register]]" /> <img id="loader" src="inc/template/admin/images/ka-tooltip-loading.gif" /></dd>
    </dl>
    <div id="error"></div>
</div>
<div style="clear: both;"></div>
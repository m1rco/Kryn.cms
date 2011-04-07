<form action="{$pConf.page|realUrl}" method="post">
    <input type="text" class="text" name="q" value="{$request.q|escape:"html"}"/>
    <input type="hidden" name="searchDo" value="1" />
    <input type="submit" value="[[Search]]" />
</form>

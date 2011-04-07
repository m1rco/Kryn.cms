<?php
function smarty_function_getPage($params, &$smarty){
        global $modules, $user, $kryn;

        $tId = $params['name'];
        $rsn = $params['id']+0;

        $row = dbTableFetch('system_pages', 1, "rsn = $rsn");
        tAssign($tId, $row);
}
?>

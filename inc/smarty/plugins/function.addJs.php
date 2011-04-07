<?php
function smarty_function_addJs($params, &$smarty){
    kryn::addJs( $params['file'] );
}
?>

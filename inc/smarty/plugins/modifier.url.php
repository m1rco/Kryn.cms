<?php

function smarty_modifier_url($string){

    return kryn::toModRewrite($string);
}

?>

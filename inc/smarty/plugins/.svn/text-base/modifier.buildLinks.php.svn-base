<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage plugins
 */


/**
 * Smarty default modifier plugin
 *
 * Type:     modifier<br>
 * Name:     default<br>
 * Purpose:  designate default value for empty variables
 * @link http://smarty.php.net/manual/en/language.modifier.default.php
 *          default (Smarty online manual)
 * @author   Monte Ohrt <monte at ohrt dot com>
 * @param string
 * @param string
 * @return string
 */
function smarty_modifier_buildLinks($string, $pIsNavigation = false)
{
    $pages = navigation::getAdminLinks( $string, $pIsNavigation );
    tAssign( 'pages', $pages );
    return tFetch( 'admin/links_items.tpl' );
    #return "<tr><td></td></tr>";
}

/* vim: set expandtab: */

?>

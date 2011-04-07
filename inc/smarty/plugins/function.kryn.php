<?php
function smarty_function_kryn($params, &$smarty){
        global $modules, $user, $kryn, $searchIndexMode;

        $module = $params['module'];
        $method = $params['plugin'];

        switch($module){
        case 'navigation':
                      
            //check if searchmode
            if($searchIndexMode && (!isset($params['search']) || !$params['search']))
                $result = '';
            else
                $result = knavigation::plugin( $params );
            
            break;
        case 'template':
            $result = tpl::plugin( $params['get'] );
            break;
        case 'page':
            return kryn::renderPageContents( $params['id'], $params['slot'], $params );
            //return kryn::getPageContent( $params['id'], true );
            break;
        default:
            if($kryn->installedMods[$module]){
                $plugins = $kryn->installedMods[$module]['plugins'];
                $count = 0;

                $paramsGiven = explode("=", $info[1]);
                $paramsExtract = explode("::", $paramsGiven[1]);

                if( count($plugins) > 0)
                    foreach($plugins as $key => $var)
                        if($key == $method){ //das aufgerufene Module
                            if(is_array($var[1])) //gibt es parameter für das plugin
                                foreach($var[1] as $pkey => $pval){
                                    $myparams[$pkey] = $paramsExtract[$count];
                                    $myparams[$pkey] = $params[$pkey];
                                    $count++;
                                }
                        }

                $temp = ob_get_contents();
                ob_end_clean();
                ob_start();
                $result = $modules[$module]->$method($myparams);
                $result = ob_get_contents().$result;
                ob_end_clean();
                ob_start();
                print $temp;
                
                if($searchIndexMode && isset($kryn->installedMods[$module]['plugins'][$method][2]) && $kryn->installedMods[$module]['plugins'][$method][2] == 1)
                    $result = '';
                
                
                
                break;

            }
        }
        return $result;
}

?>

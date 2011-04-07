<?php
function smarty_function_krynContent( $params, &$smarty ){
        global $kryn, $modules, $tpl, $searchIndexMode;

        if( getArgv(1) == 'admin' && $kryn->forceKrynContent != true ){
            $return = "{slot";
            foreach( $params as $key => $val ){
                $return .= ' '.$key.'="'.str_replace('"', '\"', $val).'"';
            }
            $return .= "}";
            
            return $return;
        }

        
        /*
        $page = $kryn->current_page;
        if( $kryn->pointer_page ){
            $page = $kryn->pointer_page;
        }

        $page_rsn = $page['rsn'];
        if( $params['page_rsn'] > 0 ){
            $page_rsn = $params['page_rsn'];
        }

        $contents = $kryn->getPageContents( $page_rsn, $params['id'] );
        tAssign("layoutContents", &$contents);
		*/
        
        //$html = '';// kryn::readTempFile( "kryn/layouts/" . $page['layout'] . ".tpl" );;
        return kryn::renderContents( kryn::$contents[$params['id']], $params);
        
        //return kryn::renderContents( null, $params['id'], $params );
        
        /*
        $contents = kryn::$contents[ $params['id'] ];
        
        if( !$params['assign'] ){
            return kryn::renderContents($contents, $params);
        } else {
            tAssign($params['assign'], kryn::renderContents($contents, $params));
        }
        */

        //return $html;
        
}
?>
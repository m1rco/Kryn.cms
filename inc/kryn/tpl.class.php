<?php

/*
 * This file is part of Kryn.cms.
 *
 * (c) Kryn.labs, MArc Schmidt <marc@kryn.org>
 *
 * To get the full copyright and license informations, please view the
 * LICENSE file, that was distributed with this source code.
 *
 */


/**
 * tpl class
 * 
 * @internal
 * @package Kryn
 * @subpackage Core
 * @author Kryn.labs <info@krynlabs.com>
 */


class tpl {

    public static function plugin( $pMethod ){
        
        switch( $pMethod ){
        case 'head':
            return tpl::buildHead();
        }

    }


    public static function buildPage( $pContent ){
        global $kryn, $cfg;

        $doctypeXhtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de" dir="ltr">';

        switch( $kryn->doctype ){
        case 'xhtml':
        default:
            $doctypeHead = $doctypeXhtml;
        }

        $res = $doctypeHead.'<head>'.$kryn->htmlHeadTop;
        $res .= tpl::buildHead(true);

        $res .= $kryn->htmlHeadEnd.'</head><body>'.$kryn->htmlBodyTop.$pContent."\n\n".$kryn->htmlBodyEnd.'</body></html>';

        return $res;
    }

    public static function buildHead( $pContinue = false ){
        global $kryn, $cfg;

        $tagEnd = ($kryn->doctype=='xhtml')?' />':' >';

        if( $pContinue == false && $kryn->admin == false ){
            return '{$kryn.header}';
        }
        $page = kryn::$page;
        $domain = kryn::$domain;

        $title = ( $page['page_title'] ) ? $page['page_title'] : $page['title'];
        if( !empty($kryn->pageTitle) )
            $title = $kryn->pageTitle.' '.$title;

        $html = '<title>' .
            str_replace(
                array('%title', '%domain'),
                array(
                    $title,
                    $_SERVER['SERVER_NAME']),
                $domain['title_format'])
                .'</title>'."\n";


        $html .= "<base href=\"".kryn::$baseUrl."\" $tagEnd\n";
        $html .= '<meta name="DC.language" content="'.$domain['lang'].'" '.$tagEnd."\n";

        $html .= '<link rel="canonical" href="'.kryn::$canonical.'" />'."\n";
        
        $metas = @json_decode($page['meta'],1);
        if( count($metas) > 0 )
            foreach( $metas as $meta )
                if( $meta['value'] != '' )
                    $html .= '<meta name="' . str_replace('"', '\"',$meta['name']) . '" content="' . str_replace('"', '\"',$meta['value']) . '" '.$tagEnd."\n";

        $html .= '<meta name="generator" content="Kryn.cms '.$kryn->version.'" '.$tagEnd."\n";
        
        
        $myCssFiles = array();
        $myJsFiles = array();
        
        
        if( kryn::$kedit == true ){
            $html .= '<script type="text/javascript">var kEditPageRsn = '.kryn::$page['rsn'].';</script>'."\n";
        }
        
        
        
        /*
         * CSS FILES
         * 
         */
        
        foreach( $kryn->cssFiles as $css ){
            $myCssFiles[] = $css;
        }

        if( file_exists('inc/template/css/_pages/'.$page['rsn'].'.css') )
            $myCssFiles[] = 'css/_pages/'.$page['rsn'].'.css';

        # clearstatcache();

        if( $domain['resourcecompression'] != '1' ){
            foreach( $myCssFiles as $css ){
                if( $mtime = @filemtime( 'inc/template/'.$css) ){
                    $css .= '?c='.$mtime;
                    $html .= '<link rel="stylesheet" type="text/css" href="'.$cfg['path'].'inc/template/'.$css.'" '.$tagEnd."\n";
                } else {
                    $html .= '<link rel="stylesheet" type="text/css" href="'.$css.'" '.$tagEnd."\n";
                }
            }
        } else {
            $cssCode = '';
            foreach( $myCssFiles as $css ){
                $file = 'inc/template/'.$css;
                if( file_exists($file) && $mtime = @filemtime($file) ){
                    $cssCode .= $file.'_'.$mtime;
                }
            }

            $cssmd5 = md5($cssCode);

            $cssCachedFile = $cfg['template_cache'].'cachedCss_'.$cssmd5.'.css';
            $cssContent = '';
            if( !file_exists( $cssCachedFile ) ){
                foreach( $myCssFiles as $css ){
                    $file = 'inc/template/'.$css;
                    if( file_exists($file) ){
                        $cssContent .= "/* $file: */\n\n";
                        $temp = kryn::fileRead( $file )."\n\n\n"; 
                        //$cssContent .= kryn::fileRead( $file )."\n\n\n"; 

                        //replace relative urls to absolute
                        $mypath = $cfg['path'].dirname($file);
                        $temp = preg_replace('/url\(/', 'url('.$mypath.'/', $temp);

                        $cssContent .= $temp;
                    }
                }
                kryn::fileWrite( $cssCachedFile, $cssContent ); 
            }
            $html .= '<link rel="stylesheet" type="text/css" href="'.$cfg['path'].$cssCachedFile.'" '.$tagEnd."\n";

            $jsCode = '';
        }
            
        
        /*
         * JS FILES
         * 
         */

        foreach( $kryn->jsFiles as $js ){
            $myJsFiles[] = $js;
        }

        if( file_exists( 'inc/template/js/_pages/'.$page['rsn'].'.js' ) )
            $myJsFiles[] = 'js/_pages/'.$page['rsn'].'.js';

        if( $domain['resourcecompression'] != '1' ){
            foreach( $myJsFiles as $js ){
                if( strpos( $js, "http://" ) !== FALSE ){
                    $html .= '<script type="text/javascript" src="'.$js.'" ></script>'."\n";
                } else {
                    if( $mtime = @filemtime('inc/template/'.$js) || $js == 'js=global.js'){
                        $html .= '<script type="text/javascript" src="'.$cfg['path'].'inc/template/'.$js.'?c='.$mtime.'" ></script>'."\n";
                    }
                }
            }
        } else {
            foreach( $myJsFiles as $js ){
                $file = 'inc/template/'.$js;
                if( $mtime = @filemtime($file) ){
                    $jsCode .= $mtime;
                }
                if( strpos( $js, "http://" ) !== FALSE ){
                    $html .= '<script type="text/javascript" src="'.$js.'" ></script>'."\n";
                } 
            }
            $jsmd5 = md5($jsCode);
            $jsCachedFile = $cfg['template_cache'].'cachedJs_'.$jsmd5.'.js';
            $jsContent = '';

            if( !file_exists( $jsCachedFile ) ){

                foreach( $myJsFiles as $js ){
                    $file = 'inc/template/'.$js;
                    if( file_exists($file) ){
                        $jsContent .= "/* $file: */\n\n";
                        $jsContent .= kryn::fileRead( $file )."\n\n\n"; 
                    }
                }
                kryn::fileWrite( $jsCachedFile, $jsContent ); 
            }

            $html .= '<script type="text/javascript" src="'.$cfg['path'].$jsCachedFile.'" ></script>'."\n";
        }

        
        /*
         * 
         * HEADER
         */

        foreach( $kryn->header as $head )
            $html .= "$head\n";

        //customized metas
        $metas = json_decode( $page['meta'], true );
        if( $page['meta_fromParent'] == 1 ){
            $ppage = kryn::getParentPage( $page['rsn'] );
            $pmetas = json_decode( $ppage['meta'], true );
            $metas = array_merge( $ppage, $pmetas );
        }

        return $html;
    }

}

?>

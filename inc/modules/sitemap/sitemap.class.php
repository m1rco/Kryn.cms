<?php

class sitemap extends baseModule {
    

    public function defaultSitemap( $pConf ){
    
        kryn::addCss('sitemap/css/'.$pConf['template'].'.css');
        return tFetch('sitemap/frontend/'.$pConf['template'].'.tpl');
    }
}

?>

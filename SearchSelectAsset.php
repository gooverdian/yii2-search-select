<?php

namespace gooverdian\sSelect;

use yii\bootstrap\BootstrapAsset;
use yii\web\AssetBundle;
use yii\web\JqueryAsset;
use yii\web\View;

class SearchSelectAsset extends AssetBundle
{
    /**
     * @inheritdoc
     */
    public $jsOptions = ['position' => View::POS_HEAD];

    /**
     * @inheritdoc
     */
    public $sourcePath = __DIR__ . '/assets';

    /**
     * @inheritdoc
     */
    public $js = ['js/search-select.js'];

    /**
     * @inheritdoc
     */
    public $css = ['css/search-select.css'];

    /**
     * @inheritdoc
     */
    public $depends = [
        BootstrapAsset::class,
        JqueryAsset::class,
    ];
    
}

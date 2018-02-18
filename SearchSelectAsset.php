<?php
namespace frontend\assets;

use yii\bootstrap\BootstrapAsset;
use yii\web\AssetBundle;

class SearchSelectAsset extends AssetBundle
{
    public $sourcePath = '@webroot/themes/frontend/assets';
    public $css = ['css/search-select.css'];
    public $js = ['js/search-select.js'];

    public $depends = [
        BootstrapAsset::class,
    ];
}
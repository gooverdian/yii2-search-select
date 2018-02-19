<?php
namespace gooverdian\sSelect;

use yii\web\AssetBundle;
use yii\web\View;
use yii\bootstrap\BootstrapAsset;

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
    public $js = ['js/search-select'];

    /**
     * @inheritdoc
     */
    public $css = ['css/search-select'];

    /**
     * @inheritdoc
     */
    public $depends = [
        BootstrapAsset::class,
    ];
    
}

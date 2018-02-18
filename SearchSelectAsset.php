<?php
namespace gooverdian\searchSelect;

use yii\bootstrap\BootstrapAsset;
use yii\web\AssetBundle;

class SearchSelectAsset extends AssetBundle
{
    /**
     * @inheritdoc
     */
    public $jsOptions = ['position' => View::POS_HEAD];

    /**
     * @inheritdoc
     */
    public $depends = [
        BootstrapAsset::class,
    ];
    
    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->setSourcePath(__DIR__ . '/assets');
        $this->setupAssets('js', ['js/search-select']);
        $this->setupAssets('css', ['css/search-select']);
        parent::init();
    }
}

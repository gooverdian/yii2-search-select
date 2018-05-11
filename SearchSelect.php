<?php

namespace gooverdian\sSelect;

use yii\helpers\Html;
use yii\helpers\Json;
use yii\widgets\InputWidget;

class SearchSelect extends InputWidget
{
    public $clientOptions = [];

    public $valueTitle;

    public function init()
    {
        SearchSelectAsset::register($this->view);
        parent::init();
    }

    /**
     * @return int|string
     */
    public function run()
    {
        parent::run();
        if (!isset($this->field)
            && (!isset($this->model) || !isset($this->attribute))
            && !isset($this->name)
        ) {
            throw new \BadMethodCallException('You must specify model & attribute or name for this widget');
        }

        $this->prepareOptions();

        $this->clientOptions['inputId'] = $this->options['id'];
        $clientOptionsJson = Json::encode($this->clientOptions);

        $searchInputId = $this->options['id'] . '-search-select';
        $searchInputOptions = $this->options;
        $searchInputOptions['id'] = $searchInputId;
        if (isset($this->model) && isset($this->attribute)) {
            $searchInputName = Html::getInputName($this->model, $this->attribute . '_search_select_title');
            $dataInput = Html::activeHiddenInput($this->model, $this->attribute);
        } else {
            $searchInputName = $this->name . '_search_select_title';
            $dataInput = Html::hiddenInput($this->name, $this->value, [
                'id' => $this->options['id']
            ]);
        }

        $searchInput = Html::textInput($searchInputName, $this->valueTitle, $searchInputOptions);

        $this->view->registerJs(
            '$("#' . $searchInputId . '").searchSelect(' . $clientOptionsJson . ');'
            . '$("#' . $searchInputId . '").on("blur change", function() {'
            . 'if ($(this).closest("form").length) {'
            . '$(this).closest("form").yiiActiveForm("validateAttribute", "' . $this->options['id'] . '"); '
            . '}'
            . '});'
        );

        return "$dataInput\n$searchInput";
    }

    public function prepareOptions()
    {
        if (!isset($this->options['class'])) {
            $this->options['class'] = 'form-control';
        }

        if (!isset($this->options['id'])) {
            $this->options['id'] = $this->id;
        }
    }
}

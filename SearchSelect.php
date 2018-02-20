<?php

namespace gooverdian\sSelect;

use yii\helpers\Html;
use yii\helpers\Json;
use yii\widgets\InputWidget;

class SearchSelect extends InputWidget
{
    public $clientOptions = [];

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

        $clientOptionsJson = Json::encode($this->clientOptions);

        $this->view->registerJs(
            '$("#' . $this->options['id'] . '").searchSelect(' . $clientOptionsJson . ')'
        );

        if (isset($this->field)) {
            return $this->field->textInput($this->options);
        }

        if (isset($this->model) && isset($this->attribute)) {
            return Html::activeTextInput($this->model, $this->attribute, $this->options);
        }

        return Html::textInput($this->name, $this->value, $this->options);
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

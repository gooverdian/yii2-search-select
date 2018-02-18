<?php
namespace frontend\widgets;

use frontend\assets\SearchSelectAsset;
use yii\base\Widget;
use yii\helpers\Html;
use yii\widgets\InputWidget;

class SearchSelect extends InputWidget
{
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

        if (!isset($this->options['inputOptions']['class'])) {
            $this->options['inputOptions']['class'] = 'form-control';
        }

        if (!isset($this->options['inputOptions']['id'])) {
            $this->options['inputOptions']['id'] = $this->id;
        }

        $this->view->registerJs('$("#' . $this->options['inputOptions']['id'] . '").searchSelect()');

        if (isset($this->field)) {
            return $this->field->textInput($this->options['inputOptions']);
        }

        if (isset($this->model) && isset($this->attribute)) {
            return Html::activeInput('text', $this->model, $this->attribute, $this->options['inputOptions']);
        }

        return Html::textInput($this->name, '', $this->options['inputOptions']);
    }
}
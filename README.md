# yii2-search-select
Search Select Widget for Yii2

# Installation
You can install this widget using composer
```
php composer.phar require gooverdian/yii2-search-select "*"
```
or add the following line to the require section of your `composer.json` file and run `php composer.phar update`

# Usage
Add `use gooverdian/sSelect/SearchSelect;` to the use section of your view file and then add
```php
echo $form->field($model, 'attribute')->widget(SearchSelect::class, [
    'clientOptions' => [
        'items' => [
            'value1' => 'Name 1',
            'value2' => 'Name 2',
        ],
    ],
]);
```
somewhere in the body. This will create simplest form of the widget. 

You can exchange `items` property with `url`, so that every change in widget input will send a request waiting dynamic JSON data consisting of something similar to `items` in response. Entered data will be passed in `query` parameter of GET request. 

You can also use this widget standalone, without ActiveField, but you must specify `name` attribute in this case:
```php
echo SearchSelect::widget([
    'name' => 'inputName',
    'clientOptions' => [
        'url' => '/some/api/url',
    ],
]);
```

WIP

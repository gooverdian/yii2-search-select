/**
 * Плагин выбора с поиском для jQuery
 */
(function ($) {

    $.fn.searchSelect = function (options) {

        function isPickerShown($input) {
            var data = $input.data('search-select');
            return data.pickerWrap.is(':visible');
        }

        function createPickerForm($input) {
            var data = $input.data('search-select');
            var $pickerWrap = $('<div class="search-select-picker-wrap panel panel-info"></div>');
            $pickerWrap.css({
                display: 'none'
            });

            $pickerWrap.html(
                '<div class="list-group search-select-picker-results"></div>' +
                '<div class="panel-footer search-select-picker-controls">' +
                '<a href="#" class="btn btn-default pull-right" ' +
                'onclick="$(\'.search-select-picker-controls\').append(\'Button pressed\')">' +
                '<span class="glyphicon glyphicon-plus"></span> Testing button' +
                '</a>' +
                '</div>'
            );

            $pickerWrap.on('mousedown', function (event) {
                event.preventDefault();
            });

            $('body').append($pickerWrap);

            data.pickerWrap = $pickerWrap;
        }

        function showResults($input) {
            var data = $input.data('search-select');
            var $pickerResults = data.pickerWrap.children('.search-select-picker-results');
            var results = data.results;
            var resultsCounter = 0;
            var $result;
            $pickerResults.children().remove();
            for (var resultKey in results) {
                if (!results.hasOwnProperty(resultKey)) {
                    continue;
                }
                resultsCounter++;
                $result = $('<a href="#" class="list-group-item"></a>');
                $result.attr('data-key', resultKey);
                $result.text(data.results[resultKey]);
                if (data.selected && data.selected.key === resultKey) {
                    $result.addClass('active');
                }
                $pickerResults.append($result);
            }
            if (resultsCounter === 0) {
                $result = $('<div class="list-group-item"></div>');
                $result.html('<em class="text-muted">Ничего не найдено</em>');
                $pickerResults.append($result);
            }

            $pickerResults.children('a').on('click', function () {
                selectItem($input, $(this));
            });

            pickerHighlightDefault($input);
        }

        function selectItem($input, $result) {
            var data = $input.data('search-select');
            var $pickerResults = data.pickerWrap.children('.search-select-picker-results');

            if (data.selected) {
                $pickerResults.children('a[data-key="' + data.selected.key + '"]').removeClass('active');
            }

            data.selected = {
                key: $result.attr('data-key'),
                text: $result.text()
            };

            $input.val(data.selected.text);
            $result.addClass('active');
            $pickerResults
                .children('.search-select-picker-highlighted')
                .removeClass('search-select-picker-highlighted');

            hidePickerForm($input);
        }

        /**
         * Showing picker form
         * @param $input
         */
        function showPickerForm($input) {
            console.log('Show picker', $input);
            var data = $input.data('search-select');
            if (!data.pickerWrap) {
                createPickerForm($input);
            }
            var $pickerWrap = data.pickerWrap;
            if (data.search && !data.selected) {
                $input.attr('placeholder', '');
                $input.val(data.search);
            }

            var inputOffset = $input.offset();
            $pickerWrap.css({
                left: inputOffset.left + 'px',
                top: (inputOffset.top + $input.outerHeight()) + 'px',
                width: $input.outerWidth() + 'px'
            });

            $input.addClass('search-select-picker-shown');
            $pickerWrap.show();
        }

        function hidePickerForm($input) {
            console.log('Hide picker', $input);
            var data = $input.data('search-select');
            var $pickerWrap = data.pickerWrap;

            $input.removeClass('search-select-picker-shown');
            $pickerWrap.hide();
        }

        function invalidateSelection($input) {
            var data = $input.data('search-select');
            console.log('Invalidate Selection');
            data.selected = null;
            data.search = $input.val();
            if (!isPickerShown($input)) {
                showPickerForm($input);
            }
        }

        function searchData($input) {
            var data = $input.data('search-select');
            data.search = $input.val();
            data.results = {};

            $.ajax({
                url: data.settings.url,
                dataType: 'json',
                data: {
                    query: data.search
                }
            }).done(function (response) {
                console.log(response);
                data.currentItems = response;
                updateResults($input);
            });
        }

        function updateResults($input)
        {
            var data = $input.data('search-select');

            for (var dataKey in data.currentItems) {
                if (!data.currentItems.hasOwnProperty(dataKey)) {
                    continue;
                }
                //if (String(data.currentItems[dataKey]).indexOf(data.search) !== -1) {
                    data.results[dataKey] = data.currentItems[dataKey];
                //}
            }

            showResults($input);
        }

        function pickerScrollToResult($input, $result) {
            if (!$result.length) {
                return false;
            }
            var data = $input.data('search-select');
            var $pickerResults = data.pickerWrap.children('.search-select-picker-results');
            var position = $result.position();
            var pickerHeight = $pickerResults.innerHeight();
            var elementHeight = $result.outerHeight();
            var currentScrollTop = $pickerResults.scrollTop();

            console.log(currentScrollTop, pickerHeight, position.top, elementHeight);

            if (position.top < 0) {
                $pickerResults.scrollTop( currentScrollTop + position.top - 10 );
            } else if ((position.top + elementHeight) > pickerHeight) {
                $pickerResults.scrollTop( currentScrollTop + (position.top + elementHeight) - pickerHeight + 10);
            }
        }

        function pickerHighlightDefault($input) {
            var data = $input.data('search-select');
            var $pickerResults = data.pickerWrap.children('.search-select-picker-results');

            if ($pickerResults.children('.search-select-picker-highlighted').length) {
                return $pickerResults.children('.search-select-picker-highlighted');
            }

            var $highlighted;
            if ($pickerResults.children('.active').length) {
                $highlighted = $pickerResults.children('.active');
            } else {
                $highlighted = $pickerResults.children('a:first-child');
            }

            $highlighted.addClass('search-select-picker-highlighted');

            return $highlighted;
        }

        function pickerHighlightNext($input) {
            var $highlighted = pickerHighlightDefault($input);

            if ($highlighted.next().length) {
                $highlighted.removeClass('search-select-picker-highlighted');
                $highlighted = $highlighted.next();
                $highlighted.addClass('search-select-picker-highlighted');
            }

            pickerScrollToResult($input, $highlighted);
        }

        function pickerHighlightPrevious($input) {
            var $highlighted = pickerHighlightDefault($input);

            if ($highlighted.prev().length) {
                $highlighted.removeClass('search-select-picker-highlighted');
                $highlighted = $highlighted.prev();
                $highlighted.addClass('search-select-picker-highlighted');
            }

            pickerScrollToResult($input, $highlighted);
        }

        function pickerSelectHighlighted($input) {
            var $highlighted = pickerHighlightDefault($input);

            if($highlighted.length) {
                selectItem($input, $highlighted);
            }
        }

        function assignEvents($input) {
            $input.on('focus', function () {
                showPickerForm($(this));
            });

            $input.on('keydown', function (event) {
                if (isPickerShown($input)) {
                    prevent = true;
                    switch (event.key) {
                        case 'ArrowDown':
                            pickerHighlightNext($input);
                            break;
                        case 'ArrowUp':
                            pickerHighlightPrevious($input);
                            break;
                        case 'Enter':
                            pickerSelectHighlighted($input);
                            break;
                        case 'Escape':
                            hidePickerForm($input);
                            break;
                        default:
                            prevent = false;
                    }
                    if (prevent) {
                        event.preventDefault();
                    }
                }
            });

            $input.on('cut paste input', function () {
                var $input = $(this);

                invalidateSelection($input);
                searchData($input);
            });

            $input.on('blur', function (event) {
                var data = $(this).data('search-select');

                if (!data.selected) {
                    $input.attr('placeholder', $(this).val());
                    $input.val('');
                }

                hidePickerForm($(this));
            });
        }

        var settings = $.extend({
            requestThreshold: 200,
            url: false,
            items: []
        }, options);

        return this.each(function () {
            var $input = $(this);

            if ($input.data('search-select')) {
                return this;
            }

            console.log(settings);

            var rawData = {};
            var keyValue;
            for (var i = 0; i < 30; i++) {
                keyValue = Math.round(Math.random() * 900000 + 100000);
                rawData[keyValue] = keyValue;
            }

            var data = {
                settings: settings,
                currentItems: rawData,
                selected: null,
                search: null
            };

            assignEvents($input);

            $input.data('search-select', data);
        });
    }

}(jQuery));
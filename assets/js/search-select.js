/**
 * Select with search Jquery plugin
 */
(function ($) {

    $.fn.searchSelect = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.searchSelect');
            return false;
        }
    };

    var events = {};

    var defaults = {
        requestThreshold: 300,
        emptyResultsMessage: 'Nothing found',
        inputId: undefined,
        url: undefined,
        items: [],
        buttons: []
    };

    var methods = {
        init: function(options) {
            var settings = $.extend({}, defaults, options || {});

            return this.each(function () {
                var $input = $(this);

                if ($input.data('search-select')) {
                    return;
                }

                $input.attr({
                    autocomplete: 'off'
                });

                var data = {
                    settings: settings,
                    currentItems: settings.items,
                    selected: undefined,
                    search: undefined,
                    results: {}
                };

                var $dataInput = $('#' + data.settings.inputId);

                if ($dataInput.val()) {
                    data.selected = {
                        key: $dataInput.val(),
                        title: $input.val()
                    };
                    data.currentItems[data.selected.key] = data.selected.title;
                }

                assignEvents($input);

                $input.data('search-select', data);
            });
        },

        update: function(options) {
            return this.each(function () {
                var $input = $(this),
                    data = $input.data('search-select');
                if (!data) {
                    return;
                }
                var pickerCurrentlyShown = isPickerShown($input);

                data.settings = $.extend({}, data.settings, options || {});

                if (options.url) {
                    data.currentItems = [];
                    updateResults($input);
                    showResults($input);
                }

                if (pickerCurrentlyShown) {
                    hidePickerForm($input);
                    data.pickerWrap = undefined;
                    showPickerForm($input);
                } else {
                    data.pickerWrap = undefined;
                }
            });
        }
    };

    function isPickerShown($input) {
        var data = $input.data('search-select');
        return data.pickerWrap && data.pickerWrap.is(':visible');
    }

    function createPickerForm($input) {
        var data = $input.data('search-select');
        var $pickerWrap = $('<div class="search-select-picker-wrap panel panel-info"></div>');
        $pickerWrap.css({
            display: 'none'
        });

        var $pickerResults = $('<div class="list-group search-select-picker-results"></div>');
        $pickerWrap.append($pickerResults);

        if (data.settings.buttons.length) {
            var $pickerControls = $('<div class="panel-footer search-select-picker-controls"></div>');
            var $dataInput = $('#' + data.settings.inputId);
            for (var i = 0; i < data.settings.buttons.length; i++) {
                var $button = $('<button type="button"></button>');
                $button.html(data.settings.buttons[i].title);
                $button.addClass(data.settings.buttons[i].class);
                var clickEvent = data.settings.buttons[i].clickEvent;
                $button.on('click', function() {
                    hidePickerForm($input);
                    $dataInput.trigger(clickEvent);
                });
                $pickerControls.append($button);
            }
            $pickerWrap.append($pickerControls);
        }

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
            var $emptyResultElement = $('<em class="text-muted"></em>');
            $emptyResultElement.text(data.settings.emptyResultsMessage);
            $result.append($emptyResultElement);
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
            title: $result.text()
        };

        $input.val(data.selected.title);
        $('#' + data.settings.inputId).val(data.selected.key).change();
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
        updateResults($input);
        $pickerWrap.show();
    }

    function hidePickerForm($input) {
        var data = $input.data('search-select');
        var $pickerWrap = data.pickerWrap;

        $input.removeClass('search-select-picker-shown');
        $pickerWrap.hide();
    }

    function invalidateSelection($input) {
        var data = $input.data('search-select');
        var $pickerResults = data.pickerWrap.children('.search-select-picker-results');

        if ($pickerResults.children('.active').length) {
            $pickerResults.children('.active').removeClass('active');
        }

        data.selected = undefined;
        $('#' + data.settings.inputId).val('');
        data.search = $input.val();

        if (!isPickerShown($input)) {
            showPickerForm($input);
        }
    }

    function searchData($input) {
        var data = $input.data('search-select');
        data.search = $input.val();

        if (data.requestTimeout) {
            clearTimeout(data.requestTimeout)
        }

        data.requestTimeout = setTimeout(
            function() {
                $.ajax({
                    url: data.settings.url,
                    dataType: 'json',
                    data: {
                        query: data.search
                    }
                }).done(function (response) {
                    data.currentItems = response;
                    updateResults($input);
                });
            },
            data.settings.requestThreshold
        );
    }

    function updateResults($input)
    {
        var data = $input.data('search-select');
        data.results = {};

        for (var dataKey in data.currentItems) {
            if (!data.currentItems.hasOwnProperty(dataKey)) {
                continue;
            }
            data.results[dataKey] = data.currentItems[dataKey];
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
            var prevent;
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

        $input.on('click', function (event) {
            if ($(this).is(':focus') && !isPickerShown($input)) {
                showPickerForm($input);
            }
        });
    }

}(jQuery));
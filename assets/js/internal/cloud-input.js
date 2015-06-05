/*global console:true*/
/*global Modernizr:true*/
/*global cloud:true*/
/*global bootbox:true*/
/*global __:true*/
/*global PNotify:true*/

/**
 * Class: CloudInput
 * This class is a facility to manage inputs like test, radio and checkbox.
 *
 * Dependencies:
 * sugarsjs - http://sugarjs.com/
 * Bootstrap 2 - http://getbootstrap.com/2.3.2/index.html
 * bootbox - http://bootboxjs.com/
 * pnotify - http://pinesframework.org/pnotify/
 * x-editable - http://vitalets.github.io/x-editable/
 *
 * Usage:
 * | var my_cloud_input = new CloudInput();
 */
var registerCloudInput = function (parent) {

    /*
     * Object: input
     * Generic object with generic methods
     */
    parent.input = {
        /*
         * Object: input.config
         * Use this to inherit default configuration for some inputs.
         *
         * Example:
         * With jquery, you can inherit configuration to use a select2 control.
         * | $('#my-selector').select2($.extend({
         * |   tags:["red", "green", "blue"],
         * | }, cloud.input.config.select2));
         * |
         * |
         */
        config: {
            select2: {
                tokenSeparators: [",", " "]
            }
        },

        enable: function (input) {
            $(input).removeAttr('disabled');
        },

        disable: function (input) {
            $(input).attr('disabled', '');
        },

        toggleDisabled: function (input, disabled) {
            if (disabled) {
                parent.input.disable(input);
            }
            else {
                parent.input.enable(input);
            }
        },

        /*
         * Returns the content of an input/span/div/etc.
         */
        getText: function (input, config, attr) {
            var $el = $(input);
            if ($el.length === 0) {
                return;
            }

            var result;
            if ($el.is('input')) {
                result = $el.val();
            }
            else if ($el.is('select')) {
                result = parent.select.get(input, attr);
            }
            else {
                result = $el.text();
            }

            if (result !== undefined && result !== null) {
                config = $.extend({
                    doTrim: true,
                    doEscape: false,
                    asNumber: false
                }, config);

                if (config.doTrim) {
                    result = result.trim();
                }
                if (config.doEscape) {
                    result = result.unescapeURL();
                }
                if (config.asNumber) {
                    result = result ? cloud.formatNumber(result) : 0;
                }
            }

            return result;
        },

        /*
         * Modify the content of an input/span/div/etc.
         (select, attr, value, config) {
         */
        setText: function (input, value, attr, config) {
            var $el = $(input);
            if ($el.length) {

                if ($el.is('input')) {
                    $el.val(value || '');
                }
                else if ($el.is('select')) {
                    parent.select.set(input, attr, value || '', config);
                }
                else {
                    $el.text(value || '');
                }
            }
        },

        // Requires bootstrap datetimepicker version 4
        // Requires sugarjs
        // getDate: function (input, config) {
        getDate: function (input) {
            if ($(input).length === 0) {
                return;
            }

            var result;
            try {
                result = $(input).data('DateTimePicker').date();
            }
            catch(e) {
                return null;
            }

            return result ? result.toDate() : result;
            /*
            if (result === undefined || result === null) {
                return result;
            }

            config = $.extend({
                zeroAsNull: true
            }, config);

            if (config.zeroAsNull) {
                if (result.getTime() === 0) {
                    result = null;
                }
            }

            return result || (config.defaultDate ? Date.create(config.defaultDate) : result);
            */
        },

        setDate: function (input, value) {
            if ($(input).length) {
                if (!value) {
                    $(input).data('DateTimePicker').date(null); // v4
                }
                else {
                    $(input).data('DateTimePicker').date(Date.create(value)); // v4
                }
                // $(input).data('DateTimePicker').setDate(Date.create(value)); // v3
                // $(input).data('DateTimePicker').setDate(value ? Date.create(value) : Date.create());
            }
        },

        isDirty: function (input) {
            return $(input).attr('data-is-dirty') === '1';
        },

        setDirty: function (input, isDirty) {
            return $(input).attr('data-is-dirty', isDirty ? 1 : 0);
        }

    };

    // Requires select2
    parent.tags = {
        init: function (input, values, val) {
            $(input).select2('destroy');
            $(input).select2($.extend({ tags: values }, parent.input.config.select2));
            if (val !== undefined) {
                parent.tags.set(input, val);
            }
        },

        /*
         * return an array of string which values are the tags
         * Example:
         * tags.get('#my-tags'); // Return ['a', 'b']
         */
        get: function (input) {
            return $(input).select2('val');
        },

        set: function (input, values) {
            $(input).select2('val', values);
        }
    };

    // Requires select2
    parent.selector = {
        init: function (input, values, val) {
            $(input).select2('destroy').empty().append(values).select2({
                allowClear: true
            });
            if (val !== undefined) {
                parent.selector.set(input, val);
            }
        },

        get: function (input, defaultVal) {
            var $el = $(input);
            if ($el.length === 0) {
                return defaultVal;
            }
            else {
                return $el.select2('val');
            }
        },

        set: function (input, value) {
            $(input).select2('val', value);
        }
    };

    parent.checkbox = {
        /**
         * Return true if checkbox is checked
         */
        isChecked: function(checkbox) {
           return $(checkbox).prop('checked');// || $(checkbox).val() === 'on';
        },

        set: function(checkbox, checked) {
            $(checkbox).prop('checked', parent.asBool(checked));
        }
    };

    parent.radio = {
        /**
         * Return the attribute value for the checked radio
         * @param {string} name The name of the group of radio
         */
        get: function (name) {
            return $('[name=' + name + ']:checked').val();
        },

        set: function (name, value, checked) {
            $('[name=' + name + '][value=' + value + ']').prop('checked', parent.asBool(checked));
        }
    };

    parent.select = {
        /**
         * This function will return the selected option as a jQuery object.
         * @param {String} select   The selector for the SELECT tag that include the options,
         * @return {Object} The object that is selected.
         */
        getSelected: function (select) {
            return $(select).find(':selected');
        },

        /**
         * This function will return the value of an attribute from a selected option.
         * @param {String} select   The selector for the SELECT tag that include the options,
         * @param {String} attr     The attribute to retrieve the value from,
         * @return {String} The string value of the attribute.
         */
        get: function (select, attr) {
            return $(select).find(':selected').attr(attr || 'value');
        },

        /**
         * Method: fill
         * Take an array of object to fill a select with options.
         *
         * Parameters:
         * select - This String contains a jQuery selector.
         * items - This si the array of objects to add as options to the select.
         * config.value - The name of the property of items to get the option identifier
         * config.display -The name of the property of items to get the option text to display
         * config.emptyOption - Set this to true if you want an option taht is empty as the first option.
         *
         * Example:
         * | cloud.select.fill('#companies', companiesList, { value: 'id', display: 'text' });
         * implies that companisList array contains objects like the following:
         * | [ { id: 'ggl', text: 'Google' }, { id: 'fcbk', text: 'Facebook' }, { id: 'mzn', text: 'Amazon' } ]
         */
        fill: function (select, items, config) {
            $(select).empty();

            if (config.emptyOption) {
                $(select).append('<option value=""></option>');
            }

            if (items) {
                $.each(items, function (i, item) {
                    var val = config.isCaseInsensitive ? item[config.value].toUpperCase() : item[config.value];
                    $(select).append('<option value="' + val + '">' + item[config.display] + '</option>');
                });
            }
        },

        /**
         * This function return the html content of the selected option
         * @param {String} select   The selector for the SELECT tag that include the options,
         * @return {String} The string value of html content.
         */
        html: function (select) {
            return $(select).find(':selected').html();
        },

        /**
         * This function select the first option.
         * @param {String} select   The selector for the SELECT tag
         */
        reset: function (select) {
            parent.input.setDirty(false);
            $(select + ' > option').removeAttr('selected'); // No option selected anymore
            $(select).find(':first').prop('selected', true);
            $(select).find(':first').attr('selected', true);
        },

        /**
         * This function select the option according to one attribute
         * @param {String} select   The selector for the SELECT tag that include the options,
         * @param {String} attr     The attribute to test the value,
         * @param {String} value    The value of the attribute to match
         * @Example:
         *      parent.select.set('#my-select', 'category', '20');
         *  will select the "Fruits".
         *    <select id="my-select">
         *      <option category=10>Vegetables</option>
         *      <option category=20>Fruits</option>
         *    </select>
         */
        set: function (select, attr, value, config) {
            if (config && config.isCaseInsensitive) {
                value = value.toUpperCase();
            }

            if (value !== parent.select.get(select, attr)) {
                parent.input.setDirty(true);
            }

            $(select + ' > option[' + attr + ']').removeAttr('selected'); // No option selected anymore
            $(select + ' > option[' + attr + '="' + value + '"]').prop('selected', true);
            $(select + ' > option[' + attr + '="' + value + '"]').attr('selected', true); // select only one!
        },
    };

    parent.btngroup = {
        /**
         * This function will return the value of an attribute from a selected button of a group of buttons.
         * @param {String} btngroup The selector for the button group,
         * @param {String} attr     The attribute to retrieve the value from,
         * @return {String} The string value of the attribute, or empty string if no button is active.
         */
        get: function (btngroup, attr) {
            var b = $(btngroup + ' > button[class*=active]');
            if (b) {
                return b.attr(attr);
            }
            else {
                return '';
            }
        },

        /**
         * This function activate the button of a button group according to one attribute
         * @param {String} btngroup   The selector for the button group tag that include the button,
         * @param {String} attr     The attribute to test the value,
         * @param {String} value    The value of the attribute to match
         * @Example:
         *      parent.btngroup.set('#my-btngroup', 'symbol', 'fruit');
         *  will activate the button "Fruits".
         *    <div id="my-btngroup" class="">
         *      <button symbol="vegetables">Vegetables</button>
         *      <button symbol="fruit">Fruits</button>
         *    </div>
         */
        set: function (btngroup, attr, value) {
            $(btngroup + ' > button').removeClass('active');

            var b;
            if (value === undefined) {
                // Select first of buttons
                b = $(btngroup).find(':first');
            }
            else {
                b = $(btngroup + ' > button[' + attr + '="' + value + '"]');
            }

            if (b) {
                b.addClass('active');
            }
        }
    };

    parent.form = {
        focusFirstInput: function (form) {
            var input = $(form + ' input[class!="hide"][class!="disabled"][class!="muted"][class!="uneditable-input"][type!=checkbox][type!=radio]:first');
            if (input && input.length > 0) {
                input.focus();
            }
        },

        focusFirstNotValid: function (form) {
            $(form + ' .validation-failed:first').focus();
        }
    };

    /**
     * Event: on_tab_click
     * Use this event to manage tabs (see Bootstrap Tab component)
     *
     * Example:
     * `$('#setup-tabs a').on('click', parent.on_tab_click); // This will link click and tab show to all tags <a> in container which id is "setup-tabs".
     */
    parent.on_tab_click = function (ev) {
        ev.preventDefault();
        $(this).tab('show');
    };

    parent.loader = {
        /**
         * Return spinner HTML
         */
        getSpinner: function (id) {
            if (Modernizr.cssanimations) {
                return '<i ' + (id ? 'id="' + id+ '" ' : '') + 'class="fa fa-circle-o-notch fa-spin"></i>';
            }

            // CSS3 animations aren't supported in IE7 - IE9.
            return '<img ' + (id ? 'id="' + id+ '" ' : '') + 'src="/images/loading.gif">';
        },

        exists: function (id) {
            return $('#' + id).length > 0;
        },

        /**
         * Display a notification for loading
         */
        start: function () {
            if (!parent.loaderNotification) {
                parent.loaderNotification = new PNotify({
                    title: parent.loader.getSpinner() + ' ' + parent.__('Please wait'),
                    text: parent.__('Loading data...'),
                    mouse_reset: false,     // Mouse hover does not prevent from hiding
                    delay: parent.NOTIFICATION_DURATION_INFO,
                    icon: false,
                    hide: false,
                    closer: true,
                    sticker: false,
                    history: false
                });
            }
        },

        stopNow: function () {
            if (parent.loaderNotification) {
                parent.loaderNotification.remove();
                delete(parent.loaderNotification);
                parent.loaderNotification = false;
            }
        },

        stop: function () {
            // This will make the loader to hide after a small amount of time
            parent.loader.stopNow.delay(parent.LOADER_DURATION);
        },

        /**
         * Method: startInto
         * This method will add a spinner into an element of the DOM
         *
         * Parameters:
         * el - The DOM element to insert the spinner into.
         * displayBefore - Set to true if you want to display the spinner as the first child of the content of el.
         *
         * Returns:
         * The id and html of spinner. Use this id to remove it with method stopInto.
         */
        startInto: function (el, displayBefore) {
            var id = 'spinner-' + parent.createGUID();
            var html = $(el).html();
            if (displayBefore) {
                $(el).prepend(parent.loader.getSpinner(id));
            }
            else {
                $(el).append(parent.loader.getSpinner(id));
            }
            return {
                id: id,
                html: html
            };
        },

        startAndReplace: function (el) {
            var id = 'spinner-' + parent.createGUID();
            var html = $(el).html();
            $(el).html(parent.loader.getSpinner(id));
            return {
                id: id,
                html: html
            };
        },

        stopInto: function (spinner) {
            $('#' + spinner.id).parent().html(spinner.html);
            $('#' + spinner.id).remove();
        },

        /*
         * Remove all spinners from the given container.
         */
        removeAll: function (container) {
            $(container).find('[id*=spinner]').remove();
        }
    };

    parent.counter = {
        /**
         * Return HTML code for the badge
         */
        get: function (id, count) {
            return (count > 0 ? ' <span id="' + id + '" class="badge">' + count + '</span>' : '');
        },

        /**
         * This method will add a badge with some text into an element of the DOM
         * @returns {string}    A string with a unique identifier to remove the badge
         */
        insertInto: function (el, count, displayBefore) {
            if ($(el).attr('id') === undefined) {
                $(el).attr('id', parent.createGUID());
            }
            var id = $(el).attr('id') + '-badge';
            $('#'+id).remove();

            if (displayBefore) {
                $(el).prepend(parent.counter.get(id, count));
            }
            else {
                $(el).append(parent.counter.get(id, count));
            }
            return id;
        },

        removeFrom: function (id) {
            $('#'+id).remove();
        }
    };

    parent.progressbar = {
        getColorBar: function (percent, options) {
            var o = $.extend({
                infoThreshold: 20,
                successThreshold: 40,
                warningThreshold: 60,
                dangerThreshold: 80,
                showPercent: true,
                customCls: ''
            }, options);

            var colorCls;
            if (percent >= o.dangerThreshold) {
                colorCls = 'danger active';
            }
            else if (percent >= o.warningThreshold) {
                colorCls = 'warning';
            }
            else if (percent > o.successThreshold) {
                colorCls = 'success';
            }
            else {
                colorCls = 'info';
            }

            return '<div class="progress progress-' + colorCls + ' ' + o.customCls + '"><div class="bar" style="width: ' + Math.round(percent) + '%;"></div><span>' + __('{percent}%', { percent: Math.round(percent) }) + '</span></div>';
        }
    };

    parent.dialog = {

        alert: function (msg, callback) {
            bootbox.alert(msg, parent.__('OK'), callback); // Bootstrap 2.x
        },

        /**
         * Display a dialog to ask for a confirmation message (yes/no)
         * and launch a callback with a parameter set to True if user click yes.
         *
         * @example:
         * parent.dialog.confirm(__('Confirm the deletion of "{target}"?', { target: data.display }), function (ok) {
         *     if (ok) { ... }
         * });
         */
        confirm: function (msg, callback) {
            bootbox.confirm(msg, callback); // Bootstrap 3.x
            //~ bootbox.confirm(msg, parent.__('No'), parent.__('Yes'), callback); // Bootstrap 2.x
        },

        prompt: function (msg, callback) {
            bootbox.prompt(msg,callback); // Bootstrap 3.x
            //~ bootbox.prompt(msg, parent.__('Cancel'), parent.__('OK'), callback); // Bootstrap 2.x
        },

        promptText: function (msg, callback) {
            bootbox.prompt({
                title: msg,
                inputType: 'textarea',
                callback: callback
            });
        },

        promptPassword: function (msg, callback) {
            bootbox.prompt({
                title: msg,
                inputType: 'password',
                callback: callback
            });
        }
    };

    parent.xeditable = {

        defaultOptions: {
            anim: true
        },

        /*
         * Store x-editable default configuration. Retrieve it with defaultConfig attribute.
         */
        setDefaultInputOptions: function (config) {
            config = $.extend(parent.xeditable.defaultOptions, config);
        },

        setDefaultConfig: function () {
            try {
                $.fn.editable.defaults.mode = 'inline';
            }
            catch (e) {
                console.error('[xeditable.setDefaultConfig] x-editable library is not loaded!');
            }
        },

        /*
         * Method: getNumberInput
         * Create and return a string to us as a x-editable number input.
         *
         * Parameters:
         * attributes.id - identifier of the input
         * attributes.value - The current value of the input
         */
        createNumberInput: function (attributes) {
            return cloud.assign('<a href="#" id="{id}" data-type="number" data-clear="false" data-placeholder="{value}">{value}</a>', attributes);
        }

    };

    parent.slider = {

        defaultOptions: {
            tooltip: 'hide'
        },

        /*
         *
         * Parameters:
         * - config.$container - jQuery element that will contain the slider
         * - config.id - DOM indentifier
         * - config.label - label at the top of the slider
         * - config.value - initial value
         * - config.min - minimum value
         * - config.max - maximum value
         * - config.options - Options to modify slider behaviour
         */
        create: function (config) {
            config.$container.append(cloud.assign('<div class="form-group"><label for="{id}">{label}</label> <span id="value-{id}" class="pull-right slider-value">{value}</span><input id="{id}" type="text"></div>', {
                id: config.id,
                label: config.label,
                value: config.value
            }));

            var opt = $.extend(parent.slider.defaultOptions, config.options);

            var slider = $('input#' + config.id).slider(opt);
            slider.formater = opt.formater;
            slider.slider('setOriginValue', config.value);

            slider.on('slideStop', function (ev) {
                ev.preventDefault();
                var v;
                if (slider.formater) {
                    v = slider.formater($(this).slider('getValue'));
                }
                else {
                    v = $(this).slider('getValue');
                }
                $('span#value-' + $(this).attr('id')).text(v);
            });
            slider.on('slideChange', function (ev) {
                ev.preventDefault();
                var v;
                if (slider.formater) {
                    v = slider.formater($(this).slider('getValue'));
                }
                else {
                    v = $(this).slider('getValue');
                }
                $('span#value-' + $(this).attr('id')).text(v);
            });

            return slider;
        }

    };

    parent.validator = {
        isPositiveNumber: function (value, callback) {
            callback(cloud.formatNumber(value) >= 0);
        },

        isNumberNotNull: function (value, callback) {
            callback(cloud.formatNumber(value) >= 1);
        },

        isNumber: function (value, callback) {
            callback(!isNaN(value));
        }
    };

};

/*global _:true*/
/*global moment:true*/
/*global accounting:true*/

/**
 * Class: CloudFormat
 * This class offers facility to format numbers, currency, etc.
 *
 * Dependencies:
 * sugarsjs - http://sugarjs.com/
 * accounting -  http://josscrowcroft.github.com/accounting.js/#methods
 * Bootstrap3 touch spin - http://www.virtuosoft.eu/code/bootstrap-touchspin/
 */
var registerCloudFormat = function (parent) {

    var assign = parent.assign = function (text, data) {
        return _.template(text, { interpolate: parent.SCALAIR_INTERPOLATE_DELIMITER })(data);
    };

    /**
     * Method: getCurrencyFormats
     * Returns an objects with formatting rules for currency, according to I18N.
     *
     * Returns:
     * name - name of the currency
     * symbol - symbol of the currency
     * decimal.symbol - symbol for decimal separator
     * decimal.thousand - symbol for thousand separator
     * decimal.precision - number of digit for decimal part of a currency number.
     */
    var getCurrencyFormats = parent.getCurrencyFormats = function () {
        return {
            name: parent.__('currency-name'),
            symbol: parent.__('currency-symbol'),
            decimal: {
                symbol: parent.__('currency-decimal'),
                thousand: parent.__('currency-thousand'),
                precision: formatNumber(parent.__('currency-precision')),
                step: Math.pow(10, -formatNumber(parent.__('currency-precision')))
            }
        };
    };

    /**
     * Method: getNumberFormats
     * Returns an objects with formatting rules for number, according to I18N.
     *
     * Returns:
     * decimal.symbol - symbol for decimal separator
     * decimal.thousand - symbol for thousand separator
     * decimal.precision - number of digit for decimal part of a number.
     */
    var getNumberFormats = parent.getNumberFormats = function () {
        return {
            decimal: {
                symbol: parent.__('number-decimal'),
                thousand: parent.__('number-thousand'),
                precision: formatNumber(parent.__('number-precision')),
                step: Math.pow(10, -formatNumber(parent.__('currency-precision')))
            }
        };
    };

    /*
     * Method: setCurrencyControls
     * Apply bootstrap3 touchspin plugin to the given selection.
     *
     * Example:
     * cs.setCurrencyControls($(this.dialog).find('input.cs-currency'));
     * will apply styling an input controls on every input of class cs-currency in the dialog.
     */
    parent.setCurrencyControls = function ($selection) {
        var $el;
        $.each($selection, function (index,  item) {
            $el = $(item);
            // Spin button are available only if control is editable
            if (!$el.attr('readonly') && !$el.attr('disabled')) {
                $el.TouchSpin({
                    boostat: 5,
                    maxboostedstep: 10,
                    initval: 0,
                    min: 0.0,
                    max: 100000,
                    step: getCurrencyFormats().decimal.step,
                    decimals: getCurrencyFormats().decimal.precision,
                    postfix: getCurrencyFormats().symbol
                });
            }
        });
    };

    /*
     * Method: setPercentControls
     * Apply bootstrap3 touchspin plugin to the given selection.
     *
     * Example:
     * cs.setPercentControls($(this.dialog).find('input.cs-percent'));
     * will apply styling an input controls on every input of class cs-percent in the dialog.
     */
    parent.setPercentControls = function ($selection) {
        var $el;
        $.each($selection, function (index,  item) {
            $el = $(item);
            // Spin button are available only if control is editable
            if (!$el.attr('readonly') && !$el.attr('disabled')) {
                $el.TouchSpin({
                    boostat: 5,
                    maxboostedstep: 10,
                    initval: 0,
                    min: 0,
                    max: 100,
                    step: 0.001,
                    decimals: 3,
                    postfix: '%'
                });
            }
        });
    };

    parent.setPercentIntControls = function ($selection) {
        var $el;
        $.each($selection, function (index,  item) {
            $el = $(item);
            // Spin button are available only if control is editable
            if (!$el.attr('readonly') && !$el.attr('disabled')) {
                $el.TouchSpin({
                    boostat: 5,
                    maxboostedstep: 10,
                    initval: 0,
                    min: 0,
                    max: 100,
                    step: 1,
                    postfix: '%'
                });
            }
        });
    };

    /*
     * Method: setIntControls
     * Apply bootstrap3 touchspin plugin to the given selection.
     *
     * Example:
     * cs.setIntControls($(this.dialog).find('input.cs-int'), 'days');
     * will apply styling an input controls on every input of class cs-int in the dialog.
     */
    parent.setIntControls = function ($selection, unit, min, max) {
        var $el;
        $.each($selection, function (index,  item) {
            $el = $(item);
            // Spin button are available only if control is editable
            if (!$el.attr('readonly') && !$el.attr('disabled')) {
                $el.TouchSpin({
                    boostat: 5,
                    maxboostedstep: 10,
                    min: min || 0,
                    max: max || 0xFFFF,
                    initval: 0,
                    postfix: unit || ''
                });
            }
        });
    };

    /**
     * Method: valueTo01
     * Returns an integer with value 0 or 1 from a string or a boolean.
     *
     * Returns:
     * 1 - if for 'ON', 'true', true, !0
     * 0 - is for false, undefined, NaN, null, 0
     * This function use case ++insensitive++ comparison.
     */
    parent.valueTo01 = function (val) {
        if (_.isBoolean(val)) {
            return val ? 1 : 0;
        }

        if (_.isString(val)) {
            if (val.toLowerCase() === 'on' || val.toLowerCase() === 'yes' || val.toLowerCase() === 'true') {
                return 1;
            }
            else {
                return 0;
            }
        }

        if (_.isNumber(val)) {
            return val !== 0 ? 1 : 0;
        }

        // This must be the last test !
        if (val === null || val === undefined || isNaN(val)) {
            return 0;
        }

        return 0;
    };

    /**
     * Method: asBool
     * Try to guess if value means true or false. See <valueTo01>.
     */
    parent.asBool = function (val) {
        return parent.valueTo01(val) !== 0;
    };

    /**
     * Method: formatMoney
     * Format any number into currency.
     *
     * Reference:
     * http://josscrowcroft.github.com/accounting.js/#methods
     */
    parent.formatMoney = function (n, displaySign, perMonth) {
        if (displaySign) {
            return accounting.formatMoney(n, {
                format: {
                    pos: parent.__('currency-format-pos-signed'),
                    neg: parent.__('currency-format-neg-signed'),
                    zero: parent.__('currency-format-zero-signed')
                }
            });
        }

        return accounting.formatMoney(n) + (perMonth ? parent.__('/month') : '');
    };

    /**
     * Method: formatMoneyNotNull
     * Format any number into currency. If value is 0 (zero) then an empty string is returned.
     */
    parent.formatMoneyNotNull = function (n, displaySign) {
        if (n !== 0) {
            return parent.formatMoney(n, displaySign);
        }
        else {
            return '';
        }
    };

    /**
     * Method: formatColumn
     * Format a list of values for column-display.
     *
     * Reference:
     * http://josscrowcroft.github.com/accounting.js/#methods
     */
    parent.formatColumn = function (n) {
        return accounting.formatColumn(n);
    };

    /**
     * Method: formatNumber
     * Format a number with custom precision and localisation.
     *
     * Reference:
     * http://josscrowcroft.github.com/accounting.js/#methods
     */
    parent.formatNumber = function (n, precision) {
        return accounting.formatNumber(n, precision);
    };

    /**
     * Method: formatPercent
     * Format a percent with its symbol. Precision gives the number of digits.
     */
    parent.formatPercent = function (n) {
        return parent.__('{percent}%', { percent: parent.formatNumber(n, 2) });
    };

    /**
     * Method: formatFloat
     * Return a float number from a string with localized formatted number.
     *
     * Reference:
     * http://josscrowcroft.github.com/accounting.js/#methods
     */
    parent.formatFloat = function (s, nanOnError) {
        if (nanOnError) {
            if (!parent.regexp.isFloat.test(s.replace(accounting.settings.number.decimal, '.'))) {
                return NaN;
            }
        }

        return accounting.unformat(s.replace('.', accounting.settings.number.decimal));
    };

    /**
     * Method: toFixed
     * Better rounding for floating point numbers.
     *
     * Reference:
     * http://josscrowcroft.github.com/accounting.js/#methods
     */
    parent.toFixed = function (n) {
        return accounting.toFixed(n);
    };

    /**
     * Method: formatDiscount
     * This method returns a discount value as a string .
     *
     * Parameters:
     * value - The amount of discount (price, percent).
     * type - The type of discount from <parent.DISCOUNT_TYPES>.
     */
    parent.formatDiscount = function (value, type) {
        type = formatNumber(type);
        value = formatNumber(value);

        if (type === parent.DISCOUNT_TYPES.PERCENT) {
            return parent.__('{percent}%', { percent: value });
        }
        else if (type === parent.DISCOUNT_TYPES.PRICE_FIXED) {
            return parent.formatMoney(value, false);
        }
        else if (type === parent.DISCOUNT_TYPES.PRICE_MINUS) {
            return parent.formatMoney(value, true);
        }

        return value.toString();
    };

    /**
     * Method: unformat
     * Get a value from any formatted number/currency string.
     *
     * Reference:
     * http://josscrowcroft.github.com/accounting.js/#methods
     */
    parent.unformat = function (n) {
        return accounting.unformat(n);
    };

    /**
     * Method: secondsToString
     * Return a duration in human readable string.
     *
     * Parameters:
     * sec - The duration in seconds.
     * config - Options that modify output.
     * config.formatShort - Set this to true to display short units names.
     * config.excludeSeconds - Set this to +true+ to +not display+ the seconds.
     */
    var secondsToString = parent.secondsToString = function (sec, config) {

        var cfg = $.extend({
            formatShort: true
        }, config);

        var tmp = Math.abs(sec);
        var years = Math.floor(tmp / 31536000); // Years
        var months = Math.floor((tmp % 31536000) / 2629800); // Months (approximative)
        var weeks = Math.floor(((tmp % 31536000) % 2629800) / 604800); // Weeks (approximative)
        var days = Math.floor(((tmp % 31536000) % 604800) / 86400); // Days
        var hours = Math.floor(((tmp % 31536000) % 86400) / 3600); // Hours
        var minutes = Math.floor((((tmp % 31536000) % 86400) % 3600) / 60); // Minutes
        var seconds = (((tmp % 31536000) % 86400) % 3600) % 60; // Seconds

        var result = [];
        result.push((years === 0) ? '' : (cfg.formatShort) ? parent.__('{n}Y', { n: years }) : parent.__('{n} years', { n: years }));
        result.push((months === 0) ? '' : (cfg.formatShort) ? parent.__('{n}M', { n: months }) : parent.__('{n} months', { n: months }));
        result.push((weeks === 0) ? '' : (cfg.formatShort) ? parent.__('{n}W', { n: weeks }) : parent.__('{n} weeks', { n: weeks }));
        result.push((days === 0) ? '' : (cfg.formatShort) ? parent.__('{n}d', { n: days }) : parent.__('{n} days', { n: days }));
        result.push((hours === 0) ? '' : (cfg.formatShort) ? parent.__('{n}h', { n: hours }) : parent.__('{n} hours', { n: hours }));
        result.push((minutes === 0) ? '' : (cfg.formatShort) ? parent.__('{n}m', { n: minutes }) : parent.__('{n} minutes', { n: minutes }));
        if (!cfg.excludeSeconds) {
            result.push((seconds === 0) ? '' : (cfg.formatShort) ? parent.__('{n}s', { n: seconds }) : parent.__('{n} seconds', { n: seconds }));
        }

        return result.join(' ').trim();
    };

    parent.secondsBetweenDates = function (startDate, endDate, config) {
        return secondsToString((startDate - endDate) / 1000, config);
    };

    /*
     * Method: ISODateToLocaleDate
     * This method convert a date in ISO format into a date with locale format. It will include the timezone.
     *
     * Returns:
     * - Date object
     */
    parent.ISODateToLocaleDate = function (iso) {
        var isoDate = new Date(iso);
        return moment(isoDate.getTime() + isoDate.getTimezoneOffset() * 60 * 1000);
    };

    /*
     * Method: naturalSort
     * This method compares two objects with natural sort algorythm.
     */
    parent.naturalSort = function(a, b, options) {
        options = options || {};
        var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            i = function(s) { return options.insensitive && (''+s).toLowerCase() || ''+s; },
            // convert all to strings strip whitespace
            x = i(a).replace(sre, '') || '',
            y = i(b).replace(sre, '') || '',
            // chunk/tokenize
            xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
            yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null,
            oFxNcL, oFyNcL,
            mult = options.desc ? -1 : 1;

        // first try and sort Hex codes or Dates
        if (yD) {
            if ( xD < yD ) {
                return -1 * mult;
            }
            else if ( xD > yD ) {
                return 1 * mult;
            }
        }

        // natural sorting through split numeric strings and default strings
        for (var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
            // find floats not starting with '0', string or 0 if not defined (Clint Priest)
            oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
            oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            else if (typeof oFxNcL !== typeof oFyNcL) {
                oFxNcL += '';
                oFyNcL += '';
            }
            if (oFxNcL < oFyNcL) {
                return -1 * mult;
            }
            if (oFxNcL > oFyNcL) {
                return 1 * mult;
            }
        }
        return 0;
    };

    /*
     * Method: normalizeName
     * Remove tags and others naughty characters from the string.
     */
    parent.normalizeName = function (name) {
        if (name) {
            name = name.trim().unescapeURL();
        }

        if (!name || name === '') {
            name = parent.__('<empty>');
        }

        return name;
    };

};

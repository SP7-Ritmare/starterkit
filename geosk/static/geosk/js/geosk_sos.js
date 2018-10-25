//! moment.js
//! version : 2.5.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "2.5.1",
        global = this,
        round = Math.round,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for language config files
        languages = {},

        // moment internal properties
        momentProperties = {
            _isAMomentObject: null,
            _i : null,
            _f : null,
            _l : null,
            _strict : null,
            _isUTC : null,
            _offset : null,  // optional. Combine with _isUTC
            _pf : null,
            _lang : null  // optional
        },

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined'),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.lang().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.lang().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Language() {

    }

    // Moment prototype object
    function Moment(config) {
        checkOverflow(config);
        extend(this, config);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            years * 12;

        this._data = {};

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }

        if (b.hasOwnProperty("toString")) {
            a.toString = b.toString;
        }

        if (b.hasOwnProperty("valueOf")) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function cloneMoment(m) {
        var result = {}, i;
        for (i in m) {
            if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
                result[i] = m[i];
            }
        }

        return result;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months,
            minutes,
            hours;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        // store the minutes and hours so we can restore them
        if (days || months) {
            minutes = mom.minute();
            hours = mom.hour();
        }
        if (days) {
            mom.date(mom.date() + days * isAdding);
        }
        if (months) {
            mom.month(mom.month() + months * isAdding);
        }
        if (milliseconds && !ignoreUpdateOffset) {
            moment.updateOffset(mom);
        }
        // restore the minutes and hours after possibly changing dst
        if (days || months) {
            mom.minute(minutes);
            mom.hour(hours);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return  Object.prototype.toString.call(input) === '[object Date]' ||
                input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (inputObject.hasOwnProperty(prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment.fn._lang[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }

    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) :
            moment(input).local();
    }

    /************************************
        Languages
    ************************************/


    extend(Language.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment.utc([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal : "%d",

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Remove a language from the `languages` cache. Mostly useful in tests.
    function unloadLang(key) {
        delete languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.
    function getLangDefinition(key) {
        var i = 0, j, lang, next, split,
            get = function (k) {
                if (!languages[k] && hasModule) {
                    try {
                        require('./lang/' + k);
                    } catch (e) { }
                }
                return languages[k];
            };

        if (!key) {
            return moment.fn._lang;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            lang = get(key);
            if (lang) {
                return lang;
            }
            key = [key];
        }

        //pick the language from the array
        //try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        //substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        while (i < key.length) {
            split = normalizeLanguage(key[i]).split('-');
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                lang = get(split.slice(0, j).join('-'));
                if (lang) {
                    return lang;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {

        if (!m.isValid()) {
            return m.lang().invalidDate();
        }

        format = expandFormat(format, m.lang());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, lang) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) { return parseTokenOneDigit; }
            /* falls through */
        case 'SS':
            if (strict) { return parseTokenTwoDigits; }
            /* falls through */
        case 'SSS':
            if (strict) { return parseTokenThreeDigits; }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return getLangDefinition(config._l)._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), "i"));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = getLangDefinition(config._l).monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'dd':
        case 'ddd':
        case 'dddd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gg':
        case 'gggg':
        case 'GG':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = input;
            }
            break;
        }
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate,
            yearToUse, fixYear, w, temp, lang, weekday, week;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            fixYear = function (val) {
                var int_val = parseInt(val, 10);
                return val ?
                  (val.length < 3 ? (int_val > 68 ? 1900 + int_val : 2000 + int_val) : int_val) :
                  (config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR]);
            };

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
            }
            else {
                lang = getLangDefinition(config._l);
                weekday = w.d != null ?  parseWeekday(w.d, lang) :
                  (w.e != null ?  parseInt(w.e, 10) + lang._week.dow : 0);

                week = parseInt(w.w, 10) || 1;

                //if we're parsing 'd', then the low day numbers may be next week
                if (w.d != null && weekday < lang._week.dow) {
                    week++;
                }

                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
            }

            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
        input[HOUR] += toInt((config._tzm || 0) / 60);
        input[MINUTE] += toInt((config._tzm || 0) % 60);

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var lang = getLangDefinition(config._l),
            string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }

        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function makeDateFromString(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be "T" or undefined
                    config._f = isoDates[i][0] + (match[6] || " ");
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += "Z";
            }
            makeDateFromStringAndFormat(config);
        }
        else {
            config._d = new Date(string);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else {
            config._d = new Date(input);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, language) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = language.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = cloneMoment(input);

            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    // creating with utc
    moment.utc = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var r;
        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(normalizeLanguage(key), values);
        } else if (values === null) {
            unloadLang(key);
            key = 'en';
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr;
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null &&  obj.hasOwnProperty('_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function (input) {
        return moment(input).parseZone();
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().lang('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {

            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function () {
            return this.zone(0);
        },

        local : function () {
            this.zone(0);
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add : function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                output += ((this - moment(this).startOf('month')) -
                        (that - moment(that).startOf('month'))) / diff;
                // same as above but with zones, to negate all dst
                output -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var sod = makeAs(moment(), this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.lang());
                return this.add({ d : input - day });
            } else {
                return day;
            }
        },

        month : function (input) {
            var utc = this._isUTC ? 'UTC' : '',
                dayOfMonth;

            if (input != null) {
                if (typeof input === 'string') {
                    input = this.lang().monthsParse(input);
                    if (typeof input !== 'number') {
                        return this;
                    }
                }

                dayOfMonth = this.date();
                this.date(1);
                this._d['set' + utc + 'Month'](input);
                this.date(Math.min(dayOfMonth, this.daysInMonth()));

                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + 'Month']();
            }
        },

        startOf: function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            return this.startOf(units).add((units === 'isoWeek' ? 'week' : units), 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = units || 'ms';
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },

        min: function (other) {
            other = moment.apply(null, arguments);
            return other < this ? this : other;
        },

        max: function (other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        },

        zone : function (input) {
            var offset = this._offset || 0;
            if (input != null) {
                if (typeof input === "string") {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                this._offset = input;
                this._isUTC = true;
                if (offset !== input) {
                    addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? "UTC" : "";
        },

        zoneName : function () {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        quarter : function () {
            return Math.ceil((this.month() + 1.0) / 3.0);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return input == null ? year : this.add("y", (input - year));
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add("y", (input - year));
        },

        week : function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return input == null ? weekday : this.add("d", input - weekday);
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    });

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + 's'] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                moment.updateOffset(this);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);
            data.days = days % 30;

            months += absRound(days / 30);
            data.months = months % 12;

            years = absRound(months / 12);
            data.years = years;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            units = normalizeUnits(units);
            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
        },

        lang : moment.fn.lang,

        toIsoString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        }
    });

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);
    moment.duration.fn.asMonths = function () {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
    };


    /************************************
        Default Lang
    ************************************/


    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LANGUAGES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(deprecate) {
        var warned = false, local_moment = moment;
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        if (deprecate) {
            global.moment = function () {
                if (!warned && console && console.warn) {
                    warned = true;
                    console.warn(
                            "Accessing Moment through the global scope is " +
                            "deprecated, and will be removed in an upcoming " +
                            "release.");
                }
                return local_moment.apply(null, arguments);
            };
            extend(global.moment, local_moment);
        } else {
            global['moment'] = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
        makeGlobal(true);
    } else if (typeof define === "function" && define.amd) {
        define("moment", function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal !== true) {
                // If user provided noGlobal, he is aware of global
                makeGlobal(module.config().noGlobal === undefined);
            }

            return moment;
        });
    } else {
        makeGlobal();
    }
}).call(this);

// Derived and simplified from example on bryntum.com
// http://stackoverflow.com/questions/15029462/exporting-sdk2-grid-to-csv
GridExporter = Ext.extend(Object, {
    dateFormat : 'Y-m-d g:i',
    
    exportGrid: function(grid) {
        if (Ext.isIE) {
            this._ieToExcel(grid);

        } else {
            var data = this._getCSV(grid);
	    Mydownload(data, "dowload.csv", "text/csv");

            //window.location = 'data:text/csv;charset=utf8,' + encodeURIComponent(data);
        }
    },

    _escapeForCSV: function(string) {
        if (string.match(/,/)) {
            if (!string.match(/"/)) {
                string = '"' + string + '"';
            } else {
                string = string.replace(/,/g, ''); // comma's and quotes-- sorry, just loose the commas
            }
        }
        return string;
    },

    _getFieldText: function(fieldData) {
        var text;

        if (fieldData == null || fieldData == undefined) {
            text = '';

        } else if (fieldData._refObjectName && !fieldData.getMonth) {
            text = fieldData._refObjectName;

        } else if (fieldData instanceof Date) {
            text = Ext.Date.format(fieldData, this.dateFormat);

        } else if (typeof fieldData === 'number') {
            text = "" + fieldData;

        } else if (!fieldData.match) { // not a string or object we recognize...bank it out
            text = '';

        } else {
            text = fieldData;
        }

        return text;
    },

    _getFieldTextAndEscape: function(fieldData) {
        var string  = this._getFieldText(fieldData);

        return this._escapeForCSV(string);
    },

    _getCSV: function (grid) {
        var cols    = grid.colModel.columns;
        var store   = grid.store;
        var data    = '';

        var that = this;
        Ext.each(cols, function(col, index) {
            if (col.hidden != true) {
                data += that._getFieldTextAndEscape(col.header) + ',';
            }
        });
        data += "\n";

        store.each(function(record) {
            var entry       = record.data;
            Ext.each(cols, function(col, index) {
                if (col.hidden != true) {
                    var fieldName   = col.dataIndex;
                    var text        = entry[fieldName];
                    data += that._getFieldTextAndEscape(text) + ',';
		    console.log(fieldName);
		    console.log(text);
		    console.log(that._getFieldTextAndEscape(text));
                }
            });
            data += "\n";
        });

        return data;
    },

    _ieGetGridData : function(grid, sheet) {
        var that            = this;
        var resourceItems   = grid.store.data.items;
        var cols            = grid.colModel.columns;

        Ext.each(cols, function(col, colIndex) {
            if (col.hidden != true) {
                console.log('header: ', col.header);
                sheet.cells(1,colIndex + 1).value = col.header;
            }
        });

        var rowIndex = 2;
        grid.store.each(function(record) {
            var entry   = record.data;

            Ext.each(cols, function(col, colIndex) {
                if (col.hidden != true) {
                    var fieldName   = col.dataIndex;
                    var text        = entry[fieldName];
                    var value       = that._getFieldText(text);

                    sheet.cells(rowIndex, colIndex+1).value = value;
                }
            });
            rowIndex++;
        });
    },

    _ieToExcel: function (grid) {
        if (window.ActiveXObject){
            var  xlApp, xlBook;
            try {
                xlApp = new ActiveXObject("Excel.Application"); 
                xlBook = xlApp.Workbooks.Add();
            } catch (e) {
                Ext.Msg.alert('Error', 'For the export to work in IE, you have to enable a security setting called "Initialize and script ActiveX control not marked as safe" from Internet Options -> Security -> Custom level..."');
                return;
            }

            xlBook.worksheets("Sheet1").activate;
            var XlSheet = xlBook.activeSheet;
            xlApp.visible = true; 

            this._ieGetGridData(grid, XlSheet);
            XlSheet.columns.autofit; 
        }
    }
});

// http://stackoverflow.com/questions/16376161/javascript-set-file-in-download
function Mydownload(strData, strFileName, strMimeType) {
    var D = document,
    a = D.createElement("a");
    strMimeType= strMimeType || "application/octet-stream";


    if (navigator.msSaveBlob) { // IE10
        return navigator.msSaveBlob(new Blob([strData], {type: strMimeType}), strFileName);
    } /* end if(navigator.msSaveBlob) */


    if ('download' in a) { //html5 A[download]
        a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
        a.setAttribute("download", strFileName);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            a.click();
            D.body.removeChild(a);
        }, 66);
        return true;
    } /* end if('download' in a) */


    //do iframe dataURL download (old ch+FF):
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" +  strMimeType   + "," + encodeURIComponent(strData);

    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
} /* end download() */
function ValidURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if(!pattern.test(str)) {
          return false;

  } else {
          return true;

  }
}
// override read function adding X-CSRFToken header
OpenLayers.Protocol.SOS.v1_0_0.prototype.read = function(options) {
    options = OpenLayers.Util.extend({}, options);
    OpenLayers.Util.applyDefaults(options, this.options || {});
    var response = new OpenLayers.Protocol.Response({requestType: "read"});
    var format = this.format;
    var data = OpenLayers.Format.XML.prototype.write.apply(format,
    	[format.writeNode("sos:GetFeatureOfInterest", {fois: this.fois})]
    );
    response.priv = OpenLayers.Request.POST({
        url: options.url,
        callback: this.createCallback(this.handleRead, response, options),
        data: data,
        headers: {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')}
    });
    return response;
};

OpenLayers.SOSFoiClient = OpenLayers.Class({
    CLASS_NAME: "OpenLayers.SOSFoiClient"
});


OpenLayers.SOSClient = OpenLayers.Class({
    url: null,
    map: null,
    capsformat: new OpenLayers.Format.SOSCapabilities(),
    obsformat: new OpenLayers.Format.SOSGetObservation(),
    legends: null,
    updateLegendTimeout: null,
    latestPosition: null,
    events: null,

    // 52n bug on v4.0.0 and SOS1.0.0 need to check resultModel
    resultModel: 'om:Measurement',

    /**
     *
     */
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
        this.events = new OpenLayers.Events(this);
        var params = {'service': 'SOS', 'request': 'GetCapabilities', 'acceptVersions': '1.0.0'};
        var paramString = OpenLayers.Util.getParameterString(params);
        url = OpenLayers.Util.urlAppend(this.url, paramString);
        OpenLayers.Request.GET({url: url,
                                success: this.parseSOSCaps,
                                failure: this.onFailure,
                                scope: this
                               });
    },
    onFailure: function(){
        this.events.triggerEvent("failure");
    },
    getRandomColor: function () {
        var colorIndex;
        var color;
        var colors = ['#33a02c', '#1f78b4', '#b2df8a', '#a6cee3', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6' ,'#6a3d9a', '#ffff99', '#b15928'];
	// warning: global variable
	// if(sosColorsIndex  === 'undefined'){
	if(typeof sosColorsIndex == 'undefined'){
	    sosColorsIndex = 0;
	}
	colorIndex = sosColorsIndex;
	if(colorIndex < colors.length){
	    color = colors[colorIndex];
	} else {
	    var letters = '0123456789ABCDEF'.split('');
	    color = '#';
	    for (var i = 0; i < 6; i++) {
		color += letters[Math.round(Math.random() * 15)];
	    }
	}
	sosColorsIndex += 1;
	return color;
    },
    createLayer: function(){
	//console.log(this);
	this.layer = new OpenLayers.Layer.Vector.SOS(this.SOSCapabilities.serviceIdentification.title, {
            styleMap: new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({},{
		    rules: [
			new OpenLayers.Rule({
			    'name': 'base',
			    'title': 'FOI',
			    symbolizer: {
				graphicName:"circle", pointRadius:6, fillOpacity:0.8, fillColor: this.getRandomColor()
				//'pointRadius': 10,
				//'externalGraphic': 'http://cigno.ve.ismar.cnr.it/static/cigno/img/sos_marker.png',
			    }
			})
		    ]
                })
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.SOS({
                formatOptions: {internalProjection: new OpenLayers.Projection('EPSG:4326')},
                //url: this.url,
                // url: this.urlPOST,
		url: this.getURL('GetFeatureOfInterest', 'post', 'application/xml'),
                fois: this.getFois()
            }),
            projection: new OpenLayers.Projection("EPSG:4326")
            // displayInLayerSwitcher: false
        });
	return this.layer
    },

    getURL: function(operation, method, contentType){
	var elements = this.SOSCapabilities.operationsMetadata[operation].dcp.http[method];
	for(var index = 0; index < elements.length; ++index){
	    var el = elements[index];
	    if (typeof el.constraints === 'undefined'){
		return el.url;
	    } else {
		if(el.constraints['Content-Type'].allowedValues[contentType] === true){
		    return el.url;
		}
	    }
	}
	return elements[0].url;
    },

    parseSOSCaps: function(response) {
        // cache capabilities for future use
        this.SOSCapabilities = this.capsformat.read(response.responseXML || response.responseText);
	//console.log(this.SOSCapabilities.operationsMetadata.GetFeatureOfInterest.dcp.http.post[0].url);
	// non lancio piu' queste funzioni perche' ora controlla tutto il gxp_source
        // this.map.addLayer(this.createLayer());
        // this.ctrl = new OpenLayers.Control.SelectFeature(this.layer,
        //                               {scope: this, onSelect: this.onFeatureSelect});
        // this.map.addControl(this.ctrl);
        // this.ctrl.activate();
        this.events.triggerEvent("loaded",
                         {"capabilities": this.SOSCapabilities});
    },

    /**
     *
     */
    getFois: function() {
        var result = [];
        this.offeringCount = 0;
	//console.log(this.SOSCapabilities);
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            this.offeringCount++;
            for (var i=0, len=offering.featureOfInterestIds.length; i<len; i++) {
                var foi = offering.featureOfInterestIds[i];
                if (OpenLayers.Util.indexOf(result, foi) === -1) {
                    result.push(foi);
                }
            }
        }
        return result;
    },

    getTitleForObservedProperty: function(property) {
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return offering.name;
            }
        }
    },

    getNameForObservedProperty: function(property) {
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return name;
            }
        }
    },

    getNameForFoi: function(property) {
        for (var fid in this.layer.features) {
            if(this.layer.features[fid].attributes.id == property){
		return this.layer.features[fid].attributes.name;
	    }
        }
    },

    getObservationRequest: function(foiId, offering_id, observedProperties, begin, end, resultModel){
	var foi = {objectId: foiId};
        // get a time range for chart
        var xml = this.obsformat.write({
            eventTime: 'first',
            resultModel: resultModel,
            responseMode: 'inline',
            procedure: foiId,     // TODO: verificare procedure
            foi: foi,
            offering: offering_id,
            observedProperties: observedProperties,
            responseFormat: this.getResponseFormat()
        });

        var timeperiodXml = this.getGmlTimeperiod(begin, end);

        // a little rework due to missing timeperiod in OL-Format
        xml = xml.replace("xmlns:ogc=\"http://www.opengis.net/ogc\"", "xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\"");
        xml = xml.replace("<eventTime/>", timeperiodXml);
	return xml;
    },

    getGmlTimeperiod: function(begin, end) {
        var timeperiod = "<eventTime>" +
                "<ogc:TM_During>" +
                "<ogc:PropertyName>om:samplingTime</ogc:PropertyName>" +
                "<gml:TimePeriod>" +
                "<gml:beginPosition>" + moment(begin).format() + "</gml:beginPosition>" +
                "<gml:endPosition>" + moment(end).format() + "</gml:endPosition>" +
                "</gml:TimePeriod>" +
                "</ogc:TM_During>" +
                "</eventTime>";

        return timeperiod;
    },


    getResponseFormat: function(){
        if (!this.responseFormat) {
            for (format in this.SOSCapabilities.operationsMetadata.GetObservation.parameters.responseFormat.allowedValues) {
                // look for a text/xml type of format
                if (format.indexOf('text/xml') >= 0) {
                    this.responseFormat = format;
                }
            }
        }
	return this.responseFormat;
    },

    getOfferingsByFoi: function(foi){
	var foiId = foi.attributes.id;
	var offerings = {};
        for (var name in this.SOSCapabilities.contents.offeringList) {
	    // console.log(foi);
            var offering = this.SOSCapabilities.contents.offeringList[name];
	    // console.log(offering.featureOfInterestIds);

            // test foi in offeringList
            if(offering.featureOfInterestIds.indexOf(foiId) !== -1){
                //problema nel loop degli array all'interno del writers perche' Ext modifica l'array base dj js ( Ext Array.prototype.indexOf)
                //trasformo l'array in un dictionary
                // var observedProperties = {};
                // offering.observedProperties.forEach(function(val, i) {
                // observedProperties[i]=val;
		//});

		offerings[name] = offering;
            }
        }
	return offerings;
    },

    onFeatureSelect: function(feature) {
	//alert(feature);
	//console.log(feature);
	var foiExplorer = new FoiExplorer({sosClient: this,
					   foi: feature,
					   title: "SOS details: " + feature.attributes.name
					  });

        foiExplorer.show();
    },

    getObservation: function(foiId, offering_id, observedProperty_id, begin, end, onSuccess){
        var offering = this.SOSCapabilities.contents.offeringList[offering_id];
        //c'e' un problema con array e extjs: vedi commento piu' avanti
        var observedProperties = {};
	// doesn't work in IE
        // offering.observedProperties.forEach(function(val, i) {
        //     observedProperties[i]=val;
        // });
	//
	// non funziona nenanche questo in alcuni casi -> prendo solo la prima
        // for(var i=0; i< offering.observedProperties.length; i++) {
	//    observedProperties[i] = offering.observedProperties[i];
	//}
	//if(offering.observedProperties.length>0){
	//  var observedProperties = {0: offering.observedProperties[0]}
        //}

	// ora e' passato come parametro alla funzione
	var observedProperties = {0: observedProperty_id}

	var xmlRequest = this.getObservationRequest(foiId, offering_id, observedProperties, begin,end, this.resultModel);
        OpenLayers.Request.POST({
            // url: this.sosClient.urlPOST,
	    url: this.getURL('GetObservation', 'post', 'application/xml'),
            scope: this,
            success: function(response) {
		//console.log(response.responseText);
		//check for exceptions
		var xmlReader = new OpenLayers.Format.XML();
		var doc = xmlReader.read(response.responseText);
		if(doc && doc.documentElement.tagName == "ows:ExceptionReport"){
		    var els = doc.documentElement.getElementsByTagName('ExceptionText');
		    if(els.length > 0 && els[0].textContent.indexOf("om:Measurement") > -1){
			this.resultModel = null;
			// this.chartReload(); //TODO lanciare automaticamente il reload
		    }
		}
		var output = this.obsformat.read(response.responseXML || response.responseText);
		//console.log(output);
		onSuccess(offering, output);
	    },

            failure: function(response) {
                ("No data for charts...");
            },
            data: xmlRequest,
            headers: {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')}
        });
    },



    /**
     *
     */
    destroy: function () {
    },

    /**
     *
     */
    CLASS_NAME: "OpenLayers.SOSClient"
});

    PlotDataStore = Ext.extend(Ext.util.Observable, {
	constructor: function(config){
	    this.dataSeries = [];
            this.name = config.name;
            this.addEvents({
		"addSerie" : true,
		"reload" : true
            });

            this.listeners = config.listeners;

            PlotDataStore.superclass.constructor.call(this, config)
	},
	addSerie: function(data){
	    this.dataSeries.push(data);
	    this.fireEvent('addSerie', this.dataSeries, data);
	},
	removeAll: function(){
	    this.dataSeries = [];
	    this.fireEvent('reload', this.dataSeries);
	},
	removeSerie: function(serie_id){
            for(var i=0; i< this.dataSeries.length; i++) {
		if(this.dataSeries[i]['serie_id'] == serie_id){
		    this.dataSeries.splice(i, 1);
		}
            }
	    this.fireEvent('reload', this.dataSeries);
	},
	reload: function(){
	    this.fireEvent('reload', this.dataSeries);
	},
	download: function(){
	    // console.log(this.dataSeries);
	    var de = new DataExporter();
	    de.exportGrid(this.dataSeries);
	}

    });


DataExporter = Ext.extend(Object, {
    dateFormat : 'Y-m-d g:i',

    exportGrid: function(grid) {
        if (Ext.isIE) {
            this._ieToExcel(grid);

        } else {
            var data = this._getCSV(grid);
	    Mydownload(data, "dowload.csv", "text/csv");

            //window.location = 'data:text/csv;charset=utf8,' + encodeURIComponent(data);
        }
    },

    _escapeForCSV: function(string) {
        if (string.match(/,/)) {
            if (!string.match(/"/)) {
                string = '"' + string + '"';
            } else {
                string = string.replace(/,/g, ''); // comma's and quotes-- sorry, just loose the commas
            }
        }
        return string;
    },

    _getFieldText: function(fieldData) {
        var text;

        if (fieldData == null || fieldData == undefined) {
            text = '';

        } else if (fieldData._refObjectName && !fieldData.getMonth) {
            text = fieldData._refObjectName;

        } else if (fieldData instanceof Date) {
            text = Ext.Date.format(fieldData, this.dateFormat);

        } else if (typeof fieldData === 'number') {
            text = "" + fieldData;

        } else if (!fieldData.match) { // not a string or object we recognize...bank it out
            text = '';

        } else {
            text = fieldData;
        }

        return text;
    },

    _getFieldTextAndEscape: function(fieldData) {
        var string  = this._getFieldText(fieldData);

        return this._escapeForCSV(string);
    },

    _getCSV: function (grid) {
        var store   = grid.store;
        var data    = '';

        var that = this;
	var headers = ['offering', 'time', 'value']
        Ext.each(headers, function(col, index) {
            data += that._getFieldTextAndEscape(col) + ',';
        });
        data += "\n";

        Ext.each(grid, function(serie) {
	    Ext.each(serie.data, (function(record) {
		var time = new Date(record[0]).toISOString();
		var value = record[1];
		data += that._getFieldTextAndEscape(serie.serie_id) + ',';
		data += that._getFieldTextAndEscape(time) + ',';
		data += that._getFieldTextAndEscape(value) + ',';
		data += "\n";
	    }));
	});

        return data;
    },

    _ieGetGridData : function(grid, sheet) {
        var that            = this;
        var resourceItems   = grid.store.data.items;
        var cols            = grid.colModel.columns;

        Ext.each(cols, function(col, colIndex) {
            if (col.hidden != true) {
                // console.log('header: ', col.header);
                sheet.cells(1,colIndex + 1).value = col.header;
            }
        });

        var rowIndex = 2;
        grid.store.each(function(record) {
            var entry   = record.data;

            Ext.each(cols, function(col, colIndex) {
                if (col.hidden != true) {
                    var fieldName   = col.dataIndex;
                    var text        = entry[fieldName];
                    var value       = that._getFieldText(text);

                    sheet.cells(rowIndex, colIndex+1).value = value;
                }
            });
            rowIndex++;
        });
    },

    _ieToExcel: function (grid) {
        if (window.ActiveXObject){
            var  xlApp, xlBook;
            try {
                xlApp = new ActiveXObject("Excel.Application");
                xlBook = xlApp.Workbooks.Add();
            } catch (e) {
                Ext.Msg.alert('Error', 'For the export to work in IE, you have to enable a security setting called "Initialize and script ActiveX control not marked as safe" from Internet Options -> Security -> Custom level..."');
                return;
            }

            xlBook.worksheets("Sheet1").activate;
            var XlSheet = xlBook.activeSheet;
            xlApp.visible = true;

            this._ieGetGridData(grid, XlSheet);
            XlSheet.columns.autofit;
        }
    }
});


FoiExplorer = Ext.extend(Ext.Window, {
    constructor: function(config){
        var today = new Date(), begin = new Date(), end = new Date();

	this.timeRange = 2;

        begin.setDate(today.getDate() - this.timeRange);
        this.dateRange = [begin, end];
	this.frequency = 10;
	this.interval = 3600;

	this.sosClient = config.sosClient;
	this.foiId = config.foi.attributes.id

	// add listeners
        this.addEvents({
            //"addSerie" : true,
            //"removeSerie" : true,
	    //"reload": true
        });
        this.listeners = config.listeners;

	// configure window
        this.count = 0;

        //reinit
        this.offeringsGridId = Ext.id();
        this.placeholderId = Ext.id();
	this.manualModeId = Ext.id();
	this.realtimeModeId = Ext.id();

	var defaultConfig = this.configureSOSWindow();
	Ext.apply(defaultConfig, config);
	FoiExplorer.superclass.constructor.call(this, defaultConfig);


	// lo creo qui per avere lo scope: this
	// create stores
	this.plotDataStore = new PlotDataStore({
	    listeners: {
		addSerie: function(dataSeries, data) {
		    this.drawChart(dataSeries);
		},
		reload: function(dataSeries){
		    this.drawChart(dataSeries);
		},
		scope: this
	    }
	});


	//console.log(config.foi);
	var offerings = this.sosClient.getOfferingsByFoi(config.foi);
	for (var name in offerings) {
	    this.addSensorRecord(offerings[name], name);
	    //console.log(offerings[name].observedProperties);
	}

	this.enableRealTime(false);

    },
    plot: null,
    chartOptions: {
        series: {
            lines: { show: true },
            points: { show: true, radius: 2 } ,
            stack: false
        },
        crosshair: { mode: "x" },
        xaxis: {
            mode: "time",
            timeformat: "%d/%m/%y %H:%M",
            labelAngle: 45
        },
        grid: { hoverable: true, autoHighlight: false},
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
        //yaxis: { min: 0.00, max: 360.00 }
    },
    drawChart: function(dataSeries) {
        var options = this.chartOptions;
        this.plot = $.plot($("#"+ this.placeholderId), dataSeries, options);
        this.initLegends();
        this.initPanZoom();
    },
    chartMask: null,
    onDeselectOffering: function(sm, rowIndex, record ){
	this.plotDataStore.removeSerie(record.data.name);
    },
    onSelectOffering: function(sm, rowIndex, record ){
        var offering_id = record.data.name;
	var observedProperty_id = record.data.observedProperty;
	var observedProperty_label = record.data.observedPropertyLabel;
	var begin;
	var end;
	if(!this.realTime){
            begin = this.dateRange[0];
            end = this.dateRange[1];
	} else {
            var now = new Date();
	    begin = new Date();
	    end = new Date();
            begin.setTime(now.getTime() - this.interval * 1000);
	}

	//console.log(moment(begin).format());
	//console.log(moment(end).format());

        if(! this.chartMask) this.chartMask = new Ext.LoadMask(Ext.get(this.placeholderId));
        this.chartMask.show();

	var plotDataStore = this.plotDataStore;
	this.sosClient.getObservation(this.foiId, offering_id, observedProperty_id, begin,end,
				      function(offering, output){
					  var rows = [];
                                          var uom = "-";
					  if (output.measurements.length > 0) {
					      // a look-up object for different time formats
					      var timeMap = {};
					      for(var i=0; i<output.measurements.length; i++) {
						  var timePos = output.measurements[i].samplingTime.timeInstant.timePosition;
						  var timePosObj = new Date(timePos);
						  var timestamp = timePosObj.getTime();
						  rows.push([timestamp, parseFloat(output.measurements[i].result.value)]);
					      }

                                              // get uom from first record
                                              if(output.measurements.length > 0){
                                                  uom = output.measurements[0].result.uom;
                                              }

					      function sortfunction(a, b){
						  if(a[0] > b[0]) {
						      return 1;
						  }
						  else {
						      return -1;
						  }
					      }
					      rows.sort(sortfunction);
					  }
					  var label = observedProperty_label + " (" + uom + ") = No Values";
					  plotDataStore.addSerie({data: rows, label: label, serie_id: offering_id});
				      });
    },
    chartReload: function(){
	var grid = Ext.getCmp(this.offeringsGridId);
	this.plotDataStore.removeAll();

	var selection= grid.getSelectionModel();
	for(i=0;i < grid.store.getCount();i++){
            if(selection.isSelected(i)){
		this.onSelectOffering(1, 1, grid.store.getAt(i));
	    }
	}
    },
    download: function(){
	this.plotDataStore.download();
    },
    startRealTime: function(){
	var inst=this;
	// verifico che ci sia una frequenza valida, altrimenti resto in ascolto
	var freq = 1;
	if(this.frequency > 0){
	    this.chartReload();
	    freq = this.frequency;
	}
	this.realTimeTimeOut = setTimeout(function(){
	    inst.startRealTime();
	}, freq * 1000);
	//console.log('REALTIME');
    },
    stopRealTime: function(){
	clearTimeout(this.realTimeTimeOut);
	//console.log('STOP REALTIME');
    },
    enableRealTime: function(enable){
	this.realTime = enable;
	Ext.getCmp(this.realtimeModeId).setDisabled(!enable);
	Ext.getCmp(this.manualModeId).setDisabled(enable);
	if(enable){
	    this.startRealTime();
	} else {
	    this.stopRealTime();
	}
    },
    getFormattedDateFromTimePos: function(timePos) {
	//console.log(timePos);
	//console.log(Date.parse(timePos));
        // var date = new Date(Date.parse(timePos));
        // var formattedString = date.format("isoDate") + " " + date.format("isoTime");

	var date = moment(timePos);
	var a = date.format("YYYY-MM-DD HH:mm");
        return a;
    },
    addSensorRecord: function(offering, name, time, lastvalue) {
        this.count++;
	for(var i=0; i< offering.observedProperties.length; i++) {
	    //console.log(i);
            //exclude phenomenonTime
            if(offering.observedProperties[i] == 'http://www.opengis.net/def/property/OGC/0/PhenomenonTime'){
                continue;
            }
            observedPropertyLabel = offering.observedProperties[i];
	    this.offeringsStore.add(
		this.getSensorRecord({
		    type: offering.name,
		    name: name,
		    observedProperty: offering.observedProperties[i],
		    observedPropertyLabel: observedPropertyLabel,
		    time: time,
		    startPeriod: (offering.time && offering.time.timePeriod) ? this.getFormattedDateFromTimePos(offering.time.timePeriod.beginPosition) : '-',
		    endPeriod: (offering.time && offering.time.timePeriod) ? this.getFormattedDateFromTimePos(offering.time.timePeriod.endPosition) : '-',
		    lastvalue: lastvalue
		})
	    );
        };
    },
    getSensorRecord: function(config){
	Ext.apply({
	    type: null,
	    name: null,
	    observedProperty: null,
	    observedPropertyLabel: null,
	    time: null,
	    startPeriod: null,
	    endPeriod: null,
	    lastvalue: null
	}, config);
	var SensorRecord =  Ext.data.Record.create([
            {name: "type", type: "string"},
            {name: "name", type: "string"},
            {name: "observedProperty", type: "string"},
            {name: "observedPropertyLabel", type: "string"},
            {name: "time", type: "string"},
            {name: "startPeriod", type: "string"},
            {name: "endPeriod", type: "string"},
            {name: "lastvalue", type: "string"}
	]);
	return new SensorRecord({
            type: config.type,
            name: config.name,
            observedProperty: config.observedProperty,
            observedPropertyLabel: config.observedPropertyLabel,
            time: config.time,
            startPeriod: config.startPeriod,
            endPeriod: config.endPeriod,
            lastvalue: config.lastvalue
        });
    },

    // chart's functions
    initLegends: function(){
        this.legends = $("#" + this.placeholderId + " .legendLabel");
        this.legends.each(function () {
            // fix the widths so they don't jump around
            $(this).css('width', $(this).width());
        });
	var sos = this;
        $("#"+this.placeholderId).bind("plothover",  function (event, pos, item) {
            sos.latestPosition = pos;
            //if (!sos.updateLegendTimeout){
	    //sos.updateLegendTimeout = setTimeout(function(){sos.updateLegend();}, 50);
	    //}
	    sos.updateLegend();
        });
    },

    initPanZoom: function(){
	var sos = this;
        $("#"+this.placeholderId).bind('plotpan', function (event, plot) {
            sos.initLegends();
        });

        $("#"+this.placeholderId).bind('plotzoom', function (event, plot) {
            sos.initLegends();
        });

    },
    updateLegend: function(){
        this.updateLegendTimeout = null;
        var pos = this.latestPosition;
        var axes = this.plot.getAxes();
        if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
            pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
            return;

        var i, j, dataset = this.plot.getData();
        for (i = 0; i < dataset.length; ++i) {
            var series = dataset[i];

            // find the nearest points, x-wise
            for (j = 0; j < series.data.length; ++j)
                if (series.data[j][0] > pos.x)
                    break;

            // now interpolate
            var y, p1 = series.data[j - 1], p2 = series.data[j];
            if (p1 == null)
                y = p2[1];
            else if (p2 == null)
                y = p1[1];
            else
                y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);

            this.legends.eq(i).text(series.label.replace(/=.*/, "= " + y.toFixed(3)));
        }
    },

    configureSOSWindow: function(){
	this.offeringsStore = new Ext.data.ArrayStore({
            // store configs
            // autoDestroy: true,
            // reader configs
            idIndex: 0,
            fields: [
		{name: 'type'},
		{name: 'name'},
		{name: 'observedProperty'},
		{name: 'observedPropertyLabel'},
		{name: 'time'},
		{name: 'startPeriod'},
		{name: 'endPeriod'},
		{name: 'lastvalue'}
            ]
	});
        this.offeringsStore.addListener('add', function(store, records, index){
            var record = records[0];
            var op = record.get('observedProperty');
            if(ValidURL(op)){
                var request = OpenLayers.Request.GET({
                    url: op,
                    success: function(request){
                        var doc = null;
                        if(!request.responseXML.documentElement) {
                            var format = new OpenLayers.Format.XML();
                            doc = format.read(request.responseText);
                        } else {
                            doc = request.responseXML;
                        }
                        var label = doc.getElementsByTagNameNS('http://www.w3.org/2004/02/skos/core#', 'altLabel');
                        if(label){
                            label = label[0].textContent;
                        }
                        if(label && label != ''){
                            record.set('observedPropertyLabel', label);
                        }
                    },
                    failure: function(request){}
                });
            }
        }, this.offeringsStore);
        return {
            maximizable: true,
            width: 1000,
            height: 350,
            layout: 'border',
	    cls: 'sos-window',
	    defaults: {
		collapsible: true,
		split: true
		//bodyStyle: 'padding:15px'
	    },
            items: [
		{
		    title: 'Metadata',
		    region: 'west',
		    minSize: 150,
		    width: 300,
		    bodyStyle: 'padding: 5px',
		    html: '<p><b>Service: </b>' + this.sosClient.SOSCapabilities.serviceIdentification.title + '</p>'
			+ '<p><b>Abstract: </b> ' + this.sosClient.SOSCapabilities.serviceIdentification.abstract + '</p>'
			+ '<p><b>Provider: </b> ' + this.sosClient.SOSCapabilities.serviceProvider.providerName + '</p>'
			+ '<p><b>Foi: </b> ' + this.sosClient.getNameForFoi(this.foiId) + '</p>'
		},
		{
                    xtype: 'panel',
                    title: 'Observations',
                    //iconCls: 'chart_curve',
                    html: "<div id='" + this.placeholderId + "' class='chart'></div>",
                    //padding: '3 3 3 3',
		    region: 'south',
		    height: 150,
		    minSize: 150,
		    //maxSize: 250,
		    //cmargins: '5 0 0 0',
		    tbar: [{
			xtype:'buttongroup',
			title: 'Settings',
			defaults: {
			    scale: 'medium'
			},
			items: [{
			    text: 'Mode',
			    menu: {        // <-- submenu by nested config object
				items: [
				    {
					checked: true,
					group: 'theme',
					text: 'Manual',
					icon: 'images/chart_line.png',
					listeners: {
					    "click": function(){
						this.enableRealTime(false);
					    },
					    scope: this
					}
				    }, {
					checked: false,
					group: 'theme',
					text: 'Real-time',
					icon: 'images/chart_curve.png',
					listeners: {
					    "click": function() {
						this.enableRealTime(true);
					    },
					    scope: this
					}
				    }
				]
			    }
			},{
			    text: 'Style',
			    menu: {        // <-- submenu by nested config object
				items: [
				    {
					checked: true,
					group: 'theme',
					text: 'Line & points',
					icon: 'images/chart_line.png',
					listeners: {
					    "click": function(){
						this.chartOptions['series']['lines']['show'] = true;
						this.chartOptions['series']['points']['show'] = true;
						this.plotDataStore.reload();
					    },
					    scope: this
					}
				    }, {
					checked: false,
					group: 'theme',
					text: 'Line',
					icon: 'images/chart_curve.png',
					listeners: {
					    "click": function(){
						this.chartOptions['series']['lines']['show'] = true;
						this.chartOptions['series']['points']['show'] = false;
						this.plotDataStore.reload();
					    },
					    scope: this
					}
				    }, {
					checked: false,
					group: 'theme',
					text: 'Points',
					icon: 'images/chart_point.png',
					listeners: {
					    "click": function(){
						this.chartOptions['series']['lines']['show'] = false;
						this.chartOptions['series']['points']['show'] = true;
						this.plotDataStore.reload();
					    },
					    scope: this
					}
				    }
				]
			    }
			}]
		    }, {
			id: this.manualModeId,
			xtype: 'buttongroup',
			title: 'Manual',
			items: [{
                            xtype: 'label',
			    html:'Start date'
			},{
                            xtype: 'datefield',
                            value: this.dateRange[0],
			    format: 'd/m/Y',
			    width: 100,
                            listeners: {
		                "valid": function(field){
                                    this.dateRange[0] =  field.getValue();
                                    if(this.dateRange[0]){
					this.dateRange[0].setHours(0,0,0,0);
                                    }
		                },
				scope: this
	                    }
			},{
                            xtype: 'label',
			    html:'End date'
			},{
                            xtype: 'datefield',
                            value: this.dateRange[1],
			    format: 'd/m/Y',
			    width: 100,
                            listeners: {
		                "valid": function(field){
                                    this.dateRange[1] = field.getValue();
                                    if(this.dateRange[1]){
					this.dateRange[1].setHours(23,59,59,99);
                                    }
		                },
				scope: this
	                    }
			},{
                            text: 'Reload',
                            icon: 'images/arrow_refresh.png',
                            listeners: {
		                "click": this.chartReload,
				scope: this
	                    }
			}]
		    },{
			id: this.realtimeModeId,
			xtype:'buttongroup',
			title: 'Real-time',
			items: [{
                            xtype: 'label',
			    html:'Freq. (sec)'
			},{
			    xtype: 'numberfield',
			    value: this.frequency,
			    maxLength: 5,
			    width: 60,
			    autoCreate: {tag: 'input', type: 'text', size: '7', autocomplete:'off', maxlength: '5'},
                            listeners: {
		                "valid": function(field){
                                    this.frequency = field.getValue();
		                },
				scope: this
	                    }
			},{
                            xtype: 'label',
			    html:'Interval (sec)'
			},{
			    xtype: 'numberfield',
			    value: this.interval,
			    maxLength: 5,
			    width: 60,
			    autoCreate: {tag: 'input', type: 'text', size: '7', autocomplete:'off', maxlength: '5'},
                            listeners: {
		                "valid": function(field){
                                    this.interval = field.getValue();
		                },
				scope: this
	                    }
			}]
		    },{
			xtype:'buttongroup',
			title: 'Download',
			defaults: {
			    scale: 'medium'
			},
			items: [{
                            text: 'Download',
			    // style: {padding: '15px'},
                            // icon: 'images/arrow_refresh.png',
                            listeners: {
		                "click": this.download,
				scope: this
	                    }
			}]
		    }],
                    tbaraaa:[
			'-',' ','-',' ','-',,'-']
		},
                {
                    xtype: 'grid',
		    id: this.offeringsGridId,
		    title: 'Offerings',
                    region: 'center',
            	    //bodyStyle: {"padding": "1px"},
                    //split: true,
                    store: this.offeringsStore,
                    colModel: new Ext.grid.ColumnModel({
                        defaults: {
                            width: 150,
                            sortable: true
                        },
                        columns: [
                            //{id: 'type', header: 'Type', dataIndex: 'type'},
			    {header: 'Observed property', dataIndex: 'observedPropertyLabel'},
                            {header: 'Start', dataIndex: 'startPeriod'},
                            {header: 'End', dataIndex: 'endPeriod'}//,
                            //{header: 'Time', dataIndex: 'time'},
                            //{header: 'Last Value', dataIndex: 'lastvalue'}
                        ]
                    }),
                    sm: new Ext.grid.RowSelectionModel({
                        singleSelect:false,
                        listeners: {
                            'rowselect': this.onSelectOffering,
                            'rowdeselect': this.onDeselectOffering,
                            scope: this
                        }
                    }),
                    autoScroll: true
                }
            ],
            // items: {
            //     xtype: "container",
            //     cls: "error-details",
            //     html: html
            // },
            autoScroll: true,
            buttons: [{
                text: "OK",
                handler: function() { this.close(); },
		scope: this
            }]
        }
    }
});

Ext.namespace("gxp.plugins");

gxp.plugins.AddSOS = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = gxp_layerproperties */
    ptype: "gxp_addsos",

    /** api: config[menuText]
     *  ``String``
     *  Text for layer properties menu item (i18n).
     */
    menuText: "Add SOS",

    addText: "Add new Server",

    /** api: config[toolTip]
     *  ``String``
     *  Text for layer properties action tooltip (i18n).
     */
    toolTip: "Add SOS",

    constructor: function(config) {
        gxp.plugins.AddSOS.superclass.constructor.apply(this, arguments);
        if (!this.outputConfig) {
            this.outputConfig = {
                width: 325,
                autoHeight: true
            };
        }
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var actions = gxp.plugins.AddSOS.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            iconCls: "gxp-icon-addsos",
            disabled: false,
            tooltip: this.toolTip,
            handler: function() {
                this.removeOutput();
                this.addOutput();
            },
            scope: this
        }]);
        return actions;
    },
    addOutput: function(config) {
        config = config || {};
        //TODO create generic gxp_layerpanel
        var xtype = "gxp_sossourcedialog";
        var output = gxp.plugins.AddSOS.superclass.addOutput.call(this, Ext.apply({
	    title: this.addText,
            xtype: "gxp_sossourcedialog",
            target: this.target,
            listeners: {
                'addfoi':function (config) {
                    var sourceConfig = {"config":{
                        "ptype": 'gxp_sossource',
                        "listeners": {
                            'beforeload': function(){
                                this.loadingMask = new Ext.LoadMask(Ext.getBody());
                                this.loadingMask.show();
                            },
                            'loaded': function(config){
                                this.target.mapPanel.layers.add([config.record]);
                                this.sosDialog.hide();
                                this.loadingMask.hide();
                            },
                            'failure': function(){
                                this.loadingMask.hide();
                            },
                            'scope': this
                        }
                    }};
                    if (config.url) {
                        sourceConfig.config["url"] = config.url;
                    }
                    var source = this.target.addLayerSource(sourceConfig);
                    config.source = source.id;
                    source.createLayerRecord(config);
                },
                scope: this
	    }
	}, config));
        output.on({
            added: function(cmp) {
                if (!this.outputTarget) {
                    cmp.on("afterrender", function() {
                        cmp.ownerCt.ownerCt.center();
                    }, this, {single: true});
                }
            },
            scope: this
        });
	this.sosDialog = output;
        return output;
    }

});

Ext.preg(gxp.plugins.AddSOS.prototype.ptype, gxp.plugins.AddSOS);

/**
 * Copyright (c) 2008-2011 The Open Planning Project
 *
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/SOSSource.js
 * @requires widgets/PointSymbolizer.js
 */

/** api: (define)
 *  module = gxp
 *  class = SOSSourceDialog
 *  base_link = `Ext.Container <http://extjs.com/deploy/dev/docs/?class=Ext.Container>`_
 */

Ext.namespace("gxp");

/** api: constructor
 *  .. class:: SOSSourceDialog(config)
 *
 *      A  dialog for creating a SOS FOI layer
 */
gxp.SOSSourceDialog = Ext.extend(Ext.Container, {
    /** api: config[SOSTypeText] ``String`` i18n */
    sosTypeText: "Source",
    /** api: config[addSOSText] ``String`` i18n */
    addLocalSOSText: "Local OSK SOS",
    /** api: config[addSOSText] ``String`` i18n */
    addSOSText: "Remote SOS",
    /** api: config[addFeedText] ``String`` i18n */
    addFOISText: "Add to Map",
    /** api: config[doneText] ``String`` i18n */
    doneText: "Done",
    /** api: config[emptyText] ``String`` i18n */
    emptyText: "Select a SOS source...",

    /**
     * api: config[width]
     * ``Number`` width of dialog
     */
    width: 300,

    /**
     * api: config[autoHeight]
     * ``Boolean`` default is true
     */
    autoHeight: true,

    /**
     * api: config[closeAction]
     * ``String`` default is destroy
     */
    closeAction: 'destroy',

    /** private: method[initComponent]
     */
    initComponent: function() {

        this.addEvents("addfoi");

        if (!this.sosServices) {
            this.sosServices  = [
		[this.addLocalSOSText, '/observations/sos/kvp'],
		['SOS ISMAR', 'http://david.ve.ismar.cnr.it/52nSOSv3_WAR/sos?'],
		['SOS LTER', 'http://sp7.irea.cnr.it/tomcat/SOS32/sos'],
		['SOS ISE', 'http://sos.ise.cnr.it/sos?'],
		['SOS ISE BIO', 'http://sos.ise.cnr.it/biology/sos?'],
		['SOS ISE CHEM', 'http://sos.ise.cnr.it/chemistry/sos?'],
                [this.addSOSText, '']
            ];
        }

        var sosStore = new Ext.data.ArrayStore({
            fields: ['name', 'url'],
            data : this.sosServices
        });

        var sourceTypeSelect = new Ext.form.ComboBox({
            store: sosStore,
            fieldLabel: this.sosTypeText,
            displayField:'name',
            valueField:'url',
            typeAhead: true,
            width: 180,
            mode: 'local',
            triggerAction: 'all',
            emptyText: this.emptyText,
            selectOnFocus:true,
            listeners: {
                "select": function(choice) {
                    if (choice.value == '') {
                        urlTextField.show();
                        // symbolizerField.show();
			symbolizerField.hide();
                    } else {
                        urlTextField.hide();
                        urlTextField.setValue(choice.value)
                        symbolizerField.hide();
                    }
                    submitButton.setDisabled(choice.value == null);
                },
                scope: this
            }
        });

        var urlTextField = new Ext.form.TextField({
            fieldLabel: "URL",
            allowBlank: false,
            hidden: true,
            width: 180,
            msgTarget: "right",
            validator: this.urlValidator.createDelegate(this)
        });


        var symbolizerField = new gxp.PointSymbolizer({
            bodyStyle: {padding: "10px"},
            width: 280,
            border: false,
            hidden: true,
            labelWidth: 70,
            defaults: {
                labelWidth: 70
            },
            symbolizer: {pointGraphics: "circle", pointRadius: "5"}
        });


        symbolizerField.find("name", "rotation")[0].hidden = true;

        if (this.symbolType === "Point" && this.pointGraphics) {
            cfg.pointGraphics = this.pointGraphics;
        }

        var submitButton =  new Ext.Button({
            text: this.addFOISText,
            iconCls: "gxp-icon-addsos",
            disabled: true,
            handler: function() {
                var config = {};

                config.url = urlTextField.getValue();
                var symbolizer = symbolizerField.symbolizer;
                config.defaultStyle = {};
                config.selectStyle = {};
                Ext.apply(config.defaultStyle, symbolizer);
                Ext.apply(config.selectStyle, symbolizer);
                Ext.apply(config.selectStyle, {
                    fillColor: "Yellow",
                    pointRadius: parseInt(symbolizer["pointRadius"]) + 2
                });

                this.fireEvent("addfoi", config);

            },
            scope: this
        });


        var bbarItems = [
            "->",
            submitButton,
            new Ext.Button({
                text: this.doneText,
                handler: function() {
                    this.hide();
                },
                scope: this
            })
        ];

        this.panel = new Ext.Panel({
            bbar: bbarItems,
            autoScroll: true,
            items: [
                sourceTypeSelect,
                urlTextField,
                symbolizerField
            ],
            layout: "form",
            border: false,
            labelWidth: 100,
            bodyStyle: "padding: 5px",
            autoWidth: true,
            autoHeight: true
        });

        this.items = this.panel;

        gxp.FeedSourceDialog.superclass.initComponent.call(this);

    },



    /** private: property[urlRegExp]
     *  `RegExp`
     *
     *  We want to allow protocol or scheme relative URL
     *  (e.g. //example.com/).  We also want to allow username and
     *  password in the URL (e.g. http://user:pass@example.com/).
     *  We also want to support virtual host names without a top
     *  level domain (e.g. http://localhost:9080/).  It also makes sense
     *  to limit scheme to http and https.
     *  The Ext "url" vtype does not support any of this.
     *  This doesn't have to be completely strict.  It is meant to help
     *  the user avoid typos.
     */
    urlRegExp: /^(http(s)?:)?\/\/([\w%]+:[\w%]+@)?([^@\/:]+)(:\d+)?\//i,

    /** private: method[urlValidator]
     *  :arg url: `String`
     *  :returns: `Boolean` The url looks valid.
     *
     *  This method checks to see that a user entered URL looks valid.  It also
     *  does form validation based on the `error` property set when a response
     *  is parsed.
     */
    urlValidator: function(url) {
        var valid;
        if (!this.urlRegExp.test(url)) {
            valid = this.invalidURLText;
        } else {
            valid = !this.error || this.error;
        }
        // clear previous error message
        this.error = null;
        return valid;
    }


});

/** api: xtype = gxp_feedsourcedialog */
Ext.reg('gxp_sossourcedialog', gxp.SOSSourceDialog);

Ext.namespace("gxp.plugins");

gxp.plugins.SOSSource = Ext.extend(gxp.plugins.LayerSource, {

    /** api: ptype = gxp_feedsource **/
    ptype:'gxp_sossource',

    /** api: config[url]
     * ``String`` URL  for GeoRSS feed
     **/

    /** api: config[title]
     * ``String`` Title for source
     **/
    title:'SOS Source',

    /** api: config[format]
     * ``String`` Default format of vector layer
     **/
    format:'OpenLayers.Format.XML',

    /** api: config[popupFormat]
     *  ``String``  XTemplate string for feature info popup
     */
    popupTemplate:'<a target="_blank" href="{link}">{description}</a>',


    /** api: config[fixed]
     * ``Boolean`` Use OpenLayers.Strategy.Fixed if true, BBOX if false
     **/
    fixed: true,

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord:function (config) {
        var record;
        this.fireEvent("beforeload", {'record': record});
	this.sosClient = new OpenLayers.SOSClient({map: null, url: this.url});
        this.sosClient.events.on({
            'loaded': function(){
                var layer = this.sosClient.createLayer();

                //configure the popup balloons for feed items
                this.configureInfoPopup(layer);

                // create a layer record for this layer
                var Record = GeoExt.data.LayerRecord.create([
                    //{name: "title", type: "string"},
                    {name:"name", type:"string"},
                    {name:"source", type:"string"},
                    {name:"group", type:"string"},
                    {name:"fixed", type:"boolean"},
                    {name:"selected", type:"boolean"},
                    {name:"visibility", type:"boolean"},
                    {name:"format", type:"string"},
                    {name:"defaultStyle"},
                    {name:"selectStyle"},
                    {name:"params"}
                ]);

                var formatConfig = "format" in config ? config.format : this.format;

                var data = {
                    layer:layer,
                    //title: config.name,
                    name:config.name,
                    source:config.source,
                    group:config.group,
                    fixed:("fixed" in config) ? config.fixed : false,
                    selected:("selected" in config) ? config.selected : false,
                    params:("params" in config) ? config.params : {},
                    visibility:("visibility" in config) ? config.visibility : false,
                    format: formatConfig instanceof String ? formatConfig : null,
                    defaultStyle:("defaultStyle" in config) ? config.defaultStyle : {},
                    selectStyle:("selectStyle" in config) ? config.selectStyle : {}
                };


                record = new Record(data, layer.id);
                this.fireEvent("loaded", {'record': record});
            },
            'failure': function(){
                this.fireEvent("failure");
            },
            scope: this
        });
    },


    /** api: method[getConfigForRecord]
     *  :arg record: :class:`GeoExt.data.LayerRecord`
     *  :returns: ``Object``
     *
     *  Create a config object that can be used to recreate the given record.
     */
    getConfigForRecord:function (record) {
        // get general config
        var config = gxp.plugins.SOSSource.superclass.getConfigForRecord.apply(this, arguments);
        // add config specific to this source
        return Ext.apply(config, {
            //title: record.get("name"),
            name:record.get("name"),
            group:record.get("group"),
            fixed:record.get("fixed"),
            selected:record.get("selected"),
            params:record.get("params"),
            visibility:record.getLayer().getVisibility(),
            format:record.get("format"),
            defaultStyle:record.getLayer().styleMap["styles"]["default"]["defaultStyle"],
            selectStyle:record.getLayer().styleMap["styles"]["select"]["defaultStyle"]
        });
    },

    /* api: method[getFormat]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``OpenLayers.Format``
     * Create an instance of the layer's format class and return it
     */
    getFormat:function (config) {
        // get class based on rssFormat in config
        var Class = window;
        var formatConfig = ("format" in config) ? config.format : this.format;

        if (typeof formatConfig == "string" || formatConfig instanceof String) {
            var parts = formatConfig.split(".");
            for (var i = 0, ii = parts.length; i < ii; ++i) {
                Class = Class[parts[i]];
                if (!Class) {
                    break;
                }
            }

            // TODO: consider static method on OL classes to construct instance with args
            if (Class && Class.prototype && Class.prototype.initialize) {

                // create a constructor for the given layer format
                var Constructor = function () {
                    // this only works for args that can be serialized as JSON
                    Class.prototype.initialize.apply(this);
                };
                Constructor.prototype = Class.prototype;

                // create a new layer given format
                var format = new Constructor();
                return format;
            }
        } else {
            return formatConfig;
        }
    },

    /* api: method[configureInfoPopup]
     *  :arg config:  ``Object``  The vector layer
     * Configure a popup to display information on selected feed item.
     */
    configureInfoPopup:function (layer) {
        // var tpl = new Ext.XTemplate(this.popupTemplate);
        layer.events.on({
            "featureselected": 	function (featureObject) {
                var feature = featureObject.feature;
		this.sosClient.onFeatureSelect(feature);

                // var feature = featureObject.feature;
                // var pos = feature.geometry;
                // if (this.target.selectControl) {
                //     if (this.target.selectControl.popup) {
                //         this.target.selectControl.popup.close();
                //     }
                //     this.target.selectControl.popup = new GeoExt.Popup({
                //         title:feature.attributes.title,
                //         closeAction:'destroy',
                //         location:feature,
                //         html:tpl.apply(feature.attributes)
                //     });
                //     this.target.selectControl.popup.show();
                // }
            },
            "featureunselected":function () {
                if (this.target.selectControl && this.target.selectControl.popup) {
                    this.target.selectControl.popup.close();
                }
            },
            scope:this
        });
    },

    /* api: method[getStyleMap]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``OpenLayers.StyleMap``
     * Return a style map containing default and select styles
     */
    getStyleMap:function (config) {
        return new OpenLayers.StyleMap({
            "default":new OpenLayers.Style("defaultStyle" in config ? config.defaultStyle : {graphicName:"circle", pointRadius:5, fillOpacity:0.7, fillColor:'Red'}, {title:config.name}),
            "select":new OpenLayers.Style("selectStyle" in config ? config.selectStyle : {graphicName:"circle", pointRadius:10, fillOpacity:1.0, fillColor:"Yellow"})
        });
    }

});
Ext.preg(gxp.plugins.SOSSource.prototype.ptype, gxp.plugins.SOSSource);

Ext.namespace("gxp.plugins");

gxp.plugins.SOSGetFeatureInfo =  Ext.extend(gxp.plugins.Tool,{

    /** api: ptype = gxp_getsosfeatureinfo */
    ptype: "gxp_getsosfeatureinfo",

    init: function(target) {
        gxp.plugins.SOSGetFeatureInfo.superclass.init.apply(this, arguments);

        this.target.mapPanel.layers.on({
            "add": this.addLayer,
            "remove": this.removeLayer,
            scope: this
        });

    },

    /** private: method [addLayer]
     *
     * Adds a geoRSS layer to the SelectControl
     *
     */
    addLayer: function(store, records, index){
        for (var i = 0,  ii = records.length; i < ii; ++i) {
            var record = records[i];
            var source = this.target.getSource(record);
            var layer = record.getLayer();
            if (source  instanceof gxp.plugins.SOSSource) {
                //Create a SelectFeature control & add layer to it.
                if (this.target.selectControl == null) {
                    this.target.selectControl = new OpenLayers.Control.SelectFeature(layer, {
                        clickout: true,
                        listeners: {
                            'clickoutFeature': function () {
                            }
                        },
                        scope: this
                    });

                    this.target.mapPanel.map.addControl(this.target.selectControl);

                } else {
		    // non e' sufficiente, -> rimuovo e riaggiungo il controllo
		    // riga aggiunta per rimuovere il controllo
                    this.target.mapPanel.map.removeControl(this.target.selectControl);
                    var currentLayers = this.target.selectControl.layers ? this.target.selectControl.layers :
                        (this.target.selectControl.layer ? [this.target.selectControl.layer] : []);
                    currentLayers.push(layer);
                    this.target.selectControl.setLayer(currentLayers);
		    // rifaccio il control e lo riaggiungo
                    this.target.selectControl = new OpenLayers.Control.SelectFeature(currentLayers, {
                        clickout: true,
                        listeners: {
                            'clickoutFeature': function () {
                            }
                        },
                        scope: this
                    });
		    
                    this.target.mapPanel.map.addControl(this.target.selectControl);
                }
            }
        }

        if (this.target.selectControl)
            this.target.selectControl.activate();
    },



    /** private: method[removeLayer]
     *
     * Remove a feed layer from the SelectFeatureControl (if present) when that layer is removed from the map.
     * If this is not done, the layer will remain on the map even after the record is deleted.
     *
     */
    removeLayer:  function(store, records, index){
    	if (!records.length) {
    		records = [records];
    	}
    	for (var i = 0,  ii = records.length; i < ii; ++i) {
    		var layer = records[i].getLayer();
    		var selectControl = this.target.selectControl;
    		//SelectControl might have layers array or single layer object
    		if (selectControl != null) {
    			if (selectControl.layers){
    				for (var x = 0; x < selectControl.layers.length; x++)
    				{
    					var selectLayer = selectControl.layers[x];
    					var selectLayers = selectControl.layers;
    					if (selectLayer.id === layer.id) {
    						selectLayers.splice(x,1);
    						selectControl.setLayer(selectLayers);
    					}
    				}
    			} else if (selectControl.layer != null) {
    				if (layer.id === selectControl.layer.id) {
    					selectControl.setLayer([]);
    				}
    			}
    		}
    	}
    }


});


Ext.preg(gxp.plugins.SOSGetFeatureInfo.prototype.ptype, gxp.plugins.SOSGetFeatureInfo);

GeoExt.Lang.add("it", {

    "gxp.plugins.AddSOS.prototype": {
        menuText: "Aggiungi SOS",
        addText: "Aggiungi nuovo server",
        toolTip: "Aggiungi SOS"
    },
    "gxp.SOSSourceDialog.prototype": {
        sosTypeText: "Risorsa",
        addLocalSOSText: "SOS Locale",
        addSOSText: "SOS Remoto",
        addFOISText: "Aggiungi alla mappa",
        doneText: "Fatto",
        emptyText: "Seleziona una risorsa"
    }
});

import moment from 'moment';
import countlyVue from './vue-core';

var countlyCommon = {
    BROWSER_LANG_SHORT: 'en',
    BROWSER_LANG: 'en'
};

/**
* Format date based on some locale settings
* @memberof countlyCommon
* @param {moment} date - moment js object
* @param {string} format - format string to use
* @returns {string} date in formatted string
* @example
* //outputs Jan 20
* countlyCommon.formatDate(moment(), "MMM D");
*/
countlyCommon.formatDate = function(date, format) {
    format = countlyCommon.getDateFormat(format);
    return date.format(format);
};

countlyCommon.getDateFormat = function(format) {
    if (countlyCommon.BROWSER_LANG_SHORT.toLowerCase() === "ko") {
        format = format.replace("MMM D", "MMM D[일]").replace("D MMM", "MMM D[일]");
    }
    else if (countlyCommon.BROWSER_LANG_SHORT.toLowerCase() === "ja") {
        format = format
            .replace("D MMM YYYY", "YYYY年 MMM D")
            .replace("MMM D, YYYY", "YYYY年 MMM D")
            .replace("D MMM, YYYY", "YYYY年 MMM D")
            .replace("MMM YYYY", "YYYY年 MMM")
            .replace("MMM D", "MMM D[日]")
            .replace("D MMM", "MMM D[日]");
    }
    else if (countlyCommon.BROWSER_LANG_SHORT.toLowerCase() === "zh") {
        format = format.replace("MMMM", "M").replace("MMM", "M").replace("MM", "M").replace("DD", "D").replace("D M, YYYY", "YYYY M D").replace("D M", "M D").replace("D", "D[日]").replace("M", "M[月]").replace("YYYY", "YYYY[年]");
    }
    return format;
};

/**
* Converts cohort time period to string.
* @param {Object} obj Inferred time object. Must contain "value", "type" and optionally "level".
* @returns {Object} String fields
*/
countlyCommon.getTimePeriodDescriptions = function(obj) {
    if (obj.type === "all-time") {
        return { name: countlyVue.i18n('common.all-time'), valueAsString: "0days" };
    }
    if (obj.type === "last-n") {
        var level = obj.level || "days";
        return {
            name: countlyVue.i18n('common.in-last-' + level + (obj.value > 1 ? '-plural' : ''), obj.value),
            valueAsString: obj.value + level
        };
    }
    if (obj.type === "hour") {
        return {
            name: countlyVue.i18n("common.today"),
            valueAsString: "hour"
        };
    }
    if (obj.type === "yesterday") {
        return {
            name: countlyVue.i18n("common.yesterday"),
            valueAsString: "yesterday"
        };
    }
    if (obj.type === "day") {
        return {
            name: moment().format("MMMM, YYYY"),
            valueAsString: "day"
        };
    }
    if (obj.type === "month") {
        return {
            name: moment().year(),
            valueAsString: "month"
        };
    }

    var valueAsString = JSON.stringify(obj.value);
    var name = valueAsString;
    var formatDate = function(point, isShort) {
        var format = "MMMM DD, YYYY";
        if (isShort) {
            format = "MMM DD, YYYY";
        }

        if (point.toString().length === 10) {
            point *= 1000;
        }

        return countlyCommon.formatDate(moment(point), format);
    };
    if (Array.isArray(obj.value)) {
        name = countlyVue.i18n('common.time-period-name.range', formatDate(obj.value[0], true), formatDate(obj.value[1], true));
    }
    else {
        name = countlyVue.i18n('common.time-period-name.' + obj.type, formatDate(obj.value[obj.type]));
    }
    return {
        name: name,
        valueAsString: valueAsString
    };
};

/**
* Cohort time period is a string (may still contain an array or an object). The needed
* meta data, however, is not included within the field. This function infers the meta data
* and returns as an object. Meta data is not persisted in db, just used in the UI.
*
* Example:
*
* Input: "[1561928400,1595203200]"
*
* // Other input forms:
* // "0days" (All Time)
* // "10days", "10weeks", etc. (In the Last)
* // "[1561928400,1595203200]" (In Between)
* // "{'on':1561928400}" (On)
* // "{'since':1561928400}" (Since)
*
* Output:
* {
*     level: "days" // only effective when the type is "last-n"
*     longName: "Jul 01, 2019-Jul 20, 2020"
*     name: "Jul 01, 2019-Jul 20, 2020"
*     type: "range"
*     value: [1561928400, 1595203200]
*     valueAsString: "[1561928400,1595203200]"
* }
*
* @param {string} period Period string
* @returns {Object} An object containing meta fields
*/
countlyCommon.convertToTimePeriodObj = function(period) {
    var inferredLevel = "days",
        inferredType = null,
        inferredValue = null;

    if (typeof period === "string" && (period.indexOf("{") > -1 || period.indexOf("[") > -1)) {
        period = JSON.parse(period);
    }

    if (!period && period === 0) {
        inferredType = "all-time";
        inferredValue = 0;
    }
    else if (Array.isArray(period)) {
        inferredType = "range";
    }
    else if (period === "hour") {
        inferredType = "hour";
        inferredValue = "hour";
    }
    else if (period === "yesterday") {
        inferredType = "yesterday";
        inferredValue = "yesterday";
    }
    else if (period === "day") {
        inferredType = "day";
        inferredValue = "day";
    }
    else if (period === "month") {
        inferredType = "month";
        inferredValue = "month";
    }
    else if (typeof period === "object") {
        if (Object.prototype.hasOwnProperty.call(period, "since")) {
            inferredType = "since";
        }
        else if (Object.prototype.hasOwnProperty.call(period, "on")) {
            inferredType = "on";
        }
    }
    else if (period.endsWith("days")) {
        inferredLevel = "days";
        inferredType = "last-n";
    }
    else if (period.endsWith("weeks")) {
        inferredLevel = "weeks";
        inferredType = "last-n";
    }
    else if (period.endsWith("months")) {
        inferredLevel = "months";
        inferredType = "last-n";
    }
    else {
        inferredType = "all-time";
        inferredValue = 0;
    }

    if (inferredValue !== 0 && inferredType === "last-n") {
        inferredValue = parseInt((period.replace(inferredLevel, '')));
    }
    else if (inferredValue !== 0) {
        var stringified = JSON.stringify(period);
        inferredValue = JSON.parse(stringified);
    }

    var obj = {
        value: inferredValue,
        type: inferredType,
        level: inferredLevel
    };

    var descriptions = countlyCommon.getTimePeriodDescriptions(obj);

    obj.valueAsString = descriptions.valueAsString;
    obj.name = obj.longName = descriptions.name;

    return obj;
};



/**
* Correct timezone offset on the timestamp for current browser's timezone
* @memberof countlyCommon
* @param {number} inTS - second or milisecond timestamp
* @returns {number} corrected timestamp applying user's timezone offset
*/
countlyCommon.getOffsetCorrectionForTimestamp = function(inTS) {
    var intLength = Math.round(inTS).toString().length,
        timeZoneOffset = new Date((intLength === 13) ? inTS : inTS * 1000).getTimezoneOffset(),
        tzAdjustment = 0;

    if (timeZoneOffset !== 0) {
        if (intLength === 13) {
            tzAdjustment = timeZoneOffset * 60000;
        }
        else if (intLength === 10) {
            tzAdjustment = timeZoneOffset * 60;
        }
    }

    return tzAdjustment;
};

/**
* Formats the number by separating each 3 digits with
* @memberof countlyCommon
* @param {number} x - number to format
* @returns {string} formatted number
* @example
* //outputs 1,234,567
* countlyCommon.formatNumber(1234567);
*/
countlyCommon.formatNumber = function(x) {
    x = parseFloat(parseFloat(x).toFixed(2));
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

countlyCommon.formatTimeAgoText = function(x) {
    return x;
}
countlyCommon.formatTimeAgo = function(x) {
    return x;
}
countlyCommon.formatNumber = function(x) {
    return x;
}
countlyCommon.formatNumberSafe = function(x) {
    return x;
}
countlyCommon.getShortNumber = function(x) {
    return x;
}

export default countlyCommon;
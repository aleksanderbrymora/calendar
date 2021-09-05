var React = require('react');
var ReactDOM = require('react-dom');
var overlays = require('@react-aria/overlays');
var tw = require('twin.macro');
var button = require('@react-aria/button');
var focus = require('@react-aria/focus');
var overlays$1 = require('@react-stately/overlays');
var interactions = require('@react-aria/interactions');
var mobxReactLite = require('mobx-react-lite');
var dateFns = require('date-fns');
var isSameDay = require('date-fns/isSameDay');
var mobxStateTree = require('mobx-state-tree');
var pluralize = require('pluralize');
var addDays = require('date-fns/addDays');
var isSameMonth = require('date-fns/isSameMonth');
var nanoid = require('nanoid');
var useImmer = require('use-immer');
var styledComponents = require('styled-components');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);
var tw__default = /*#__PURE__*/_interopDefaultLegacy(tw);
var isSameDay__default = /*#__PURE__*/_interopDefaultLegacy(isSameDay);
var pluralize__default = /*#__PURE__*/_interopDefaultLegacy(pluralize);
var addDays__default = /*#__PURE__*/_interopDefaultLegacy(addDays);
var isSameMonth__default = /*#__PURE__*/_interopDefaultLegacy(isSameMonth);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
}

var SelectState;
(function (SelectState) {
    SelectState[SelectState["startNotSelected"] = 0] = "startNotSelected";
    SelectState[SelectState["startSelected"] = 1] = "startSelected";
    SelectState[SelectState["endSelected"] = 2] = "endSelected";
})(SelectState || (SelectState = {}));
var Status = /** @class */ (function () {
    function Status(
    /** A boolean specifying if the date is available and if the reason should be read */
    isAvailableToSelect, 
    /** Used mainly for styling - tells what kind of day to display and can user select it */
    variant, 
    /** A reason for the unavailability displayed to the user */
    reason) {
        this.isAvailableToSelect = isAvailableToSelect;
        this.variant = variant;
        this.reason = reason;
    }
    return Status;
}());
var StatusVariant;
(function (StatusVariant) {
    StatusVariant[StatusVariant["unavailable"] = 0] = "unavailable";
    StatusVariant[StatusVariant["checkoutOnly"] = 1] = "checkoutOnly";
    StatusVariant[StatusVariant["nMinNights"] = 2] = "nMinNights";
    StatusVariant[StatusVariant["available"] = 3] = "available";
    StatusVariant[StatusVariant["selectedAsStart"] = 4] = "selectedAsStart";
    StatusVariant[StatusVariant["selectedAsEnd"] = 5] = "selectedAsEnd";
    StatusVariant[StatusVariant["selectedBetween"] = 6] = "selectedBetween";
})(StatusVariant || (StatusVariant = {}));

var unavailable = tw__default['default'](templateObject_1$5 || (templateObject_1$5 = __makeTemplateObject(["cursor-default text-gray-400 line-through"], ["cursor-default text-gray-400 line-through"])));
var checkoutOnly = tw__default['default'](templateObject_2$5 || (templateObject_2$5 = __makeTemplateObject(["text-gray-600 cursor-default"], ["text-gray-600 cursor-default"])));
var nMinNights = tw__default['default'](templateObject_3$2 || (templateObject_3$2 = __makeTemplateObject(["text-gray-600 cursor-default"], ["text-gray-600 cursor-default"])));
var available = tw__default['default'](templateObject_4$1 || (templateObject_4$1 = __makeTemplateObject(["cursor-pointer hover:(border-2 rounded-full border-gray-800 )"], ["cursor-pointer hover:(border-2 rounded-full border-gray-800 )"])));
var start = tw__default['default'](templateObject_5$1 || (templateObject_5$1 = __makeTemplateObject(["rounded-l-full bg-gray-800 text-gray-50"], ["rounded-l-full bg-gray-800 text-gray-50"])));
var end = tw__default['default'](templateObject_6$1 || (templateObject_6$1 = __makeTemplateObject(["rounded-r-full bg-gray-800 text-gray-50"], ["rounded-r-full bg-gray-800 text-gray-50"])));
var selected = tw__default['default'](templateObject_7 || (templateObject_7 = __makeTemplateObject(["bg-gray-800 text-gray-50"], ["bg-gray-800 text-gray-50"])));
var getStyle = function (statusVariant) {
    var _a;
    var styles = (_a = {},
        _a[StatusVariant.unavailable] = unavailable,
        _a[StatusVariant.checkoutOnly] = checkoutOnly,
        _a[StatusVariant.nMinNights] = nMinNights,
        _a[StatusVariant.available] = available,
        _a[StatusVariant.selectedAsStart] = start,
        _a[StatusVariant.selectedAsEnd] = end,
        _a[StatusVariant.selectedBetween] = selected,
        _a);
    return styles[statusVariant];
};
var templateObject_1$5, templateObject_2$5, templateObject_3$2, templateObject_4$1, templateObject_5$1, templateObject_6$1, templateObject_7;

/* todo list
 * Make another state for deciding type of day for when min-stay is 1 night only
 */
// ---- Day -------------------------------------------------
var Day$1 = mobxStateTree.types
    .model({
    id: mobxStateTree.types.optional(mobxStateTree.types.identifier, nanoid.nanoid),
    date: mobxStateTree.types.Date,
    reserved: mobxStateTree.types.optional(mobxStateTree.types.boolean, false),
})
    /** DEV-only Actions */
    .actions(function (self) { return ({
    changeReserved: function (to) {
        self.reserved = to;
    },
}); })
    .actions(function (self) { return ({
    select: function () {
        var select = mobxStateTree.getParent(self, 3).select;
        select(self.id);
    },
}); })
    .views(function (self) { return ({
    /** Used to display a number on a month view */
    get dayOfMonth() {
        return self.date.getDate();
    },
    /** Tells if the date is before today, used for styling */
    get isBeforeToday() {
        return dateFns.isBefore(self.date, new Date());
    },
    get isDayAfterReserved() {
        var reservedDates = mobxStateTree.getParent(self, 3).reservedDates;
        var dayAfter = addDays__default['default'](self.date, 1);
        return !!reservedDates.find(function (d) { return isSameDay__default['default'](dayAfter, d); });
    },
    /**
     * Used to disable selection of a date that would not meet a min stay requirement
     * only used for determining days when selecting start as the latest possible start before reserved day
     */
    get belowMinStayRequirementStartSelection() {
        var _a = mobxStateTree.getParent(self, 3), minStay = _a.minStay, reservedDates = _a.reservedDates;
        var _loop_1 = function (i) {
            var testDay = addDays__default['default'](self.date, i);
            var isReserved = reservedDates.find(function (d) { return isSameDay__default['default'](d, testDay); });
            if (isReserved !== undefined)
                return { value: true };
        };
        for (var i = 0; i <= minStay; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return false;
    },
    /**
     * Used to disable selection of a date that would not meet a min stay requirement
     * only used for determining days when selecting end as the late possible start before meeting a min stay requirement
     */
    get belowMinStayRequirementEndSelection() {
        var _a = mobxStateTree.getParent(self, 3), minStay = _a.minStay, startDate = _a.startDate;
        if (!startDate)
            return false;
        var difference = dateFns.differenceInDays(self.date, startDate);
        return difference < minStay;
    },
    get isBeforeStart() {
        var startDate = mobxStateTree.getParent(self, 3).startDate;
        if (!startDate)
            return false;
        return dateFns.isBefore(self.date, startDate);
    },
    get isStart() {
        var startDate = mobxStateTree.getParent(self, 3).startDate;
        if (!startDate)
            return false;
        return isSameDay__default['default'](startDate, self.date);
    },
    get isEnd() {
        var endDate = mobxStateTree.getParent(self, 3).endDate;
        if (!endDate)
            return false;
        return isSameDay__default['default'](endDate, self.date);
    },
    get isBetweenStartAndEnd() {
        var _a = mobxStateTree.getParent(self, 3), startDate = _a.startDate, endDate = _a.endDate;
        if (!startDate || !endDate)
            return false;
        return dateFns.isBefore(self.date, endDate) && dateFns.isAfter(self.date, startDate);
    },
    get isFreeBetweenStartAndDate() {
        var _a = mobxStateTree.getParent(self, 3), isRangeFree = _a.isRangeFree, startDate = _a.startDate;
        if (!startDate)
            return false;
        return !isRangeFree(startDate, self.date);
    },
    get belongsToDisplayedMonth() {
        var side = mobxStateTree.getParent(self, 2).side;
        var offset = mobxStateTree.getParent(self, 3).offset;
        return isSameMonth__default['default'](self.date, dateFns.addMonths(new Date(), offset + (side === 'left' ? 0 : 1)));
    },
    get testId() {
        var formattedDate = dateFns.format(self.date, 'd/L/y');
        return "calendar-day-" + formattedDate;
    },
}); })
    .views(function (self) { return ({
    get startNotSelectedStatus() {
        // Reserved day
        if (self.reserved)
            return new Status(false, StatusVariant.unavailable);
        // Before today
        if (self.isBeforeToday)
            return new Status(false, StatusVariant.unavailable);
        // Is it day before a reserved day
        if (self.isDayAfterReserved)
            return new Status(false, StatusVariant.checkoutOnly, 'Checkout Only');
        // Does it meet minStay requirement
        if (self.belowMinStayRequirementStartSelection) {
            var minStay = mobxStateTree.getParent(self, 3).minStay;
            return new Status(false, StatusVariant.nMinNights, minStay + "-night minimum");
        }
        // Available if all else failed
        return new Status(true, StatusVariant.available);
    },
    get startSelectedStatus() {
        // Reserved day
        if (self.reserved)
            return new Status(false, StatusVariant.unavailable);
        // Is before selected start date
        if (self.isBeforeStart)
            return new Status(false, StatusVariant.unavailable);
        // Is it same as selected start
        if (self.isStart)
            return new Status(true, StatusVariant.selectedAsStart);
        // Is it after next reserved date
        if (self.isFreeBetweenStartAndDate)
            return new Status(false, StatusVariant.unavailable);
        // Does it meet minStay requirement
        if (self.belowMinStayRequirementEndSelection) {
            var minStay = mobxStateTree.getParent(self, 3).minStay;
            return new Status(false, StatusVariant.nMinNights, minStay + "-night minimum");
        }
        // if all above fails then its available
        return new Status(true, StatusVariant.available);
    },
    get endSelectedStatus() {
        // Reserved day
        if (self.reserved)
            return new Status(false, StatusVariant.unavailable);
        // Before today
        if (self.isBeforeToday)
            return new Status(false, StatusVariant.unavailable);
        // Is it same as selected start
        if (self.isStart)
            return new Status(true, StatusVariant.selectedAsStart, 'Check-in day');
        // Is it same as selected end
        if (self.isEnd)
            return new Status(true, StatusVariant.selectedAsEnd, 'Check-out day');
        // Is it between start and end
        if (self.isBetweenStartAndEnd)
            return new Status(true, StatusVariant.selectedBetween);
        // is it a day before a reserved day
        if (self.isDayAfterReserved)
            return new Status(false, StatusVariant.checkoutOnly, 'Checkout Only');
        // Does it meet minStay requirement
        if (self.belowMinStayRequirementStartSelection) {
            var minStay = mobxStateTree.getParent(self, 3).minStay;
            return new Status(false, StatusVariant.nMinNights, minStay + "-night minimum");
        }
        return new Status(true, StatusVariant.available);
    },
}); })
    .views(function (self) { return ({
    get status() {
        var selectState = mobxStateTree.getParent(self, 3).selectState;
        switch (selectState) {
            case SelectState.startNotSelected:
                return self.startNotSelectedStatus;
            case SelectState.startSelected:
                return self.startSelectedStatus;
            case SelectState.endSelected:
                return self.endSelectedStatus;
            default:
                return self.startNotSelectedStatus;
        }
    },
}); })
    .views(function (self) { return ({
    get style() {
        return getStyle(self.status.variant);
    },
    /** Used for aria-label when displaying a day */
    get label() {
        // Selected start date. Tuesday, December 7, 2021
        var formattedDate = dateFns.format(self.date, 'EEEE, LLLL d, y');
        var _a = mobxStateTree.getParent(self, 3), minStay = _a.minStay, selectState = _a.selectState;
        switch (self.status.variant) {
            case StatusVariant.selectedAsStart:
                return "Selected for check-in. " + formattedDate;
            case StatusVariant.selectedAsEnd:
                return "Selected for check-out. " + formattedDate;
            case StatusVariant.available:
                switch (selectState) {
                    case SelectState.startNotSelected:
                        return "Choose " + formattedDate + " as your check-in date. It's available, and has " + minStay + " night minimum stay requirement";
                    case SelectState.startSelected:
                        return "Choose " + formattedDate + " as your check-out date. It's available";
                    case SelectState.endSelected:
                        return "Choose " + formattedDate + " as your check-in date. It's available, and has " + minStay + " night minimum stay requirement";
                    default:
                        return 'Something went really wrong';
                }
            case StatusVariant.checkoutOnly:
                return formattedDate + " is only available for check out.";
            // Friday, October 15, 2021 is available, but has no eligible check out date, due to the 2 night stay requirement.
            case StatusVariant.nMinNights:
                return formattedDate + " is available, but has no eligible check out date, due to the " + minStay + " night stay requirement.";
            case StatusVariant.selectedBetween:
                return "Choose " + formattedDate + " as your check-in date. It's available, and has " + minStay + " night minimum stay requirement";
            case StatusVariant.unavailable:
                return "Not available " + formattedDate;
            default:
                return "Something went really wrong...";
        }
    },
}); });

// ---- Month -----------------------------------------------
var Month$1 = mobxStateTree.types
    .model({
    days: mobxStateTree.types.array(Day$1),
    side: mobxStateTree.types.enumeration(['left', 'right']),
})
    .views(function (self) { return ({
    get name() {
        var offset = mobxStateTree.getParent(self).offset;
        return dateFns.format(dateFns.addMonths(new Date(), (self.side === 'left' ? 0 : 1) + offset), 'MMMM Y');
    },
}); })
    .actions(function (self) { return ({
    /** Goes through each day in this month and destroys it so it will be replaced with new days */
    wipeDays: function () {
        self.days.forEach(function (d) { return mobxStateTree.destroy(d); });
    },
}); })
    .actions(function (self) { return ({
    /**
     * Wipes all days previously in the month and recreates them for a given month
     * it also checks the `reservedDays` in its parent - Calendar - and marks each day in there as reserved
     * @param {Date} date a day in month that this entity represents
     * @example if current date is 29.8.2021 then this will create an 8th month - August
     */
    createDays: function (date) {
        self.wipeDays();
        var reservedDates = mobxStateTree.getParent(self).reservedDates;
        var start = dateFns.startOfMonth(date);
        var end = dateFns.endOfMonth(date);
        var startWeekIndex = (dateFns.getDay(start) + 6) % 7;
        var endWeekIndex = (dateFns.getDay(end) + 6) % 7;
        var allDaysToDisplay = [];
        // days in the first week outside of the selected month
        for (var i = 0; i < startWeekIndex; i++) {
            var d = dateFns.subDays(start, startWeekIndex - i);
            allDaysToDisplay.push(d);
        }
        // normal days inside the month
        for (var i = start.getDate(); i <= end.getDate(); i++) {
            allDaysToDisplay.push(new Date(start.getFullYear(), start.getMonth(), i));
        }
        // days after the end of the selected month
        for (var i = 1; i < 7 - endWeekIndex; i++) {
            allDaysToDisplay.push(new Date(end.getFullYear(), end.getMonth(), end.getDate() + i));
        }
        allDaysToDisplay.forEach(function (d) {
            var isReserved = reservedDates.find(function (potentialDate) { return isSameDay__default['default'](d, potentialDate); });
            self.days.push(Day$1.create({
                date: d,
                reserved: !!isReserved,
            }));
        });
    },
}); });

// ---- Calendar ---------------------------------------------
var Calendar$1 = mobxStateTree.types
    .model({
    /**  */
    reservedDates: mobxStateTree.types.array(mobxStateTree.types.Date),
    /**
     * How many months from current day should be display
     * positive numbers will move right month to be left
     * and right to be regenerated for the next month
     * All goes the other way when offset is negative
     */
    offset: mobxStateTree.types.optional(mobxStateTree.types.integer, 0),
    /** A month data for the left month in the calendar */
    left: Month$1,
    /** A month data for the right month in the calendar */
    right: Month$1,
    /** What's the minimum time customer can make a reservation for */
    minStay: mobxStateTree.types.optional(mobxStateTree.types.integer, 0),
    /** Start of the date selection */
    startDate: mobxStateTree.types.maybeNull(mobxStateTree.types.Date),
    /** End of the date selection */
    endDate: mobxStateTree.types.maybeNull(mobxStateTree.types.Date),
})
    .actions(function (self) { return ({
    createMonths: function () {
        self.left.wipeDays();
        self.right.wipeDays();
        self.left = Month$1.create({ side: 'left' });
        self.right = Month$1.create({ side: 'right' });
        self.left.createDays(dateFns.addMonths(new Date(), self.offset));
        self.right.createDays(dateFns.addMonths(new Date(), self.offset + 1));
    },
}); })
    .actions(function (self) { return ({
    /** Shifts everything back to initial state */
    reset: function () {
        self.startDate = null;
        self.endDate = null;
        self.createMonths();
    },
    /**
     * Moves to the next month
     * its reusing previously done work by shifting months
     * could also just call createMonths and regenerate days for both
     */
    nextMonth: function () {
        self.offset++;
        self.createMonths();
    },
    previousMonth: function () {
        self.offset--;
        self.createMonths();
    },
    isRangeFree: function (start, end) {
        var _a;
        var monthsCombined = __spreadArray(__spreadArray([], self.left.days), self.right.days);
        var startIndex = monthsCombined.findIndex(function (d) {
            return isSameDay__default['default'](d.date, start);
        });
        var endIndex = monthsCombined.findIndex(function (d) { return isSameDay__default['default'](d.date, end); });
        for (var i = startIndex; i < endIndex; i++) {
            if ((_a = monthsCombined[i]) === null || _a === void 0 ? void 0 : _a.reserved)
                return false;
        }
        return true;
    },
    clearEnd: function () {
        self.endDate = null;
    },
    /** DEV-ONLY */
    addReservedDates: function (dates) {
        dates.forEach(function (d) { return self.reservedDates.push(d); });
    },
}); })
    .views(function (self) { return ({
    /** Used for disabling an arrow to make reservations before today */
    get isPreviousMonthAvailable() {
        // todo check if this is correct
        return dateFns.isBefore(dateFns.addMonths(new Date(), self.offset - 1), new Date());
    },
    get selectState() {
        if (self.startDate === null)
            return SelectState.startNotSelected;
        else if (self.startDate !== null && self.endDate === null)
            return SelectState.startSelected;
        else
            return SelectState.endSelected;
    },
    get amountOfNights() {
        if (self.startDate && self.endDate) {
            return dateFns.differenceInDays(self.endDate, self.startDate);
        }
        return 0;
    },
}); })
    .views(function (self) { return ({
    get infoText() {
        switch (self.selectState) {
            case SelectState.startNotSelected:
                return 'Select travel dates to see pricing';
            case SelectState.startSelected:
                // prettier-ignore
                return "Minimum stay: " + self.minStay + " " + pluralize__default['default']('day', self.minStay);
            case SelectState.endSelected:
                var formatDate = function (d) { return dateFns.format(d, 'MMM d, y'); };
                // prettier-ignore
                return formatDate(self.startDate) + " - " + formatDate(self.endDate);
            default:
                return 'Something went really wrong...';
        }
    },
}); })
    .actions(function (self) { return ({
    select: function (dayId) {
        var monthsCombined = __spreadArray(__spreadArray([], self.left.days), self.right.days);
        var day = monthsCombined.find(function (d) { return d.id === dayId; });
        switch (self.selectState) {
            case SelectState.startNotSelected:
                if (day.status.isAvailableToSelect)
                    self.startDate = day.date;
                break;
            case SelectState.startSelected:
                if (isSameDay__default['default'](day.date, self.startDate)) {
                    self.startDate = null;
                }
                else if (day.status.isAvailableToSelect) {
                    self.endDate = day.date;
                }
                break;
            case SelectState.endSelected:
                if (isSameDay__default['default'](day.date, self.endDate)) {
                    self.endDate = null;
                }
                else if (day.status.isAvailableToSelect) {
                    self.endDate = null;
                    self.startDate = day.date;
                }
                break;
            default:
                console.error('something went really wrong');
        }
    },
}); })
    .actions(function (self) { return ({
    selectByDate: function (date, what) {
        var isDateAfterNow = dateFns.isAfter(date, dateFns.addMonths(new Date(), self.offset));
        var isDateInLeftMonth = function () {
            return self.left.days.find(function (d) { return isSameDay__default['default'](d.date, date); });
        };
        var isDateInRightMonth = function () {
            return self.right.days.find(function (d) { return isSameDay__default['default'](d.date, date); });
        };
        var scrollToSelectedStart = function () {
            var day = isDateInLeftMonth();
            while (!day) {
                self.offset += isDateAfterNow ? 1 : -1;
                self.createMonths();
                day = isDateInLeftMonth();
            }
            return day;
        };
        var scrollToSelectedEnd = function () {
            var day = isDateInLeftMonth();
            if (day)
                return day;
            day = isDateInRightMonth();
            while (!day) {
                self.offset += isDateAfterNow ? 1 : -1;
                self.createMonths();
                day = isDateInRightMonth();
            }
            return day;
        };
        if (what === 'start') {
            var day = scrollToSelectedStart();
            var previousSelectedStart = self.startDate;
            self.startDate = null;
            day.status.isAvailableToSelect
                ? (self.startDate = date)
                : (self.startDate = previousSelectedStart);
        }
        else {
            if (!self.startDate)
                return;
            var day = scrollToSelectedEnd();
            var previousSelectedEnd = self.endDate;
            self.endDate = null;
            day.status.isAvailableToSelect && !isSameDay__default['default'](self.startDate, day.date)
                ? (self.endDate = day.date)
                : (self.endDate = previousSelectedEnd);
        }
    },
}); });

var calendar = Calendar$1.create({
    left: Month$1.create({ side: 'left' }),
    right: Month$1.create({ side: 'right' }),
    minStay: 3,
    reservedDates: [
        dateFns.addDays(new Date(), 2),
        dateFns.addDays(new Date(), 3),
        dateFns.addDays(new Date(), 4),
        dateFns.addDays(new Date(), 5),
        dateFns.addDays(new Date(), 10),
        dateFns.addDays(new Date(), 11),
        dateFns.addDays(new Date(), 12),
        dateFns.addDays(new Date(), 13),
        dateFns.addDays(new Date(), 14),
        dateFns.addDays(new Date(), 15),
    ],
});
calendar.createMonths();
var useCalendar = function () { return calendar; };

var BottomControls = mobxReactLite.observer(function (_a) {
    var btnProps = _a.btnProps, btnRef = _a.btnRef;
    var reset = useCalendar().reset;
    var resetPressProps = interactions.usePress({ onPress: reset }).pressProps;
    return (React__default['default'].createElement("div", { tw: 'flex flex-row justify-between ' },
        React__default['default'].createElement("button", { "aria-label": 'Open keyboard shortcuts panel' }, "Kb info"),
        React__default['default'].createElement("div", { tw: 'grid grid-cols-2 gap-3' },
            React__default['default'].createElement("button", __assign({}, resetPressProps, { tw: 'underline font-semibold p-1' }), "Clear Dates"),
            React__default['default'].createElement("button", __assign({ tw: 'bg-gray-900 font-semibold rounded-md text-white py-1 px-2' }, btnProps, { ref: btnRef }), "Close"))));
});

var tooltipStyles = tw__default['default'](templateObject_1$4 || (templateObject_1$4 = __makeTemplateObject(["invisible absolute p-1 rounded border border-gray-200 bg-gray-100 shadow-lg ml-4 text-sm"], ["invisible absolute p-1 rounded border border-gray-200 bg-gray-100 shadow-lg ml-4 text-sm"])));
var Day = mobxReactLite.observer(function (_a) {
    var data = _a.data;
    var selectPressProps = interactions.usePress({
        onPress: data.select,
    }).pressProps;
    var _b = interactions.useHover({}), isHovered = _b.isHovered, hoverProps = _b.hoverProps;
    return data.belongsToDisplayedMonth ? (React__default['default'].createElement("div", null,
        React__default['default'].createElement("button", __assign({}, selectPressProps, hoverProps, { disabled: !data.status.isAvailableToSelect, "aria-disabled": !data.status.isAvailableToSelect, "aria-live": 'polite', "aria-label": data.label, tabIndex: data.status.isAvailableToSelect ? 1 : -1, "data-selected-start": data.status.variant === StatusVariant.selectedAsStart, "data-selected-end": data.status.variant === StatusVariant.selectedAsEnd, css: [
                tw__default['default'](templateObject_2$4 || (templateObject_2$4 = __makeTemplateObject(["grid content-center justify-items-center h-10 w-full font-medium ring-0 my-1"], ["grid content-center justify-items-center h-10 w-full font-medium ring-0 my-1"]))),
                tw__default['default'](templateObject_3$1 || (templateObject_3$1 = __makeTemplateObject(["focus:(border-none ring-0)"], ["focus:(border-none ring-0)"]))),
                tw__default['default'](templateObject_4 || (templateObject_4 = __makeTemplateObject(["active:ring-0"], ["active:ring-0"]))),
                data.style,
            ], "data-cy": data.testId }), data.dayOfMonth),
        data.status.reason && (React__default['default'].createElement("small", { css: [tooltipStyles, isHovered ? tw__default['default'](templateObject_5 || (templateObject_5 = __makeTemplateObject(["visible"], ["visible"]))) : tw__default['default'](templateObject_6 || (templateObject_6 = __makeTemplateObject(["invisible"], ["invisible"])))] }, data.status.reason)))) : (React__default['default'].createElement("div", { tabIndex: -1 }));
});
var templateObject_1$4, templateObject_2$4, templateObject_3$1, templateObject_4, templateObject_5, templateObject_6;

var MonthsView = mobxReactLite.observer(function () {
    var _a = useCalendar(), left = _a.left, right = _a.right;
    return (React__default['default'].createElement("div", { tw: 'grid grid-cols-2 gap-8' },
        React__default['default'].createElement(Month, { month: left }),
        React__default['default'].createElement(Month, { month: right })));
});
var gridStyles = tw__default['default'](templateObject_1$3 || (templateObject_1$3 = __makeTemplateObject(["grid grid-cols-7"], ["grid grid-cols-7"])));
var Month = mobxReactLite.observer(function (_a) {
    var month = _a.month;
    var daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    var _b = useCalendar(), nextMonth = _b.nextMonth, previousMonth = _b.previousMonth, isPreviousMonthAvailable = _b.isPreviousMonthAvailable;
    return (React__default['default'].createElement("div", { tw: 'flex flex-col w-full', "data-cy": month.side + "-month" },
        React__default['default'].createElement("div", { tw: 'flex flex-row items-center' },
            month.side === 'left' && (React__default['default'].createElement(Arrow, { variant: month.side, changeMonth: previousMonth, disabled: isPreviousMonthAvailable })),
            React__default['default'].createElement("div", { tw: 'text-center font-semibold py-4 w-full' }, month.name),
            month.side === 'right' && (React__default['default'].createElement(Arrow, { variant: month.side, changeMonth: nextMonth, disabled: false }))),
        React__default['default'].createElement("div", { css: gridStyles }, daysOfWeek.map(function (d) { return (React__default['default'].createElement("span", { tw: 'text-center cursor-default font-semibold text-gray-600', key: d }, d)); })),
        React__default['default'].createElement("div", { css: gridStyles }, month.days.map(function (day) { return (React__default['default'].createElement(Day, { key: day.id, data: day })); }))));
});
var Arrow = function (_a) {
    var variant = _a.variant, changeMonth = _a.changeMonth, disabled = _a.disabled;
    var pressProps = interactions.usePress({
        onPress: changeMonth,
        isDisabled: disabled,
    }).pressProps;
    return (React__default['default'].createElement("button", __assign({ css: [tw__default['default'](templateObject_2$3 || (templateObject_2$3 = __makeTemplateObject(["w-10 h-10"], ["w-10 h-10"]))), disabled && tw__default['default'](templateObject_3 || (templateObject_3 = __makeTemplateObject(["opacity-10 cursor-not-allowed"], ["opacity-10 cursor-not-allowed"])))] }, pressProps, { tabIndex: disabled ? -1 : 1, "aria-disabled": disabled, disabled: disabled, "data-cy": (variant === 'left' ? 'previous' : 'next') + "-month-button", "aria-label": "Move " + (variant === 'left' ? 'back' : 'forward') + " to switch to the next month." }), variant === 'right' ? (React__default['default'].createElement("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
        React__default['default'].createElement("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 5l7 7-7 7' }))) : (React__default['default'].createElement("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
        React__default['default'].createElement("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 19l-7-7 7-7' })))));
};
var templateObject_1$3, templateObject_2$3, templateObject_3;
/*
TODO

* Keyboard shortcuts
* Inputs on top for the date written by keyboard in a certain format
*/

var Summary = mobxReactLite.observer(function () {
    var _a = useCalendar(), infoText = _a.infoText, startDate = _a.startDate, endDate = _a.endDate, reset = _a.reset, clearEnd = _a.clearEnd, amountOfNights = _a.amountOfNights;
    return (React__default['default'].createElement("div", { tw: 'grid grid-cols-3 my-2' },
        React__default['default'].createElement("div", { tw: 'mr-5' },
            React__default['default'].createElement("h1", { tw: 'text-3xl font-bold', tabIndex: -1 }, amountOfNights === 0 ? 'Select dates' : amountOfNights + " nights"),
            React__default['default'].createElement("h2", { tw: 'whitespace-nowrap text-sm' }, infoText)),
        React__default['default'].createElement(DateInput, { clearFunction: reset, initialDate: startDate, type: 'checkIn' }),
        React__default['default'].createElement(DateInput, { clearFunction: clearEnd, initialDate: endDate, type: 'checkout' })));
});
var DateInput = mobxReactLite.observer(function (_a) {
    var initialDate = _a.initialDate, type = _a.type, clearFunction = _a.clearFunction;
    var _b = useCalendar(), startDate = _b.startDate, endDate = _b.endDate, selectByDate = _b.selectByDate;
    var _c = useImmer.useImmer({
        input: initialDate ? dateFns.format(initialDate, 'dd/LL/y') : '',
        isValid: false,
        shouldShowInvalid: false,
        placeholder: 'Select Date',
        focusOutline: false,
    }), state = _c[0], setState = _c[1];
    var validateInput = function () { return /\d{1,2}\/\d{1,2}\/\d{2,4}/gm.test(state.input); };
    React.useEffect(function () {
        setState(function (d) {
            d.input = initialDate ? dateFns.format(initialDate, 'dd/LL/y') : '';
        });
        // eslint-disable-next-line
    }, [startDate, endDate]);
    React.useEffect(function () {
        setState(function (d) {
            d.shouldShowInvalid = false;
            d.isValid = validateInput();
        });
        // eslint-disable-next-line
    }, [state.input]);
    var onFocus = React.useCallback(function () {
        setState(function (d) {
            d.placeholder = 'DD/MM/YYYY';
            d.focusOutline = true;
        });
        // eslint-disable-next-line
    }, [state.placeholder]);
    var onBlur = function () {
        setState(function (d) {
            d.shouldShowInvalid = d.input !== '';
            d.placeholder = 'Select Date';
            d.focusOutline = false;
        });
    };
    var onChange = React.useCallback(function (e) {
        setState(function (d) {
            d.input = e.target.value;
        });
    }, 
    // eslint-disable-next-line
    [state.input]);
    var onSubmit = function (e) {
        e.preventDefault();
        if (state.isValid) {
            var _a = state.input.split('/'), d = _a[0], m = _a[1], y = _a[2];
            // prettier-ignore
            var selectedDate = [d, m, y.length === 4 ? y.substr(-2) : y].join('/');
            var result = dateFns.parse(selectedDate, 'd/M/yy', new Date());
            selectByDate(result, type === 'checkIn' ? 'start' : 'end');
        }
    };
    var reset = function () {
        clearFunction();
        setState(function (d) {
            d.input = '';
            d.shouldShowInvalid = false;
            d.focusOutline = false;
            d.placeholder = 'Select Date';
            d.isValid = false;
        });
    };
    var focusProps = interactions.useFocus({ onFocus: onFocus, onBlur: onBlur }).focusProps;
    var pressProps = interactions.usePress({ onPress: reset }).pressProps;
    return (React__default['default'].createElement("div", { css: [
            tw__default['default'](templateObject_1$2 || (templateObject_1$2 = __makeTemplateObject(["border-2 border-white flex flex-col justify-between p-1 rounded-md"], ["border-2 border-white flex flex-col justify-between p-1 rounded-md"]))),
            state.focusOutline && tw__default['default'](templateObject_2$2 || (templateObject_2$2 = __makeTemplateObject(["border-gray-800"], ["border-gray-800"]))),
        ] },
        React__default['default'].createElement("div", { tw: 'flex flex-row justify-between items-center min-w-min px-1' },
            React__default['default'].createElement("div", null,
                React__default['default'].createElement("form", { onSubmit: onSubmit },
                    React__default['default'].createElement("label", { htmlFor: type, tw: 'text-gray-800 font-semibold text-xs p-1 w-max' }, type === 'checkIn' ? 'CHECK-IN' : 'CHECKOUT'),
                    React__default['default'].createElement("input", __assign({}, focusProps, { onChange: onChange, value: state.input, type: 'text', id: type, placeholder: state.placeholder, tw: 'p-1 focus:outline-none w-full' })))),
            (type === 'checkIn' ? startDate : endDate) && (React__default['default'].createElement("button", __assign({}, pressProps, { tw: 'w-10 h-10 text-center p-2' }),
                React__default['default'].createElement("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'h-2 w-2', viewBox: '0 0 20 20' },
                    React__default['default'].createElement("path", { fillRule: 'evenodd', d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z', clipRule: 'evenodd' }))))),
        !state.isValid && state.shouldShowInvalid && (React__default['default'].createElement("small", { tw: 'text-red-500' }, "This date is unavailable"))));
});
var templateObject_1$2, templateObject_2$2;

var Calendar = function () {
    // const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    var underlayRef = React.useRef(null);
    var _a = overlays.useOverlay({}, underlayRef), overlayProps = _a.overlayProps, underlayProps = _a.underlayProps;
    var modalProps = overlays.useModal().modalProps;
    var state = overlays$1.useOverlayTriggerState({});
    var openButtonRef = React.useRef(null);
    var closeButtonRef = React.useRef(null);
    var openButtonProps = button.useButton({ onPress: state.open }, openButtonRef).buttonProps;
    var closeButtonProps = button.useButton({ onPress: state.close }, closeButtonRef).buttonProps;
    overlays.usePreventScroll();
    var calendarGrid = tw.css(templateObject_1$1 || (templateObject_1$1 = __makeTemplateObject(["\n    grid-template-rows: auto 380px auto;\n  "], ["\n    grid-template-rows: auto 380px auto;\n  "])));
    var styles = tw__default['default'](templateObject_2$1 || (templateObject_2$1 = __makeTemplateObject(["max-w-3xl py-5 px-7 grid rounded-xl shadow-2xl mx-auto bg-white mt-8"], ["max-w-3xl py-5 px-7 grid rounded-xl shadow-2xl mx-auto bg-white mt-8"])));
    return state.isOpen ? (React__default['default'].createElement(overlays.OverlayContainer, null,
        React__default['default'].createElement("div", __assign({ tw: 'inset-0 z-50 fixed bg-black bg-opacity-10' }, underlayProps),
            React__default['default'].createElement(focus.FocusScope, { contain: true, restoreFocus: true, autoFocus: true },
                React__default['default'].createElement("div", __assign({ css: [styles, calendarGrid], ref: underlayRef }, overlayProps, modalProps),
                    React__default['default'].createElement(Summary, null),
                    React__default['default'].createElement(MonthsView, null),
                    React__default['default'].createElement(BottomControls, { btnProps: closeButtonProps, btnRef: closeButtonRef })))))) : (React__default['default'].createElement("button", __assign({}, openButtonProps, { ref: openButtonRef, "data-cy": 'open-calendar-modal' }), "Make a reservation"));
};
var templateObject_1$1, templateObject_2$1;

var App = function () {
    return (React__default['default'].createElement("div", { className: 'App' },
        React__default['default'].createElement(overlays.OverlayProvider, null,
            React__default['default'].createElement(Calendar, null))));
};

var CustomStyles = styledComponents.createGlobalStyle(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  body {\n    ", "\n  }\n"], ["\n  body {\n    ", "\n  }\n"])), tw__default['default'](templateObject_1 || (templateObject_1 = __makeTemplateObject(["antialiased"], ["antialiased"]))));
var GlobalStyles = function () { return (React__default['default'].createElement(React__default['default'].Fragment, null,
    React__default['default'].createElement(tw.GlobalStyles, null),
    React__default['default'].createElement(CustomStyles, null))); };
var templateObject_1, templateObject_2;

ReactDOM__default['default'].render(React__default['default'].createElement(React__default['default'].StrictMode, null,
    React__default['default'].createElement(GlobalStyles, null),
    React__default['default'].createElement(App, null)), document.getElementById('root'));
//# sourceMappingURL=index.tsx.map

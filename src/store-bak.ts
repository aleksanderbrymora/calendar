import {
  addDays,
  addMonths,
  differenceInDays,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWeekend,
  startOfMonth,
  subDays,
} from 'date-fns';
import { destroy, getParent, types } from 'mobx-state-tree';
import { nanoid } from 'nanoid';
import pluralize from 'pluralize';

type UnavailabilityReasonType = {
  /** A boolean specifying if the date is available and if the reason should be read */
  isAvailableToSelect: boolean;
  /** A reason for the unavailability */
  reason: UnavailabilityReasonString;
};

type UnavailabilityReasonString =
  | 'Checkout Only'
  | `${number}-night minimum`
  | 'After unavailable day'
  | '';

export const DayOfWeek = types
  .model({
    id: types.optional(types.identifier, nanoid),
    date: types.Date,
    isNextMonthDate: types.boolean,
    // this is a reflection of the db, not the state of the ui,
    // this is not toggled in any way during the reservation process,
    // only after the process has been finalized and reservation was recorded to db
    // reserved: types.optional(types.boolean, () => Math.random() < 0.8),
    reserved: types.optional(types.boolean, false),
  })
  .views((self) => ({
    /**
     * Returns true when `date` is in the month
     * used when displaying days in the month-view to hide the days that are outside of the month
     */
    get isInMonth(): boolean {
      const parentSelectedDate = getParent<typeof Calendar>(
        self,
        2,
      ).selectedDate;
      const dateToCheck = self.isNextMonthDate
        ? addMonths(parentSelectedDate, 1)
        : parentSelectedDate;
      return isSameMonth(self.date, dateToCheck);
    },
    /** Does the day belong to a weekend */
    get isWeekendDay(): boolean {
      return isWeekend(self.date);
    },
    /** Returns a day of the month for the date */
    get number() {
      return self.date.getDate();
    },
    /** Is this date today */
    get isToday() {
      return isSameDay(new Date(), self.date);
    },
    /** Used to tell if the displaying date is the start of the selection period */
    get isStart(): boolean {
      const parentStart = getParent<typeof Calendar>(self, 2).start;
      if (!parentStart) return false;
      return isSameDay(parentStart, self.date);
    },
    /** Used to tell if the displaying date is the end of the selection period */
    get isEnd(): boolean {
      const parentEnd = getParent<typeof Calendar>(self, 2).end;
      if (!parentEnd) return false;
      return isSameDay(parentEnd, self.date);
    },
    /** Used for applying styles to the dates before the `start` date selected by the user */
    get isBeforeSelection(): boolean {
      const parentStart = getParent<typeof Calendar>(self, 2).start;
      if (!parentStart) return false;
      return isBefore(self.date, parentStart);
    },
    /** Used for applying styles to the dates between the `start` and `end` date selected by the user */
    get isInSelection(): boolean {
      const parentStart = getParent<typeof Calendar>(self, 2).start;
      const parentEnd = getParent<typeof Calendar>(self, 2).end;
      if (!parentEnd || !parentStart) return false;
      return isBefore(self.date, parentEnd) && isAfter(self.date, parentStart);
    },
    /** Used for applying styles to the dates end the `end` date selected by the user */
    get isAfterSelection(): boolean {
      const parentEnd = getParent<typeof Calendar>(self, 2).end;
      if (!parentEnd) return false;
      return isAfter(self.date, parentEnd);
    },
  }))
  .actions((self) => ({
    /** A proxy to the parent method located in the Calendar Entity, used for selecting a date */
    select() {
      getParent<typeof Calendar>(self, 2).select(self.date);
    },
    /** DEV ONLY */
    changeReservation(to: boolean) {
      self.reserved = to;
    },
  }))
  .views((self) => ({
    /** Used for styling to determine if the date is either an end or a start */
    get isSelected() {
      return self.isEnd || self.isStart;
    },
    /**
     * This method is used for getting the Tooltip text for the dates
     * that are `tricky`, like ones that are before unavailable dates,
     * or the ones that would not fulfill the minimum stay requirement
     * @returns {string} if the reason is empty then the date is available
     */
    get unavailabilityReason(): UnavailabilityReasonType {
      const parent = getParent<typeof Calendar>(self, 2);
      if (self.reserved && !parent.isDateAvailable(addDays(self.date, 1)))
        return { isAvailableToSelect: false, reason: 'Checkout Only' };
      else if (parent.minStay) {
        const fulfillsMinStay = () => {
          const days = [];
          for (let i = 0; i <= parent.minStay!; i++) {
            days.push(parent.isDateAvailable(addDays(self.date, i)));
          }
          return !days.every((d) => d);
        };
        if (self.reserved && fulfillsMinStay()) {
          return {
            isAvailableToSelect: false,
            reason: `${parent.minStay}-night minimum`,
          };
        }
      }
      return { isAvailableToSelect: true, reason: '' };
    },
  }))
  .views((self) => ({
    get stylingToApply(): string {
      return '';
    },
  }));

export const Calendar = types
  .model({
    /** A minimum amount of nights a customer is able to stay */
    minStay: types.maybeNull(types.integer),
    /** A maximum amount of nights a customer is able to stay. Not yet implemented */
    maxStay: types.maybeNull(types.integer), // todo implement that into `select` method
    /**
     * A date that is used as a starting point for generating the calendar
     * by default its today's date. When user changes a month for a reservation
     * this date changes first and all of the months are regenerated based on it
     */
    selectedDate: types.optional(types.Date, new Date()),
    /** A beginning of a selection by user.
     * By default its null and changes when user clicks on an available date
     */
    start: types.maybeNull(types.Date),
    /** An end of a selection by user.
     * By default its null and changes when user clicks on an available date
     */
    end: types.maybeNull(types.Date),
    /** An array containing `Days` for the left side of the calendar - current month */
    selectedMonth: types.optional(types.array(DayOfWeek), []),
    /** An array containing `Days` for the right side of the calendar - next month */
    nextMonth: types.optional(types.array(DayOfWeek), []),
    /**
     * Small State Machine used for a `select` method to determine which -
     * start or end - should be updated
     */
    state: types.optional(
      types.union(
        types.literal('empty'),
        types.literal('startSelected'),
        types.literal('endSelected'),
      ),
      'empty',
    ),
  })
  .views((self) => ({
    get monthsCombined() {
      return [...self.selectedMonth, ...self.nextMonth];
    },
  }))
  // separate actions object so i can avoid using `this`
  .actions((self) => ({
    /**
     * Goes through each day in two months and destroys it so the
     * `createMonths` method has a blank slate to work from
     */
    wipeMonths() {
      self.nextMonth.forEach((d) => destroy(d));
      self.selectedMonth.forEach((d) => destroy(d));
    },
  }))
  // separate actions (again..) object so i can avoid using `this`
  .actions((self) => ({
    // todo currently something is wrong with selecting dates between the months
    /**
     * Ran to determine if a passed in date is selectable
     * @param {Date} d A date to check if is available
     * @param {"start" | "end"} availableFor is the date a start or an end of a selection
     * useful because of the constraints raised by `minStay` for example
     * @returns {boolean} saying if the date is available
     */
    isDateAvailable(d: Date, availableFor: 'start' | 'end' = 'end'): boolean {
      const found = self.monthsCombined.find((day) => isSameDay(day.date, d));
      if (found && availableFor === 'start') {
        // if its for the start then we have to check if its also not constrained by `minStay` and other stuff
        return found.reserved && found.unavailabilityReason.isAvailableToSelect;
      }
      if (found) return found.reserved;
      else return false;
    },
    /**
     * Used for determining if a selected period is free of unavailable dates
     * so there are no reservations covering the same date
     * @param {Date} start a beginning of a period to check
     * @param {Date} end an end of a period to check
     * @returns {boolean} if a period is free to make a reservation for
     */
    areDatesBetweenAvailable(start: Date, end: Date): boolean {
      const startIndex = self.monthsCombined.findIndex((d) =>
        isSameDay(start, d.date),
      );
      const endIndex = self.monthsCombined.findIndex((d) =>
        isSameDay(end, d.date),
      );

      for (let i = startIndex; i < endIndex; i++) {
        if (!self.monthsCombined[i].reserved) return false;
      }
      return true;
    },
    /** Ran as an initialization of the whole calendar and whenever there is a change of a month to recreate new ones */
    createMonths() {
      // ? might be able to save on some work by transferring next to selected but didn't get that to work
      self.wipeMonths();

      const createMonth = (date: Date, selectedOrNext: 'selected' | 'next') => {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const startWeekIndex = (getDay(start) + 6) % 7;
        const endWeekIndex = (getDay(end) + 6) % 7;

        const allDaysToDisplay: Date[] = [];

        // days in the first week outside of the selected month
        for (let i = 0; i < startWeekIndex; i++) {
          const d = subDays(start, startWeekIndex - i);
          allDaysToDisplay.push(d);
        }

        // normal days inside the month
        for (let i = start.getDate(); i <= end.getDate(); i++) {
          allDaysToDisplay.push(
            new Date(start.getFullYear(), start.getMonth(), i),
          );
        }

        // days after the end of the selected month
        for (let i = 1; i < 7 - endWeekIndex; i++) {
          allDaysToDisplay.push(
            new Date(end.getFullYear(), end.getMonth(), end.getDate() + i),
          );
        }

        allDaysToDisplay.forEach((d) => {
          self[
            // this is swapped because we have to do work on the other month than selected
            selectedOrNext === 'selected' ? 'selectedMonth' : 'nextMonth'
          ].push(
            DayOfWeek.create({
              date: d,
              isNextMonthDate: selectedOrNext === 'next',
            }),
          );
        });
      };
      createMonth(self.selectedDate, 'selected');
      createMonth(addMonths(self.selectedDate, 1), 'next');
    },
  }))
  .actions((self) => ({
    /** Shifts months by one forward */
    changeNextMonth() {
      self.selectedDate = addMonths(self.selectedDate, 1);
      self.createMonths();
    },
    /** Shifts months by one backwards */
    changePrevMonth() {
      self.selectedDate = addMonths(self.selectedDate, -1);
      self.createMonths();
    },
    /** Resets the whole calendar back to its initial state */
    reset() {
      self.start = null;
      self.end = null;
      self.state = 'empty';
      self.selectedDate = new Date();
      self.createMonths();
    },
    /** Removes the `end` date from the selection */
    clearEnd() {
      self.end = null;
      if (self.start) self.state = 'startSelected';
      else self.state = 'empty';
    },
    /**
     * Says if the `n` days after the passed in date is available
     * @param day a day from which the counting should begin
     * @param n a number of days to count from that day
     * @returns a boolean saying if the day is available
     */
    isNthDayAfterAvailable(day: Date, n: number) {
      const nextNthDayDate = addDays(day, n);
      const nextNthDay = self.monthsCombined.find((d) =>
        isSameDay(nextNthDayDate, d.date),
      );
      if (nextNthDay) return nextNthDay.reserved;
      else return true;
    },
    /**
     * The most complicated method in this whole store
     * Determines if a passed in date should be a `start` or an `end` of the selection
     * Also checks if the dates are meeting many constraints like `minDays`
     * @param {Date} d a date which is possibly a selection by the user
     */
    select(d: Date) {
      switch (self.state) {
        case 'empty':
          if (self.isDateAvailable(d, 'start')) {
            self.start = d;
            self.state = 'startSelected';
          }
          break;
        case 'startSelected':
          if (isSameDay(self.start!, d)) {
            self.start = null;
            self.state = 'empty';
          } else if (!self.isDateAvailable(d)) return;

          if (isAfter(d, self.start!)) {
            if (self.areDatesBetweenAvailable(self.start!, d)) {
              if (self.minStay) {
                if (differenceInDays(d, self.start!) >= self.minStay) {
                  self.end = d;
                  self.state = 'endSelected';
                }
              } else {
                self.end = d;
                self.state = 'endSelected';
              }
            }
          }
          break;
        case 'endSelected':
          self.end = null;
          self.state = 'startSelected';
          break;
      }
    },
    /** !DEV ONLY - dont use it anywhere in ui */
    changeReservation(day: Date, to: boolean) {
      console.log({ months: self.monthsCombined });
      const found = self.monthsCombined.find((d) => isSameDay(day, d.date));
      if (found) found.changeReservation(to);
    },
  }))
  .views((self) => ({
    /** Returns a text displaying a range of selected dates  */
    get displaySelectedRange() {
      let rangeDates = [];

      const formatDate = (d: Date): string => format(d, 'LLL d, y');

      if (!self.start) rangeDates.push('Select the dates');
      else if (self.start) rangeDates.push(formatDate(self.start));
      if (self.start && self.end) rangeDates.push(formatDate(self.end));
      return rangeDates.join(' - ');
    },
    /** A label for the left calendar */
    get selectedMonthName() {
      return format(self.selectedDate, 'MMMM Y');
    },
    /** A label for the right calendar */
    get nextMonthName() {
      return format(addMonths(self.selectedDate, 1), 'MMMM Y');
    },
    /** Calculates how many nights have been selected by the user */
    get amountOfNights() {
      if (self.start && self.end) {
        return differenceInDays(self.end, self.start);
      }
      return 0;
    },
    /** Returns a status text informing the user about the status of the process */
    get dateRange() {
      switch (self.state) {
        case 'empty':
          return 'Add your travel dates to see pricing';
        case 'startSelected':
          if (self.minStay !== null && self.maxStay !== null) {
            return `Minimum stay: ${self.minStay} ${pluralize(
              'day',
              self.minStay,
            )}\nMaximum stay: ${self.maxStay} ${pluralize(
              'day',
              self.maxStay,
            )}`;
          } else if (self.minStay !== null) {
            return `Minimum stay: ${self.minStay} ${pluralize(
              'day',
              self.minStay,
            )}`;
          } else {
            return 'Select the end date';
          }
        case 'endSelected':
          const formatDate = (d: Date) => format(d, 'MMM d, y');
          return formatDate(self.start!) + ' - ' + formatDate(self.end!);
        default:
          return 'Add your travel dates to see pricing';
      }
    },
  }));

const store = Calendar.create({ minStay: 3 });
store.createMonths();

if (process.env.NODE_ENV !== 'production') {
  store.changeReservation(new Date(2021, 7, 18), true);
  store.changeReservation(new Date(2021, 7, 19), true);
  store.changeReservation(new Date(2021, 7, 20), true);
  store.changeReservation(new Date(2021, 7, 21), true);

  store.changeReservation(new Date(2021, 8, 2), true);
  store.changeReservation(new Date(2021, 8, 3), true);
  store.changeReservation(new Date(2021, 8, 4), true);
  store.changeReservation(new Date(2021, 8, 5), true);
}
export const useStore = () => store;

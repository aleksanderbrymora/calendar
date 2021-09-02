import {
  addMonths,
  differenceInDays,
  differenceInMonths,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  startOfMonth,
  subDays,
} from 'date-fns';
import addDays from 'date-fns/addDays';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import { destroy, getParent, types } from 'mobx-state-tree';
import { nanoid } from 'nanoid';
import pluralize from 'pluralize';
import { getStyle } from './styles';

/* todo list
 * Make another state for deciding type of day for when min-stay is 1 night only
 */

enum SelectState {
  startNotSelected,
  startSelected,
  endSelected,
}

class Status {
  constructor(
    /** A boolean specifying if the date is available and if the reason should be read */
    public isAvailableToSelect: boolean,
    /** Used mainly for styling - tells what kind of day to display and can user select it */
    public variant: StatusVariant,
    /** A reason for the unavailability displayed to the user */
    public reason?: StatusStringType,
  ) {}
}

export enum StatusVariant {
  unavailable,
  checkoutOnly,
  nMinNights,
  available,
  selectedAsStart,
  selectedAsEnd,
  selectedBetween,
}

type StatusStringType =
  | 'Checkout Only'
  | `${number}-night minimum`
  | 'Check-in day'
  | 'Check-out day';

// ---- Day -------------------------------------------------
export const Day = types
  .model({
    id: types.optional(types.identifier, nanoid),
    date: types.Date,
    reserved: types.optional(types.boolean, false),
    isFocusable: types.optional(types.boolean, true),
  })
  /** DEV-only Actions */
  .actions((self) => ({
    changeReserved(to: boolean) {
      self.reserved = to;
    },
  }))
  .actions((self) => ({
    select() {
      const { select } = getParent<typeof Calendar>(self, 3);
      select(self.id);
    },
    changeOtherDaysToNotFocusable() {
      const { changeAllButOneDayToFocusable } = getParent<typeof Calendar>(
        self,
        3,
      );
      changeAllButOneDayToFocusable(self.id);
    },
    changeFocusable(to: boolean) {
      self.isFocusable = to;
    },
  }))
  .views((self) => ({
    /** Used to display a number on a month view */
    get dayOfMonth(): number {
      return self.date.getDate();
    },
    /** Tells if the date is before today, used for styling */
    get isBeforeToday(): boolean {
      return isBefore(self.date, new Date());
    },
    get isDayAfterReserved(): boolean {
      const { reservedDates } = getParent<typeof Calendar>(self, 3);
      const dayAfter = addDays(self.date, 1);

      return !!reservedDates.find((d) => isSameDay(dayAfter, d));
    },
    /**
     * Used to disable selection of a date that would not meet a min stay requirement
     * only used for determining days when selecting start as the latest possible start before reserved day
     */
    get belowMinStayRequirementStartSelection(): boolean {
      const { minStay, reservedDates } = getParent<typeof Calendar>(self, 3);

      for (let i = 0; i <= minStay; i++) {
        const testDay = addDays(self.date, i);
        const isReserved = reservedDates.find((d) => isSameDay(d, testDay));
        if (isReserved !== undefined) return true;
      }

      return false;
    },

    /**
     * Used to disable selection of a date that would not meet a min stay requirement
     * only used for determining days when selecting end as the late possible start before meeting a min stay requirement
     */
    get belowMinStayRequirementEndSelection(): boolean {
      const { minStay, startDate } = getParent<typeof Calendar>(self, 3);
      if (!startDate) return false;
      const difference = differenceInDays(self.date, startDate);
      return difference < minStay;
    },
    get isBeforeStart(): boolean {
      const { startDate } = getParent<typeof Calendar>(self, 3);
      if (!startDate) return false;
      return isBefore(self.date, startDate);
    },
    get isStart(): boolean {
      const { startDate } = getParent<typeof Calendar>(self, 3);
      if (!startDate) return false;
      return isSameDay(startDate, self.date);
    },
    get isEnd(): boolean {
      const { endDate } = getParent<typeof Calendar>(self, 3);
      if (!endDate) return false;
      return isSameDay(endDate, self.date);
    },
    get isBetweenStartAndEnd(): boolean {
      const { startDate, endDate } = getParent<typeof Calendar>(self, 3);
      if (!startDate || !endDate) return false;
      return isBefore(self.date, endDate) && isAfter(self.date, startDate);
    },
    get isFreeBetweenStartAndDate(): boolean {
      const { isRangeFree, startDate } = getParent<typeof Calendar>(self, 3);
      if (!startDate) return false;
      return !isRangeFree(startDate, self.date);
    },
    get belongsToDisplayedMonth(): boolean {
      const { side } = getParent<typeof Month>(self, 2);
      const { offset } = getParent<typeof Calendar>(self, 3);

      return isSameMonth(
        self.date,
        addMonths(new Date(), offset + (side === 'left' ? 0 : 1)),
      );
    },
    get testId(): string {
      const formattedDate = format(self.date, 'd/L/y');
      return `calendar-day-${formattedDate}`;
    },
  }))
  .views((self) => ({
    get startNotSelectedStatus(): Status {
      // Reserved day
      if (self.reserved) return new Status(false, StatusVariant.unavailable);

      // Before today
      if (self.isBeforeToday)
        return new Status(false, StatusVariant.unavailable);

      // Is it day before a reserved day
      if (self.isDayAfterReserved)
        return new Status(false, StatusVariant.checkoutOnly, 'Checkout Only');

      // Does it meet minStay requirement
      if (self.belowMinStayRequirementStartSelection) {
        const { minStay } = getParent<typeof Calendar>(self, 3);
        return new Status(
          false,
          StatusVariant.nMinNights,
          `${minStay}-night minimum`,
        );
      }

      // Available if all else failed
      return new Status(true, StatusVariant.available);
    },
    get startSelectedStatus(): Status {
      // Reserved day
      if (self.reserved) return new Status(false, StatusVariant.unavailable);

      // Is before selected start date
      if (self.isBeforeStart)
        return new Status(false, StatusVariant.unavailable);

      // Is it same as selected start
      if (self.isStart) return new Status(true, StatusVariant.selectedAsStart);

      // Is it after next reserved date
      if (self.isFreeBetweenStartAndDate)
        return new Status(false, StatusVariant.unavailable);

      // Does it meet minStay requirement
      if (self.belowMinStayRequirementEndSelection) {
        const { minStay } = getParent<typeof Calendar>(self, 3);
        return new Status(
          false,
          StatusVariant.nMinNights,
          `${minStay}-night minimum`,
        );
      }

      // if all above fails then its available
      return new Status(true, StatusVariant.available);
    },
    get endSelectedStatus(): Status {
      // Reserved day
      if (self.reserved) return new Status(false, StatusVariant.unavailable);

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
        const { minStay } = getParent<typeof Calendar>(self, 3);
        return new Status(
          false,
          StatusVariant.nMinNights,
          `${minStay}-night minimum`,
        );
      }

      return new Status(true, StatusVariant.available);
    },
  }))
  .views((self) => ({
    get status(): Status {
      const { selectState } = getParent<typeof Calendar>(self, 3);

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
  }))
  .views((self) => ({
    get style() {
      return getStyle(self.status.variant);
    },
    /** Used for aria-label when displaying a day */
    get label(): string {
      // Selected start date. Tuesday, December 7, 2021
      const formattedDate = format(self.date, 'EEEE, LLLL d, y');
      const { minStay, selectState } = getParent<typeof Calendar>(self, 3);

      switch (self.status.variant) {
        case StatusVariant.selectedAsStart:
          return `Selected for check-in. ${formattedDate}`;
        case StatusVariant.selectedAsEnd:
          return `Selected for check-out. ${formattedDate}`;
        case StatusVariant.available:
          switch (selectState) {
            case SelectState.startNotSelected:
              return `Choose ${formattedDate} as your check-in date. It's available, and has ${minStay} night minimum stay requirement`;
            case SelectState.startSelected:
              return `Choose ${formattedDate} as your check-out date. It's available`;
            case SelectState.endSelected:
              return `Choose ${formattedDate} as your check-in date. It's available, and has ${minStay} night minimum stay requirement`;
            default:
              return 'Something went really wrong';
              break;
          }
        case StatusVariant.checkoutOnly:
          return `${formattedDate} is only available for check out.`;
        // Friday, October 15, 2021 is available, but has no eligible check out date, due to the 2 night stay requirement.
        case StatusVariant.nMinNights:
          return `${formattedDate} is available, but has no eligible check out date, due to the ${minStay} night stay requirement.`;
        case StatusVariant.selectedBetween:
          return `Choose ${formattedDate} as your check-in date. It's available, and has ${minStay} night minimum stay requirement`;
        case StatusVariant.unavailable:
          return `Not available ${formattedDate}`;
      }
    },
  }));

// ---- Month -----------------------------------------------
export const Month = types
  .model({
    days: types.array(Day),
    side: types.enumeration(['left', 'right']),
  })
  .views((self) => ({
    get name(): string {
      const { offset } = getParent<typeof Calendar>(self);

      return format(
        addMonths(new Date(), (self.side === 'left' ? 0 : 1) + offset),
        'MMMM Y',
      );
    },
  }))
  .actions((self) => ({
    /** Goes through each day in this month and destroys it so it will be replaced with new days */
    wipeDays() {
      self.days.forEach((d) => destroy(d));
    },
  }))
  .actions((self) => ({
    /**
     * Wipes all days previously in the month and recreates them for a given month
     * it also checks the `reservedDays` in its parent - Calendar - and marks each day in there as reserved
     * @param {Date} date a day in month that this entity represents
     * @example if current date is 29.8.2021 then this will create an 8th month - August
     */
    createDays(date: Date) {
      self.wipeDays();
      const { reservedDates } = getParent<typeof Calendar>(self);

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
        const isReserved = reservedDates.find((potentialDate) =>
          isSameDay(d, potentialDate),
        );
        self.days.push(
          Day.create({
            date: d,
            reserved: !!isReserved,
          }),
        );
      });
    },
  }));

// ---- Calendar ---------------------------------------------
export const Calendar = types
  .model({
    /**  */
    reservedDates: types.array(types.Date),
    /**
     * How many months from current day should be display
     * positive numbers will move right month to be left
     * and right to be regenerated for the next month
     * All goes the other way when offset is negative
     */
    offset: types.optional(types.integer, 0),
    /** A month data for the left month in the calendar */
    left: Month,
    /** A month data for the right month in the calendar */
    right: Month,
    /** What's the minimum time customer can make a reservation for */
    minStay: types.optional(types.integer, 0),
    /** Start of the date selection */
    startDate: types.maybeNull(types.Date),
    /** End of the date selection */
    endDate: types.maybeNull(types.Date),
  })
  .actions((self) => ({
    createMonths() {
      self.left.wipeDays();
      self.right.wipeDays();
      self.left = Month.create({ side: 'left' });
      self.right = Month.create({ side: 'right' });
      self.left.createDays(addMonths(new Date(), self.offset));
      self.right.createDays(addMonths(new Date(), self.offset + 1));
    },
    changeAllButOneDayToFocusable(id: string) {
      self.left.days.forEach((d) =>
        d.id === id ? d.changeFocusable(true) : d.changeFocusable(false),
      );
      self.right.days.forEach((d) =>
        d.id === id ? d.changeFocusable(true) : d.changeFocusable(false),
      );
    },
    makeAllFocusable() {
      self.left.days.forEach((d) => d.changeFocusable(true));
      self.right.days.forEach((d) => d.changeFocusable(true));
    },
  }))
  .actions((self) => ({
    /** Shifts everything back to initial state */
    reset() {
      self.startDate = null;
      self.endDate = null;
      self.createMonths();
      self.makeAllFocusable();
    },
    /**
     * Moves to the next month
     * its reusing previously done work by shifting months
     * could also just call createMonths and regenerate days for both
     */
    nextMonth() {
      self.offset++;
      self.createMonths();
      self.makeAllFocusable();
    },
    previousMonth() {
      self.offset--;
      self.createMonths();
      self.makeAllFocusable();
    },
    isRangeFree(start: Date, end: Date) {
      const monthsCombined = [...self.left.days, ...self.right.days];
      const startIndex = monthsCombined.findIndex((d) =>
        isSameDay(d.date, start),
      );
      const endIndex = monthsCombined.findIndex((d) => isSameDay(d.date, end));

      for (let i = startIndex; i < endIndex; i++) {
        if (monthsCombined[i].reserved) return false;
      }

      return true;
    },
    clearEnd() {
      self.endDate = null;
    },
    /** DEV-ONLY */
    addReservedDates(dates: Date[]) {
      dates.forEach((d) => self.reservedDates.push(d));
    },
  }))
  .views((self) => ({
    /** Used for disabling an arrow to make reservations before today */
    get isPreviousMonthAvailable(): boolean {
      // todo check if this is correct
      return isBefore(addMonths(new Date(), self.offset - 1), new Date());
    },
    get selectState(): SelectState {
      if (self.startDate === null) return SelectState.startNotSelected;
      else if (self.startDate !== null && self.endDate === null)
        return SelectState.startSelected;
      else return SelectState.endSelected;
    },
    get amountOfNights(): number {
      if (self.startDate && self.endDate) {
        return differenceInDays(self.endDate, self.startDate);
      }
      return 0;
    },
  }))
  .views((self) => ({
    get infoText(): string {
      switch (self.selectState) {
        case SelectState.startNotSelected:
          return 'Select travel dates to see pricing';
        case SelectState.startSelected:
          // prettier-ignore
          return `Minimum stay: ${self.minStay} ${pluralize('day', self.minStay)}`
        case SelectState.endSelected:
          const formatDate = (d: Date) => format(d, 'MMM d, y');
          // prettier-ignore
          return `${formatDate(self.startDate!)} - ${formatDate(self.endDate!)}`
        default:
          return 'Something went really wrong...';
      }
    },
  }))
  .actions((self) => ({
    select(dayId: string) {
      const monthsCombined = [...self.left.days, ...self.right.days];
      const day = monthsCombined.find((d) => d.id === dayId)!;
      switch (self.selectState) {
        case SelectState.startNotSelected:
          if (day.status.isAvailableToSelect) self.startDate = day.date;
          break;
        case SelectState.startSelected:
          if (isSameDay(day.date, self.startDate!)) {
            self.startDate = null;
          } else if (day.status.isAvailableToSelect) {
            self.endDate = day.date;
          }
          break;
        case SelectState.endSelected:
          if (isSameDay(day.date, self.endDate!)) {
            self.endDate = null;
          } else if (day.status.isAvailableToSelect) {
            self.endDate = null;
            self.startDate = day.date;
          }
          break;
        default:
          console.error('something went really wrong');
      }
    },
  }))
  .actions((self) => ({
    selectByDate(date: Date) {
      const difference = differenceInMonths(
        date,
        addMonths(new Date(), self.offset),
      );

      self.offset = difference + 1;
      self.createMonths();

      const monthsCombined = [...self.left.days, ...self.right.days];
      const day = monthsCombined.find((d) => isSameDay(d.date, date))!;

      console.log({ day, difference, date, monthsCombined });

      if (day) self.select(day.id);
    },
  }));

const calendar = Calendar.create({
  left: Month.create({ side: 'left' }),
  right: Month.create({ side: 'right' }),
  minStay: 3,
  reservedDates: [
    new Date(2021, 8, 18),
    new Date(2021, 8, 19),
    new Date(2021, 8, 20),
    new Date(2021, 8, 21),
    new Date(2021, 8, 4),
    new Date(2021, 8, 5),
    new Date(2021, 8, 6),
    new Date(2021, 8, 7),
  ],
});
calendar.createMonths();

export const useCalendar = () => calendar;

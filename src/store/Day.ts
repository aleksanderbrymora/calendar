import {
  addMonths,
  differenceInDays,
  format,
  isAfter,
  isBefore,
} from 'date-fns';
import addDays from 'date-fns/addDays';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import { getParent, types } from 'mobx-state-tree';
import { nanoid } from 'nanoid';
import { getStyle } from './styles';
import { Status, StatusVariant, SelectState } from './types';
import { Calendar } from './Calendar';
import { Month } from './Month';

/* todo list
 * Make another state for deciding type of day for when min-stay is 1 night only
 */
// ---- Day -------------------------------------------------

export const Day = types
  .model({
    id: types.optional(types.identifier, nanoid),
    date: types.Date,
    reserved: types.optional(types.boolean, false),
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
        default:
          return `Something went really wrong...`;
      }
    },
  }));

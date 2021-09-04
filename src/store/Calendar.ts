import {
  addMonths,
  differenceInDays,
  differenceInMonths,
  format,
  isBefore,
} from 'date-fns';
import isSameDay from 'date-fns/isSameDay';
import { types } from 'mobx-state-tree';
import pluralize from 'pluralize';
import { Month } from './Month';
import { SelectState } from './types';

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
          return `Minimum stay: ${self.minStay} ${pluralize('day', self.minStay)}`;
        case SelectState.endSelected:
          const formatDate = (d: Date) => format(d, 'MMM d, y');
          // prettier-ignore
          return `${formatDate(self.startDate!)} - ${formatDate(self.endDate!)}`;
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

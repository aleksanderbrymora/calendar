import {
  addMonths, endOfMonth,
  format,
  getDay, startOfMonth,
  subDays
} from 'date-fns';
import isSameDay from 'date-fns/isSameDay';
import { destroy, getParent, types } from 'mobx-state-tree';
import { Day } from './Day';
import { Calendar } from "./Calendar";

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
        'MMMM Y'
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
          new Date(start.getFullYear(), start.getMonth(), i)
        );
      }

      // days after the end of the selected month
      for (let i = 1; i < 7 - endWeekIndex; i++) {
        allDaysToDisplay.push(
          new Date(end.getFullYear(), end.getMonth(), end.getDate() + i)
        );
      }

      allDaysToDisplay.forEach((d) => {
        const isReserved = reservedDates.find((potentialDate) => isSameDay(d, potentialDate)
        );
        self.days.push(
          Day.create({
            date: d,
            reserved: !!isReserved,
          })
        );
      });
    },
  }));

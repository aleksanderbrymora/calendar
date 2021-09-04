import { addDays } from 'date-fns';
import { Calendar } from './Calendar';
import { Month } from './Month';

const calendar = Calendar.create({
  left: Month.create({ side: 'left' }),
  right: Month.create({ side: 'right' }),
  minStay: 3,
  reservedDates: [
    addDays(new Date(), 2),
    addDays(new Date(), 3),
    addDays(new Date(), 4),
    addDays(new Date(), 5),

    addDays(new Date(), 10),
    addDays(new Date(), 11),
    addDays(new Date(), 12),
    addDays(new Date(), 13),
    addDays(new Date(), 14),
    addDays(new Date(), 15),
  ],
});
calendar.createMonths();

export const useCalendar = () => calendar;

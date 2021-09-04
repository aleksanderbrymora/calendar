import { Calendar } from './Calendar';
import { Month } from './Month';

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

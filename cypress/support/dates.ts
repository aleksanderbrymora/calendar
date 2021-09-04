import { addDays, format } from 'date-fns';
export const dates = (
  offset: number,
): { formattedTestDate: string; formattedLabelDate: string } => {
  const day = addDays(new Date(), offset);
  const formattedTestDate = format(day, 'd/L/y');
  const formattedLabelDate = format(day, 'EEEE, LLLL d, y');
  return { formattedTestDate, formattedLabelDate };
};

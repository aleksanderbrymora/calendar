import { usePress } from '@react-aria/interactions';
import { observer } from 'mobx-react-lite';
import { Instance } from 'mobx-state-tree';
import { FC } from 'react';
import tw from 'twin.macro';
import { useCalendar, Month as MonthStore } from '../store';
import Day from './Day';

const MonthsView = observer(() => {
  const { left, right } = useCalendar();
  return (
    <div tw='grid grid-cols-2 gap-8'>
      <Month month={left} />
      <Month month={right} />
    </div>
  );
});

interface MonthProps {
  month: Instance<typeof MonthStore>;
}

const gridStyles = tw`grid grid-cols-7`;

const Month: FC<MonthProps> = observer(({ month }) => {
  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const { nextMonth, previousMonth, isPreviousMonthAvailable } = useCalendar();

  return (
    <div tw='flex flex-col w-full' data-cy={`${month.side}-month`}>
      <div tw='flex flex-row items-center'>
        {month.side === 'left' && (
          <Arrow
            variant={month.side}
            changeMonth={previousMonth}
            disabled={isPreviousMonthAvailable}
          />
        )}
        <div tw='text-center font-semibold py-4 w-full'>{month.name}</div>
        {month.side === 'right' && (
          <Arrow
            variant={month.side}
            changeMonth={nextMonth}
            disabled={false}
          />
        )}
      </div>
      <div css={gridStyles}>
        {daysOfWeek.map((d) => (
          <span
            tw='text-center cursor-default font-semibold text-gray-600'
            key={d}
          >
            {d}
          </span>
        ))}
      </div>
      <div css={gridStyles}>
        {month.days.map((day) => (
          <Day key={day.id} data={day} />
        ))}
      </div>
    </div>
  );
});

interface ArrowProps {
  changeMonth: () => void;
  variant: 'left' | 'right';
  disabled: boolean;
}

const Arrow: FC<ArrowProps> = ({ variant, changeMonth, disabled }) => {
  const { pressProps } = usePress({
    onPress: changeMonth,
    isDisabled: disabled,
  });

  return (
    <button
      css={[tw`w-10 h-10`, disabled && tw`opacity-10 cursor-not-allowed`]}
      {...pressProps}
      tabIndex={disabled ? -1 : 1}
      aria-disabled={disabled}
      data-cy={`${variant === 'left' ? 'previous' : 'next'}-month-button`}
    >
      {variant === 'right' ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5l7 7-7 7'
          />
        </svg>
      ) : (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 19l-7-7 7-7'
          />
        </svg>
      )}
    </button>
  );
};

export default MonthsView;

/*
TODO

* Keyboard shortcuts
* Inputs on top for the date written by keyboard in a certain format
*/

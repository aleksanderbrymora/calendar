import { useFocus, usePress } from '@react-aria/interactions';
import { format, parse } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React, {
  ChangeEvent,
  FC,
  FormEvent,
  useCallback,
  useEffect,
} from 'react';
import tw from 'twin.macro';
import { useImmer } from 'use-immer';
import { useCalendar } from '../store';

const Summary = observer(() => {
  const { infoText, startDate, endDate, reset, clearEnd, amountOfNights } =
    useCalendar();

  return (
    <div tw='grid grid-cols-3 my-2'>
      <div tw='mr-5'>
        <h1 tw='text-3xl font-bold' tabIndex={-1}>
          {amountOfNights === 0 ? 'Select dates' : `${amountOfNights} nights`}
        </h1>
        <h2 tw='whitespace-nowrap text-sm'>{infoText}</h2>
      </div>
      <DateInput clearFunction={reset} initialDate={startDate} type='checkIn' />
      <DateInput
        clearFunction={clearEnd}
        initialDate={endDate}
        type='checkout'
      />
    </div>
  );
});

interface DateInputProps {
  type: 'checkIn' | 'checkout';
  initialDate: Date | null;
  clearFunction: () => void;
}

const DateInput: FC<DateInputProps> = observer(
  ({ initialDate, type, clearFunction }) => {
    const { startDate, endDate, selectByDate } = useCalendar();

    const [state, setState] = useImmer<{
      input: string;
      isValid: boolean;
      shouldShowInvalid: boolean;
      placeholder: 'Select Date' | 'DD/MM/YYYY';
      focusOutline: boolean;
    }>({
      input: initialDate ? format(initialDate, 'dd/LL/y') : '',
      isValid: false,
      shouldShowInvalid: false,
      placeholder: 'Select Date',
      focusOutline: false,
    });

    const validateInput = () => /\d{1,2}\/\d{1,2}\/\d{2,4}/gm.test(state.input);

    useEffect(() => {
      setState((d) => {
        d.input = initialDate ? format(initialDate, 'dd/LL/y') : '';
      });
      // eslint-disable-next-line
    }, [startDate, endDate]);

    useEffect(() => {
      setState((d) => {
        d.shouldShowInvalid = false;
        d.isValid = validateInput();
      });
      // eslint-disable-next-line
    }, [state.input]);

    const onFocus = useCallback(() => {
      setState((d) => {
        d.placeholder = 'DD/MM/YYYY';
        d.focusOutline = true;
      });
      // eslint-disable-next-line
    }, [state.placeholder]);

    const onBlur = () => {
      setState((d) => {
        d.shouldShowInvalid = d.input !== '';
        d.placeholder = 'Select Date';
        d.focusOutline = false;
      });
    };

    const onChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setState((d) => {
          d.input = e.target.value;
        });
      },
      // eslint-disable-next-line
      [state.input],
    );

    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (state.isValid) {
        const [d, m, y] = state.input.split('/');
        // prettier-ignore
        const selectedDate = [d, m, y.length === 4 ? y.substr(-2) : y].join('/');
        const result = parse(selectedDate, 'd/M/yy', new Date());
        selectByDate(result, type === 'checkIn' ? 'start' : 'end');
      }
    };

    const reset = () => {
      clearFunction();
      setState((d) => {
        d.input = '';
        d.shouldShowInvalid = false;
        d.focusOutline = false;
        d.placeholder = 'Select Date';
        d.isValid = false;
      });
    };

    const { focusProps } = useFocus({ onFocus, onBlur });
    const { pressProps } = usePress({ onPress: reset });

    return (
      <div
        css={[
          tw`border-2 border-white flex flex-col justify-between p-1 rounded-md`,
          state.focusOutline && tw`border-gray-800`,
        ]}
      >
        <div tw='flex flex-row justify-between items-center min-w-min px-1'>
          <div>
            <form onSubmit={onSubmit}>
              <label
                htmlFor={type}
                tw='text-gray-800 font-semibold text-xs p-1 w-max'
              >
                {type === 'checkIn' ? 'CHECK-IN' : 'CHECKOUT'}
              </label>
              <input
                {...focusProps}
                onChange={onChange}
                value={state.input}
                type='text'
                id={type}
                placeholder={state.placeholder}
                tw='p-1 focus:outline-none w-full'
              />
            </form>
          </div>
          {(type === 'checkIn' ? startDate : endDate) && (
            <button {...pressProps} tw='w-10 h-10 text-center p-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-2 w-2'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
        {!state.isValid && state.shouldShowInvalid && (
          <small tw='text-red-500'>This date is unavailable</small>
        )}
      </div>
    );
  },
);

export default Summary;

import { observer } from 'mobx-react-lite';
import 'twin.macro';
import { useCalendar } from '../store';
import { usePress } from '@react-aria/interactions';
import { ButtonAria } from '@react-aria/button';
import { RefObject, FC } from 'react';

interface Props {
  btnRef: RefObject<HTMLButtonElement>;
  btnProps: ButtonAria<HTMLButtonElement>;
}

const BottomControls: FC<Props> = observer(({ btnProps, btnRef }) => {
  const { reset } = useCalendar();

  const { pressProps: resetPressProps } = usePress({ onPress: reset });

  return (
    <div tw='flex flex-row justify-between '>
      <button>Kb info</button>
      <div tw='grid grid-cols-2 gap-3'>
        <button {...resetPressProps} tw='underline font-semibold p-1'>
          Clear Dates
        </button>
        <button
          tw='bg-gray-900 font-semibold rounded-md text-white py-1 px-2'
          {...btnProps}
          ref={btnRef}
        >
          Close
        </button>
      </div>
    </div>
  );
});

export default BottomControls;

import { observer } from 'mobx-react-lite';
import 'twin.macro';
import { useCalendar } from '../store';

const BottomControls = observer(() => {
  const { reset } = useCalendar();

  return (
    <div tw='flex flex-row justify-between '>
      <button>Kb info</button>
      <div tw='grid grid-cols-2 gap-3'>
        <button onClick={reset} tw='underline font-semibold p-1'>
          Clear Dates
        </button>
        <button tw='bg-gray-900 font-semibold rounded-md text-white py-1 px-2'>
          Close
        </button>
      </div>
    </div>
  );
});

export default BottomControls;

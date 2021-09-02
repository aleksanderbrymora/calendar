import { observer } from 'mobx-react-lite';
import { Instance } from 'mobx-state-tree';
import { FC, useState } from 'react';
import tw from 'twin.macro';
import { Day as DayOfWeek } from '../store';

interface Props {
  data: Instance<typeof DayOfWeek>;
}

const tooltipStyles = tw`invisible absolute p-1 rounded border border-gray-200 bg-gray-100 shadow-lg ml-4 text-sm`;

const Day: FC<Props> = observer(({ data }) => {
  const [hasHover, setHasHover] = useState(false);

  const onHover = () => setHasHover(true);
  const onLeave = () => setHasHover(false);

  return data.belongsToDisplayedMonth ? (
    <div>
      <button
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={data.select}
        disabled={!data.status.isAvailableToSelect}
        aria-disabled={!data.status.isAvailableToSelect}
        aria-live='polite'
        tabIndex={data.status.isAvailableToSelect ? 1 : -1}
        css={[
          tw`grid content-center justify-items-center h-10 w-full font-medium ring-0 my-1`,
          tw`focus:(border-none ring-0)`,
          tw`active:ring-0`,
          data.style,
        ]}
      >
        {data.dayOfMonth}
      </button>
      {data.status.reason && (
        <small css={[tooltipStyles, hasHover ? tw`visible` : tw`invisible`]}>
          {data.status.reason}
        </small>
      )}
    </div>
  ) : (
    <div tabIndex={-1} />
  );
});

export default Day;

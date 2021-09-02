import { useHover, usePress } from '@react-aria/interactions';
import { observer } from 'mobx-react-lite';
import { Instance } from 'mobx-state-tree';
import { FC } from 'react';
import tw from 'twin.macro';
import { Day as DayOfWeek } from '../store';

interface Props {
  data: Instance<typeof DayOfWeek>;
}

const tooltipStyles = tw`invisible absolute p-1 rounded border border-gray-200 bg-gray-100 shadow-lg ml-4 text-sm`;

const Day: FC<Props> = observer(({ data }) => {
  const { pressProps: selectPressProps } = usePress({
    onPress: data.select,
  });
  const { isHovered, hoverProps } = useHover({});

  return data.belongsToDisplayedMonth ? (
    <div>
      <button
        {...selectPressProps}
        {...hoverProps}
        disabled={!data.status.isAvailableToSelect}
        aria-disabled={!data.status.isAvailableToSelect}
        aria-live='polite'
        aria-label={data.label}
        tabIndex={data.status.isAvailableToSelect ? 1 : -1}
        css={[
          tw`grid content-center justify-items-center h-10 w-full font-medium ring-0 my-1`,
          tw`focus:(border-none ring-0)`,
          tw`active:ring-0`,
          data.style,
        ]}
        data-cy={data.testId}
      >
        {data.dayOfMonth}
      </button>
      {data.status.reason && (
        <small css={[tooltipStyles, isHovered ? tw`visible` : tw`invisible`]}>
          {data.status.reason}
        </small>
      )}
    </div>
  ) : (
    <div tabIndex={-1} />
  );
});

export default Day;

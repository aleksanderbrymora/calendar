import MonthsView from './MonthsView';
import tw, { css } from 'twin.macro';
import Summary from './Summary';
import BottomControls from './BottomControls';

const Calendar = () => {
  const calendarGrid = css`
    grid-template-rows: auto 380px auto;
  `;

  const styles = tw`max-w-3xl p-5 grid rounded-xl shadow-2xl mx-auto`;

  return (
    <div css={[styles, calendarGrid]}>
      <Summary />
      <MonthsView />
      <BottomControls />
    </div>
  );
};

export default Calendar;

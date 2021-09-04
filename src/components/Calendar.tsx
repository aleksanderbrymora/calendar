import { useButton } from '@react-aria/button';
import { FocusScope } from '@react-aria/focus';
import {
  OverlayContainer,
  useModal,
  useOverlay,
  usePreventScroll
} from '@react-aria/overlays';
import { useOverlayTriggerState } from '@react-stately/overlays';
import { useRef } from 'react';
import tw, { css } from 'twin.macro';
import BottomControls from './BottomControls';
import MonthsView from './MonthsView';
import Summary from './Summary';

const Calendar = () => {
  // const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const underlayRef = useRef<HTMLDivElement>(null);
  const { overlayProps, underlayProps } = useOverlay({}, underlayRef);
  const { modalProps } = useModal();
  const state = useOverlayTriggerState({});
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { buttonProps: openButtonProps } = useButton(
    {
      onPress: state.open,
    },
    openButtonRef,
  );

  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: state.close,
    },
    closeButtonRef,
  );

  usePreventScroll();

  const calendarGrid = css`
    grid-template-rows: auto 380px auto;
  `;
  const styles = tw`max-w-3xl py-5 px-7 grid rounded-xl shadow-2xl mx-auto bg-white mt-8`;

  return state.isOpen ? (
    <OverlayContainer>
      <div tw='inset-0 z-50 fixed bg-black bg-opacity-10' {...underlayProps}>
        <FocusScope contain restoreFocus autoFocus>
          <div
            css={[styles, calendarGrid]}
            ref={underlayRef}
            {...overlayProps}
            {...modalProps}
          >
            <Summary />
            <MonthsView />
            <BottomControls
              btnProps={closeButtonProps}
              btnRef={closeButtonRef}
            />
          </div>
        </FocusScope>
      </div>
    </OverlayContainer>
  ) : (
    <button {...openButtonProps} ref={openButtonRef}>
      Make a reservation
    </button>
  );
};

export default Calendar;

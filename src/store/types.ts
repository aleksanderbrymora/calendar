export enum SelectState {
  startNotSelected,
  startSelected,
  endSelected,
}

export type StatusStringType =
  | 'Checkout Only'
  | `${number}-night minimum`
  | 'Check-in day'
  | 'Check-out day';

export class Status {
  constructor(
    /** A boolean specifying if the date is available and if the reason should be read */
    public isAvailableToSelect: boolean,
    /** Used mainly for styling - tells what kind of day to display and can user select it */
    public variant: StatusVariant,
    /** A reason for the unavailability displayed to the user */
    public reason?: StatusStringType,
  ) {}
}

export enum StatusVariant {
  unavailable,
  checkoutOnly,
  nMinNights,
  available,
  selectedAsStart,
  selectedAsEnd,
  selectedBetween,
}

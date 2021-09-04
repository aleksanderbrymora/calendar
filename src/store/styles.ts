import tw, { TwStyle } from 'twin.macro';
import { StatusVariant } from './types';

const unavailable = tw`cursor-default text-gray-400 line-through`;
const checkoutOnly = tw`text-gray-600 cursor-default`;
const nMinNights = tw`text-gray-600 cursor-default`;
const available = tw`cursor-pointer hover:(border-2 rounded-full border-gray-800 )`;
const start = tw`rounded-l-full bg-gray-800 text-gray-50`;
const end = tw`rounded-r-full bg-gray-800 text-gray-50`;
const selected = tw`bg-gray-800 text-gray-50`;

export const getStyle = (statusVariant: StatusVariant) => {
  const styles: Record<StatusVariant, TwStyle> = {
    [StatusVariant.unavailable]: unavailable,
    [StatusVariant.checkoutOnly]: checkoutOnly,
    [StatusVariant.nMinNights]: nMinNights,
    [StatusVariant.available]: available,
    [StatusVariant.selectedAsStart]: start,
    [StatusVariant.selectedAsEnd]: end,
    [StatusVariant.selectedBetween]: selected,
  };

  return styles[statusVariant];
};

import dayjs from "dayjs";
import { sum } from "lodash";

export const CurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
export const CurrencyFormatterWithPrecision = (number, precision) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precision,
  }).format(number);
};
export const NumberFormatter = (number) => {
  const retNumber = number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });
  // console.log("retNumber", retNumber);
  return retNumber;
};

export const PercentFormatter = (number) => `${number.toFixed(2)}%`;
export const PercentChangeFormatter = (number, precision = 2) => {
  const formatNumber = Number(number).toFixed(precision);
  return `${new Intl.NumberFormat("en-US", {
    signDisplay: "always",
    minimumFractionDigits: precision,
  }).format(formatNumber)}%`;
};

export const DateNow = () => `${dayjs().format("DD/MM HH:mm:ss")}`;
export const DateFormatter = (timestamp) =>
  `${dayjs(timestamp).format("DD/MM HH:mm:ss")}`;
export const TimeFormatter = (timestamp) =>
  `${dayjs(timestamp).format("HH:mm:ss")}`;
export const FundingRateFormat = (fundingRate) =>
  `${Number(fundingRate).toFixed(4)}%`;

export const NumberShortFmt = (number) => {
  if (number < 1000000) {
    return `${Number(number).toFixed(3)}`;
  } else if (number < 1000000000) {
    return `${Number(number / 1000000).toFixed(2)}M`;
  } else {
    return `${Number(number / 1000000000).toFixed(2)}B`;
  }
};

const Utils = {
  CurrencyFormatter,
  PercentFormatter,
};

export default Utils;

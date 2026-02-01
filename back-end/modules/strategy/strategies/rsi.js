import { calculateRSI } from "../../indicators/oscillators/rsi.js";

const defaultOptions = {
  rsiPeriod: 14,
  rsiOversold: 25,
  rsiOverbought: 75,
};

/**
 * Return true if the RSI crosses up the oversold threshold
 */
export const isBuySignal = (candles, options = defaultOptions) => {
  if (candles.length < options.rsiPeriod) return false;

  const values = calculateRSI(candles, {
    period: options.rsiPeriod,
  });

  const last = values[values.length - 2];
  const current = values[values.length - 1];

  return last < options.rsiOversold && current > options.rsiOversold;
};

/**
 * Return true if the RSI crosses down the overbought threshold
 */
export const isSellSignal = (candles, options = defaultOptions) => {
  if (candles.length < options.rsiPeriod) return false;

  const values = calculateRSI(candles, {
    period: options.rsiPeriod,
  });

  const last = values[values.length - 2];
  const current = values[values.length - 1];

  return last > options.rsiOverbought && current < options.rsiOverbought;
};

export const detectRsiSignal = (candles, options = defaultOptions) => {
  if (isSellSignal(candles, options)) {
    return {
      detected: true,
      type: "RSI_CROSS_DOWN_UPPER_SHORT",
    };
  } else if (isBuySignal(candles, options)) {
    return {
      detected: true,
      type: "RSI_CROSS_UP_LOWER_LONG",
    };
  }
  return {
    detected: false,
    type: "NA",
  };
};

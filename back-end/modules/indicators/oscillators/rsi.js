import { RSI } from "technicalindicators";
import { getCandleSourceType } from "../utils/index.js";

const defaultOptions = {
  sourceType: "close",
  period: 14,
};

export function calculateRSI(candles, options) {
  options = { ...defaultOptions, ...options };

  let values = getCandleSourceType(candles, options.sourceType);
  let result = RSI.calculate({ values, period: options.period });

  return result;
}
